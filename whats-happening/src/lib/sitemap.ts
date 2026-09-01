import type { MetadataRoute } from "next";
import type { CountryActivity, Trend } from "@/types/trends";
import { SITE_URL } from "./site";
import { absoluteUrl, countryPath, trendPath } from "./trend-page-graph";
import {
  MIN_RETAINED_HUB_ARTICLES,
  retainedCategoryHubs,
  retainedHubForCategory,
  retainedHubPageCount,
  retainedHubPath,
} from "./trend-hubs";
import researchState from "../content/security-research-state.json";
import evergreenGuideState from "../content/evergreen-guide-state.json";

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
  ...["ai-security-vulnerabilities", "hallucination-detection"].map((slug) => ({
    url: `${SITE_URL}/guides/${slug}`,
    lastModified: researchState.checkedAt,
    changeFrequency: "daily" as const,
    priority: 0.8,
  })),
  ...["ai-agents", "ai-chips-infrastructure", "ai-governance"].map((slug) => ({
    url: `${SITE_URL}/guides/${slug}`,
    lastModified: evergreenGuideState.checkedAt,
    changeFrequency: "daily" as const,
    priority: 0.8,
  })),
  ...[
    "compare/exploding-topics-vs-google-trends",
    "compare/exploding-topics-vs-glimpse",
    "compare/trend-analysis-tools",
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

export function buildSitemap(
  trends: Trend[],
  activities: CountryActivity[],
  collectionTrends: Trend[] = trends,
): MetadataRoute.Sitemap {
  const eligibleTrends = trends.filter(hasSourcedBriefing);
  const eligibleCollectionTrends = collectionTrends.filter(hasSourcedBriefing);
  const categoryGroups = new Map(retainedCategoryHubs.map((hub) => [hub.slug, { hub, trends: [] as Trend[] }]));
  for (const trend of eligibleCollectionTrends) {
    categoryGroups.get(retainedHubForCategory(trend.category).slug)?.trends.push(trend);
  }
  const categoryEntries = [...categoryGroups.values()]
    .filter(({ trends: categoryTrends }) => categoryTrends.length >= MIN_RETAINED_HUB_ARTICLES)
    .flatMap(({ hub, trends: categoryTrends }) => Array.from(
      { length: retainedHubPageCount(categoryTrends.length) },
      (_, index) => ({
        url: absoluteUrl(retainedHubPath(hub, index + 1)),
        lastModified: newestTimestamp(categoryTrends.map((trend) => trend.brief?.article.last_updated_at || trend.updated_at || trend.last_seen_at)),
        changeFrequency: "daily" as const,
        priority: 0.7,
      }),
    ))
    .sort((left, right) => left.url.localeCompare(right.url));

  const countryEntries = activities
    .filter((activity) => activity.country.slug.trim() && activity.rising_topics.length >= MIN_RETAINED_HUB_ARTICLES && activity.developments.length)
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
