import { describe, expect, it } from "vitest";
import { extractGoogleNewsItems } from "./sources";

describe("extractGoogleNewsItems", () => {
  it("keeps the publisher, article URL, title, and clean snippet from Google Trends RSS", () => {
    expect(extractGoogleNewsItems([{
      "ht:news_item_title": "New AI benchmark is published",
      "ht:news_item_snippet": "<p>The test compares current inference hardware.</p>",
      "ht:news_item_url": "https://publisher.test.invalid/benchmark",
      "ht:news_item_source": "Research Desk",
    }])).toEqual([{
      title: "New AI benchmark is published",
      snippet: "The test compares current inference hardware.",
      url: "https://publisher.test.invalid/benchmark",
      source: "Research Desk",
    }]);
  });

  it("drops entries without a usable article link", () => {
    expect(extractGoogleNewsItems({ "ht:news_item_title": "Missing URL" })).toEqual([]);
  });
});
