import type { MetadataRoute } from "next";
import { readMapActivity, readPublicTrendArchive } from "@/lib/server/trend-data";
import { buildSitemap, staticSitemapEntries } from "@/lib/sitemap";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  try {
    const [publicTrends, mapPayload] = await Promise.all([
      readPublicTrendArchive(),
      readMapActivity(now),
    ]);
    return buildSitemap(publicTrends, mapPayload.activities, publicTrends);
  } catch {
    return staticSitemapEntries;
  }
}
