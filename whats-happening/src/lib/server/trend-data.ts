import "server-only";

import { demoMapCountries, demoMapSignals, demoSignals, demoTrends } from "@/lib/demo-data";
import { canonicalCategoryQuery } from "@/lib/discovery";
import { countryAttributionFromMetadata } from "@/lib/country-attribution";
import { isDemoMode } from "@/lib/env";
import { buildMapActivityPayload } from "@/lib/map";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import {
  MIN_RETAINED_HUB_ARTICLES,
  RETAINED_HUB_PAGE_SIZE,
  retainedCategoryHubs,
  retainedHubForSlug,
  retainedHubPageCount,
  type RetainedHubDefinition,
} from "@/lib/trend-hubs";
import {
  isAiTrend,
  isEligibleEvidenceSignal,
  resolveTrendContent,
  sanitizeSignal,
  sanitizeTrend,
} from "@/lib/trend-content";
import {
  ACTIVE_TREND_WINDOW_HOURS,
  DAILY_TREND_TARGET,
  activeTrendCutoff,
  buildPublicTrendArchive,
  buildTrendListPayload,
  type TrendFeedOptions,
  utcDayStart,
} from "@/lib/trend-feed";
import type {
  MapActivityPayload,
  RetainedHubDirectoryItem,
  RetainedCountryPagePayload,
  RetainedTrendPagePayload,
  Signal,
  Trend,
  TrendDetailPayload,
  TrendListPayload,
} from "@/types/trends";

function batches<T>(items: T[], size: number) {
  const groups: T[][] = [];
  for (let index = 0; index < items.length; index += size) groups.push(items.slice(index, index + size));
  return groups;
}

export async function readTrendDetail(slug: string): Promise<TrendDetailPayload | null> {
  if (isDemoMode()) {
    const trend = demoTrends.find((item) => item.slug === slug && isAiTrend(item));
    if (!trend) return null;
    const signals = demoSignals.filter((signal) => signal.trend_id === trend.id);
    return { trend, signals, mode: "demo" };
  }

  const supabase = getSupabaseAdmin();
  const { data: trend, error } = await supabase
    .from("trends")
    .select("*, country:countries(*)")
    .eq("slug", slug)
    .single();
  if (error?.code === "PGRST116") return null;
  if (error) throw error;

  const { data: signals, error: signalError } = await supabase
    .from("signals")
    .select("*, country:countries(*)")
    .eq("trend_id", trend.id)
    .order("observed_at", { ascending: false })
    .order("published_at", { ascending: false })
    .limit(30);
  if (signalError) throw signalError;

  const safeTrend = sanitizeTrend(trend);
  const safeSignals = (signals || []).map(sanitizeSignal).filter(isEligibleEvidenceSignal);
  const responseTrend = resolveTrendContent(safeTrend, safeSignals);
  if (!responseTrend.summary || !responseTrend.summary_source) return null;
  return { trend: responseTrend, signals: safeSignals, mode: "live" };
}

export async function readTrendList(options: TrendFeedOptions & {
  category?: string | null;
  country?: string | null;
  globalPulse?: boolean;
}): Promise<TrendListPayload> {
  const now = options.now || new Date();
  const category = options.category ? canonicalCategoryQuery(options.category) : null;

  if (isDemoMode()) {
    const qualified = demoTrends.filter((trend) =>
      isAiTrend(trend)
      && (!options.globalPulse || trend.is_global_pulse)
      && (!category || trend.category.toLowerCase() === category.toLowerCase())
      && (!options.country || trend.country?.slug === options.country),
    );
    const trends = qualified.slice(options.offset, options.offset + options.limit);
    const dayStart = utcDayStart(now);
    return {
      trends,
      mode: "demo",
      coverage: {
        target: DAILY_TREND_TARGET,
        qualified_today: qualified.length,
        active_qualified: qualified.length,
        returned: trends.length,
        status: qualified.length >= DAILY_TREND_TARGET ? "target_met" : "under_supply",
        utc_day: dayStart.toISOString().slice(0, 10),
        as_of: now.toISOString(),
        active_window_hours: ACTIVE_TREND_WINDOW_HOURS,
      },
      pagination: {
        limit: options.limit,
        offset: options.offset,
        total: qualified.length,
        has_more: options.offset + trends.length < qualified.length,
      },
    };
  }

  const supabase = getSupabaseAdmin();
  let query = supabase
    .from("trends")
    .select(options.country ? "*, country:countries!inner(*)" : "*, country:countries(*)")
    .order("score", { ascending: false })
    .order("last_seen_at", { ascending: false })
    .gte("last_seen_at", activeTrendCutoff(now).toISOString())
    .limit(1_000);
  if (options.globalPulse) query = query.eq("is_global_pulse", true);
  if (category) query = query.ilike("category", category);
  if (options.country) query = query.eq("country.slug", options.country);
  const { data, error } = await query;
  if (error) throw error;

  const candidates = (data || []).map(sanitizeTrend);
  const signalResults = await Promise.all(
    batches(candidates.map((trend) => trend.id), 100).map((trendIds) =>
      supabase
        .from("signals")
        .select("*, country:countries(*)")
        .in("trend_id", trendIds)
        .order("observed_at", { ascending: false })
        .order("published_at", { ascending: false })
        .limit(1_000),
    ),
  );
  const signalError = signalResults.find((result) => result.error)?.error;
  if (signalError) throw signalError;
  const signals = signalResults.flatMap((result) => result.data || []).map(sanitizeSignal) as Signal[];
  return buildTrendListPayload(candidates, signals, { ...options, now });
}

