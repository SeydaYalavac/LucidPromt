import { NextRequest, NextResponse } from "next/server";
import { demoTrends } from "@/lib/demo-data";
import { edgeReadHeaders, unavailable } from "@/lib/api";
import { isDemoMode } from "@/lib/env";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { isDiscoverableTrend, sanitizeTrend } from "@/lib/trend-content";

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
    let query = getSupabaseAdmin()
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
    const trends = (data || []).map(sanitizeTrend).filter(isDiscoverableTrend).slice(0, limit);
    return NextResponse.json({ trends, mode: "live" }, { headers: edgeReadHeaders });
  } catch (error) {
    return unavailable(error);
  }
}
