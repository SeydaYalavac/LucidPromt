import { NextResponse } from "next/server";
import { edgeReadHeaders, unavailable } from "@/lib/api";
import { readMapActivity } from "@/lib/server/trend-data";

export async function GET() {
  try {
    return NextResponse.json(await readMapActivity(), { headers: edgeReadHeaders });
  } catch (error) {
    return unavailable(error);
  }
}
