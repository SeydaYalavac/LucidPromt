import type { SourceName, TrendSummarySource } from "@/types/trends";

const MAX_EXCERPT_LENGTH = 500;
const MAX_CARD_SUMMARY_LENGTH = 280;
const SUMMARY_WRITE_TOLERANCE_MS = 5_000;

const structuredTextKeys = [
  "ht:news_item_snippet",
  "snippet",
  "description",
  "summary",
  "excerpt",
  "ht:news_item_title",
  "title",
] as const;

const technologyPatterns = [
  /\b(?:ai|artificial intelligence|machine learning|deep learning|neural network|large language model|language model|llm|generative ai|agentic|computer vision|natural language processing|inference)\b/i,
  /\b(?:openai|anthropic|deepmind|chatgpt|claude|gemini|copilot|gpt(?:-?\d+)?|mistral|hugging face)\b/i,
  /\b(?:software|developer|programming|codebase|coding|open source|api|sdk|framework|library|database|cloud computing|serverless|devops|kubernetes|docker|linux|kernel|browser|webassembly)\b/i,
  /\b(?:javascript|typescript|python|rust|golang|java|swift|react|next\.js|node\.js|postgres|supabase)\b/i,
  /\b(?:cybersecurity|cyber security|ransomware|malware|data breach|encryption|privacy tech|zero-day|vulnerability|hacker)\b/i,
  /\b(?:chip|semiconductor|gpu|processor|quantum computing|robotics|robot|autonomous|self-driving|electric vehicle|ev battery)\b/i,
  /\b(?:nvidia|amd|intel|microsoft|github|gitlab|android|iphone|ios|macos|windows|tesla|spacex)\b/i,
  /\b(?:blockchain|cryptocurrency|crypto|bitcoin|ethereum|web3|smart contract)\b/i,
  /\b(?:biotech|biotechnology|medtech|mrna|genomics|gene editing|clinical trial|cancer vaccine)\b/i,
  /\b(?:spaceflight|space tech|satellite|rocket|nasa|esa|fusion energy|renewable energy|energy storage|carbon capture|climate tech)\b/i,
];

function decodeEntities(value: string) {
  const named: Record<string, string> = {
    amp: "&",
    apos: "'",
    gt: ">",
    lt: "<",
    nbsp: " ",
    quot: '"',
  };

  return value.replace(/&(#x[\da-f]+|#\d+|[a-z]+);/gi, (entity, code: string) => {
    if (code[0] !== "#") return named[code.toLowerCase()] ?? entity;
    const numeric = code[1]?.toLowerCase() === "x" ? Number.parseInt(code.slice(2), 16) : Number.parseInt(code.slice(1), 10);
    if (!Number.isFinite(numeric) || numeric < 0 || numeric > 0x10ffff) return entity;
    return String.fromCodePoint(numeric);
  });
}

