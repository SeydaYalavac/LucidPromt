import { NextRequest, NextResponse } from "next/server";
import { demoTrends } from "@/lib/demo-data";
import { edgeReadHeaders, unavailable } from "@/lib/api";
import { isDemoMode } from "@/lib/env";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { isDiscoverableTrend, resolveTrendContent, sanitizeSignal, sanitizeTrend } from "@/lib/trend-content";
import type { Signal } from "@/types/trends";

function batches<T>(items: T[], size: number) {
  const groups: T[][] = [];
  for (let index = 0; index < items.length; index += size) groups.push(items.slice(index, index + size));
  return groups;
}

export async function GET(request: NextRequest) {
  const limit = Math.min(50, Math.max(1, Number(request.nextUrl.searchParams.get("limit")) || 10));
  const globalPulse = request.nextUrl.searchParams.get("globalPulse") === "true";
  const category = request.nextUrl.searchParams.get("category");
  const country = request.nextUrl.searchParams.get("country");

  if (isDemoMode()) {
    const trends = demoTrends.filter((trend) => !globalPulse || trend.is_global_pulse).slice(0, limit);
    return NextResponse.json({ trends, mode: "demo" }, { headers: edgeReadHeaders });
  }

  try {
    const supabase = getSupabaseAdmin();
    let query = supabase
      .from("trends")
      .select(country ? "*, country:countries!inner(*)" : "*, country:countries(*)")
      .order("score", { ascending: false })
      .order("last_seen_at", { ascending: false })
      .limit(Math.max(limit * 5, 250));
    if (globalPulse) query = query.eq("is_global_pulse", true);
    if (category) query = query.ilike("category", category.replace(/-/g, " "));
    if (country) query = query.eq("country.slug", country);
    const { data, error } = await query;
    if (error) throw error;
    const candidates = (data || []).map(sanitizeTrend).filter(isDiscoverableTrend);
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
    const signalsByTrend = new Map<string, Signal[]>();
    for (const signal of signals) signalsByTrend.set(signal.trend_id, [...(signalsByTrend.get(signal.trend_id) || []), signal]);
    const trends = candidates
      .map((trend) => resolveTrendContent(trend, signalsByTrend.get(trend.id) || []))
      .filter((trend) => trend.summary && trend.summary_source)
      .slice(0, limit);
    return NextResponse.json({ trends, mode: "live" }, { headers: edgeReadHeaders });
  } catch (error) {
    return unavailable(error);
  }
}
