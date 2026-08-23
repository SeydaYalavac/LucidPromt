import type { MetadataRoute } from "next";
import type { CountryActivity, Trend } from "@/types/trends";
import { SITE_URL } from "./site";
import { absoluteUrl, categoryPath, countryPath, trendPath } from "./trend-page-graph";

export const staticSitemapEntries: MetadataRoute.Sitemap = [
  {
    url: SITE_URL,
    changeFrequency: "daily",
    priority: 1,
  },
  {
    url: `${SITE_URL}/about`,
    changeFrequency: "monthly",
    priority: 0.8,
  },
  {
    url: `${SITE_URL}/how-it-works`,
    changeFrequency: "monthly",
    priority: 0.8,
  },
  {
    url: `${SITE_URL}/pricing`,
    changeFrequency: "monthly",
    priority: 0.7,
  },
  {
    url: `${SITE_URL}/security-research`,
    changeFrequency: "daily",
    priority: 0.8,
  },
  ...[
    "compare/exploding-topics-vs-google-trends",
    "compare/exploding-topics-vs-glimpse",
    "alternatives/google-trends",
    "alternatives/exploding-topics",
    "alternatives/glimpse",
    "alternatives/trends-co",
  ].map((path) => ({
    url: `${SITE_URL}/${path}`,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  })),
  ...["privacy", "terms"].map((path) => ({
    url: `${SITE_URL}/${path}`,
    changeFrequency: "monthly" as const,
    priority: 0.4,
  })),
  ...["world", "trending", "explore", "map"].map((path) => ({
    url: `${SITE_URL}/${path}`,
    changeFrequency: "daily" as const,
    priority: 0.7,
  })),
];

function hasSourcedBriefing(trend: Trend) {
  return Boolean(
    trend.slug.trim()
    && trend.summary
    && trend.summary_source?.source_url
    && trend.brief?.evidence.length
    && trend.brief.article.sections.length,
  );
}

function newestTimestamp(values: Array<string | undefined>) {
  return values
    .filter((value): value is string => Boolean(value))
    .sort((left, right) => new Date(right).getTime() - new Date(left).getTime())[0];
}

export function buildSitemap(trends: Trend[], activities: CountryActivity[]): MetadataRoute.Sitemap {
  const eligibleTrends = trends.filter(hasSourcedBriefing);
  const categoryEntries = [...new Set(eligibleTrends.map((trend) => trend.category.trim()).filter(Boolean))]
    .map((category) => ({
      category,
      path: categoryPath(category),
      trends: eligibleTrends.filter((trend) => trend.category.trim() === category),
    }))
    .filter(({ path }) => path !== "/category/")
    .sort((left, right) => left.path.localeCompare(right.path))
    .map(({ path, trends: categoryTrends }) => ({
      url: absoluteUrl(path),
      lastModified: newestTimestamp(categoryTrends.map((trend) => trend.brief?.article.last_updated_at || trend.updated_at || trend.last_seen_at)),
      changeFrequency: "daily" as const,
      priority: 0.7,
    }));

  const countryEntries = activities
    .filter((activity) => activity.country.slug.trim() && activity.rising_topics.length && activity.developments.length)
    .map((activity) => ({
      url: absoluteUrl(countryPath(activity.country.slug)),
      lastModified: activity.latest_observed_at,
      changeFrequency: "daily" as const,
      priority: 0.7,
    }))
    .sort((left, right) => left.url.localeCompare(right.url));

  const trendEntries = eligibleTrends
    .map((trend) => ({
      url: absoluteUrl(trendPath(trend.slug)),
      lastModified: trend.brief?.article.last_updated_at || trend.updated_at || trend.last_seen_at,
      changeFrequency: "daily" as const,
      priority: 0.8,
    }))
    .sort((left, right) => left.url.localeCompare(right.url));

  return [...new Map(
    [...staticSitemapEntries, ...categoryEntries, ...countryEntries, ...trendEntries]
      .map((entry) => [entry.url, entry]),
  ).values()];
}
