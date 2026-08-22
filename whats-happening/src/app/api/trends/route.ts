import { NextRequest, NextResponse } from "next/server";
import { demoTrends } from "@/lib/demo-data";
import { edgeReadHeaders, unavailable } from "@/lib/api";
import { isDemoMode } from "@/lib/env";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { isAiTrend, sanitizeSignal, sanitizeTrend } from "@/lib/trend-content";
import {
  ACTIVE_TREND_WINDOW_HOURS,
  DAILY_TREND_TARGET,
  activeTrendCutoff,
  boundedInteger,
  buildTrendListPayload,
  MAX_TREND_PAGE_SIZE,
  utcDayStart,
} from "@/lib/trend-feed";
import type { Signal } from "@/types/trends";
import { canonicalCategoryQuery } from "@/lib/discovery";

function batches<T>(items: T[], size: number) {
  const groups: T[][] = [];
  for (let index = 0; index < items.length; index += size) groups.push(items.slice(index, index + size));
  return groups;
}

export async function GET(request: NextRequest) {
  const now = new Date();
  const limit = Math.max(1, boundedInteger(request.nextUrl.searchParams.get("limit"), 10, MAX_TREND_PAGE_SIZE));
  const offset = boundedInteger(request.nextUrl.searchParams.get("offset"), 0, 10_000);
  const globalPulse = request.nextUrl.searchParams.get("globalPulse") === "true";
  const category = request.nextUrl.searchParams.get("category");
  const country = request.nextUrl.searchParams.get("country");

  if (isDemoMode()) {
    const canonicalCategory = category ? canonicalCategoryQuery(category) : null;
    const qualified = demoTrends.filter((trend) =>
      isAiTrend(trend)
      && (!globalPulse || trend.is_global_pulse)
      && (!canonicalCategory || trend.category.toLowerCase() === canonicalCategory.toLowerCase())
      && (!country || trend.country?.slug === country),
    );
    const trends = qualified.slice(offset, offset + limit);
    const dayStart = utcDayStart(now);
    return NextResponse.json(
      {
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
          limit,
          offset,
          total: qualified.length,
          has_more: offset + trends.length < qualified.length,
        },
      },
      { headers: edgeReadHeaders },
    );
  }

  try {
    const supabase = getSupabaseAdmin();
    let query = supabase
      .from("trends")
      .select(country ? "*, country:countries!inner(*)" : "*, country:countries(*)")
      .order("score", { ascending: false })
      .order("last_seen_at", { ascending: false })
      .gte("last_seen_at", activeTrendCutoff(now).toISOString())
      .limit(1_000);
    if (globalPulse) query = query.eq("is_global_pulse", true);
    if (category) query = query.ilike("category", canonicalCategoryQuery(category));
    if (country) query = query.eq("country.slug", country);
    const { data, error } = await query;
    if (error) throw error;
    const candidates = (data || []).map(sanitizeTrend);
    const signalResults = await Promise.all(
      batches(candidates.map((trend) => trend.id), 100).map((trendIds) =>
        supabase
          .from("signals")
          .select("*")
          .in("trend_id", trendIds)
          .order("observed_at", { ascending: false })
          .order("published_at", { ascending: false })
          .limit(1_000),
      ),
    );
    const signalError = signalResults.find((result) => result.error)?.error;
    if (signalError) throw signalError;
    const signals = signalResults.flatMap((result) => result.data || []).map(sanitizeSignal) as Signal[];
    return NextResponse.json(
      buildTrendListPayload(candidates, signals, { limit, offset, mode: "live", now }),
      { headers: edgeReadHeaders },
    );
  } catch (error) {
    return unavailable(error);
  }
}
