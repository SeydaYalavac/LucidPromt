import type { SourceName } from "@/types/trends";

const MAX_EXCERPT_LENGTH = 500;

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

export function isDiscoverableTrend(trend: { title?: unknown; summary?: unknown; category?: unknown }) {
  return hasTechnologyRelevance(trend.title, trend.summary);
}

export function sanitizeSignal<T extends { excerpt?: string | null }>(signal: T): T {
  return { ...signal, excerpt: sanitizeExcerpt(signal.excerpt) };
}

export function sanitizeTrend<T extends { summary?: string | null }>(trend: T): T {
  return { ...trend, summary: sanitizeExcerpt(trend.summary) };
}
