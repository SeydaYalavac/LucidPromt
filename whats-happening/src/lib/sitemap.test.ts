import { describe, expect, it } from "vitest";
import type { CountryActivity, Trend } from "@/types/trends";
import { SITE_URL } from "./site";
import { buildSitemap, staticSitemapEntries } from "./sitemap";

function eligibleTrend(overrides: Partial<Trend> = {}): Trend {
  return {
    id: "trend-1",
    slug: "agent-evaluation",
    title: "AI agent evaluation",
    category: "Artificial Intelligence",
    summary: "A sourced AI agent evaluation briefing.",
    country_id: null,
    velocity_score: 80,
    reach_score: 70,
    novelty_score: 60,
    score: 72,
    is_global_pulse: false,
    source_count: 1,
    signal_count: 1,
    growth_percent: null,
    first_seen_at: "2026-08-22T10:00:00.000Z",
    last_seen_at: "2026-08-23T10:00:00.000Z",
    why_status: "complete",
    what_happened: "A source reported an AI agent evaluation update.",
    why_now: "Attention increased in the current evidence window.",
    where_started: null,
    summary_source: {
      source: "hacker_news",
      source_url: "https://news.ycombinator.com/item?id=1",
      source_title: "AI agent evaluation",
      published_at: "2026-08-23T09:00:00.000Z",
      observed_at: "2026-08-23T10:00:00.000Z",
    },
    brief: {
      what_it_is: "A sourced AI agent evaluation briefing.",
      why_trending: "The current source shows rising attention.",
      useful_for: "Teams comparing agent reliability.",
      next_step: "Read the original source.",
      evidence: [{
        reference_id: "source-1",
        provider: "hacker_news",
        kind: "signal",
        label: "Hacker News",
        source_url: "https://news.ycombinator.com/item?id=1",
        source_title: "AI agent evaluation",
        published_at: "2026-08-23T09:00:00.000Z",
        observed_at: "2026-08-23T10:00:00.000Z",
        signal_summary: "A current source signal.",
      }],
      freshest_observed_at: "2026-08-23T10:00:00.000Z",
      evidence_source_count: 1,
      linked_site_count: 1,
      corroboration: "single_source",
      caution: "One source is available.",
      article: {
        depth: "concise",
        independent_source_count: 1,
        last_updated_at: "2026-08-23T10:00:00.000Z",
        sections: [{
          id: "background",
          label: "Background",
          heading: "What is happening",
          claims: [{ text: "A current source signal exists.", evidence_reference_ids: ["source-1"], kind: "reported" }],
        }],
      },
    },
    ...overrides,
  };
}

function activity(overrides: Partial<CountryActivity> = {}): CountryActivity {
  return {
    country: {
      id: "gb",
      code: "GB",
      slug: "united-kingdom",
      name: "United Kingdom",
      latitude: 55.37,
      longitude: -3.43,
    },
    trend_count: 1,
    evidence_count: 1,
    source_count: 1,
    latest_observed_at: "2026-08-23T10:00:00.000Z",
    rising_topics: [{
      id: "trend-1",
      slug: "agent-evaluation",
      title: "AI agent evaluation",
      category: "Artificial Intelligence",
      summary: "A sourced AI agent evaluation briefing.",
      score: 72,
      velocity_score: 80,
      last_seen_at: "2026-08-23T10:00:00.000Z",
      evidence_count: 1,
      source_count: 1,
      latest_observed_at: "2026-08-23T10:00:00.000Z",
      evidence: [],
    }],
    developments: [{
      id: "signal-1",
      provider: "google_trends",
      provider_label: "Google Trends",
      source_url: "https://trends.google.com/trending?geo=GB",
      source_title: "AI agent evaluation",
      published_at: "2026-08-23T09:00:00.000Z",
      observed_at: "2026-08-23T10:00:00.000Z",
      signal_summary: "Google Trends recorded the topic.",
      trend_id: "trend-1",
      trend_slug: "agent-evaluation",
      trend_title: "AI agent evaluation",
      trend_summary: "A sourced AI agent evaluation briefing.",
      category: "Artificial Intelligence",
      country: {
        id: "gb",
        code: "GB",
        slug: "united-kingdom",
        name: "United Kingdom",
        latitude: 55.37,
        longitude: -3.43,
      },
      geographic_precision: "country",
      geographic_evidence: "Observed-market evidence, not event origin.",
      geographic_attribution: {
        country_code: "GB",
        source_type: "google_trends",
        source_url: "https://trends.google.com/trending?geo=GB",
        attribution_type: "observed_market",
        reason: "Google Trends recorded this topic in GB.",
      },
    }],
    ...overrides,
  };
}

describe("live discovery sitemap", () => {
  it("adds every eligible trend, live category, and evidence-backed country once on the canonical host", () => {
    const trends = [
      eligibleTrend(),
      eligibleTrend({ id: "trend-2", slug: "ai-sports-analysis", category: "Sports" }),
      eligibleTrend(),
    ];
    const sitemap = buildSitemap(trends, [activity(), activity()]);
    const urls = sitemap.map(({ url }) => url);

    expect(urls).toHaveLength(staticSitemapEntries.length + 2 + 1 + 2);
    expect(urls).toContain(`${SITE_URL}/trend/agent-evaluation`);
    expect(urls).toContain(`${SITE_URL}/trend/ai-sports-analysis`);
    expect(urls).toContain(`${SITE_URL}/category/artificial-intelligence`);
    expect(urls).toContain(`${SITE_URL}/category/sports`);
    expect(urls).toContain(`${SITE_URL}/country/united-kingdom`);
    expect(new Set(urls).size).toBe(urls.length);
    expect(urls.every((url) => url === SITE_URL || url.startsWith(`${SITE_URL}/`))).toBe(true);
  });

  it("fails closed for thin trends and unsupported collection routes", () => {
    const thinTrends = [
      eligibleTrend({ id: "missing-summary", slug: "missing-summary", summary: null }),
      eligibleTrend({ id: "missing-source", slug: "missing-source", summary_source: null }),
      eligibleTrend({ id: "missing-brief", slug: "missing-brief", brief: null }),
      eligibleTrend({ id: "missing-slug", slug: "" }),
    ];
    const unsupportedCountries = [
      activity({ developments: [] }),
      activity({ rising_topics: [] }),
      activity({ country: { ...activity().country, slug: "" } }),
    ];
    const urls = buildSitemap(thinTrends, unsupportedCountries).map(({ url }) => url);

    expect(urls).toEqual(staticSitemapEntries.map(({ url }) => url));
    expect(urls.some((url) => url.includes("/trend/"))).toBe(false);
    expect(urls.some((url) => url.includes("/category/"))).toBe(false);
    expect(urls.some((url) => url.includes("/country/"))).toBe(false);
  });

  it("keeps public archive articles without exposing inactive collection routes", () => {
    const archivedTrend = eligibleTrend({
      slug: "archived-ai-agent",
      category: "Archived AI",
      last_seen_at: "2026-08-01T10:00:00.000Z",
    });
    const urls = buildSitemap([archivedTrend], [], []).map(({ url }) => url);

    expect(urls).toContain(`${SITE_URL}/trend/archived-ai-agent`);
    expect(urls).not.toContain(`${SITE_URL}/category/archived-ai`);
  });
});
