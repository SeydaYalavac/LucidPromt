import { describe, expect, it } from "vitest";
import type { Trend, TrendBrief } from "@/types/trends";
import { localizeTrendBrief } from "./trend";

const trend = { title: "Reasoning model benchmark" } as Trend;
const brief = {
  what_it_is: "English internal summary",
  why_trending: "English internal rationale",
  useful_for: "English internal audience",
  next_step: "English internal next step",
  freshest_observed_at: "2026-08-21T10:00:00.000Z",
  evidence_source_count: 1,
  linked_site_count: 1,
  corroboration: "single_source",
  caution: "English internal caution",
  evidence: [{
    reference_id: "source-1",
    provider: "hacker_news",
    kind: "linked_report",
    label: "Hacker News",
    source_url: "https://news.ycombinator.com/item?id=1",
    source_title: "Original English source headline",
    published_at: "2026-08-21T09:00:00.000Z",
    observed_at: "2026-08-21T10:00:00.000Z",
    signal_summary: "Original English evidence summary",
  }],
  article: {
    depth: "concise",
    independent_source_count: 1,
    last_updated_at: "2026-08-21T10:00:00.000Z",
    sections: [],
  },
} satisfies TrendBrief;

describe("trend localization", () => {
  it("preserves the English brief by reference when English is selected", () => {
    expect(localizeTrendBrief(trend, brief, "en")).toBe(brief);
  });

  it("translates internal editorial copy while preserving external source evidence", () => {
    const localized = localizeTrendBrief(trend, brief, "tr");

    expect(localized?.what_it_is).toContain("güncel bir yapay zeka konusu");
    expect(localized?.article.sections[0]?.label).toBe("Arka plan");
    expect(localized?.evidence[0]).toEqual(brief.evidence[0]);
    expect(localized?.evidence[0].source_title).toBe("Original English source headline");
    expect(localized?.evidence[0].source_url).toBe("https://news.ycombinator.com/item?id=1");
  });
});
