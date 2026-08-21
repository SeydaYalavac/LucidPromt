import type { NewsVisual, SourceSignal } from "@/types/trends";

const LINUS_TORVALDS_HN_ID = "49390035";
const LINUS_TORVALDS_TITLE = "Linus Torvalds uses AI to debug an Intel GPU driver bug";
const LINUS_TORVALDS_HN_URL = `https://news.ycombinator.com/item?id=${LINUS_TORVALDS_HN_ID}`;
const LINUS_VISUAL_ACTIVE_FROM = Date.parse("2026-08-21T00:00:00.000Z");
const LINUS_VISUAL_EXPIRES_AT = Date.parse("2026-08-24T00:00:00.000Z");

type CuratedSignalIdentity = {
  source?: string | null;
  externalId?: string | null;
  title?: unknown;
  sourceUrl?: string | null;
  publishedAt?: string | null;
};

type StoredSignalIdentity = {
  source?: string | null;
  external_id?: string | null;
  title?: unknown;
  source_url?: string | null;
  published_at?: string | null;
};

const linusTorvaldsVisual: NewsVisual = {
  image_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/82/Linus_Torvalds_at_the_Annual_Meeting_of_the_New_Champions_in_Tianjin%2C_China_2012.jpg/1920px-Linus_Torvalds_at_the_Annual_Meeting_of_the_New_Champions_in_Tianjin%2C_China_2012.jpg",
  title: "Linus Torvalds at a 2012 World Economic Forum event",
  alt_text: "Linus Torvalds, at right, speaking at the World Economic Forum Annual Meeting of the New Champions in Tianjin in 2012.",
  source_name: "Wikimedia Commons",
  source_url: "https://commons.wikimedia.org/wiki/File:Linus_Torvalds_at_the_Annual_Meeting_of_the_New_Champions_in_Tianjin,_China_2012.jpg",
  creator_name: "World Economic Forum",
  license_name: "CC BY-SA 2.0",
  license_url: "https://creativecommons.org/licenses/by-sa/2.0/",
  rights_basis: "open_license",
  usage_notes: "Exact-match contextual portrait. Do not imply that the 2012 photograph depicts the reported debugging event; credit World Economic Forum and link CC BY-SA 2.0.",
  width: 1920,
  height: 1353,
};

/**
 * Manually reviewed visual records only. Every rule is bound to one source,
 * external record, exact title, canonical evidence URL, and short validity
 * window so an entity portrait cannot drift onto a similarly named story.
 */
function curatedVisualForIdentity(signal: CuratedSignalIdentity, now: Date): NewsVisual | null {
  const nowTimestamp = now.getTime();
  const publishedTimestamp = new Date(signal.publishedAt || "").getTime();
  if (!Number.isFinite(nowTimestamp) || !Number.isFinite(publishedTimestamp)) return null;
  if (nowTimestamp < LINUS_VISUAL_ACTIVE_FROM || nowTimestamp >= LINUS_VISUAL_EXPIRES_AT) return null;
  if (publishedTimestamp < LINUS_VISUAL_ACTIVE_FROM || publishedTimestamp >= LINUS_VISUAL_EXPIRES_AT) return null;
  if (signal.source !== "hacker_news") return null;
  if (signal.externalId !== LINUS_TORVALDS_HN_ID) return null;
  if (signal.title !== LINUS_TORVALDS_TITLE) return null;
  if (signal.sourceUrl !== LINUS_TORVALDS_HN_URL) return null;
  return { ...linusTorvaldsVisual };
}

export function curatedNewsVisualForSourceSignal(signal: SourceSignal, now = new Date()) {
  return curatedVisualForIdentity(signal, now);
}

export function curatedNewsVisualForStoredSignal(signal: StoredSignalIdentity, now = new Date()) {
  return curatedVisualForIdentity({
    source: signal.source,
    externalId: signal.external_id,
    title: signal.title,
    sourceUrl: signal.source_url,
    publishedAt: signal.published_at,
  }, now);
}
