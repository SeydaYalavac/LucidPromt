import { describe, expect, it } from "vitest";
import { prepareSourceSignals } from "./prepare-signals";
import type { SourceSignal } from "../src/types/trends";

const signal = (overrides: Partial<SourceSignal> = {}): SourceSignal => ({
  source: "hacker_news",
  externalId: "123",
  title: "  New   AI agent benchmark  ",
  excerpt: "<p>Independent AI evaluation.</p>",
  sourceUrl: "https://news.ycombinator.com/item?id=123",
  engagementCount: 8,
  publishedAt: "2026-08-21T17:00:00Z",
  ...overrides,
});

describe("prepareSourceSignals", () => {
  it("normalizes, deduplicates, and keeps the strongest source observation", () => {
    const prepared = prepareSourceSignals([
      signal(),
      signal({ title: "New AI agent benchmark", engagementCount: 18 }),
    ]);

    expect(prepared).toEqual([expect.objectContaining({
      title: "New AI agent benchmark",
      excerpt: "Independent AI evaluation.",
      engagementCount: 18,
    })]);
  });

  it("rejects malformed, title-less, and off-scope records", () => {
    const prepared = prepareSourceSignals([
      signal({ externalId: "1", title: "" }),
      signal({ externalId: "2", sourceUrl: "javascript:alert(1)" }),
      signal({ externalId: "3", publishedAt: "not-a-date" }),
      signal({ externalId: "4", title: "Football transfer update", excerpt: "League fixtures" }),
    ]);

    expect(prepared).toEqual([]);
  });

  it("stores only rights-checked visual metadata", () => {
    const validVisual = {
      image_url: "https://upload.wikimedia.org/ai-research.jpg",
      title: "AI research lab",
      alt_text: "An AI research lab.",
      source_name: "Wikimedia Commons",
      source_url: "https://commons.wikimedia.org/wiki/File:AI_research.jpg",
      creator_name: "Example Photographer",
      license_name: "CC BY-SA 4.0",
      license_url: "https://creativecommons.org/licenses/by-sa/4.0/",
      rights_basis: "open_license",
    };
    const prepared = prepareSourceSignals([
      signal({ externalId: "licensed", metadata: { news_visual: validVisual } }),
      signal({ externalId: "unlicensed", metadata: { news_visual: { image_url: "https://publisher.example/og.jpg" } } }),
    ]);

    expect(prepared[0].metadata?.news_visual).toEqual(validVisual);
    expect(prepared[1].metadata).not.toHaveProperty("news_visual");
  });

  it("attaches the exact current curated visual and expires it", () => {
    const exact = signal({
      externalId: "49390035",
      title: "Linus Torvalds uses AI to debug an Intel GPU driver bug",
      sourceUrl: "https://news.ycombinator.com/item?id=49390035",
      publishedAt: "2026-08-21T16:00:00.000Z",
      metadata: { points: 20, comments: 4 },
    });

    expect(prepareSourceSignals([exact], new Date("2026-08-21T22:00:00.000Z"))[0].metadata?.news_visual).toMatchObject({
      creator_name: "World Economic Forum",
      license_name: "CC BY-SA 2.0",
    });
    expect(prepareSourceSignals([exact], new Date("2026-08-24T00:00:00.000Z"))[0].metadata).not.toHaveProperty("news_visual");
  });
});
