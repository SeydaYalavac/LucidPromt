import { NextResponse } from "next/server";
import { demoSignals, demoTrends } from "@/lib/demo-data";
import { edgeReadHeaders, unavailable } from "@/lib/api";
import { isDemoMode } from "@/lib/env";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { isAiTrend, isEligibleEvidenceSignal, resolveTrendContent, sanitizeSignal, sanitizeTrend } from "@/lib/trend-content";

export async function GET(_request: Request, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params;

  if (isDemoMode()) {
    const trend = demoTrends.find((item) => item.slug === slug && isAiTrend(item));
    if (!trend) return NextResponse.json({ error: "Trend not found" }, { status: 404 });
    const signals = demoSignals.filter((signal) => signal.trend_id === trend.id);
    return NextResponse.json({ trend, signals, mode: "demo" }, { headers: edgeReadHeaders });
  }

  try {
    const supabase = getSupabaseAdmin();
    const { data: trend, error } = await supabase
      .from("trends")
      .select("*, country:countries(*)")
      .eq("slug", slug)
      .single();
    if (error?.code === "PGRST116") {
      return NextResponse.json({ error: "Trend not found" }, { status: 404 });
    }
    if (error) throw error;

    const { data: signals, error: signalError } = await supabase
      .from("signals")
      .select("*")
      .eq("trend_id", trend.id)
      .order("observed_at", { ascending: false })
      .order("published_at", { ascending: false })
      .limit(30);
    if (signalError) throw signalError;
    const safeTrend = sanitizeTrend(trend);
    const safeSignals = (signals || []).map(sanitizeSignal).filter(isEligibleEvidenceSignal);
    const responseTrend = resolveTrendContent(safeTrend, safeSignals);
    if (!responseTrend.summary || !responseTrend.summary_source) {
      return NextResponse.json({ error: "Trend not found" }, { status: 404 });
    }
    return NextResponse.json({ trend: responseTrend, signals: safeSignals, mode: "live" }, { headers: edgeReadHeaders });
  } catch (error) {
    return unavailable(error);
  }
}
