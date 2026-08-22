import { describe, expect, it } from "vitest";
import type { Country, CountryActivity, Signal, Trend } from "@/types/trends";
import {
  absoluteUrl,
  categoryPath,
  categoryStructuredData,
  countryPath,
  countryStructuredData,
  evidenceBackedCountries,
  serializeStructuredData,
  trendInternalLinks,
  trendPath,
  trendStructuredData,
} from "./trend-page-graph";

const country: Country = {
  id: "gb",
  code: "GB",
  slug: "united-kingdom",
  name: "United Kingdom",
  latitude: 55.37,
  longitude: -3.43,
};

const trend: Trend = {
  id: "trend-1",
  slug: "openai-model-evaluation",
  title: "OpenAI model evaluation",
  category: "Artificial Intelligence",
  summary: "A current source-linked AI model evaluation trend.",
  country_id: country.id,
  country,
  velocity_score: 82,
  reach_score: 70,
  novelty_score: 65,
  score: 75,
  is_global_pulse: false,
  source_count: 1,
  signal_count: 1,
  growth_percent: null,
  first_seen_at: "2026-08-21T17:00:00Z",
  last_seen_at: "2026-08-21T19:30:00Z",
  why_status: "complete",
  what_happened: "A source recorded a current model evaluation.",
  why_now: "Attention increased in the source window.",
  where_started: null,
  summary_source: {
    source: "google_trends",
    source_url: "https://trends.google.com/trending?geo=GB",
    source_title: "OpenAI model evaluation",
    published_at: "2026-08-21T18:00:00Z",
    observed_at: "2026-08-21T19:30:00Z",
  },
};

function signal(options: { attributed: boolean; sourceUrl?: string; itemCountry?: Country } = { attributed: true }): Signal {
  const itemCountry = options.itemCountry || country;
  const sourceUrl = options.sourceUrl || `https://trends.google.com/trending?geo=${itemCountry.code}`;
  return {
    id: `signal-${itemCountry.code}`,
    trend_id: trend.id,
    country_id: itemCountry.id,
    country: itemCountry,
    source: "google_trends",
    external_id: `${itemCountry.code}-openai-model-evaluation`,
    title: trend.title,
    excerpt: trend.summary,
    source_url: sourceUrl,
    author_label: "Google Trends",
    engagement_count: 20_000,
    audience_count: null,
    published_at: "2026-08-21T18:00:00Z",
    observed_at: "2026-08-21T19:30:00Z",
    metadata: options.attributed ? {
      country_attribution: {
        country_code: itemCountry.code,
        source_type: "google_trends",
        source_url: sourceUrl,
        attribution_type: "observed_market",
        reason: `Google Trends recorded this topic in the ${itemCountry.code} market. This is observed-market evidence, not event origin.`,
      },
    } : {},
  };
}

function activity(): CountryActivity {
  return {
    country,
    trend_count: 1,
    evidence_count: 1,
    source_count: 1,
    latest_observed_at: "2026-08-21T19:30:00Z",
    rising_topics: [{
      id: trend.id,
      slug: trend.slug,
      title: trend.title,
      category: trend.category,
      summary: trend.summary,
      score: trend.score,
      velocity_score: trend.velocity_score,
      last_seen_at: trend.last_seen_at,
      evidence_count: 1,
      source_count: 1,
      latest_observed_at: "2026-08-21T19:30:00Z",
      evidence: [],
    }],
    developments: [{
      id: "signal-gb",
      provider: "google_trends",
      provider_label: "Google Trends",
      source_url: "https://trends.google.com/trending?geo=GB",
      source_title: trend.title,
      published_at: "2026-08-21T18:00:00Z",
      observed_at: "2026-08-21T19:30:00Z",
      signal_summary: "Google Trends source evidence.",
      trend_id: trend.id,
      trend_slug: trend.slug,
      trend_title: trend.title,
      trend_summary: trend.summary,
      category: trend.category,
      country,
      geographic_precision: "country",
      geographic_evidence: "Observed-market evidence, not event origin.",
      geographic_attribution: {
        country_code: "GB",
        source_type: "google_trends",
        source_url: "https://trends.google.com/trending?geo=GB",
        attribution_type: "observed_market",
        reason: "Google Trends recorded this topic in the GB market. This is observed-market evidence, not event origin.",
      },
    }],
  };
}

