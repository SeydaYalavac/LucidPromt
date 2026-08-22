import { NextRequest, NextResponse } from "next/server";
import { edgeReadHeaders, unavailable } from "@/lib/api";
import {
  boundedInteger,
  MAX_TREND_PAGE_SIZE,
} from "@/lib/trend-feed";
import { readTrendList } from "@/lib/server/trend-data";

export async function GET(request: NextRequest) {
  const now = new Date();
  const limit = Math.max(1, boundedInteger(request.nextUrl.searchParams.get("limit"), 10, MAX_TREND_PAGE_SIZE));
  const offset = boundedInteger(request.nextUrl.searchParams.get("offset"), 0, 10_000);
  const globalPulse = request.nextUrl.searchParams.get("globalPulse") === "true";
  const category = request.nextUrl.searchParams.get("category");
  const country = request.nextUrl.searchParams.get("country");

  try {
    const payload = await readTrendList({ limit, offset, mode: "live", now, globalPulse, category, country });
    return NextResponse.json(payload, { headers: edgeReadHeaders });
  } catch (error) {
    return unavailable(error);
  }
}
