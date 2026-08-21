import { describe, expect, it } from "vitest";
import {
  DEFAULT_GOOGLE_TRENDS_MARKETS,
  extractGoogleNewsItems,
  googleTrendMarkets,
  parseGoogleTrendsRss,
  SOURCE_INTAKE_LIMITS,
} from "./sources";
import { MAP_COUNTRIES } from "./map-countries";

describe("official source intake", () => {
  it("keeps enough first-party capacity for a 100-trend daily target", () => {
    expect(SOURCE_INTAKE_LIMITS).toEqual({ hackerNews: 200, github: 100 });
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
    })]);
    expect(first[0].externalId).toContain("TR-");
  });
});
