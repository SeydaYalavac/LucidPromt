import type {
  SourceName,
  TrendArticle,
  TrendArticleClaim,
  TrendArticleSection,
  TrendBrief,
  TrendBriefEvidence,
  TrendSummarySource,
} from "@/types/trends";

const MAX_EXCERPT_LENGTH = 500;
const MAX_CARD_SUMMARY_LENGTH = 180;
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

// Public records must carry affirmative AI evidence. Broad technology terms are
// intentionally absent: a repository, chip, model, agent, or company name alone
// is not enough to prove that the underlying topic is about AI.
const explicitAiPatterns = [
  /\bAI\b/,
  /\b(?:artificial intelligence|artificial general intelligence|machine learning|deep learning|reinforcement learning|generative ai|agentic ai|ai (?:(?:autonomous|coding|research|sales|software|support) )?agents?|ai models?|ai systems?|ai assistants?|ai coding|ai safety|ai policy|ai regulation|ai governance|ai infrastructure|ai accelerators?|ai chips?|ai inference|ai training|ai search|ai (?:image|video|voice|data)|ai[- ](?:assisted|based|designed|driven|enabled|generated|powered))\b/i,
  /\bai[-_ ]+(?:agent|assistant|bot|chip|coding|data|image|inference|model|platform|repo|research|safety|search|system|tool|training|video|voice)s?\b/i,
  /\b(?:large language models?|language models?|foundation models?|frontier models?|vision[- ]language models?|multimodal models?|diffusion models?|neural networks?|computer vision|natural language processing)\b/i,
  /\b(?:LLMs?|NLP|RAG)\b/,
  /\b(?:retrieval[- ]augmented generation|fine[- ]tuning|prompt engineering|model alignment|model safety|model evaluations?|mechanistic interpretability|inference (?:accelerator|chip|engine|runtime|server)|text[- ]to[- ](?:image|video)|image[- ]to[- ]video)\b/i,
  /\b(?:openai|anthropic|chatgpt|deepmind|hugging face|mistral ai|perplexity ai|stability ai|midjourney|dall[- ]?e|deepseek(?:-[\w.-]+)?|qwen(?:[0-9][\w.-]*)?)\b/i,
  /\b(?:vllm|ollama|langchain|langgraph|llamaindex|pytorch|tensorflow|tensorrt[- ]llm|llama\.cpp|comfyui)\b/i,
  /\bgpt(?:-?[0-9][\w.-]*|[_-][a-z][\w.-]*)\b/i,
];

const ambiguousAiEntityPattern = /\b(?:claude|gemini|llama|grok|sora|copilot|codex|cursor|windsurf)\b/i;
const aiEntityContextPattern = /\b(?:ai|anthropic|google|meta|openai|microsoft|github|model|llm|assistant|chatbot|agent|inference|training|weights|tokens?|api|coding|code|editor|prompt|benchmark|reasoning|multimodal|vision|subscription)\b/i;

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

export function hasAiRelevance(...values: unknown[]) {
  const text = values.map((value) => sanitizeExcerpt(value) || "").join(" ");
  if (!text) return false;
  if (explicitAiPatterns.some((pattern) => pattern.test(text))) return true;
  return ambiguousAiEntityPattern.test(text) && aiEntityContextPattern.test(text);
}

export function isAiSignal(signal: { title?: unknown; excerpt?: unknown }) {
  if (hasAiRelevance(signal.title)) return true;
  const excerpt = sanitizeExcerpt(signal.excerpt) || "";
  if (!excerpt) return false;
  if (explicitAiPatterns.slice(1).some((pattern) => pattern.test(excerpt))) return true;
  return ambiguousAiEntityPattern.test(excerpt) && aiEntityContextPattern.test(excerpt);
}

