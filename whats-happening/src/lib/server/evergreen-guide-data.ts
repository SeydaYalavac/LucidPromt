import "server-only";

import { liveTrendsForEvergreenGuide, type EvergreenGuideSlug } from "@/content/evergreen-guides";
import { readTrendList } from "@/lib/server/trend-data";

export async function readEvergreenGuideTrends(slug: EvergreenGuideSlug) {
  try {
    const payload = await readTrendList({ limit: 1_000, offset: 0, mode: "live" });
    return payload.mode === "live" ? liveTrendsForEvergreenGuide(payload.trends, slug) : [];
  } catch {
    return [];
  }
}
