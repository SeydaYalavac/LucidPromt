import { adapters } from "./sources";
import { clusterSignals, earliestAttributedSignal, scoreSignals, slugifyTitle } from "../src/lib/scoring";
import { sanitizeExcerpt, summarizeEvidenceSignal } from "../src/lib/trend-content";
import { getSupabaseAdmin } from "../src/lib/supabase/admin";
import { generateWhyLayer } from "../src/lib/why-layer";
import { activeTrendCutoff, DAILY_TREND_TARGET } from "../src/lib/trend-feed";
import { categoryForSignals } from "../src/lib/trend-category";
import { prepareSourceSignals } from "./prepare-signals";
import { MAP_COUNTRIES } from "./map-countries";
import { backfillableCountryAttribution, evidenceCountryRows } from "./country-attribution";
import { countryAttributionFromMetadata } from "../src/lib/country-attribution";
import { inspectTrendBriefingCoverage, type BriefingBackfillTrend } from "./trend-briefing-backfill";
import type { Signal, SourceName, SourceSignal, Trend } from "../src/types/trends";

const sourceNames = (process.env.INGEST_SOURCES || "hacker_news,github,google_trends")
  .split(",")
  .map((source) => source.trim())
  .filter((source): source is SourceName => source in adapters);

type StoredSignal = {
  id: string;
  country_id: string | null;
  source: SourceName;
  source_url: string;
  metadata: Record<string, unknown> | null;
};

function batches<T>(items: T[], size: number) {
  const groups: T[][] = [];
  for (let index = 0; index < items.length; index += size) groups.push(items.slice(index, index + size));
  return groups;
}

async function backfillTrendBriefings(supabase: ReturnType<typeof getSupabaseAdmin>) {
  const { data, error } = await supabase
    .from("trends")
    .select("id,title,summary,what_happened,why_now,last_seen_at,updated_at")
    .gte("last_seen_at", activeTrendCutoff().toISOString())
    .limit(10_000);
  if (error) throw error;

  const trends = (data || []) as BriefingBackfillTrend[];
  const signalResults = await Promise.all(
    batches(trends.map((trend) => trend.id), 100).map((trendIds) =>
      supabase
        .from("signals")
        .select("*")
        .in("trend_id", trendIds)
        .order("observed_at", { ascending: false })
        .order("published_at", { ascending: false })
        .limit(10_000),
    ),
  );
  const signalError = signalResults.find((result) => result.error)?.error;
  if (signalError) throw signalError;
  const signals = signalResults.flatMap((result) => result.data || []) as Signal[];
  const signalsByTrend = new Map<string, Signal[]>();
  for (const signal of signals) {
    signalsByTrend.set(signal.trend_id, [...(signalsByTrend.get(signal.trend_id) || []), signal]);
  }

  const inspections = trends.map((trend) => ({
    trend,
    inspection: inspectTrendBriefingCoverage(trend, signalsByTrend.get(trend.id) || []),
  }));
  const pending = inspections.filter(({ inspection }) => inspection.completeAfter && Object.keys(inspection.patch).length > 0);

  for (const group of batches(pending, 10)) {
    const results = await Promise.all(group.map(({ trend, inspection }) =>
      supabase.from("trends").update(inspection.patch as Partial<Trend>).eq("id", trend.id),
    ));
    const updateError = results.find((result) => result.error)?.error;
    if (updateError) throw updateError;
  }

  return {
    activeRecords: trends.length,
    eligibleRecords: inspections.filter(({ inspection }) => inspection.eligible).length,
    completeBefore: inspections.filter(({ inspection }) => inspection.completeBefore).length,
    completeAfter: inspections.filter(({ inspection }) => inspection.completeAfter).length,
    validAttributedSourceCoverage: inspections.filter(({ inspection }) => inspection.hasAttributedSource).length,
    unsupportedRecords: inspections.filter(({ inspection }) => !inspection.eligible).length,
    failOpenRecords: inspections.filter(({ inspection }) => inspection.failOpen).length,
    metadataLeaks: inspections.filter(({ inspection }) => inspection.metadataLeak).length,
    deepBriefings: inspections.filter(({ inspection }) => inspection.depth === "deep").length,
    backfilledRecords: pending.length,
  };
}