type EvidenceSignal = {
  trend_id?: string | null;
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
  what_happened?: string | null;
  why_now?: string | null;
  where_started?: string | null;
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

function sourceHost(value: string) {
  try {
    return new URL(value).hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return value;
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
  if (!isAiSignal(signal)) return false;
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

function compactSentence(value: string, max = 220) {
  const clean = sanitizeExcerpt(value) || "";
  if (clean.length <= max) return clean;
  const clipped = clean.slice(0, max + 1);
  const boundary = clipped.lastIndexOf(" ");
  return `${clipped.slice(0, boundary > max * 0.65 ? boundary : max).trimEnd()}…`;
}

function sourceActivity(signal: EvidenceSignal) {
  const metadata = signal.metadata || {};
  if (signal.source === "hacker_news") {
    const comments = count(metadata.comments);
    const points = count(metadata.points ?? Math.max(0, count(signal.engagement_count) - comments));
    return `Hacker News recorded ${plural(points, "point")} and ${plural(comments, "comment")}.`;
  }
  if (signal.source === "github") {
    const forks = count(metadata.forks);
    const stars = count(metadata.stars ?? Math.max(0, count(signal.engagement_count) - forks));
    return `GitHub recorded ${plural(stars, "star")} and ${plural(forks, "fork")}.`;
  }
  if (signal.source === "google_trends") {
    const traffic = sanitizeExcerpt(metadata.approximate_traffic);
    return traffic
      ? `Google Trends listed roughly ${traffic.replace(/\s*searches?$/i, "")} searches.`
      : "Google Trends listed the topic in its current trending searches.";
  }
  if (signal.source === "reddit") {
    const comments = count(metadata.comments);
    const score = Math.max(0, count(signal.engagement_count) - comments);
    return `Reddit recorded ${plural(score, "point")} and ${plural(comments, "comment")}.`;
  }
  if (signal.source === "x") {
    return `X recorded ${plural(count(signal.engagement_count), "public interaction")}.`;
  }
  return `${sourceLabel(signal.source)} surfaced a current matching report.`;
}

function describeTrend(trend: EvidenceTrend, signal: EvidenceSignal) {
  const title = sanitizeExcerpt(signal.title) || sanitizeExcerpt(trend.title) || "this topic";
  const excerpt = sanitizeExcerpt(signal.excerpt);
  const metadata = signal.metadata || {};

  if (signal.source === "github") {
    const language = sanitizeExcerpt(metadata.language);
    const context = language ? ` written primarily in ${language}` : "";
    return excerpt
      ? `${title} is a GitHub project${context}. Its repository describes it as: ${compactSentence(excerpt, 180)}`
      : `${title} is a GitHub project${context} attracting recent repository activity.`;
  }
  if (signal.source === "google_trends") {
    return excerpt
      ? `A Google Trends search topic linked to the report “${compactSentence(excerpt, 180)}”.`
      : `${title} is a search topic currently listed by Google Trends.`;
  }
  if (signal.source === "hacker_news") {
    return excerpt
      ? `A Hacker News discussion about ${title}. The submitted context says: ${compactSentence(excerpt, 180)}`
      : `${title} is a technology topic drawing discussion on Hacker News.`;
  }
  if (signal.source === "reddit") {
    return excerpt
      ? `A Reddit discussion about ${title}. The post says: ${compactSentence(excerpt, 180)}`
      : `${title} is a topic drawing discussion on Reddit.`;
  }
  return excerpt
    ? `${compactSentence(excerpt, 220)}`
    : `${title} is a topic appearing in current ${sourceLabel(signal.source)} evidence.`;
}

function usefulnessFor(signals: EvidenceSignal[]) {
  const sources = new Set(signals.map((signal) => signal.source));
  if (sources.size > 1) {
    return "Useful for checking whether attention is crossing independent communities before committing deeper research time.";
  }
  if (sources.has("github")) {
    return "Useful for developers evaluating whether a new open-source project deserves a technical review or trial.";
  }
  if (sources.has("hacker_news") || sources.has("reddit")) {
    return "Useful for seeing the questions, objections, and use cases a technical community is discussing right now.";
  }
  if (sources.has("google_trends")) {
    return "Useful for gauging current search attention and finding the reporting attached to that query.";
  }
  return "Useful as an early research lead that can be checked against the linked report before making a decision.";
}

function nextStepFor(signals: EvidenceSignal[]) {
  const sources = new Set(signals.map((signal) => signal.source));
  if (sources.size > 1) {
    return "Compare the newest claim across the independent sources below, then follow the primary evidence they cite.";
  }
  if (sources.has("github")) {
    return "Open the repository and check its README, license, release history, and open issues before trying it.";
  }
  if (sources.has("hacker_news") || sources.has("reddit")) {
    return "Read the linked discussion and its original submission, separating author claims from community reaction.";
  }
  if (sources.has("google_trends")) {
    return "Open Google Trends and the linked reporting. Search volume shows attention, not the cause behind it.";
  }
  return "Open the source and verify its central claim before using this trend in a product or research decision.";
}

type LinkedReport = {
  title?: unknown;
  snippet?: unknown;
  url?: unknown;
  source?: unknown;
};

function linkedReports(signal: EvidenceSignal): TrendBriefEvidence[] {
  if (signal.source === "hacker_news") {
    const url = cleanSourceUrl(signal.metadata?.article_url);
    const title = sanitizeExcerpt(signal.title);
    if (!url || !title) return [];
    return [{
      reference_id: "",
      provider: "hacker_news",
      kind: "linked_report",
      label: sourceHost(url),
      source_url: url,
      source_title: title,
      published_at: signal.published_at || "",
      observed_at: signal.observed_at || signal.published_at || "",
      signal_summary: "Original submission linked from the Hacker News discussion.",
    }];
  }
  if (signal.source !== "google_trends" || !Array.isArray(signal.metadata?.news_items)) return [];
  return (signal.metadata.news_items as LinkedReport[]).flatMap((item) => {
    const url = cleanSourceUrl(item.url);
    const title = sanitizeExcerpt(item.title);
    if (!url || !title) return [];
    const label = sanitizeExcerpt(item.source) || sourceHost(url);
    const snippet = sanitizeExcerpt(item.snippet);
    return [{
      reference_id: "",
      provider: "google_trends" as const,
      kind: "linked_report" as const,
      label,
      source_url: url,
      source_title: title,
      published_at: signal.published_at || "",
      observed_at: signal.observed_at || signal.published_at || "",
      signal_summary: snippet ? compactSentence(snippet, 180) : title,
    }];
  }).slice(0, 2);
}

function evidenceReference(signal: EvidenceSignal): TrendBriefEvidence | null {
  let sourceUrl = cleanSourceUrl(signal.source_url);
  if (signal.source === "hacker_news" && /^\d+$/.test(String(signal.external_id || ""))) {
    sourceUrl = `https://news.ycombinator.com/item?id=${signal.external_id}`;
  }
  const title = sanitizeExcerpt(signal.title);
  if (!sourceUrl || !title || !signal.source || !(signal.source in sourceLabels)) return null;
  return {
    reference_id: "",
    provider: signal.source as SourceName,
    kind: "signal",
    label: sourceLabel(signal.source),
    source_url: sourceUrl,
    source_title: title,
    published_at: signal.published_at || "",
    observed_at: signal.observed_at || signal.published_at || "",
    signal_summary: sourceActivity(signal),
  };
}

function referenceIds(evidence: TrendBriefEvidence[], limit = evidence.length) {
  return evidence.slice(0, limit).map((item) => item.reference_id);
}

function articleClaim(
  text: string,
  evidenceReferenceIds: string[],
  kind: TrendArticleClaim["kind"],
): TrendArticleClaim {
  return {
    text: compactSentence(text, 520),
    evidence_reference_ids: [...new Set(evidenceReferenceIds)].filter(Boolean),
    kind,
  };
}

function articleSection(
  id: TrendArticleSection["id"],
  label: string,
  heading: string,
  claims: TrendArticleClaim[],
): TrendArticleSection {
  return { id, label, heading, claims: claims.filter((claim) => claim.text) };
}

function evidenceDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Time unavailable";
  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

function buildTrendArticle(
  trend: EvidenceTrend,
  representativeSignals: EvidenceSignal[],
  evidence: TrendBriefEvidence[],
  whatItIs: string,
  whyTrending: string,
  usefulFor: string,
  nextStep: string,
  caution: string,
  freshestObservedAt: string,
): TrendArticle {
  const independentSourceCount = new Set(evidence.map((item) => sourceHost(item.source_url))).size;
  const deep = independentSourceCount >= 2 && evidence.length >= 2;
  const broadSupport = referenceIds(evidence);
  const leadSupport = referenceIds(evidence, Math.min(2, evidence.length));
  const whatHappened = sanitizeExcerpt(trend.what_happened);
  const generatedWhyNow = sanitizeExcerpt(trend.why_now);

  if (!deep) {
    return {
      depth: "concise",
      independent_source_count: independentSourceCount,
      last_updated_at: freshestObservedAt,
      sections: [
        articleSection("background", "Background", "What the evidence shows", [
          articleClaim(whatItIs, leadSupport, "reported"),
        ]),
        articleSection("why_now", "Why now", "Why it is appearing now", [
          articleClaim(whyTrending, broadSupport, "measured"),
        ]),
        articleSection("counterpoints", "Evidence limits", "What remains unknown", [
          articleClaim(caution, broadSupport, "limitation"),
          articleClaim("This article stays concise until a second independent source can support a deeper account.", broadSupport, "limitation"),
        ]),
      ],
    };
  }

  const timelineClaims = [...evidence]
    .sort((a, b) => signalTimestamp(a) - signalTimestamp(b))
    .slice(0, 5)
    .map((item) => articleClaim(
      `${evidenceDate(item.published_at || item.observed_at)}: ${item.label} recorded “${compactSentence(item.source_title, 150)}”. ${item.signal_summary}`,
      [item.reference_id],
      item.kind === "signal" ? "measured" : "reported",
    ));

  const backgroundClaims = [articleClaim(whatItIs, leadSupport, "reported")];
  if (whatHappened && whatHappened.toLocaleLowerCase() !== whatItIs.toLocaleLowerCase()) {
    backgroundClaims.push(articleClaim(whatHappened, broadSupport, "analysis"));
  }

  const sourceNames = representativeSignals.map((signal) => sourceLabel(signal.source));
  const impactContext = sourceNames.length > 1
    ? `Attention is crossing ${sourceNames.join(" and ")}. That makes the topic more useful as a research lead than a single-platform spike, while still falling short of proof that adoption will continue.`
    : usefulFor;

  return {
    depth: "deep",
    independent_source_count: independentSourceCount,
    last_updated_at: freshestObservedAt,
    sections: [
      articleSection("background", "Background", "What is happening", backgroundClaims),
      articleSection("why_now", "Why now", "Why attention moved now", [
        articleClaim(generatedWhyNow || whyTrending, broadSupport, generatedWhyNow ? "analysis" : "measured"),
        ...(generatedWhyNow ? [articleClaim(whyTrending, broadSupport, "measured")] : []),
      ]),
      articleSection("timeline", "Timeline", "How the signal developed", timelineClaims),
      articleSection("impact", "Impact", "What this could change", [
        articleClaim(impactContext, broadSupport, "analysis"),
        articleClaim(usefulFor, leadSupport, "analysis"),
      ]),
      articleSection("practical_implications", "Practical implications", "How to investigate it", [
        articleClaim(nextStep, leadSupport, "analysis"),
        articleClaim("Treat source activity as a prompt for verification: compare the dated evidence, inspect the original material, and separate measured attention from claims made inside the linked reports.", broadSupport, "analysis"),
      ]),
      articleSection("counterpoints", "Counterpoints and unknowns", "What the evidence does not prove", [
        articleClaim(caution, broadSupport, "limitation"),
        articleClaim(`The current briefing draws on ${independentSourceCount} independently hosted sources. It can show that attention exists and when it was observed; it cannot establish future growth, causation, or the origin of the underlying idea.`, broadSupport, "limitation"),
      ]),
    ],
  };
}

export function buildTrendBrief(trend: EvidenceTrend, signals: EvidenceSignal[]): TrendBrief | null {
  const eligible = signals
    .filter(isEligibleEvidenceSignal)
    .sort((a, b) => signalTimestamp(b) - signalTimestamp(a));
  if (!eligible.length) return null;

  const strongestByProvider = new Map<string, EvidenceSignal>();
  for (const signal of eligible) {
    if (!signal.source || strongestByProvider.has(signal.source)) continue;
    strongestByProvider.set(signal.source, signal);
  }
  const representativeSignals = [...strongestByProvider.values()];
  const activity = representativeSignals.map(sourceActivity);
  const evidence = representativeSignals
    .flatMap((signal) => [evidenceReference(signal), ...linkedReports(signal)])
    .filter((item): item is TrendBriefEvidence => Boolean(item))
    .filter((item, index, items) => items.findIndex((candidate) => candidate.source_url === item.source_url) === index)
    .slice(0, 7)
    .map((item, index) => ({ ...item, reference_id: `source-${index + 1}` }));
  if (!evidence.length) return null;

  const evidenceSourceCount = representativeSignals.length;
  const multiSource = evidenceSourceCount > 1;
  const freshest = eligible[0].observed_at || eligible[0].published_at || "";
  const whyTrending = multiSource
    ? `The topic appears across ${representativeSignals.map((signal) => sourceLabel(signal.source)).join(" and ")}. ${activity.join(" ")}`
    : `The current rank is supported by one source only. ${activity[0]} Treat it as an early signal, not corroborated momentum.`;

  const whatItIs = describeTrend(trend, eligible[0]);
  const compactWhyTrending = compactSentence(whyTrending, 360);
  const usefulFor = usefulnessFor(representativeSignals);
  const nextStep = nextStepFor(representativeSignals);
  const caution = multiSource
    ? "Multiple source systems show attention, but the evidence does not prove cause or predict future growth."
    : "One source system is available, so the cause and durability of this attention remain unconfirmed.";

  return {
    what_it_is: whatItIs,
    why_trending: compactWhyTrending,
    useful_for: usefulFor,
    next_step: nextStep,
    evidence,
    freshest_observed_at: freshest,
    evidence_source_count: evidenceSourceCount,
    linked_site_count: new Set(evidence.map((item) => sourceHost(item.source_url))).size,
    corroboration: multiSource ? "multi_source" : "single_source",
    caution,
    article: buildTrendArticle(
      trend,
      representativeSignals,
      evidence,
      whatItIs,
      compactWhyTrending,
      usefulFor,
      nextStep,
      caution,
      freshest,
    ),
  };
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
  if (!newest) return { ...trend, summary: null, summary_source: null, brief: null };

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
    brief: buildTrendBrief(trend, eligibleSignals),
  };
}

export function selectAiScopedTrends<T extends EvidenceTrend & { id: string }>(trends: T[], signals: EvidenceSignal[]) {
  const signalsByTrend = new Map<string, EvidenceSignal[]>();
  for (const signal of signals.filter(isEligibleEvidenceSignal)) {
    if (!signal.trend_id) continue;
    signalsByTrend.set(signal.trend_id, [...(signalsByTrend.get(signal.trend_id) || []), signal]);
  }
  return trends
    .map((trend) => resolveTrendContent(trend, signalsByTrend.get(trend.id) || []))
    .filter((trend) => trend.summary && trend.summary_source);
}

export function isAiTrend(trend: { title?: unknown; summary?: unknown }) {
  return hasAiRelevance(trend.title, trend.summary);
}

export function sanitizeSignal<T extends { excerpt?: string | null }>(signal: T): T {
  return { ...signal, excerpt: sanitizeExcerpt(signal.excerpt) };
}

export function sanitizeTrend<T extends { summary?: string | null }>(trend: T): T {
  return { ...trend, summary: sanitizeExcerpt(trend.summary) };
}
