import { NextResponse } from "next/server";
import { edgeReadHeaders, unavailable } from "@/lib/api";
import { isDemoMode } from "@/lib/env";
import { demoMapCountries, demoMapSignals, demoTrends } from "@/lib/demo-data";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { sanitizeSignal, sanitizeTrend } from "@/lib/trend-content";
import { activeTrendCutoff } from "@/lib/trend-feed";
import { buildMapActivityPayload } from "@/lib/map";
import type { Signal } from "@/types/trends";

function batches<T>(items: T[], size: number) {
  const groups: T[][] = [];
  for (let index = 0; index < items.length; index += size) groups.push(items.slice(index, index + size));
  return groups;
}

export async function GET() {
  const now = new Date();
  if (isDemoMode()) {
    return NextResponse.json(buildMapActivityPayload(demoMapCountries, demoTrends, demoMapSignals, { mode: "demo", now }), { headers: edgeReadHeaders });
  }
  try {
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
    return NextResponse.json(buildMapActivityPayload(countries.data || [], candidates, signals, { mode: "live", now }), { headers: edgeReadHeaders });
  } catch (error) {
    return unavailable(error);
  }
}
