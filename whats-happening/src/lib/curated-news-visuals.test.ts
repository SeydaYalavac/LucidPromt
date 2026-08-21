import { describe, expect, it } from "vitest";
import type { SourceSignal } from "@/types/trends";
import { curatedNewsVisualForSourceSignal, curatedNewsVisualForStoredSignal } from "./curated-news-visuals";

const exactSignal: SourceSignal = {
  source: "hacker_news",
  externalId: "49390035",
  title: "Linus Torvalds uses AI to debug an Intel GPU driver bug",
  sourceUrl: "https://news.ycombinator.com/item?id=49390035",
  engagementCount: 42,
  publishedAt: "2026-08-21T16:00:00.000Z",
};

describe("curatedNewsVisualForSourceSignal", () => {
  it("returns the reviewed portrait only for the exact current source record", () => {
    expect(curatedNewsVisualForSourceSignal(exactSignal, new Date("2026-08-21T22:00:00.000Z"))).toMatchObject({
      title: "Linus Torvalds at a 2012 World Economic Forum event",
      creator_name: "World Economic Forum",
      license_name: "CC BY-SA 2.0",
      rights_basis: "open_license",
    });
  });

  it.each([
    { externalId: "49390036" },
    { title: "Linus Torvalds comments on an AI debugging tool" },
    { sourceUrl: "https://news.ycombinator.com/item?id=49390036" },
    { source: "github" as const },
  ])("fails closed when the identity tuple does not match: %o", (mismatch) => {
    expect(curatedNewsVisualForSourceSignal({ ...exactSignal, ...mismatch }, new Date("2026-08-21T22:00:00.000Z"))).toBeNull();
  });

  it("expires the mapping and rejects an out-of-window publication", () => {
    expect(curatedNewsVisualForSourceSignal(exactSignal, new Date("2026-08-24T00:00:00.000Z"))).toBeNull();
    expect(curatedNewsVisualForSourceSignal({ ...exactSignal, publishedAt: "2026-08-20T23:59:59.000Z" }, new Date("2026-08-21T22:00:00.000Z"))).toBeNull();
  });

  it("matches the equivalent stored signal shape used by live API reads", () => {
    expect(curatedNewsVisualForStoredSignal({
      source: exactSignal.source,
      external_id: exactSignal.externalId,
      title: exactSignal.title,
      source_url: exactSignal.sourceUrl,
      published_at: exactSignal.publishedAt,
    }, new Date("2026-08-21T22:00:00.000Z"))).toMatchObject({ creator_name: "World Economic Forum" });
  });
});
