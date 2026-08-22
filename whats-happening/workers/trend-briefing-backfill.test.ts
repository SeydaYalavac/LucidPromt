import { describe, expect, it } from "vitest";
import type { Signal, Trend } from "../src/types/trends";
import { inspectTrendBriefingCoverage } from "./trend-briefing-backfill";

const trend: Pick<Trend, "id" | "title" | "summary" | "what_happened" | "why_now" | "last_seen_at"> = {
  id: "trend-1",
  title: "AI reasoning benchmark",
  summary: null,
  what_happened: null,
  why_now: null,
  last_seen_at: "2026-08-22T15:00:00.000Z",
};

const hackerNewsSignal: Signal = {
  id: "signal-1",
  trend_id: trend.id,
  source: "hacker_news",
  external_id: "49390035",
  title: "AI reasoning benchmark",
  excerpt: "A reproducible benchmark for AI reasoning systems.",
  source_url: "https://news.ycombinator.com/item?id=49390035",
  author_label: null,
  engagement_count: 44,
  audience_count: null,
  published_at: "2026-08-22T14:00:00.000Z",
  observed_at: "2026-08-22T15:00:00.000Z",
  metadata: { points: 30, comments: 14 },
};

describe("trend briefing coverage backfill", () => {
  it("fills only missing source-backed fields and preserves next-check guidance", () => {
    const result = inspectTrendBriefingCoverage(trend, [hackerNewsSignal]);

    expect(result).toMatchObject({
      eligible: true,
      hasAttributedSource: true,
      hasTopicExplanation: true,
      hasWhyNow: true,
      hasNextCheck: true,
      completeBefore: false,
      completeAfter: true,
      metadataLeak: false,
      depth: "concise",
    });
    expect(result.patch.summary).toBe("A reproducible benchmark for AI reasoning systems.");
    expect(result.patch.what_happened).toContain("Hacker News discussion");
    expect(result.patch.why_now).toContain("one source only");
  });

  it("is idempotent once every persisted field is present", () => {
    const first = inspectTrendBriefingCoverage(trend, [hackerNewsSignal]);
    const completeTrend = { ...trend, ...first.patch };
    const second = inspectTrendBriefingCoverage(completeTrend, [hackerNewsSignal]);

    expect(second.completeBefore).toBe(true);
    expect(second.completeAfter).toBe(true);
    expect(second.patch).toEqual({});
  });

  it("does not backfill or publish unsupported records", () => {
    const unsupported = inspectTrendBriefingCoverage(
      { ...trend, summary: "Uncited copy" },
      [{ ...hackerNewsSignal, external_id: "demo-1", source_url: "https://example.com/mock" }],
    );

    expect(unsupported).toMatchObject({ eligible: false, completeAfter: false, hasAttributedSource: false });
    expect(unsupported.patch).toEqual({});
  });

  it("retains deep format when a second independent source is available", () => {
    const githubSignal: Signal = {
      ...hackerNewsSignal,
      id: "signal-2",
      source: "github",
      external_id: "org/ai-reasoning-benchmark",
      title: "org/ai-reasoning-benchmark",
      source_url: "https://github.com/org/ai-reasoning-benchmark",
      excerpt: "An open AI model benchmark for reproducible reasoning evaluations.",
      metadata: { stars: 100, forks: 10 },
    };

    const result = inspectTrendBriefingCoverage(trend, [hackerNewsSignal, githubSignal]);

    expect(result).toMatchObject({ depth: "deep", independentSourceCount: 2, completeAfter: true });
  });
});
