import { describe, expect, it } from "vitest";
import {
  hasTechnologyRelevance,
  isDiscoverableSignal,
  isDiscoverableTrend,
  resolveTrendContent,
  sanitizeExcerpt,
} from "./trend-content";

const screenshotExcerpt = `[{"ht:news_item_title":"Carlos Alcaraz to return from wrist injury, defend US Open title","ht:news_item_snippet":"","ht:news_item_url":"https://www.espn.com/tennis/story/_/id/49672571/carlos-alcaraz-return-wrist-injury-defend-us-open-title"},{"ht:news_item_title":"Carlos Alcaraz confirms U.S. Open return via soccer transfer figu`;

describe("sanitizeExcerpt", () => {
  it("extracts a readable title from the truncated Google Trends metadata shown in the bug", () => {
    expect(sanitizeExcerpt(screenshotExcerpt)).toBe("Carlos Alcaraz to return from wrist injury, defend US Open title");
  });

  it("prefers a useful snippet and never serializes source metadata", () => {
    expect(sanitizeExcerpt([{ "ht:news_item_title": "New AI chip launches", "ht:news_item_snippet": "Benchmark results are now public." }])).toBe(
      "Benchmark results are now public.",
    );
  });

  it("strips markup and rejects empty or malformed transport blobs", () => {
    expect(sanitizeExcerpt("<p>Open-source &amp; auditable.</p>")).toBe("Open-source & auditable.");
    expect(sanitizeExcerpt("   ")).toBeNull();
    expect(sanitizeExcerpt(`[{"ht:news_item_url":"https://example.com`)).toBeNull();
  });
});

describe("technology relevance", () => {
  it("quarantines the screenshot sports topic", () => {
    expect(isDiscoverableTrend({ title: "fabrizio romano", summary: screenshotExcerpt, category: "World" })).toBe(false);
    expect(isDiscoverableTrend({ title: "fashion week", summary: "A model signs with a new agent", category: "Artificial Intelligence" })).toBe(false);
    expect(isDiscoverableSignal({ source: "google_trends", title: "college football schedule", excerpt: "Opening week fixtures" })).toBe(false);
  });

  it("keeps AI, developer, and adjacent technology evidence", () => {
    expect(hasTechnologyRelevance("OpenAI releases a new coding agent")).toBe(true);
    expect(isDiscoverableSignal({ source: "google_trends", title: "tesla autopilot", excerpt: "Self-driving crash data" })).toBe(true);
    expect(isDiscoverableSignal({ source: "github", title: "small-org/unknown-tool", excerpt: null })).toBe(true);
  });
});

describe("source-backed trend content", () => {
  const trend = {
    title: "Nvidia reasoning benchmark",
    summary: null,
    updated_at: "2026-08-21T14:00:00.000Z",
    last_seen_at: "2026-08-21T14:00:00.000Z",
  };
  const hackerNewsSignal = {
    source: "hacker_news",
    external_id: "123",
    title: "Nvidia reasoning benchmark",
    excerpt: null,
    source_url: "https://news.ycombinator.com/item?id=123",
    engagement_count: 34,
    published_at: "2026-08-21T14:03:00.000Z",
    observed_at: "2026-08-21T14:04:00.000Z",
    metadata: { points: 22, comments: 12 },
  };

  it("fills an empty summary from factual source metadata", () => {
    const resolved = resolveTrendContent(trend, [hackerNewsSignal]);

    expect(resolved.summary).toContain("Hacker News activity: 22 points · 12 comments");
    expect(resolved.summary).toContain("observed Aug 21");
    expect(resolved.summary_source).toMatchObject({
      source: "hacker_news",
      source_url: "https://news.ycombinator.com/item?id=123",
      source_title: "Nvidia reasoning benchmark",
      observed_at: "2026-08-21T14:04:00.000Z",
    });
  });

  it("replaces stale fallback copy with the newest eligible source", () => {
    const resolved = resolveTrendContent(
      { ...trend, summary: "An older repository description." },
      [
        {
          source: "github",
          external_id: "old-repo",
          title: "org/old-repo",
          excerpt: "An older repository description.",
          source_url: "https://github.com/org/old-repo",
          engagement_count: 10,
          published_at: "2026-08-21T13:00:00.000Z",
          observed_at: "2026-08-21T13:01:00.000Z",
          metadata: { stars: 8, forks: 2 },
        },
        hackerNewsSignal,
      ],
    );

    expect(resolved.summary).toContain("Hacker News activity");
    expect(resolved.summary).not.toContain("older repository");
    expect(resolved.summary_source?.source).toBe("hacker_news");
  });

  it("keeps a clean stored summary written with the current observation", () => {
    const resolved = resolveTrendContent(
      { ...trend, summary: "Fresh benchmark results are now public.", updated_at: "2026-08-21T14:04:01.000Z" },
      [{ ...hackerNewsSignal, excerpt: "Fresh benchmark results are now public." }],
    );

    expect(resolved.summary).toBe("Fresh benchmark results are now public.");
    expect(resolved.summary_source?.source_url).toBe("https://news.ycombinator.com/item?id=123");
  });

  it("excludes malformed and demo evidence instead of presenting mock copy", () => {
    const resolved = resolveTrendContent(trend, [
      { ...hackerNewsSignal, external_id: "demo-hn-1", excerpt: "Mock production copy", observed_at: "2026-08-21T14:09:00.000Z" },
      { ...hackerNewsSignal, external_id: "456", source_url: "https://example.com/mock", excerpt: screenshotExcerpt, observed_at: "2026-08-21T14:08:00.000Z" },
      {
        source: "github",
        external_id: "real-repo",
        title: "org/real-ai-repo",
        excerpt: "A real source-backed repository description.",
        source_url: "https://github.com/org/real-ai-repo",
        engagement_count: 4,
        published_at: "2026-08-21T14:01:00.000Z",
        observed_at: "2026-08-21T14:02:00.000Z",
        metadata: { stars: 3, forks: 1 },
      },
    ]);

    expect(resolved.summary).toBe("A real source-backed repository description.");
    expect(resolved.summary).not.toContain("ht:news_item");
    expect(resolved.summary_source?.source_url).toBe("https://github.com/org/real-ai-repo");
  });

  it("fails closed when no eligible source evidence exists", () => {
    const resolved = resolveTrendContent({ ...trend, summary: "Uncited production copy" }, []);

    expect(resolved.summary).toBeNull();
    expect(resolved.summary_source).toBeNull();
  });
});
