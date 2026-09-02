import { describe, expect, it } from "vitest";
import { buildTrendSearchMetadata, trendMetadataOverride } from "./trend-metadata";

const source = {
  source: "google_trends" as const,
  source_url: "https://trends.google.com/trending/rss?geo=US",
  source_title: "OpenAI publishes a new AI safety benchmark",
  published_at: "2026-09-01T10:00:00.000Z",
  observed_at: "2026-09-01T10:05:00.000Z",
};

describe("trend metadata overrides", () => {
  it("uses query-aligned metadata for the two first-page trend routes", () => {
    expect(trendMetadataOverride("squall01337-mixamo-llm-mocap")).toEqual({
      title: "Mixamo LLM Mocap by squall01337: Video-to-Animation",
      description: "Mixamo LLM Mocap turns video into Mixamo-rig animation with GVHMR, spec-driven retargeting, and Blender MCP. See the GitHub evidence and limits.",
    });
    expect(trendMetadataOverride("nateherkai-scroll-craft")).toEqual({
      title: "Scroll Craft by nateherkai: Claude Code Skill for Websites",
      description: "Scroll Craft is a JavaScript Claude Code skill for building scroll-driven websites. See its GitHub signal, source evidence, and current limits.",
    });
  });

  it("leaves every other trend on the existing generated metadata", () => {
    expect(trendMetadataOverride("another-live-trend")).toBeNull();
  });

  it("builds topic-first metadata from the source selected for the public article", () => {
    expect(buildTrendSearchMetadata({
      trend: {
        slug: "openai-safety-benchmark",
        title: "OpenAI safety benchmark",
        summary_source: source,
      },
      signals: [{ source: source.source, source_url: source.source_url, title: source.source_title }],
    })).toEqual({
      title: "OpenAI safety benchmark | AI Trend Evidence",
      description: "Source-backed Google Trends evidence for OpenAI safety benchmark. Signal: OpenAI publishes a new AI safety benchmark. Read the context, timing, and evidence...",
    });
  });

  it("keeps descriptions unique when two topics share one source report", () => {
    const first = buildTrendSearchMetadata({
      trend: { slug: "andrew-garfield", title: "Andrew Garfield", summary_source: source },
      signals: [],
    });
    const second = buildTrendSearchMetadata({
      trend: { slug: "sam-altman", title: "Sam Altman", summary_source: source },
      signals: [],
    });

    expect(first.title).not.toBe(second.title);
    expect(first.description).not.toBe(second.description);
    expect(first.description.length).toBeLessThanOrEqual(160);
    expect(second.description.length).toBeLessThanOrEqual(160);
  });

  it("removes markup and repeats no redundant source title", () => {
    expect(buildTrendSearchMetadata({
      trend: {
        slug: "safe-agent",
        title: "<b>Safe AI agent</b>",
        summary_source: { ...source, source: "github", source_title: "Safe AI agent" },
      },
      signals: [],
    })).toEqual({
      title: "Safe AI agent | AI Trend Evidence",
      description: "Source-backed GitHub evidence for Safe AI agent. Read the context, timing, and evidence limits.",
    });
  });
});
