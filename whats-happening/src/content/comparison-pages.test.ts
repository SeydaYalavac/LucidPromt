import { describe, expect, it } from "vitest";
import {
  buildComparisonJsonLd,
  comparisonPages,
} from "./comparison-pages";
import { SITE_URL } from "../lib/site";

describe("comparison pages", () => {
  it("publishes only the two validated comparison targets", () => {
    expect(comparisonPages.map(({ slug }) => slug)).toEqual([
      "exploding-topics-vs-google-trends",
      "exploding-topics-vs-glimpse",
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
    expect(`${page.quickAnswer} ${page.whatsHappeningSummary}`).toMatch(/not (connected|ready)|unavailable/i);
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