export async function readPublicTrendArchive(now = new Date()): Promise<Trend[]> {
  if (isDemoMode()) return [];

  const supabase = getSupabaseAdmin();
  const candidates: Trend[] = [];
  const pageSize = 1_000;
  for (let offset = 0; ; offset += pageSize) {
    const { data, error } = await supabase
      .from("trends")
      .select("*, country:countries(*)")
      .order("last_seen_at", { ascending: false })
      .range(offset, offset + pageSize - 1);
    if (error) throw error;
    candidates.push(...(data || []).map(sanitizeTrend));
    if (!data || data.length < pageSize) break;
  }

  const signalResults = await Promise.all(
    batches(candidates.map((trend) => trend.id), 100).map((trendIds) =>
      supabase
        .from("signals")
        .select("*, country:countries(*)")
        .in("trend_id", trendIds)
        .order("observed_at", { ascending: false })
        .order("published_at", { ascending: false })
        .limit(1_000),
    ),
  );
  const signalError = signalResults.find((result) => result.error)?.error;
  if (signalError) throw signalError;
  const signals = signalResults.flatMap((result) => result.data || []).map(sanitizeSignal) as Signal[];
  return buildPublicTrendArchive(candidates, signals, now);
}

async function readRetainedCategoryCount(hub: RetainedHubDefinition) {
  if (isDemoMode()) {
    return demoTrends.filter((trend) => hub.categories.includes(trend.category)).length;
  }
  const supabase = getSupabaseAdmin();
  const { count, error } = await supabase
    .from("trends")
    .select("id", { count: "exact", head: true })
    .in("category", [...hub.categories]);
  if (error) throw error;
  return count || 0;
}

export async function readRetainedHubDirectory(): Promise<RetainedHubDirectoryItem[]> {
  const totals = await Promise.all(retainedCategoryHubs.map(readRetainedCategoryCount));
  return retainedCategoryHubs.flatMap((hub, index) => {
    const total = totals[index];
    if (total < MIN_RETAINED_HUB_ARTICLES) return [];
    return [{ slug: hub.slug, label: hub.label, total, page_count: retainedHubPageCount(total) }];
  });
}

export async function readRetainedCategoryPage(
  slug: string,
  page: number,
  now = new Date(),
): Promise<RetainedTrendPagePayload | null> {
  const hub = retainedHubForSlug(slug);
  if (!hub) return null;
  const total = await readRetainedCategoryCount(hub);
  if (total < MIN_RETAINED_HUB_ARTICLES) return null;
  const pageCount = retainedHubPageCount(total);
  if (page > pageCount) return null;
  const offset = (page - 1) * RETAINED_HUB_PAGE_SIZE;

  let trends: Trend[];
  let mode: "live" | "demo" = "live";
  if (isDemoMode()) {
    mode = "demo";
    trends = demoTrends
      .filter((trend) => hub.categories.includes(trend.category))
      .sort((left, right) => right.score - left.score)
      .slice(offset, offset + RETAINED_HUB_PAGE_SIZE);
  } else {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("trends")
      .select("*, country:countries(*)")
      .in("category", [...hub.categories])
      .order("last_seen_at", { ascending: false })
      .order("score", { ascending: false })
      .range(offset, offset + RETAINED_HUB_PAGE_SIZE - 1);
    if (error) throw error;
    const candidates = (data || []).map(sanitizeTrend);
    const signalResults = await Promise.all(candidates.map((trend) =>
      supabase
        .from("signals")
        .select("*, country:countries(*)")
        .eq("trend_id", trend.id)
        .order("observed_at", { ascending: false })
        .order("published_at", { ascending: false })
        .limit(30),
    ));
    const signalError = signalResults.find((result) => result.error)?.error;
    if (signalError) throw signalError;
    const signals = signalResults.flatMap((result) => result.data || []).map(sanitizeSignal) as Signal[];
    trends = buildPublicTrendArchive(candidates, signals, now);
  }

  return {
    trends,
    mode,
    collection: { kind: "category", slug: hub.slug, label: hub.label },
    pagination: {
      page,
      page_size: RETAINED_HUB_PAGE_SIZE,
      total,
      page_count: pageCount,
      has_previous: page > 1,
      has_next: page < pageCount,
    },
  };
}

