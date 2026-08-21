import { NextResponse } from "next/server";
import { edgeReadHeaders, unavailable } from "@/lib/api";
import { isDemoMode } from "@/lib/env";
import { demoTrends } from "@/lib/demo-data";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { isAiTrend, sanitizeSignal, sanitizeTrend, selectAiScopedTrends } from "@/lib/trend-content";
import type { Signal } from "@/types/trends";

function batches<T>(items: T[], size: number) {
  const groups: T[][] = [];
  for (let index = 0; index < items.length; index += size) groups.push(items.slice(index, index + size));
  return groups;
}

export async function GET() {
  if (isDemoMode()) {
    return NextResponse.json({ countries: [], trends: demoTrends.filter(isAiTrend), mode: "demo" }, { headers: edgeReadHeaders });
  }
  try {
    const supabase = getSupabaseAdmin();
    const [countries, trends] = await Promise.all([
      supabase.from("countries").select("*").order("name"),
      supabase
        .from("trends")
        .select("*, country:countries(*)")
        .not("country_id", "is", null)
        .order("score", { ascending: false })
        .limit(250),
    ]);
    if (countries.error) throw countries.error;
    if (trends.error) throw trends.error;
    const candidates = (trends.data || []).map(sanitizeTrend);
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
      { countries: countries.data, trends: selectAiScopedTrends(candidates, signals).slice(0, 50), mode: "live" },
      { headers: edgeReadHeaders },
    );
  } catch (error) {
    return unavailable(error);
  }
}
