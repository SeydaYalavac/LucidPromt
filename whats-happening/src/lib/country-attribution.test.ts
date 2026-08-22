import { describe, expect, it } from "vitest";
import { explicitSourceLocationAttribution, googleTrendsMarketAttribution, sanitizeCountryAttribution } from "./country-attribution";

describe("country attribution evidence", () => {
  it("builds observed-market evidence only from the matching official Google Trends URL", () => {
    expect(googleTrendsMarketAttribution("tr", "https://trends.google.com/trending?geo=TR")).toEqual({
      country_code: "TR",
      source_type: "google_trends",
      source_url: "https://trends.google.com/trending?geo=TR",
      attribution_type: "observed_market",
      reason: "Google Trends recorded this topic in the TR market. This is observed-market evidence, not event origin.",
    });
    expect(googleTrendsMarketAttribution("TR", "https://trends.google.com/trending?geo=US")).toBeNull();
    expect(googleTrendsMarketAttribution("TR", "https://example.com/trending?geo=TR")).toBeNull();
  });

  it("fails closed when source, URL, or country does not match the stored evidence", () => {
    const evidence = googleTrendsMarketAttribution("US", "https://trends.google.com/trending?geo=US");
    expect(sanitizeCountryAttribution(evidence, {
      source: "google_trends",
      sourceUrl: "https://trends.google.com/trending?geo=US",
      countryCode: "US",
    })).toEqual(evidence);
    expect(sanitizeCountryAttribution(evidence, {
      source: "google_trends",
      sourceUrl: "https://trends.google.com/trending?geo=US",
      countryCode: "GB",
    })).toBeNull();
    expect(sanitizeCountryAttribution(evidence, {
      source: "github",
      sourceUrl: "https://trends.google.com/trending?geo=US",
      countryCode: "US",
    })).toBeNull();
  });

  it("accepts an explicit location only from a permitted source adapter", () => {
    expect(explicitSourceLocationAttribution({
      countryCode: "DE",
      source: "x",
      sourceUrl: "https://x.com/i/web/status/123",
      locationLabel: "Berlin, Germany",
    })).toEqual(expect.objectContaining({
      country_code: "DE",
      source_type: "x",
      attribution_type: "explicit_source_location",
      source_url: "https://x.com/i/web/status/123",
    }));
    expect(explicitSourceLocationAttribution({
      countryCode: "DE",
      source: "github",
      sourceUrl: "https://github.com/example/repo",
      locationLabel: "Berlin, Germany",
    })).toBeNull();
  });
});
