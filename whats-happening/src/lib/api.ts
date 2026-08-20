import { NextResponse } from "next/server";

export function unavailable(error: unknown) {
  console.error(error);
  return NextResponse.json(
    { error: "Live data is not configured yet", code: "LIVE_DATA_UNAVAILABLE" },
    { status: 503 },
  );
}

export const edgeReadHeaders = {
  "Cache-Control": "public, s-maxage=15, stale-while-revalidate=60",
};
