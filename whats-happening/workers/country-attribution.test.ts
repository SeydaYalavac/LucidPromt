import { describe, expect, it } from "vitest";
import { backfillableCountryAttribution, evidenceCountryRows } from "./country-attribution";
import type { SourceSignal } from "../src/types/trends";

function attributedSignal(countryCode: string): SourceSignal {
  const sourceUrl = "https://x.com/i/web/status/123";
  return {
    source: "x",
    externalId: "123",
    title: "AI model release",
    sourceUrl,
    engagementCount: 12,
    publishedAt: "2026-08-22T06:00:00.000Z",
    countryCode,
    countryAttribution: {
      country_code: countryCode,
      source_type: "x",
      source_url: sourceUrl,
      attribution_type: "explicit_source_location",
      reason: "X attached a source location.",
    },
  };
}

describe("evidence-driven country catalog", () => {
  it("adds a missing ISO country without replacing configured market centroids", () => {
    expect(evidenceCountryRows([
      attributedSignal("DE"),
      attributedSignal("FI"),
      { ...attributedSignal("FI"), externalId: "duplicate" },
    ])).toEqual([{
      code: "FI",
      slug: "finland",
      name: "Finland",
      latitude: null,
      longitude: null,
    }]);
  });

  it("backfills only Google observations whose stored market matches the official source URL", () => {
    expect(backfillableCountryAttribution({
      source: "google_trends",
      source_url: "https://trends.google.com/trending?geo=FI",
      metadata: { market: "FI" },
    })).toEqual(expect.objectContaining({ country_code: "FI", attribution_type: "observed_market" }));
    expect(backfillableCountryAttribution({
      source: "google_trends",
      source_url: "https://trends.google.com/trending?geo=US",
      metadata: { market: "FI" },
    })).toBeNull();
    expect(backfillableCountryAttribution({
      source: "github",
      source_url: "https://github.com/example/repo",
      metadata: { market: "FI" },
    })).toBeNull();
  });
});