export async function readRetainedCountryPage(
  slug: string,
  page: number,
  now = new Date(),
): Promise<RetainedCountryPagePayload | null> {
  if (isDemoMode()) return null;
  const supabase = getSupabaseAdmin();
  const { data: country, error: countryError } = await supabase
    .from("countries")
    .select("*")
    .eq("slug", slug)
    .single();
  if (countryError?.code === "PGRST116") return null;
  if (countryError) throw countryError;

  const verifiedSignals: Signal[] = [];
  for (let offset = 0; ; offset += RETAINED_HUB_PAGE_SIZE) {
    const { data, error } = await supabase
      .from("signals")
      .select("*, country:countries(*)")
      .eq("country_id", country.id)
      .order("observed_at", { ascending: false })
      .range(offset, offset + RETAINED_HUB_PAGE_SIZE - 1);
    if (error) throw error;
    const pageSignals = (data || []).map(sanitizeSignal).filter((signal) =>
      isEligibleEvidenceSignal(signal)
      && Boolean(countryAttributionFromMetadata(signal.metadata, {
        source: signal.source,
        sourceUrl: signal.source_url,
        countryCode: country.code,
      })),
    );
    verifiedSignals.push(...pageSignals);
    if (!data || data.length < RETAINED_HUB_PAGE_SIZE) break;
  }

  const trendIds = [...new Set(verifiedSignals.map((signal) => signal.trend_id))];
  const trendResults = await Promise.all(batches(trendIds, RETAINED_HUB_PAGE_SIZE).map((ids) =>
    supabase.from("trends").select("*, country:countries(*)").in("id", ids).limit(RETAINED_HUB_PAGE_SIZE),
  ));
  const trendError = trendResults.find((result) => result.error)?.error;
  if (trendError) throw trendError;
  const candidates = trendResults.flatMap((result) => result.data || []).map(sanitizeTrend);
  const allSignalResults = await Promise.all(candidates.map((trend) =>
    supabase
      .from("signals")
      .select("*, country:countries(*)")
      .eq("trend_id", trend.id)
      .order("observed_at", { ascending: false })
      .limit(RETAINED_HUB_PAGE_SIZE),
  ));
  const allSignalError = allSignalResults.find((result) => result.error)?.error;
  if (allSignalError) throw allSignalError;
  const allSignals = allSignalResults.flatMap((result) => result.data || []).map(sanitizeSignal) as Signal[];
  const archive = buildPublicTrendArchive(candidates, allSignals, now)
    .sort((left, right) => new Date(right.last_seen_at).getTime() - new Date(left.last_seen_at).getTime());
  if (!archive.length) return null;
  const total = archive.length;
  const pageCount = retainedHubPageCount(total);
  if (page > pageCount) return null;
  const offset = (page - 1) * RETAINED_HUB_PAGE_SIZE;
  const trends = archive.slice(offset, offset + RETAINED_HUB_PAGE_SIZE);
  const visibleIds = new Set(trends.map((trend) => trend.id));

  return {
    trends,
    mode: "live",
    country,
    evidence_count: verifiedSignals.filter((signal) => visibleIds.has(signal.trend_id)).length,
    collection: { kind: "country", slug: country.slug, label: country.name },
    pagination: {
      page,
      page_size: RETAINED_HUB_PAGE_SIZE,
      total,
      page_count: pageCount,
      has_previous: page > 1,
      has_next: page < pageCount,
    },
  };
}

export async function readMapActivity(now = new Date()): Promise<MapActivityPayload> {
  if (isDemoMode()) {
    return buildMapActivityPayload(demoMapCountries, demoTrends, demoMapSignals, { mode: "demo", now });
  }

  const supabase = getSupabaseAdmin();
  const [countries, trends] = await Promise.all([
    supabase.from("countries").select("*").order("name"),
    supabase
      .from("trends")
      .select("*, country:countries(*)")
      .order("score", { ascending: false })
      .order("last_seen_at", { ascending: false })
      .gte("last_seen_at", activeTrendCutoff(now).toISOString())
      .limit(1_000),
  ]);
  if (countries.error) throw countries.error;
  if (trends.error) throw trends.error;

  const candidates = (trends.data || []).map(sanitizeTrend);
  const signalResults = await Promise.all(
    batches(candidates.map((trend) => trend.id), 100).map((trendIds) =>
      supabase
        .from("signals")
        .select("*, country:countries(*)")
        .in("trend_id", trendIds)
        .order("observed_at", { ascending: false })
        .order("published_at", { ascending: false })
        .limit(1_000),
    ),
  );
  const signalError = signalResults.find((result) => result.error)?.error;
  if (signalError) throw signalError;
  const signals = signalResults.flatMap((result) => result.data || []).map(sanitizeSignal) as Signal[];
  return buildMapActivityPayload(countries.data || [], candidates, signals, { mode: "live", now });
}
