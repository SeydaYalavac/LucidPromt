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
});
