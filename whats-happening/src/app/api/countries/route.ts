import { NextResponse } from "next/server";
import { edgeReadHeaders, unavailable } from "@/lib/api";
import { isDemoMode } from "@/lib/env";
import { demoTrends } from "@/lib/demo-data";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export async function GET() {
  if (isDemoMode()) {
    return NextResponse.json({ countries: [], trends: demoTrends, mode: "demo" }, { headers: edgeReadHeaders });
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
        .limit(50),
    ]);
    if (countries.error) throw countries.error;
    if (trends.error) throw trends.error;
    return NextResponse.json(
      { countries: countries.data, trends: trends.data, mode: "live" },
      { headers: edgeReadHeaders },
    );
  } catch (error) {
    return unavailable(error);
  }
}
