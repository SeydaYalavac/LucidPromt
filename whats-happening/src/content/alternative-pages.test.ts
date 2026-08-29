import { describe, expect, it } from "vitest";
import {
  alternativePages,
  buildAlternativeJsonLd,
} from "./alternative-pages";
import { SITE_URL } from "../lib/site";

const staleAvailabilityClaim =
  /live data service is not connected|production (?:trend )?data (?:and (?:account access|accounts) )?are unavailable|production (?:data|feed) and accounts are unavailable|production feed and account journeys are unavailable|production data service and authentication are not connected|live trend journey is not|no connected trend data service or authentication configuration|unavailable feed is reported|not a (?:working|live|production) (?:replacement|substitute)|not ready to replace/i;

describe("alternative pages", () => {
  it("publishes the four validated alternative targets in priority order", () => {
    expect(alternativePages.map(({ slug }) => slug)).toEqual([
      "google-trends",
      "exploding-topics",
      "glimpse",
      "trends-co",
    ]);
  });

  it.each(alternativePages)("describes the verified live feed and account paths on $slug", (page) => {
    const availabilityCopy = [
      page.quickAnswer,
      page.bestFit.whatsHappening,
      ...page.axes.flatMap(({ whatsHappening, decision }) => [whatsHappening, decision]),
      ...page.faq.map(({ answer }) => answer),
      ...page.related.map(({ note }) => note),
    ].join(" ");

    expect(availabilityCopy).not.toMatch(staleAvailabilityClaim);
    expect(availabilityCopy).toContain("up to 100 source-backed");
    expect(availabilityCopy).toContain("email signup");
    expect(availabilityCopy).toContain("Google sign-in");
    expect(availabilityCopy).not.toMatch(/(?:GitHub|Apple) sign-in/i);
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
