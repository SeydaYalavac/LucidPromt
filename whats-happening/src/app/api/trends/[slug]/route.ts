import { NextResponse } from "next/server";
import { edgeReadHeaders, unavailable } from "@/lib/api";
import { readTrendDetail } from "@/lib/server/trend-data";

export async function GET(_request: Request, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params;
  try {
    const payload = await readTrendDetail(slug);
    if (!payload) return NextResponse.json({ error: "Trend not found" }, { status: 404 });
    return NextResponse.json(payload, { headers: edgeReadHeaders });
  } catch (error) {
    return unavailable(error);
  }
}
