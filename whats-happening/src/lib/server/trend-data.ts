import "server-only";

import { demoMapCountries, demoMapSignals, demoSignals, demoTrends } from "@/lib/demo-data";
import { canonicalCategoryQuery } from "@/lib/discovery";
import { isDemoMode } from "@/lib/env";
import { buildMapActivityPayload } from "@/lib/map";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
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
import type { MapActivityPayload, Signal, Trend, TrendDetailPayload, TrendListPayload } from "@/types/trends";

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
