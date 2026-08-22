import { afterEach, describe, expect, it, vi } from "vitest";
import {
  DEFAULT_GOOGLE_TRENDS_MARKETS,
  DEFAULT_DISCOVERY_QUERY,
  extractGoogleNewsItems,
  GITHUB_SEARCH_SLICES,
  googleTrendMarkets,
  parseGoogleTrendsRss,
  SOURCE_INTAKE_LIMITS,
  xRecent,
} from "./sources";
import { MAP_COUNTRIES } from "./map-countries";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("official source intake", () => {
  it("keeps enough first-party capacity for a 100-trend daily target", () => {
    expect(SOURCE_INTAKE_LIMITS).toEqual({ hackerNews: 200, github: 100 });
    expect(GITHUB_SEARCH_SLICES.reduce((sum, slice) => sum + slice.limit, 0)).toBe(SOURCE_INTAKE_LIMITS.github);
  });

  it("reserves official discovery capacity for AI sports use cases", () => {
    expect(GITHUB_SEARCH_SLICES.map(({ query }) => query).join(" ")).toMatch(/AI sports/i);
    expect(DEFAULT_DISCOVERY_QUERY).toMatch(/performance analytics.*injury prevention.*officiating.*broadcasting.*accessibility.*sports science/i);
  });
});

describe("extractGoogleNewsItems", () => {
  it("keeps the publisher, article URL, title, and clean snippet from Google Trends RSS", () => {
    expect(extractGoogleNewsItems([{
      "ht:news_item_title": "New AI benchmark is published",
      "ht:news_item_snippet": "<p>The test compares current inference hardware.</p>",
      "ht:news_item_url": "https://publisher.test.invalid/benchmark",
      "ht:news_item_source": "Research Desk",
    }])).toEqual([{
      title: "New AI benchmark is published",
      snippet: "The test compares current inference hardware.",
      url: "https://publisher.test.invalid/benchmark",
      source: "Research Desk",
    }]);
  });

  it("drops entries without a usable article link", () => {
    expect(extractGoogleNewsItems({ "ht:news_item_title": "Missing URL" })).toEqual([]);
  });
});

describe("Google Trends market intake", () => {
  it("defaults to a broad verified market set and accepts a deduplicated subset", () => {
    expect(DEFAULT_GOOGLE_TRENDS_MARKETS).toHaveLength(28);
    expect(MAP_COUNTRIES.map((country) => country.code)).toEqual(DEFAULT_GOOGLE_TRENDS_MARKETS);
    expect(googleTrendMarkets({} as NodeJS.ProcessEnv)).toEqual(DEFAULT_GOOGLE_TRENDS_MARKETS);
    expect(googleTrendMarkets({ GOOGLE_TRENDS_GEOS: "tr,US,tr,unknown" } as unknown as NodeJS.ProcessEnv)).toEqual(["TR", "US"]);
  });

  it("creates stable market-attributed evidence IDs without inventing geography", () => {
    const xml = `<?xml version="1.0"?><rss xmlns:ht="https://trends.google.com/trending/rss"><channel><item><title>OpenAI GPT release</title><pubDate>Thu, 21 Aug 2026 18:00:00 GMT</pubDate><ht:approx_traffic>20,000+</ht:approx_traffic><ht:news_item><ht:news_item_title>New model details</ht:news_item_title><ht:news_item_url>https://news.example.co/models</ht:news_item_url><ht:news_item_source>Example News</ht:news_item_source></ht:news_item></item></channel></rss>`;
    const first = parseGoogleTrendsRss(xml, "TR");
    const second = parseGoogleTrendsRss(xml, "TR");

    expect(first).toEqual(second);
    expect(first).toEqual([expect.objectContaining({
      source: "google_trends",
      countryCode: "TR",
      sourceUrl: "https://trends.google.com/trending?geo=TR",
      engagementCount: 20000,
      countryAttribution: expect.objectContaining({
        country_code: "TR",
        source_type: "google_trends",
        attribution_type: "observed_market",
      }),
    })]);
    expect(first[0].metadata?.country_attribution).toEqual(first[0].countryAttribution);
    expect(first[0].externalId).toContain("TR-");
  });
});

describe("permissioned explicit location intake", () => {
  it("preserves an X place country only when the official response attaches it to the post", async () => {
    const previousToken = process.env.X_BEARER_TOKEN;
    const previousQueries = process.env.X_WATCH_QUERIES;
    process.env.X_BEARER_TOKEN = "test-token";
    process.env.X_WATCH_QUERIES = "AI model";
    vi.stubGlobal("fetch", vi.fn(async () => ({
      ok: true,
      json: async () => ({
        data: [{
          id: "123",
          text: "New AI model benchmark",
          created_at: "2026-08-22T06:00:00.000Z",
          public_metrics: { like_count: 5 },
          geo: { place_id: "place-1" },
        }],
        includes: { places: [{ id: "place-1", country_code: "DE", full_name: "Berlin, Germany", place_type: "city" }] },
      }),
    })));

    try {
      const [result] = await xRecent.fetchSignals();
      expect(result).toEqual(expect.objectContaining({
        countryCode: "DE",
        countryAttribution: expect.objectContaining({
          source_type: "x",
          attribution_type: "explicit_source_location",
          source_url: "https://x.com/i/web/status/123",
        }),
      }));
      expect(result.metadata?.country_attribution).toEqual(result.countryAttribution);
    } finally {
      if (previousToken == null) delete process.env.X_BEARER_TOKEN;
      else process.env.X_BEARER_TOKEN = previousToken;
      if (previousQueries == null) delete process.env.X_WATCH_QUERIES;
      else process.env.X_WATCH_QUERIES = previousQueries;
    }
  });
});
