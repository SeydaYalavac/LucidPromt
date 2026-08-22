import type { CountryAttributionEvidence, SourceName } from "@/types/trends";

const COUNTRY_CODE = /^[A-Z]{2}$/;
const EXPLICIT_LOCATION_SOURCES = new Set<SourceName>(["reddit", "x", "tavily", "exa"]);
const SOURCE_LABELS: Partial<Record<SourceName, string>> = {
  reddit: "Reddit",
  x: "X",
  tavily: "Tavily",
  exa: "Exa",
};

function cleanUrl(value: unknown) {
  if (typeof value !== "string") return null;
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" || url.username || url.password) return null;
    return url.toString();
  } catch {
    return null;
  }
}

function cleanCountryCode(value: unknown) {
  const code = typeof value === "string" ? value.trim().toUpperCase() : "";
  return COUNTRY_CODE.test(code) ? code : null;
}

function cleanReason(value: unknown) {
  if (typeof value !== "string") return null;
  const reason = value.replace(/\s+/g, " ").trim().slice(0, 300);
  return reason || null;
}

export function googleTrendsMarketAttribution(countryCode: string, sourceUrl: string): CountryAttributionEvidence | null {
  const code = cleanCountryCode(countryCode);
  const canonicalUrl = cleanUrl(sourceUrl);
  if (!code || !canonicalUrl) return null;
  const url = new URL(canonicalUrl);
  if (url.hostname !== "trends.google.com" || url.pathname !== "/trending" || url.searchParams.get("geo")?.toUpperCase() !== code) return null;
  return {
    country_code: code,
    source_type: "google_trends",
    source_url: canonicalUrl,
    attribution_type: "observed_market",
    reason: `Google Trends recorded this topic in the ${code} market. This is observed-market evidence, not event origin.`,
  };
}

export function explicitSourceLocationAttribution(input: {
  countryCode: string;
  source: SourceName;
  sourceUrl: string;
  locationLabel: string;
}): CountryAttributionEvidence | null {
  const countryCode = cleanCountryCode(input.countryCode);
  const sourceUrl = cleanUrl(input.sourceUrl);
  const locationLabel = cleanReason(input.locationLabel);
  if (!countryCode || !sourceUrl || !locationLabel || !EXPLICIT_LOCATION_SOURCES.has(input.source)) return null;
  return {
    country_code: countryCode,
    source_type: input.source,
    source_url: sourceUrl,
    attribution_type: "explicit_source_location",
    reason: `${SOURCE_LABELS[input.source] || "The source"} attached ${locationLabel} as an explicit source location. This is source-provided geography, not independently verified event origin.`,
  };
}

export function sanitizeCountryAttribution(
  value: unknown,
  context: { source: SourceName; sourceUrl: string; countryCode?: string | null },
): CountryAttributionEvidence | null {
  if (!value || typeof value !== "object") return null;
  const candidate = value as Record<string, unknown>;
  const countryCode = cleanCountryCode(candidate.country_code);
  const sourceUrl = cleanUrl(candidate.source_url);
  const expectedSourceUrl = cleanUrl(context.sourceUrl);
  const reason = cleanReason(candidate.reason);
  if (!countryCode || !sourceUrl || !expectedSourceUrl || sourceUrl !== expectedSourceUrl || !reason) return null;
  if (context.countryCode && cleanCountryCode(context.countryCode) !== countryCode) return null;
  if (candidate.source_type !== context.source) return null;

  if (candidate.attribution_type === "observed_market") {
    if (context.source !== "google_trends") return null;
    return googleTrendsMarketAttribution(countryCode, sourceUrl);
  }

  if (candidate.attribution_type !== "explicit_source_location" || !EXPLICIT_LOCATION_SOURCES.has(context.source)) return null;
  return {
    country_code: countryCode,
    source_type: context.source,
    source_url: sourceUrl,
    attribution_type: "explicit_source_location",
    reason,
  };
}

export function countryAttributionFromMetadata(
  metadata: Record<string, unknown> | null | undefined,
  context: { source: SourceName; sourceUrl: string; countryCode?: string | null },
) {
  return sanitizeCountryAttribution(metadata?.country_attribution, context);
}
