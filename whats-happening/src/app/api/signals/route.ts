import { NextRequest, NextResponse } from "next/server";
import { demoSignals } from "@/lib/demo-data";
import { edgeReadHeaders, unavailable } from "@/lib/api";
import { isDemoMode } from "@/lib/env";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

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
      .limit(limit);
    if (error) throw error;
    return NextResponse.json({ signals: data, mode: "live" }, { headers: edgeReadHeaders });
  } catch (error) {
    return unavailable(error);
  }
}
