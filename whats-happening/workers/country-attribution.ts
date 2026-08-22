import { slugifyTitle } from "../src/lib/scoring";
import { googleTrendsMarketAttribution } from "../src/lib/country-attribution";
import { MAP_COUNTRIES } from "./map-countries";
import type { CountryAttributionEvidence, SourceName, SourceSignal } from "../src/types/trends";

export function backfillableCountryAttribution(signal: {
  source: SourceName;
  source_url: string;
  metadata: Record<string, unknown> | null;
}): CountryAttributionEvidence | null {
  if (signal.source !== "google_trends") return null;
  const market = typeof signal.metadata?.market === "string" ? signal.metadata.market : "";
  return googleTrendsMarketAttribution(market, signal.source_url);
}

export function evidenceCountryRows(signals: SourceSignal[]) {
  const known = new Set<string>(MAP_COUNTRIES.map((country) => country.code));
  const displayNames = new Intl.DisplayNames(["en"], { type: "region" });
  const rows = new Map<string, { code: string; slug: string; name: string; latitude: null; longitude: null }>();
  for (const signal of signals) {
    const code = signal.countryAttribution?.country_code;
    if (!code || known.has(code) || rows.has(code)) continue;
    const name = displayNames.of(code);
    const slug = name ? slugifyTitle(name) : "";
    if (!name || name === code || !slug) continue;
    rows.set(code, { code, slug, name, latitude: null, longitude: null });
  }
  return [...rows.values()];
}
