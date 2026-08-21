import { describe, expect, it } from "vitest";
import { buildMapActivityPayload, clampMapScale, mapMarkerRadius } from "./map";
import type { Country, Signal, Trend } from "../types/trends";

describe("signal map controls", () => {
  it("keeps zoom inside the supported interaction range", () => {
    expect(clampMapScale(0.1)).toBe(1);
    expect(clampMapScale(2.5)).toBe(2.5);
    expect(clampMapScale(7)).toBe(4);
  });

  it("sizes markers by attributed evidence density", () => {
    expect(mapMarkerRadius(0, 10)).toBe(0);
    expect(mapMarkerRadius(1, 10)).toBeLessThan(mapMarkerRadius(5, 10));
    expect(mapMarkerRadius(5, 10)).toBeLessThan(mapMarkerRadius(10, 10));
  });
});

const countries: Country[] = [
  { id: "us", code: "US", slug: "united-states", name: "United States", latitude: 37.09, longitude: -95.71 },
  { id: "gb", code: "GB", slug: "united-kingdom", name: "United Kingdom", latitude: 55.37, longitude: -3.43 },
];

const trend: Trend = {
  id: "trend-1",
  slug: "openai-gpt-release",
  title: "OpenAI GPT release",
  category: "Artificial Intelligence",
  summary: "Current AI model reporting.",
  country_id: null,
  country: null,
  velocity_score: 82,
  reach_score: 70,
  novelty_score: 65,
  score: 75,
  is_global_pulse: false,
  source_count: 1,
  signal_count: 2,
  growth_percent: null,
  first_seen_at: "2026-08-21T17:00:00Z",
  last_seen_at: "2026-08-21T19:30:00Z",
  why_status: "pending",
  what_happened: null,
  why_now: null,
  where_started: null,
};

function signal(country: Country, observedAt: string): Signal {
  return {
    id: `signal-${country.code}`,
    trend_id: trend.id,
    country_id: country.id,
    country,
    source: "google_trends",
    external_id: `${country.code}-openai-gpt-release`,
    title: trend.title,
    excerpt: "Current AI model reporting.",
    source_url: `https://trends.google.com/trending?geo=${country.code}`,
    author_label: "Google Trends",
    engagement_count: 20_000,
    audience_count: null,
    published_at: "2026-08-21T18:00:00Z",
    observed_at: observedAt,
    metadata: { approximate_traffic: "20,000+", market: country.code },
  };
}

describe("map activity aggregation", () => {
  it("groups the same AI topic into every market carrying real source evidence", () => {
    const legacyUsSignal = {
      ...signal(countries[0], "2026-08-21T19:00:00Z"),
      id: "legacy-us-signal",
      external_id: "US-openai-gpt-release-0",
    };
    const payload = buildMapActivityPayload(countries, [trend], [
      legacyUsSignal,
      signal(countries[0], "2026-08-21T19:30:00Z"),
      signal(countries[1], "2026-08-21T19:20:00Z"),
    ], { mode: "live", now: new Date("2026-08-21T20:00:00Z") });

    expect(payload.coverage).toEqual(expect.objectContaining({
      countries_with_evidence: 2,
      attributed_evidence_count: 2,
      active_window_hours: 48,
    }));
    expect(payload.activities.map((activity) => activity.country.code)).toEqual(["GB", "US"]);
    expect(payload.activities.find((activity) => activity.country.code === "US")?.evidence_count).toBe(1);
    expect(payload.activities.every((activity) => activity.rising_topics[0].evidence[0].source_url.startsWith("https://trends.google.com/"))).toBe(true);
    expect(payload.countries.map((country) => country.code)).toEqual(["GB", "US"]);
    expect(payload.activities[0].developments[0]).toEqual(expect.objectContaining({
      geographic_precision: "country",
      trend_slug: trend.slug,
      source_title: trend.title,
    }));
    expect(payload.activities[0].developments[0].geographic_evidence).toContain("country-level context");
  });

  it("returns an honest empty state when no country-attributed evidence exists", () => {
    const payload = buildMapActivityPayload(countries, [trend], [], {
      mode: "live",
      now: new Date("2026-08-21T20:00:00Z"),
    });

    expect(payload.activities).toEqual([]);
    expect(payload.countries).toHaveLength(2);
    expect(payload.coverage.countries_with_evidence).toBe(0);
    expect(payload.coverage.attributed_evidence_count).toBe(0);
  });
});
