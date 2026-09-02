import { beforeEach, describe, expect, it, vi } from "vitest";

const { sourceReads, supabase } = vi.hoisted(() => {
  const sourceReads = { trends: 0, signals: 0 };
  const trend = {
    id: "trend-1",
    slug: "cached-ai-trend",
    title: "Cached AI trend",
    category: "AI",
    summary: "A current source-backed AI trend.",
    country_id: null,
    velocity_score: 50,
    reach_score: 50,
    novelty_score: 50,
    score: 50,
    is_global_pulse: false,
    source_count: 1,
    signal_count: 1,
    growth_percent: null,
    first_seen_at: "2026-09-01T10:00:00.000Z",
    last_seen_at: "2026-09-01T10:05:00.000Z",
    updated_at: "2026-09-01T10:05:00.000Z",
    why_status: "complete",
    what_happened: null,
    why_now: null,
    where_started: null,
  };
  const signal = {
    id: "signal-1",
    trend_id: "trend-1",
    source: "hacker_news",
    external_id: "123",
    title: "Cached AI trend",
    excerpt: "A current source-backed AI trend.",
    source_url: "https://news.ycombinator.com/item?id=123",
    author_label: null,
    engagement_count: 12,
    audience_count: null,
    published_at: "2026-09-01T10:00:00.000Z",
    observed_at: "2026-09-01T10:05:00.000Z",
    metadata: { points: 8, comments: 4 },
  };

  const supabase = {
    from(table: string) {
      if (table === "trends") {
        sourceReads.trends += 1;
        const builder = {
          select: () => builder,
          eq: () => builder,
          single: async () => ({ data: trend, error: null }),
        };
        return builder;
      }
      sourceReads.signals += 1;
      const builder = {
        select: () => builder,
        eq: () => builder,
        order: () => builder,
        limit: async () => ({ data: [signal], error: null }),
      };
      return builder;
    },
  };
  return { sourceReads, supabase };
});

vi.mock("next/cache", () => ({
  unstable_cache: (reader: (slug: string) => Promise<unknown>) => {
    const values = new Map<string, Promise<unknown>>();
    return (slug: string) => {
      if (!values.has(slug)) values.set(slug, reader(slug));
      return values.get(slug)!;
    };
  },
}));
vi.mock("react", async (importOriginal) => ({
  ...(await importOriginal<typeof import("react")>()),
  cache: <T extends (...args: never[]) => unknown>(reader: T) => reader,
}));
// Vitest accepts virtual module mocks at runtime, while its current type overload omits this option.
// @ts-expect-error -- "server-only" is provided by Next.js during the production build.
vi.mock("server-only", () => ({}), { virtual: true });
vi.mock("@/lib/supabase/admin", () => ({ getSupabaseAdmin: () => supabase }));
vi.mock("@/lib/env", () => ({ isDemoMode: () => false }));

import { readTrendDetail, TREND_DETAIL_CACHE_SECONDS } from "./trend-data";

describe("trend detail cache", () => {
  beforeEach(() => {
    sourceReads.trends = 0;
    sourceReads.signals = 0;
  });

  it("shares one source payload between metadata and page rendering for at most 60 seconds", async () => {
    const metadataPayload = await readTrendDetail("cached-ai-trend");
    const pagePayload = await readTrendDetail("cached-ai-trend");

    expect(metadataPayload).toBe(pagePayload);
    expect(sourceReads).toEqual({ trends: 1, signals: 1 });
    expect(TREND_DETAIL_CACHE_SECONDS).toBe(60);
  });
});
