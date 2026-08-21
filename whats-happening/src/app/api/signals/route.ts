import { NextRequest, NextResponse } from "next/server";
import { demoSignals } from "@/lib/demo-data";
import { edgeReadHeaders, unavailable } from "@/lib/api";
import { isDemoMode } from "@/lib/env";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { isEligibleEvidenceSignal, sanitizeSignal } from "@/lib/trend-content";

export async function GET(request: NextRequest) {
  const limit = Math.min(100, Math.max(1, Number(request.nextUrl.searchParams.get("limit")) || 20));
  if (isDemoMode()) {
    return NextResponse.json({ signals: demoSignals.slice(0, limit), mode: "demo" }, { headers: edgeReadHeaders });
  }
  try {
    const { data, error } = await getSupabaseAdmin()
      .from("signals")
      .select("*")
      .order("observed_at", { ascending: false })
      .limit(Math.max(limit * 5, 500));
    if (error) throw error;
    const signals = (data || []).map(sanitizeSignal).filter(isEligibleEvidenceSignal).slice(0, limit);
    return NextResponse.json({ signals, mode: "live" }, { headers: edgeReadHeaders });
  } catch (error) {
    return unavailable(error);
  }
}
