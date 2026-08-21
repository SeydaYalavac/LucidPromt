import { describe, expect, it } from "vitest";
import { boundedInteger, buildTrendListPayload, MAX_TREND_PAGE_SIZE } from "./trend-feed";
import type { Signal, Trend } from "@/types/trends";

const now = new Date("2026-08-21T18:00:00.000Z");

function trend(index: number, overrides: Partial<Trend> = {}): Trend {
  return {
    id: `trend-${index}`,
    slug: `ai-trend-${index}`,
    title: `AI agent benchmark ${index}`,
    category: "Artificial Intelligence",
    summary: null,
    country_id: null,
    velocity_score: 40,
    reach_score: 35,
    novelty_score: 70,
    score: 45,
    is_global_pulse: false,
    source_count: 1,
    signal_count: 1,
    growth_percent: 40,
    first_seen_at: "2026-08-21T08:00:00.000Z",
    last_seen_at: "2026-08-21T17:00:00.000Z",
    why_status: "pending",
    what_happened: null,
    why_now: null,
    where_started: null,
    ...overrides,
  };
}

function signal(index: number, overrides: Partial<Signal> = {}): Signal {
  return {
    id: `signal-${index}`,
    trend_id: `trend-${index}`,
    source: "hacker_news",
    external_id: String(10_000 + index),
    title: `AI agent benchmark ${index}`,
    excerpt: `A source-backed AI agent benchmark report ${index}.`,
    source_url: `https://news.ycombinator.com/item?id=${10_000 + index}`,
    author_label: "researcher",
    engagement_count: 20,
    audience_count: null,
    published_at: "2026-08-21T16:00:00.000Z",
    observed_at: "2026-08-21T17:00:00.000Z",
    metadata: { points: 15, comments: 5 },
    ...overrides,
  };
}

describe("daily trend feed", () => {
  it("bounds invalid and oversized page parameters", () => {
    expect(boundedInteger("500", 10, MAX_TREND_PAGE_SIZE)).toBe(200);
    expect(boundedInteger("-2", 10, MAX_TREND_PAGE_SIZE)).toBe(0);
    expect(boundedInteger("not-a-number", 10, MAX_TREND_PAGE_SIZE)).toBe(10);
  });

  it("returns 100 unique qualified trends and reports additional supply", () => {
    const trends = Array.from({ length: 120 }, (_, index) => trend(index));
    const signals = Array.from({ length: 120 }, (_, index) => signal(index));
    const payload = buildTrendListPayload(trends, signals, { limit: 100, offset: 0, mode: "live", now });

    expect(payload.trends).toHaveLength(100);
    expect(new Set(payload.trends.map((item) => item.id)).size).toBe(100);
    expect(payload.coverage).toMatchObject({ qualified_today: 120, status: "target_met", target: 100 });
    expect(payload.pagination).toMatchObject({ total: 120, has_more: true });
    expect(payload.trends.every((item) => item.summary_source?.source_url && item.evidence_status)).toBe(true);
  });

  it("deduplicates topics and supports bounded pagination", () => {
    const trends = [trend(1), trend(2), trend(3, { slug: "ai-trend-2" })];
    const signals = [signal(1), signal(2), signal(3)];
    const payload = buildTrendListPayload(trends, signals, { limit: MAX_TREND_PAGE_SIZE, offset: 1, mode: "live", now });

    expect(payload.pagination).toMatchObject({ offset: 1, total: 2, has_more: false });
    expect(payload.trends.map((item) => item.id)).toEqual(["trend-2"]);
  });

  it("retires stale trends and rejects malformed or title-less records", () => {
    const trends = [
      trend(1, { last_seen_at: "2026-08-18T17:59:59.000Z" }),
      trend(2, { title: "" }),
      trend(3),
      trend(4),
    ];
    const signals = [
      signal(1),
      signal(2),
      signal(3, { source_url: "not-a-url" }),
      signal(4),
    ];
    const payload = buildTrendListPayload(trends, signals, { limit: 100, offset: 0, mode: "live", now });

    expect(payload.trends.map((item) => item.id)).toEqual(["trend-4"]);
  });

  it("reports truthful under-supply without synthesizing filler", () => {
    const payload = buildTrendListPayload([trend(1), trend(2)], [signal(1), signal(2)], {
      limit: 100,
      offset: 0,
      mode: "live",
      now,
    });

    expect(payload.trends).toHaveLength(2);
    expect(payload.coverage).toMatchObject({ qualified_today: 2, active_qualified: 2, status: "under_supply" });
  });

  it("publishes current AI sports evidence with its source URL and published time", () => {
    const sportsTrend = trend(1, { category: "Sports", title: "AI improves football injury prevention" });
    const sportsSignal = signal(1, {
      title: "AI improves football injury prevention",
      excerpt: "Machine learning analyzes athlete workloads for sports science teams.",
      source_url: "https://news.ycombinator.com/item?id=10001",
      published_at: "2026-08-21T16:00:00.000Z",
      observed_at: "2026-08-21T17:00:00.000Z",
    });
    const payload = buildTrendListPayload([sportsTrend], [sportsSignal], { limit: 100, offset: 0, mode: "live", now });

    expect(payload.trends).toHaveLength(1);
    expect(payload.trends[0]).toMatchObject({ category: "Sports" });
    expect(payload.trends[0].summary_source).toMatchObject({
      source_url: "https://news.ycombinator.com/item?id=10001",
      published_at: "2026-08-21T16:00:00.000Z",
    });
  });

  it("fails closed for non-AI, non-sports, stale, or timestamp-less Sports evidence", () => {
    const sportsTrends = [
      trend(1, { category: "Sports", title: "Football transfer update" }),
      trend(2, { category: "Sports", title: "AI software benchmark" }),
      trend(3, { category: "Sports", title: "AI football officiating" }),
      trend(4, { category: "Sports", title: "AI sports broadcasting" }),
    ];
    const signals = [
      signal(1, { title: "Football transfer update", excerpt: "League fixtures" }),
      signal(2, { title: "AI software benchmark", excerpt: "A coding model evaluation" }),
      signal(3, { title: "AI football officiating", observed_at: "2026-08-18T17:00:00.000Z" }),
      signal(4, { title: "AI sports broadcasting", published_at: "" }),
    ];
    const payload = buildTrendListPayload(sportsTrends, signals, { limit: 100, offset: 0, mode: "live", now });

    expect(payload.trends).toEqual([]);
  });
});
