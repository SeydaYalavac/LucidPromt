import { describe, expect, it } from "vitest";
import {
  hasAiRelevance,
  buildTrendBrief,
  isAiSignal,
  isAiTrend,
  isEligibleEvidenceSignal,
  resolveTrendContent,
  sanitizeExcerpt,
  selectAiScopedTrends,
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

describe("AI-only scope", () => {
  it.each([
    "OpenAI releases a new GPT-5 reasoning model",
    "Anthropic publishes Claude model safety research",
    "An open-weight language model benchmark",
    "vLLM adds faster inference for multimodal models",
    "A coding team ships an AI data extraction assistant",
    "The EU AI Act enters its next enforcement phase",
    "Mechanistic interpretability results for a foundation model",
  ])("accepts verifiable AI evidence: %s", (text) => {
    expect(hasAiRelevance(text)).toBe(true);
  });

  it.each([
    ["fabrizio romano", screenshotExcerpt],
    ["fashion week", "A model signs with a new agent"],
    ["college football schedule", "Opening week fixtures"],
    ["small-org/unknown-tool", "A TypeScript dashboard framework"],
    ["Nvidia shares rise", "The semiconductor company reports earnings"],
    ["Gemini season begins", "A horoscope for June"],
    ["Claude wins the school prize", "A student receives an award"],
    ["cancer vaccine", "A phase-three clinical trial reports results"],
    ["Fidelity crypto", "Bitcoin fund inflows increased"],
    ["Show HN: All your saved articles in one place", "Sort reading by topic and avoid omnipresent AI slop"],
    ["Show HN: Mini DBA", "Database monitoring with a tasteful amount of AI to help out"],
  ])("rejects non-AI or name-only evidence: %s", (title, excerpt) => {
    expect(isAiSignal({ title, excerpt })).toBe(false);
  });

  it("does not trust a stored AI category without AI evidence", () => {
    expect(isAiTrend({ title: "fashion week", summary: "A model signs with a new agent" })).toBe(false);
    expect(isAiTrend({ title: "Local-first AI agents", summary: null })).toBe(true);
  });

  it("uses the same strict AI boundary for public source evidence", () => {
    const source_url = "https://news.ycombinator.com/item?id=123";
    expect(isEligibleEvidenceSignal({ source: "hacker_news", external_id: "123", title: "AI agent safety benchmark", source_url })).toBe(true);
    expect(isEligibleEvidenceSignal({ source: "hacker_news", external_id: "124", title: "Show HN: a CSS framework", source_url })).toBe(false);
    expect(isEligibleEvidenceSignal({ source: "github", external_id: "125", title: "small-org/unknown-tool", source_url: "https://github.com/small-org/unknown-tool" })).toBe(false);
  });

  it("hides stored non-AI trends from public reads without deleting them", () => {
    const trends = [
      { id: "ai", title: "AI agent benchmark", summary: null, updated_at: "2026-08-21T14:00:00.000Z" },
      { id: "sport", title: "fabrizio romano", summary: "Transfer news", updated_at: "2026-08-21T14:00:00.000Z" },
    ];
    const shared = {
      source: "hacker_news",
      source_url: "https://news.ycombinator.com/item?id=123",
      observed_at: "2026-08-21T14:00:00.000Z",
    };
    const selected = selectAiScopedTrends(trends, [
      { ...shared, trend_id: "ai", external_id: "123", title: "AI agent benchmark" },
      { ...shared, trend_id: "sport", external_id: "124", title: "fabrizio romano", excerpt: "Football transfer news" },
    ]);

    expect(selected.map((trend) => trend.id)).toEqual(["ai"]);
  });
});

describe("source-backed trend content", () => {
  const trend = {
    title: "Nvidia AI reasoning benchmark",
    summary: null,
    updated_at: "2026-08-21T14:00:00.000Z",
    last_seen_at: "2026-08-21T14:00:00.000Z",
  };
  const hackerNewsSignal = {
    source: "hacker_news",
    external_id: "123",
    title: "Nvidia AI reasoning benchmark",
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
      source_title: "Nvidia AI reasoning benchmark",
      observed_at: "2026-08-21T14:04:00.000Z",
    });
  });

  it("replaces stale fallback copy with the newest eligible source", () => {
    const resolved = resolveTrendContent(
      { ...trend, summary: "An older AI repository description." },
      [
        {
          source: "github",
          external_id: "old-repo",
          title: "org/old-ai-repo",
          excerpt: "An older AI repository description.",
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
    expect(resolved.brief).toBeNull();
  });

  it("builds a four-part brief and discloses single-source uncertainty", () => {
    const brief = buildTrendBrief(trend, [hackerNewsSignal]);

    expect(brief).toMatchObject({
      evidence_source_count: 1,
      linked_site_count: 1,
      corroboration: "single_source",
    });
    expect(brief?.what_it_is).toContain("discussion on Hacker News");
    expect(brief?.why_trending).toContain("22 points");
    expect(brief?.why_trending).toContain("one source only");
    expect(brief?.useful_for).toContain("questions, objections, and use cases");
    expect(brief?.next_step).toContain("original submission");
    expect(brief?.evidence[0].source_url).toBe("https://news.ycombinator.com/item?id=123");
  });

  it("marks independent providers as corroborated without claiming causation", () => {
    const brief = buildTrendBrief(trend, [
      hackerNewsSignal,
      {
        source: "github",
        external_id: "repo-1",
        title: "org/reasoning-benchmark",
        excerpt: "An open AI model benchmark for reasoning systems.",
        source_url: "https://github.com/org/reasoning-benchmark",
        engagement_count: 120,
        published_at: "2026-08-21T14:02:00.000Z",
        observed_at: "2026-08-21T14:05:00.000Z",
        metadata: { language: "Python", stars: 100, forks: 20 },
      },
    ]);

    expect(brief).toMatchObject({
      evidence_source_count: 2,
      linked_site_count: 2,
      corroboration: "multi_source",
    });
    expect(brief?.why_trending).toContain("Hacker News");
    expect(brief?.why_trending).toContain("GitHub");
    expect(brief?.why_trending).toContain("100 stars");
    expect(brief?.caution).toContain("does not prove cause");
  });

  it("adds publisher links carried by Google Trends without counting them as independent signal systems", () => {
    const brief = buildTrendBrief(trend, [{
      source: "google_trends",
      external_id: "US-ai-chip-1",
      title: "ai chip",
      excerpt: "A new AI chip benchmark is published",
      source_url: "https://trends.google.com/trending?geo=US",
      engagement_count: 2000,
      published_at: "2026-08-21T14:00:00.000Z",
      observed_at: "2026-08-21T14:05:00.000Z",
      metadata: {
        approximate_traffic: "2000+",
        news_items: [{
          title: "A new AI chip benchmark is published",
          snippet: "The benchmark compares current inference hardware.",
          url: "https://publisher.example.ai/benchmark",
          source: "Example AI",
        }],
      },
    }]);

    expect(brief).toMatchObject({ evidence_source_count: 1, linked_site_count: 2, corroboration: "single_source" });
    expect(brief?.evidence[1]).toMatchObject({ kind: "linked_report", label: "Example AI" });
    expect(brief?.why_trending).toContain("roughly 2000+ searches");
  });
});
