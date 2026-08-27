import { describe, expect, it } from "vitest";
import {
  buildComparisonJsonLd,
  comparisonPages,
  trendAnalysisToolsComparison,
} from "./comparison-pages";
import { SITE_URL } from "../lib/site";

describe("comparison pages", () => {
  it("publishes only the validated comparison targets", () => {
    expect(comparisonPages.map(({ slug }) => slug)).toEqual([
      "exploding-topics-vs-google-trends",
      "exploding-topics-vs-glimpse",
      "trend-analysis-tools",
    ]);
  });

  it.each(comparisonPages)("keeps $slug specific, sourced, and internally connected", (page) => {
    expect(page.title).toContain(page.competitor);
    expect(page.title).toContain(page.alternative);
    expect(page.axes).toHaveLength(6);
    expect(page.faq.length).toBeGreaterThanOrEqual(4);
    expect(page.sources.some(({ url }) => url === `${SITE_URL}/how-it-works`)).toBe(true);
    expect(page.sources.some(({ url }) => url === `${SITE_URL}/pricing`)).toBe(true);
    expect(page.sources.filter(({ url }) => url.startsWith("https://") && !url.includes("whatshappeninginai.com")).length).toBeGreaterThanOrEqual(3);
    expect(page.sibling.href).toMatch(/^\/compare\//);
    expect(`${page.quickAnswer} ${page.whatsHappeningSummary} ${page.productionStatus?.body ?? ""}`).toMatch(
      /not (connected|ready)|unavailable|boundaries|requires separate credentials/i,
    );
  });

  it("keeps the trend analysis tool guide complete and keyword-focused", () => {
    const copy = [
      trendAnalysisToolsComparison.heading,
      trendAnalysisToolsComparison.lead,
      trendAnalysisToolsComparison.competitorSummary,
      trendAnalysisToolsComparison.alternativeSummary,
      trendAnalysisToolsComparison.whatsHappeningSummary,
      trendAnalysisToolsComparison.quickAnswer,
      ...Object.values(trendAnalysisToolsComparison.choiceGuidance),
      ...trendAnalysisToolsComparison.axes.flatMap((axis) => Object.values(axis)),
      ...(trendAnalysisToolsComparison.deepDive ?? []).flatMap((section) => [
        section.eyebrow,
        section.heading,
        ...section.paragraphs,
      ]),
      ...trendAnalysisToolsComparison.faq.flatMap(({ question, answer }) => [question, answer]),
    ].join(" ");

    expect(trendAnalysisToolsComparison.title.toLowerCase()).toContain("trend analysis tool");
    expect(copy.match(/\b[\w’'-]+\b/g)?.length ?? 0).toBeGreaterThanOrEqual(1500);
    expect(copy).toContain("Hootsuite");
    expect(copy).toContain("Trendalytics");
  });

  it.each(comparisonPages)("adds Organization, SoftwareApplication, and FAQPage schema to $slug", (page) => {
    const jsonLd = buildComparisonJsonLd(page);
    const graph = jsonLd["@graph"];

    expect(graph.map((item) => item["@type"])).toEqual([
      "Organization",
      "SoftwareApplication",
      "FAQPage",
    ]);
    const faq = graph.find((item) => item["@type"] === "FAQPage");
    expect(faq && "mainEntity" in faq ? faq.mainEntity : []).toHaveLength(page.faq.length);
  });
});
