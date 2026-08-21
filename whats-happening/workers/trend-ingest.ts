import { adapters } from "./sources";
import { clusterSignals, earliestAttributedSignal, scoreSignals, slugifyTitle } from "../src/lib/scoring";
import { isAiSignal, sanitizeExcerpt, summarizeEvidenceSignal } from "../src/lib/trend-content";
import { getSupabaseAdmin } from "../src/lib/supabase/admin";
import { generateWhyLayer } from "../src/lib/why-layer";
import type { Signal, SourceName, SourceSignal } from "../src/types/trends";

const sourceNames = (process.env.INGEST_SOURCES || "hacker_news,github,google_trends")
  .split(",")
  .map((source) => source.trim())
  .filter((source): source is SourceName => source in adapters);

function categoryFor(signal: SourceSignal) {
  const value = `${signal.title} ${signal.excerpt || ""}`.toLowerCase();
  if (/\b(ai|llm|model|agent|machine learning)\b/.test(value)) return "Artificial Intelligence";
  if (/\b(climate|energy|battery|carbon)\b/.test(value)) return "Climate & Energy";
  if (/\b(github|api|framework|library|developer)\b/.test(value)) return "Developer Tools";
  if (/\b(space|nasa|rocket|orbit)\b/.test(value)) return "Space";
  if (/\b(health|medicine|clinical|drug)\b/.test(value)) return "Health";
  return "World";
}

async function run() {
  if (!sourceNames.length) throw new Error("INGEST_SOURCES contains no supported source names");
  const supabase = getSupabaseAdmin();
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
      signals = signals.concat(
        result.value
          .map((signal) => ({ ...signal, excerpt: sanitizeExcerpt(signal.excerpt) || undefined }))
          .filter(isAiSignal),
      );
      succeeded.push(name);
    } else {
      errors.push({ source: name, message: result.reason instanceof Error ? result.reason.message : String(result.reason) });
    }
  });

  const { data: countries } = await supabase.from("countries").select("id,code");
  const countryIds = new Map((countries || []).map((country) => [country.code, country.id]));

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
          category: categoryFor(lead),
          summary,
          country_id: originSignal?.countryCode ? countryIds.get(originSignal.countryCode) || null : null,
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
      country_id: item.countryCode ? countryIds.get(item.countryCode) || null : null,
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
      .upsert(signalRows, { onConflict: "source,external_id", ignoreDuplicates: true })
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
  console.log(JSON.stringify({ status, sources: succeeded, signalsSeen: signals.length, insertedSignals, createdTrends, errors }));
  if (succeeded.length === 0) process.exitCode = 1;
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
