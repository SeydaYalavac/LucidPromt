import { countryAttributionFromMetadata } from "./country-attribution";
import { SITE_NAME, SITE_URL } from "./site";
import { retainedHubPathForTrend } from "./trend-hubs";
import type { Country, CountryActivity, Signal, Trend } from "../types/trends";

export type InternalPageLink = {
  href: string;
  label: string;
};

export function categorySlug(category: string) {
  return category
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLocaleLowerCase("en-US")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function trendPath(slug: string) {
  return `/trend/${encodeURIComponent(slug)}`;
}

export function categoryPath(category: string) {
  return `/category/${categorySlug(category)}`;
}

export function countryPath(slug: string) {
  return `/country/${encodeURIComponent(slug)}`;
}

export function absoluteUrl(path: string) {
  return new URL(path, SITE_URL).toString();
}

export function evidenceBackedCountries(trend: Trend, signals: Signal[]) {
  const countries = new Map<string, Country>();
  for (const signal of signals) {
    const country = signal.country;
    if (!country || signal.trend_id !== trend.id) continue;
    const attribution = countryAttributionFromMetadata(signal.metadata, {
      source: signal.source,
      sourceUrl: signal.source_url,
      countryCode: country.code,
    });
    if (attribution) countries.set(country.slug, country);
  }
  return [...countries.values()].sort((left, right) => left.name.localeCompare(right.name, "en"));
}

export function trendInternalLinks(trend: Trend, signals: Signal[]) {
  const category: InternalPageLink = { href: retainedHubPathForTrend(trend), label: trend.category };
  const countries = evidenceBackedCountries(trend, signals).map((country) => ({
    href: countryPath(country.slug),
    label: country.name,
  }));
  return { category, countries };
}

function breadcrumb(items: Array<{ name: string; path: string }>) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function trendStructuredData(trend: Trend, signals: Signal[]) {
  const links = trendInternalLinks(trend, signals);
  const canonical = absoluteUrl(trendPath(trend.slug));
  const citations = signals
    .map((signal) => signal.source_url)
    .filter((url, index, items) => items.indexOf(url) === index);
  const dateModified = trend.brief?.article.last_updated_at || trend.updated_at || trend.last_seen_at;

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "NewsArticle",
        "@id": `${canonical}#article`,
        url: canonical,
        mainEntityOfPage: canonical,
        headline: trend.title,
        description: trend.brief?.what_it_is || trend.summary,
        articleSection: trend.category,
        datePublished: trend.first_seen_at,
        dateModified,
        author: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
        publisher: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
        citation: citations,
        about: [
          { "@type": "Thing", name: trend.category, url: absoluteUrl(links.category.href) },
          ...links.countries.map((country) => ({ "@type": "Place", name: country.label, url: absoluteUrl(country.href) })),
        ],
      },
      breadcrumb([
        { name: "Home", path: "/" },
        { name: trend.category, path: links.category.href },
        { name: trend.title, path: trendPath(trend.slug) },
      ]),
    ],
  };
}

export function categoryStructuredData(
  category: string,
  trends: Trend[],
  options: { path?: string; positionOffset?: number; total?: number } = {},
) {
  if (!trends.length) return null;
  const path = options.path || categoryPath(category);
  const canonical = absoluteUrl(path);
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${canonical}#collection`,
        url: canonical,
        name: `${category} AI trends`,
        description: `Current source-linked ${category} trends with evidence trails and scored attention signals.`,
        mainEntity: {
          "@type": "ItemList",
          numberOfItems: options.total || trends.length,
          itemListElement: trends.map((trend, index) => ({
            "@type": "ListItem",
            position: (options.positionOffset || 0) + index + 1,
            name: trend.title,
            url: absoluteUrl(trendPath(trend.slug)),
          })),
        },
      },
      breadcrumb([
        { name: "Home", path: "/" },
        { name: category, path },
      ]),
    ],
  };
}

export function countryStructuredData(activity: CountryActivity) {
  if (!activity.rising_topics.length || !activity.developments.length) return null;
  const path = countryPath(activity.country.slug);
  const canonical = absoluteUrl(path);
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${canonical}#collection`,
        url: canonical,
        name: `AI trends observed in ${activity.country.name}`,
        description: `Current AI trends with source evidence explicitly attributed to ${activity.country.name}. Geography describes observed-market or source-provided evidence, not event origin.`,
        about: { "@type": "Country", name: activity.country.name },
        mainEntity: {
          "@type": "ItemList",
          numberOfItems: activity.rising_topics.length,
          itemListElement: activity.rising_topics.map((trend, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: trend.title,
            url: absoluteUrl(trendPath(trend.slug)),
          })),
        },
      },
      breadcrumb([
        { name: "Home", path: "/" },
        { name: activity.country.name, path },
      ]),
    ],
  };
}

export function serializeStructuredData(value: object) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}