async function backfillCountryAttributions(
  supabase: ReturnType<typeof getSupabaseAdmin>,
  countryIds: Map<string, string>,
) {
  const { data, error } = await supabase
    .from("signals")
    .select("id,country_id,source,source_url,metadata")
    .limit(10_000);
  if (error) throw error;
  const rows = (data || []) as StoredSignal[];
  const countryCodesById = new Map([...countryIds].map(([code, id]) => [id, code]));
  let before = 0;
  let backfilled = 0;

  for (const row of rows) {
    const storedCountryCode = row.country_id ? countryCodesById.get(row.country_id) : null;
    const storedAttribution = countryAttributionFromMetadata(row.metadata, {
      source: row.source,
      sourceUrl: row.source_url,
      countryCode: storedCountryCode,
    });
    if (storedAttribution && storedCountryCode === storedAttribution.country_code) {
      before += 1;
      continue;
    }

    const attribution = backfillableCountryAttribution(row);
    const countryId = attribution ? countryIds.get(attribution.country_code) : null;
    if (!attribution || !countryId) continue;
    const { error: updateError } = await supabase
      .from("signals")
      .update({
        country_id: countryId,
        metadata: { ...(row.metadata || {}), country_attribution: attribution },
      })
      .eq("id", row.id);
    if (updateError) throw updateError;
    backfilled += 1;
  }

  return { before, after: before + backfilled, backfilled };
}

