import type { NewsVisual } from "@/types/trends";

const MAX_LABEL_LENGTH = 160;
const MAX_ALT_LENGTH = 320;
const OPEN_LICENSE_HOSTS = new Set(["creativecommons.org"]);

function cleanText(value: unknown, maximum = MAX_LABEL_LENGTH) {
  if (typeof value !== "string") return null;
  const cleaned = value.replace(/\s+/g, " ").trim();
  return cleaned ? cleaned.slice(0, maximum) : null;
}

function cleanHttpsUrl(value: unknown) {
  if (typeof value !== "string") return null;
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" || url.username || url.password) return null;
    return url.toString();
  } catch {
    return null;
  }
}

function cleanDimension(value: unknown) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 1 || parsed > 20_000) return undefined;
  return Math.round(parsed);
}

function isRecognizedOpenLicense(urlValue: string) {
  const url = new URL(urlValue);
  if (!OPEN_LICENSE_HOSTS.has(url.hostname.toLowerCase())) return false;
  return /^\/(?:licenses\/(?:by|by-sa|by-nd)\/\d(?:\.\d)?|publicdomain\/(?:zero|mark)\/\d(?:\.\d)?)(?:\/|$)/i.test(url.pathname);
}

/**
 * Fail-closed visual policy. A source adapter must provide affirmative rights
 * evidence; a discoverable image URL or Open Graph tag is never sufficient.
 */
export function sanitizeNewsVisual(value: unknown): NewsVisual | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const candidate = value as Record<string, unknown>;
  const imageUrl = cleanHttpsUrl(candidate.image_url);
  const sourceUrl = cleanHttpsUrl(candidate.source_url);
  const licenseUrl = cleanHttpsUrl(candidate.license_url);
  const title = cleanText(candidate.title);
  const altText = cleanText(candidate.alt_text, MAX_ALT_LENGTH);
  const sourceName = cleanText(candidate.source_name);
  const creatorName = cleanText(candidate.creator_name);
  const licenseName = cleanText(candidate.license_name);
  const rightsBasis = candidate.rights_basis;

  if (!imageUrl || !sourceUrl || !licenseUrl || !title || !altText || !sourceName || !creatorName || !licenseName) return null;
  if (rightsBasis !== "open_license" && rightsBasis !== "permissioned") return null;
  if (rightsBasis === "open_license" && !isRecognizedOpenLicense(licenseUrl)) return null;

  return {
    image_url: imageUrl,
    title,
    alt_text: altText,
    source_name: sourceName,
    source_url: sourceUrl,
    creator_name: creatorName,
    license_name: licenseName,
    license_url: licenseUrl,
    rights_basis: rightsBasis,
    usage_notes: cleanText(candidate.usage_notes, MAX_ALT_LENGTH) || undefined,
    width: cleanDimension(candidate.width),
    height: cleanDimension(candidate.height),
  };
}
