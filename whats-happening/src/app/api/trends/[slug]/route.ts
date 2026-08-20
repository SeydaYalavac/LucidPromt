import { NextResponse } from "next/server";
import { demoSignals, demoTrends } from "@/lib/demo-data";
import { edgeReadHeaders, unavailable } from "@/lib/api";
import { isDemoMode } from "@/lib/env";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export async function GET(_request: Request, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params;

  if (isDemoMode()) {
    const trend = demoTrends.find((item) => item.slug === slug) || demoTrends[0];
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
      .order("published_at", { ascending: false })
      .limit(30);
    if (signalError) throw signalError;
    return NextResponse.json({ trend, signals, mode: "live" }, { headers: edgeReadHeaders });
  } catch (error) {
    return unavailable(error);
  }
}
