import { describe, expect, it } from "vitest";
import { GET as getLlmsText, llmsText } from "../app/llms.txt/route";
import robots from "../app/robots";
import { SITE_URL } from "../lib/site";
import { buildSitemap } from "../lib/sitemap";

describe("crawler metadata", () => {
  it("publishes a canonical sitemap and keeps APIs out of crawl traffic", () => {
    expect(robots()).toEqual({
      rules: { userAgent: "*", allow: "/", disallow: "/api/" },
      sitemap: `${SITE_URL}/sitemap.xml`,
    });
  });

  it("lists every launch-critical public route on one canonical host", () => {
    const urls = buildSitemap([], []).map(({ url }) => url);

    expect(urls).toEqual([
      SITE_URL,
      `${SITE_URL}/about`,
      `${SITE_URL}/how-it-works`,
      `${SITE_URL}/pricing`,
      `${SITE_URL}/security-research`,
      `${SITE_URL}/compare/exploding-topics-vs-google-trends`,
      `${SITE_URL}/compare/exploding-topics-vs-glimpse`,
      `${SITE_URL}/alternatives/google-trends`,
      `${SITE_URL}/alternatives/exploding-topics`,
      `${SITE_URL}/alternatives/glimpse`,
      `${SITE_URL}/alternatives/trends-co`,
      `${SITE_URL}/privacy`,
      `${SITE_URL}/terms`,
      `${SITE_URL}/world`,
      `${SITE_URL}/trending`,
      `${SITE_URL}/explore`,
      `${SITE_URL}/map`,
    ]);
    expect(urls.every((url) => url.startsWith(SITE_URL))).toBe(true);
    expect(urls).not.toContain(`${SITE_URL}/signin`);
    expect(urls).not.toContain(`${SITE_URL}/signup`);
  });

  it("publishes factual llms.txt guidance with canonical public links only", async () => {
    const response = getLlmsText();
    const linkedUrls = Array.from(llmsText.matchAll(/\]\((https:\/\/[^)]+)\)/g), (match) => match[1]);

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe("text/plain; charset=utf-8");
    expect(await response.text()).toBe(llmsText);
    expect(linkedUrls.length).toBe(16);
    expect(linkedUrls.every((url) => url === SITE_URL || url.startsWith(`${SITE_URL}/`))).toBe(true);
    expect(llmsText).toContain("Production trend data and account access are currently unavailable");
    expect(llmsText).not.toContain(`${SITE_URL}/signin`);
    expect(llmsText).not.toContain(`${SITE_URL}/signup`);
    expect(llmsText).not.toContain(`${SITE_URL}/api/`);
  });
});
