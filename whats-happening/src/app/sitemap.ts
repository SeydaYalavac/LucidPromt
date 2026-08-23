import type { MetadataRoute } from "next";
import { readMapActivity, readTrendList } from "@/lib/server/trend-data";
import { buildSitemap, staticSitemapEntries } from "@/lib/sitemap";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  try {
    const [trendPayload, mapPayload] = await Promise.all([
      readTrendList({ limit: 1_000, offset: 0, mode: "live", now }),
      readMapActivity(now),
    ]);
    return buildSitemap(trendPayload.trends, mapPayload.activities);
  } catch {
    return staticSitemapEntries;
  }
}