function cleanPlainText(value: string) {
  const cleaned = decodeEntities(value)
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/gi, "$1")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!cleaned || cleaned === "[object Object]" || cleaned === "null" || cleaned === "undefined") return null;
  if (/^(?:\[|\{)|"(?:ht:)?news_item_(?:title|snippet|url|picture|source)"\s*:/i.test(cleaned)) return null;
  return cleaned.slice(0, MAX_EXCERPT_LENGTH);
}

function parseCapturedJsonString(value: string) {
  try {
    return JSON.parse(`"${value}"`) as string;
  } catch {
    return value.replace(/\\"/g, '"').replace(/\\n/g, " ").replace(/\\\\/g, "\\");
  }
}

function extractStructuredText(value: unknown, depth = 0): string | null {
  if (value == null || depth > 5) return null;

  if (Array.isArray(value)) {
    for (const item of value) {
      const result = extractStructuredText(item, depth + 1);
      if (result) return result;
    }
    return null;
  }

  if (typeof value === "object") {
    const record = value as Record<string, unknown>;
    for (const key of structuredTextKeys) {
      const result = extractStructuredText(record[key], depth + 1);
      if (result) return result;
    }
    return null;
  }

  if (typeof value !== "string") return cleanPlainText(String(value));

  const raw = value.trim();
  if (!raw) return null;

  if (/^[\[{]/.test(raw)) {
    try {
      return extractStructuredText(JSON.parse(raw), depth + 1);
    } catch {
      for (const key of structuredTextKeys) {
        const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const match = raw.match(new RegExp(`"${escapedKey}"\\s*:\\s*"((?:\\\\.|[^"\\\\])*)"`, "i"));
        if (!match?.[1]) continue;
        const result = cleanPlainText(parseCapturedJsonString(match[1]));
        if (result) return result;
      }
      return null;
    }
  }

  return cleanPlainText(raw);
}

export function sanitizeExcerpt(value: unknown) {
  return extractStructuredText(value);
}

export function hasTechnologyRelevance(...values: unknown[]) {
  const text = values.map((value) => sanitizeExcerpt(value) || "").join(" ");
  return technologyPatterns.some((pattern) => pattern.test(text));
}

export function isDiscoverableSignal(signal: { source?: SourceName | string | null; title?: unknown; excerpt?: unknown }) {
  if (signal.source === "github") return true;
  if (signal.source === "hacker_news" && /^show hn\s*:/i.test(String(signal.title || ""))) return true;
  return hasTechnologyRelevance(signal.title, signal.excerpt);
}

type EvidenceSignal = {
  source?: SourceName | string | null;
  external_id?: string | null;
  title?: unknown;
  excerpt?: unknown;
  source_url?: string | null;
  engagement_count?: number | null;
  audience_count?: number | null;
  published_at?: string | null;
  observed_at?: string | null;
  metadata?: Record<string, unknown> | null;
};

type EvidenceTrend = {
  title?: unknown;
  summary?: string | null;
  updated_at?: string | null;
  last_seen_at?: string | null;
};

const sourceLabels: Record<SourceName, string> = {
  hacker_news: "Hacker News",
  github: "GitHub",
  google_trends: "Google Trends",
  reddit: "Reddit",
  x: "X",
  tavily: "Tavily",
  exa: "Exa",
};

function boundedSummary(value: string) {
  if (value.length <= MAX_CARD_SUMMARY_LENGTH) return value;
  const clipped = value.slice(0, MAX_CARD_SUMMARY_LENGTH + 1);
  const boundary = clipped.lastIndexOf(" ");
  return `${clipped.slice(0, boundary > 180 ? boundary : MAX_CARD_SUMMARY_LENGTH).trimEnd()}…`;
}

function count(value: unknown) {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? Math.round(parsed) : 0;
}

function plural(value: number, singular: string) {
  return `${value.toLocaleString("en-US")} ${singular}${value === 1 ? "" : "s"}`;
}

function observedLabel(signal: EvidenceSignal) {
  const raw = signal.observed_at || signal.published_at;
  if (!raw) return null;
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "UTC",
    timeZoneName: "short",
  }).format(date);
}

function cleanSourceUrl(value: unknown) {
  if (typeof value !== "string") return null;
  try {
    const url = new URL(value);
    const host = url.hostname.toLowerCase();
    const isPlaceholder = host === "localhost"
      || host === "127.0.0.1"
      || host === "example.com"
      || host === "example.org"
      || host === "example.net"
      || host.endsWith(".test")
      || host.endsWith(".invalid");
    if (!/^https?:$/.test(url.protocol) || url.username || url.password || isPlaceholder) return null;
    return url.toString();
  } catch {
    return null;
  }
}

function signalTimestamp(signal: EvidenceSignal) {
  for (const value of [signal.observed_at, signal.published_at]) {
    const timestamp = value ? new Date(value).getTime() : Number.NaN;
    if (Number.isFinite(timestamp)) return timestamp;
  }
  return 0;
}

function trendSummaryTimestamp(trend: EvidenceTrend) {
  for (const value of [trend.updated_at, trend.last_seen_at]) {
    const timestamp = value ? new Date(value).getTime() : Number.NaN;
    if (Number.isFinite(timestamp)) return timestamp;
  }
  return 0;
}

export function sourceLabel(source: SourceName | string | null | undefined) {
  return source && source in sourceLabels ? sourceLabels[source as SourceName] : "Source";
}

export function isEligibleEvidenceSignal(signal: EvidenceSignal) {
  if (!isDiscoverableSignal(signal)) return false;
  if (String(signal.external_id || "").toLowerCase().startsWith("demo")) return false;
  return Boolean(cleanSourceUrl(signal.source_url));
}

export function summarizeEvidenceSignal(signal: EvidenceSignal) {
  if (!isEligibleEvidenceSignal(signal)) return null;
  const excerpt = sanitizeExcerpt(signal.excerpt);
  const title = sanitizeExcerpt(signal.title);
  if (excerpt && excerpt.toLocaleLowerCase() !== title?.toLocaleLowerCase()) return boundedSummary(excerpt);

  const metadata = signal.metadata || {};
  const observed = observedLabel(signal);
  const timing = observed ? ` · observed ${observed}` : "";

  if (signal.source === "hacker_news") {
    const comments = count(metadata.comments);
    const points = count(metadata.points ?? Math.max(0, count(signal.engagement_count) - comments));
    return `Hacker News activity: ${plural(points, "point")} · ${plural(comments, "comment")}${timing}`;
  }
  if (signal.source === "github") {
    const forks = count(metadata.forks);
    const stars = count(metadata.stars ?? Math.max(0, count(signal.engagement_count) - forks));
    return `GitHub activity: ${plural(stars, "star")} · ${plural(forks, "fork")}${timing}`;
  }
  if (signal.source === "google_trends") {
    const traffic = sanitizeExcerpt(metadata.approximate_traffic);
    return traffic
      ? `Google Trends activity: ${traffic} searches${timing}`
      : `Observed in Google Trends${observed ? ` on ${observed}` : ""}`;
  }
  if (signal.source === "reddit") {
    const comments = count(metadata.comments);
    const score = Math.max(0, count(signal.engagement_count) - comments);
    return `Reddit activity: ${plural(score, "point")} · ${plural(comments, "comment")}${timing}`;
  }

  const interactions = count(signal.engagement_count);
  return `${sourceLabel(signal.source)} activity: ${plural(interactions, "public interaction")}${timing}`;
}

function summarySource(signal: EvidenceSignal): TrendSummarySource | null {
  const sourceUrl = cleanSourceUrl(signal.source_url);
  const sourceTitle = sanitizeExcerpt(signal.title);
  if (!sourceUrl || !sourceTitle || !signal.source || !(signal.source in sourceLabels)) return null;
  return {
    source: signal.source as SourceName,
    source_url: sourceUrl,
    source_title: sourceTitle,
    published_at: signal.published_at || signal.observed_at || "",
    observed_at: signal.observed_at || signal.published_at || "",
  };
}

export function resolveTrendContent<T extends EvidenceTrend>(trend: T, signals: EvidenceSignal[]) {
  const eligibleSignals = signals
    .filter(isEligibleEvidenceSignal)
    .sort((a, b) => signalTimestamp(b) - signalTimestamp(a));
  const newest = eligibleSignals[0];
  if (!newest) return { ...trend, summary: null, summary_source: null };

  const storedSummary = sanitizeExcerpt(trend.summary);
  const newestSummary = summarizeEvidenceSignal(newest);
  const matchingSignal = storedSummary
    ? eligibleSignals.find((signal) => sanitizeExcerpt(signal.excerpt) === storedSummary)
    : undefined;
  const summaryIsCurrent = storedSummary
    && trendSummaryTimestamp(trend) + SUMMARY_WRITE_TOLERANCE_MS >= signalTimestamp(newest);
  const matchingSignalIsNewest = matchingSignal
    && signalTimestamp(matchingSignal) + SUMMARY_WRITE_TOLERANCE_MS >= signalTimestamp(newest);
  const selectedSignal = matchingSignalIsNewest ? matchingSignal : newest;
  const summary = (summaryIsCurrent || matchingSignalIsNewest) ? storedSummary : newestSummary;

  return {
    ...trend,
    summary: summary ? boundedSummary(summary) : null,
    summary_source: summary ? summarySource(selectedSignal) : null,
  };
}

export function isDiscoverableTrend(trend: { title?: unknown; summary?: unknown; category?: unknown }) {
  return hasTechnologyRelevance(trend.title, trend.summary);
}

export function sanitizeSignal<T extends { excerpt?: string | null }>(signal: T): T {
  return { ...signal, excerpt: sanitizeExcerpt(signal.excerpt) };
}

export function sanitizeTrend<T extends { summary?: string | null }>(trend: T): T {
  return { ...trend, summary: sanitizeExcerpt(trend.summary) };
}