async function run() {
  if (!sourceNames.length) throw new Error("INGEST_SOURCES contains no supported source names");
  const supabase = getSupabaseAdmin();
  const { error: countrySeedError } = await supabase
    .from("countries")
    .upsert(MAP_COUNTRIES, { onConflict: "code" });
  if (countrySeedError) throw countrySeedError;
  const { data: runRow, error: runError } = await supabase
    .from("ingestion_runs")
    .insert({ sources_attempted: sourceNames })
    .select("id")
    .single();
  if (runError) throw runError;

  const errors: Array<{ source: string; message: string }> = [];
  const succeeded: string[] = [];
  let signals: SourceSignal[] = [];
  let insertedSignals = 0;
  let createdTrends = 0;

  const results = await Promise.allSettled(sourceNames.map((name) => adapters[name].fetchSignals()));
  results.forEach((result, index) => {
    const name = sourceNames[index];
    if (result.status === "fulfilled") {
      signals = signals.concat(prepareSourceSignals(result.value));
      succeeded.push(name);
    } else {
      errors.push({ source: name, message: result.reason instanceof Error ? result.reason.message : String(result.reason) });
    }
  });

  const discoveredCountries = evidenceCountryRows(signals);
  if (discoveredCountries.length) {
    const { error: discoveredCountryError } = await supabase
      .from("countries")
      .upsert(discoveredCountries, { onConflict: "code", ignoreDuplicates: true });
    if (discoveredCountryError) throw discoveredCountryError;
  }

  const { data: countries, error: countriesError } = await supabase.from("countries").select("id,code");
  if (countriesError) throw countriesError;
  const countryIds = new Map((countries || []).map((country) => [country.code, country.id]));
  const countryAttributions = await backfillCountryAttributions(supabase, countryIds);

  for (const cluster of clusterSignals(signals)) {
    const lead = [...cluster].sort((a, b) => b.engagementCount - a.engagementCount)[0];
    const newest = [...cluster].sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())[0];
    const originSignal = earliestAttributedSignal(cluster);
    const slug = slugifyTitle(lead.title);
    if (!slug) continue;
    const score = scoreSignals(cluster);
    const observedAt = new Date().toISOString();
    const summary = summarizeEvidenceSignal({
      source: newest.source,
      external_id: newest.externalId,
      title: newest.title,
      excerpt: newest.excerpt,
      source_url: newest.sourceUrl,
      engagement_count: newest.engagementCount,
      audience_count: newest.audienceCount,
      published_at: newest.publishedAt,
      observed_at: observedAt,
      metadata: newest.metadata,
    });
    const { data: existing } = await supabase.from("trends").select("id").eq("slug", slug).maybeSingle();
    const { data: trend, error: trendError } = await supabase
      .from("trends")
      .upsert(
        {
          slug,
          title: lead.title,
          category: categoryForSignals(cluster),
          summary,
          country_id: originSignal?.countryAttribution ? countryIds.get(originSignal.countryAttribution.country_code) || null : null,
          velocity_score: score.velocity,
          reach_score: score.reach,
          novelty_score: score.novelty,
          score: score.total,
          source_count: new Set(cluster.map((item) => item.source)).size,
          signal_count: cluster.length,
          growth_percent: score.velocity,
          last_seen_at: observedAt,
        },
        { onConflict: "slug" },
      )
      .select("id,title")
      .single();
    if (trendError) {
      errors.push({ source: lead.source, message: trendError.message });
      continue;
    }
    if (!existing) createdTrends += 1;

    const signalRows = cluster.map((item) => ({
      trend_id: trend.id,
      country_id: item.countryAttribution ? countryIds.get(item.countryAttribution.country_code) || null : null,
      source: item.source,
      external_id: item.externalId,
      title: item.title,
      excerpt: sanitizeExcerpt(item.excerpt),
      source_url: item.sourceUrl,
      author_label: item.authorLabel?.slice(0, 60) || null,
      engagement_count: item.engagementCount,
      audience_count: item.audienceCount || null,
      published_at: item.publishedAt,
      observed_at: observedAt,
      metadata: item.metadata || {},
    }));
    const { data: inserted, error: signalError } = await supabase
      .from("signals")
      .upsert(signalRows, { onConflict: "source,external_id" })
      .select("*");
    if (signalError) errors.push({ source: lead.source, message: signalError.message });
    insertedSignals += inserted?.length || 0;

    if (!existing) {
      const whySignals = (inserted || signalRows).map((item) => ({ ...item, id: "", observed_at: item.observed_at || new Date().toISOString() })) as Signal[];
      await generateWhyLayer(trend.id, trend.title, whySignals).catch((error) =>
        errors.push({ source: "why_layer", message: error instanceof Error ? error.message : String(error) }),
      );
    }
  }

  const briefingCoverage = await backfillTrendBriefings(supabase);

  const status = succeeded.length === 0 ? "failed" : errors.length ? "partial" : "complete";
  const { error: finishError } = await supabase
    .from("ingestion_runs")
    .update({
      finished_at: new Date().toISOString(),
      status,
      sources_succeeded: succeeded,
      signals_seen: signals.length,
      signals_inserted: insertedSignals,
      trends_created: createdTrends,
      errors,
    })
    .eq("id", runRow.id);
  if (finishError) throw finishError;
  const qualifiedClustersSeen = clusterSignals(signals).length;
  console.log(JSON.stringify({
    status,
    sources: succeeded,
    qualifiedSignalsSeen: signals.length,
    qualifiedClustersSeen,
    dailyTarget: DAILY_TREND_TARGET,
    runSupplyStatus: qualifiedClustersSeen >= DAILY_TREND_TARGET ? "target_met" : "under_supply",
    upsertedSignals: insertedSignals,
    createdTrends,
    countryAttributions,
    countriesDiscoveredFromEvidence: discoveredCountries.length,
    briefingCoverage,
    errors,
  }));
  if (succeeded.length === 0) process.exitCode = 1;
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
