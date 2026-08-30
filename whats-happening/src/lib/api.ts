import { NextResponse } from "next/server";
import { isLiveDataConfigurationError } from "@/lib/live-data-error";

export function dataReadFailure(error: unknown) {
  console.error(error);

  if (!isLiveDataConfigurationError(error)) {
    return NextResponse.json(
      { error: "Live data request failed", code: "LIVE_DATA_REQUEST_FAILED" },
      { status: 502 },
    );
  }

  return NextResponse.json(
    { error: "Live data is not configured yet", code: "LIVE_DATA_UNAVAILABLE" },
    { status: 503 },
  );
}

export const edgeReadHeaders = {
  "Cache-Control": "public, s-maxage=15, stale-while-revalidate=60",
};
