import { NextResponse } from "next/server";
import { dataReadFailure, edgeReadHeaders } from "@/lib/api";
import { readMapActivity } from "@/lib/server/trend-data";

export async function GET() {
  try {
    return NextResponse.json(await readMapActivity(), { headers: edgeReadHeaders });
  } catch (error) {
    return dataReadFailure(error);
  }
}
