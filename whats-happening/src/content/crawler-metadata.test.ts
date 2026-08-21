import { describe, expect, it } from "vitest";
import robots from "../app/robots";
import sitemap from "../app/sitemap";
import { SITE_URL } from "../lib/site";

describe("crawler metadata", () => {
  it("publishes a canonical sitemap and keeps APIs out of crawl traffic", () => {
    expect(robots()).toEqual({
      rules: { userAgent: "*", allow: "/", disallow: "/api/" },
      sitemap: `${SITE_URL}/sitemap.xml`,
    });
  });

  it("lists every launch-critical public route on one canonical host", () => {
    const urls = sitemap().map(({ url }) => url);

    expect(urls).toEqual([
      SITE_URL,
      `${SITE_URL}/how-it-works`,
      `${SITE_URL}/pricing`,
      `${SITE_URL}/compare/exploding-topics-vs-google-trends`,
      `${SITE_URL}/compare/exploding-topics-vs-glimpse`,
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
});
