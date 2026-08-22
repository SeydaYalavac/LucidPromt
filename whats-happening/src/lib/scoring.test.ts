import { describe, expect, it } from "vitest";
import { clusterSignals, earliestAttributedSignal, scoreSignals, slugifyTitle } from "./scoring";
import type { SourceSignal } from "@/types/trends";

const now = Date.parse("2026-08-20T12:00:00Z");
const signal = (overrides: Partial<SourceSignal> = {}): SourceSignal => ({
  source: "hacker_news",
  externalId: "1",
  title: "Local AI agent runtime",
  sourceUrl: "https://example.com/1",
  engagementCount: 20,
  publishedAt: "2026-08-20T11:00:00Z",
  ...overrides,
});

const attributedSignal = (countryCode: string, publishedAt: string, externalId: string): SourceSignal => {
  const sourceUrl = `https://trends.google.com/trending?geo=${countryCode}`;
  return signal({
    source: "google_trends",
    externalId,
    sourceUrl,
    countryCode,
    publishedAt,
    countryAttribution: {
      country_code: countryCode,
      source_type: "google_trends",
      source_url: sourceUrl,
      attribution_type: "observed_market",
      reason: `Observed in the ${countryCode} market.`,
    },
  });
};

describe("scoreSignals", () => {
  it("keeps each metric in the database range", () => {
    const score = scoreSignals([signal({ engagementCount: 1_000_000, audienceCount: 2_000_000 })], now);
    expect(Object.values(score).every((value) => value >= 0 && value <= 100)).toBe(true);
  });

  it("rewards source diversity and fresh engagement", () => {
    const baseline = scoreSignals([signal()], now);
    const diverse = scoreSignals([
      signal(),
      signal({ source: "github", externalId: "2", engagementCount: 800 }),
      signal({ source: "google_trends", externalId: "3", engagementCount: 2_000 }),
    ], now);
    expect(diverse.total).toBeGreaterThan(baseline.total);
    expect(diverse.reach).toBeGreaterThan(baseline.reach);
  });
});

describe("clustering helpers", () => {
  it("creates stable URL-safe slugs", () => {
    expect(slugifyTitle("What's New: Ünicode + AI?")) .toBe("what-s-new-unicode-ai");
  });

  it("groups reordered title tokens", () => {
    const clusters = clusterSignals([
      signal({ externalId: "1", title: "Local AI agent runtime" }),
      signal({ externalId: "2", source: "github", title: "AI runtime: local agent" }),
    ]);
    expect(clusters).toHaveLength(1);
  });

  it("uses the earliest signal with source-backed country evidence for context", () => {
    const origin = earliestAttributedSignal([
      attributedSignal("US", "2026-08-20T11:00:00Z", "1"),
      signal({ externalId: "2", publishedAt: "2026-08-20T08:00:00Z" }),
      attributedSignal("TR", "2026-08-20T09:00:00Z", "3"),
    ]);

    expect(origin?.countryCode).toBe("TR");
  });

  it("does not choose an earliest geography when market observations are tied", () => {
    const origin = earliestAttributedSignal([
      attributedSignal("US", "2026-08-20T09:00:00Z", "us"),
      attributedSignal("GB", "2026-08-20T09:00:00Z", "gb"),
    ]);

    expect(origin).toBeUndefined();
  });

  it("ignores a country code without attribution evidence", () => {
    expect(earliestAttributedSignal([
      signal({ countryCode: "US" }),
    ])).toBeUndefined();
  });
});
