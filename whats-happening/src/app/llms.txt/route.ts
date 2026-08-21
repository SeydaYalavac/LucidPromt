import { SITE_URL } from "../../lib/site";

export const dynamic = "force-static";

export const llmsText = `# What's Happening

> Source-linked trend intelligence for inspecting scored technology signals, source trails, and the earliest available country-tagged evidence.

What's Happening is a public web product for founders and analysts tracking emerging technology. It documents an intended signal workflow built around official source feeds, a 45/35/20 breakout score, source links, concise explanations, and careful country attribution. Production trend data and account access are currently unavailable, and public data views report that limitation instead of presenting demo records as live activity.

## Product

- [Home](${SITE_URL}/): Product overview and current public access.
- [How it works](${SITE_URL}/how-it-works): Source coverage, score weights, country attribution, and current data availability.
- [Pricing](${SITE_URL}/pricing): Current $0 public access and unavailable account and Teams features.
- [World](${SITE_URL}/world): Country-context interface, with an explicit unavailable state when no production records can load.
- [Trending](${SITE_URL}/trending): Ranked trend interface, with an explicit unavailable state when no production records can load.
- [Explore](${SITE_URL}/explore): Category interface, with an explicit unavailable state when no production records can load.
- [Map](${SITE_URL}/map): Country-attributed map interface, with an explicit unavailable state when no production records can load.

## Comparison guides

- [Exploding Topics vs Google Trends](${SITE_URL}/compare/exploding-topics-vs-google-trends): A source-cited comparison of discovery and known-query validation workflows.
- [Exploding Topics vs Glimpse](${SITE_URL}/compare/exploding-topics-vs-glimpse): A source-cited comparison of curated discovery and search-data workflows.

## Alternative guides

- [Google Trends alternatives](${SITE_URL}/alternatives/google-trends): Source-cited alternatives for known-query validation and trend discovery.
- [Exploding Topics alternatives](${SITE_URL}/alternatives/exploding-topics): Source-cited alternatives for curated trend discovery.
- [Glimpse alternatives](${SITE_URL}/alternatives/glimpse): Source-cited alternatives for search-demand analysis.
- [Trends.co alternatives](${SITE_URL}/alternatives/trends-co): Source-cited alternatives for business-trend research.

## Policies

- [Privacy](${SITE_URL}/privacy): Current privacy notice.
- [Terms](${SITE_URL}/terms): Current terms of use.
`;

export function GET() {
  return new Response(llmsText, {
    headers: {
      "Cache-Control": "public, max-age=3600",
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}