describe("trend page link graph", () => {
  it("uses stable canonical paths for every live relationship", () => {
    expect(trendPath(trend.slug)).toBe("/trend/openai-model-evaluation");
    expect(categoryPath(trend.category)).toBe("/category/artificial-intelligence");
    expect(countryPath(country.slug)).toBe("/country/united-kingdom");
    expect(absoluteUrl(categoryPath(trend.category))).toBe("https://www.whatshappeninginai.com/category/artificial-intelligence");
  });

  it("links a trend to its live category and only countries carrying qualifying source attribution", () => {
    const unsupportedCountry = { ...country, id: "ca", code: "CA", slug: "canada", name: "Canada" };
    const signals = [signal(), signal({ attributed: false, itemCountry: unsupportedCountry })];

    expect(evidenceBackedCountries(trend, signals).map((item) => item.slug)).toEqual([country.slug]);
    expect(trendInternalLinks(trend, signals)).toEqual({
      category: { href: "/category/artificial-intelligence", label: "Artificial Intelligence" },
      countries: [{ href: "/country/united-kingdom", label: "United Kingdom" }],
    });
  });
});

describe("structured page data", () => {
  it("builds a valid source-backed NewsArticle and positional breadcrumb graph", () => {
    const schema = trendStructuredData(trend, [signal()]) as Record<string, unknown>;
    const graph = schema["@graph"] as Array<Record<string, unknown>>;
    const article = graph[0];
    const breadcrumbs = graph[1];

    expect(schema["@context"]).toBe("https://schema.org");
    expect(article).toEqual(expect.objectContaining({
      "@type": "NewsArticle",
      url: absoluteUrl(trendPath(trend.slug)),
      headline: trend.title,
      articleSection: trend.category,
      citation: ["https://trends.google.com/trending?geo=GB"],
    }));
    expect((breadcrumbs.itemListElement as Array<Record<string, unknown>>).map((item) => item.position)).toEqual([1, 2, 3]);
    expect(JSON.stringify(schema)).not.toContain("event origin\"");
  });

  it("fails closed instead of emitting thin category or country collection schema", () => {
    expect(categoryStructuredData("Artificial Intelligence", [])).toBeNull();
    expect(countryStructuredData({ ...activity(), developments: [] })).toBeNull();
    expect(countryStructuredData({ ...activity(), rising_topics: [] })).toBeNull();
  });

  it("links collection items back to the qualifying live trends and declares canonical URLs", () => {
    const category = categoryStructuredData(trend.category, [trend]) as Record<string, unknown>;
    const categoryGraph = category["@graph"] as Array<Record<string, unknown>>;
    const categoryPage = categoryGraph[0];
    const categoryList = categoryPage.mainEntity as Record<string, unknown>;
    const countrySchema = countryStructuredData(activity()) as Record<string, unknown>;
    const countryGraph = countrySchema["@graph"] as Array<Record<string, unknown>>;
    const countryPage = countryGraph[0];

    expect(categoryPage.url).toBe(absoluteUrl(categoryPath(trend.category)));
    expect((categoryList.itemListElement as Array<Record<string, unknown>>)[0].url).toBe(absoluteUrl(trendPath(trend.slug)));
    expect(countryPage.url).toBe(absoluteUrl(countryPath(country.slug)));
    expect(countryPage.description).toContain("not event origin");
  });

  it("escapes markup-shaped source text before embedding JSON-LD", () => {
    expect(serializeStructuredData({ headline: "</script><script>alert(1)</script>" })).not.toContain("</script>");
    expect(serializeStructuredData({ headline: "</script>" })).toContain("\\u003c/script>");
  });
});
