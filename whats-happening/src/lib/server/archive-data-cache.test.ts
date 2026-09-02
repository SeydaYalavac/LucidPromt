import { beforeEach, describe, expect, it, vi } from "vitest";

const { cacheConfigs, queryState, sourceReads, supabase } = vi.hoisted(() => {
  const sourceReads = { trends: 0, signals: 0 };
  const queryState = { signalIds: [] as string[], signalLimit: 0 };
  const cacheConfigs: Array<{ key: string; revalidate?: number | false }> = [];
  const observedAt = "2026-09-02T08:00:00.000Z";
  const trends = Array.from({ length: 30 }, (_, index) => ({
    id: `trend-${index + 1}`,
    slug: `ai-archive-trend-${index + 1}`,
    title: `AI archive trend ${index + 1}`,
    category: "Artificial Intelligence",
    summary: `Source-backed AI archive summary ${index + 1}.`,
    country_id: null,
    velocity_score: 50,
    reach_score: 50,
    novelty_score: 50,
    score: 50,
    is_global_pulse: false,
    source_count: 1,
    signal_count: 1,
    growth_percent: null,
    first_seen_at: observedAt,
    last_seen_at: observedAt,
    updated_at: observedAt,
    why_status: "complete",
    what_happened: null,
    why_now: null,
    where_started: null,
  }));
  const signals = trends.map((trend, index) => ({
    id: `signal-${index + 1}`,
    trend_id: trend.id,
    source: "hacker_news",
    external_id: String(index + 1),
    title: trend.title,
    excerpt: trend.summary,
    source_url: `https://news.ycombinator.com/item?id=${index + 1}`,
    author_label: null,
    engagement_count: 12,
    audience_count: null,
    published_at: observedAt,
    observed_at: observedAt,
    metadata: { points: 8, comments: 4 },
  }));

  const supabase = {
    from(table: string) {
      if (table === "trends") {
        sourceReads.trends += 1;
        let countOnly = false;
        const builder = {
          select: (_columns: string, options?: { head?: boolean }) => {
            countOnly = Boolean(options?.head);
            return builder;
          },
          in: () => builder,
          neq: () => builder,
          not: () => builder,
          order: () => builder,
          range: async () => ({ data: trends, error: null }),
          then: (resolve: (value: unknown) => unknown, reject: (reason: unknown) => unknown) =>
            Promise.resolve(countOnly
              ? { data: null, count: trends.length, error: null }
              : { data: trends, count: null, error: null })
              .then(resolve, reject),
        };
        return builder;
      }

      sourceReads.signals += 1;
      const builder = {
        select: () => builder,
        in: (_column: string, ids: string[]) => {
          queryState.signalIds = ids;
          return builder;
        },
        order: () => builder,
        limit: async (limit: number) => {
          queryState.signalLimit = limit;
          return { data: signals, error: null };
        },
      };
      return builder;
    },
  };

  return { cacheConfigs, queryState, sourceReads, supabase };
});

vi.mock("next/cache", () => ({
  unstable_cache: <T extends (...args: never[]) => Promise<unknown>>(
    reader: T,
    keyParts: string[] = [],
    options: { revalidate?: number | false } = {},
  ) => {
    cacheConfigs.push({ key: keyParts.join(":"), revalidate: options.revalidate });
    const values = new Map<string, ReturnType<T>>();
    return (...args: Parameters<T>) => {
      const key = JSON.stringify(args);
      if (!values.has(key)) values.set(key, reader(...args) as ReturnType<T>);
      return values.get(key)!;
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

import { ARCHIVE_CACHE_SECONDS, readPublicTrendArchive, readRetainedCategoryPage } from "./trend-data";

describe("retained category archive cache", () => {
  beforeEach(() => {
    sourceReads.trends = 0;
    sourceReads.signals = 0;
    queryState.signalIds = [];
    queryState.signalLimit = 0;
  });

  it("uses three reads for a cold 30-record page and shares it with metadata rendering", async () => {
    const metadataPayload = await readRetainedCategoryPage("artificial-intelligence", 1);
    const pagePayload = await readRetainedCategoryPage("artificial-intelligence", 1);

    expect(metadataPayload).toBe(pagePayload);
    expect(pagePayload?.trends).toHaveLength(30);
    expect(sourceReads).toEqual({ trends: 2, signals: 1 });
    expect(queryState.signalIds).toHaveLength(30);
    expect(queryState.signalLimit).toBe(900);
    expect(ARCHIVE_CACHE_SECONDS).toBe(60);
    expect(cacheConfigs).toContainEqual({ key: "retained-category-page-v1", revalidate: 60 });
  });

  it("reuses the short-lived public archive payload for sitemap reads", async () => {
    const firstSitemapRead = await readPublicTrendArchive();
    const secondSitemapRead = await readPublicTrendArchive();

    expect(firstSitemapRead).toBe(secondSitemapRead);
    expect(firstSitemapRead).toHaveLength(30);
    expect(sourceReads).toEqual({ trends: 1, signals: 1 });
    expect(cacheConfigs).toContainEqual({ key: "public-trend-archive-v1", revalidate: 60 });
  });
});
