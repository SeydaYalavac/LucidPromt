import { describe, expect, it } from "vitest";
import { hasTechnologyRelevance, isDiscoverableSignal, isDiscoverableTrend, sanitizeExcerpt } from "./trend-content";

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
