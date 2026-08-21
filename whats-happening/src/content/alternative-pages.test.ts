import { describe, expect, it } from "vitest";
import {
  alternativePages,
  buildAlternativeJsonLd,
} from "./alternative-pages";
import { SITE_URL } from "../lib/site";

describe("alternative pages", () => {
  it("publishes the four validated alternative targets in priority order", () => {
    expect(alternativePages.map(({ slug }) => slug)).toEqual([
      "google-trends",
      "exploding-topics",
      "glimpse",
      "trends-co",
    ]);
  });

  it.each(alternativePages)("keeps $slug useful, candid, sourced, and internally connected", (page) => {
    expect(page.title.toLowerCase()).toContain("alternative");
    expect(page.axes).toHaveLength(6);
    expect(page.faq.length).toBeGreaterThanOrEqual(4);
    expect(page.sources.some(({ url }) => url === `${SITE_URL}/how-it-works`)).toBe(true);
    expect(page.sources.some(({ url }) => url === `${SITE_URL}/pricing`)).toBe(true);
    expect(page.sources.filter(({ url }) => url.startsWith("https://") && !url.includes("whatshappeninginai.com")).length).toBeGreaterThanOrEqual(2);

    const internalLinks = page.related.map(({ href }) => href);
    expect(internalLinks).toContain("/how-it-works");
    expect(internalLinks).toContain("/pricing");
    expect(internalLinks).toContain("/explore");
    expect(internalLinks.some((href) => href.startsWith("/alternatives/") || href.startsWith("/compare/"))).toBe(true);
    expect(`${page.quickAnswer} ${page.bestFit.whatsHappening}`).toMatch(/not (a live|a working|a production)|unavailable|early-access/i);
  });

  it.each(alternativePages)("adds Organization, SoftwareApplication, and FAQPage schema to $slug", (page) => {
    const jsonLd = buildAlternativeJsonLd(page);
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
