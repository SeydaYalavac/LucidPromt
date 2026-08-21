import { isAiSignal, sanitizeExcerpt } from "../src/lib/trend-content";
import { sanitizeNewsVisual } from "../src/lib/news-visual";
import type { SourceSignal } from "../src/types/trends";

function cleanText(value: string, maximum: number) {
  return value.replace(/\s+/g, " ").trim().slice(0, maximum);
}

function cleanUrl(value: string) {
  try {
    const url = new URL(value);
    if (!/^https?:$/.test(url.protocol) || url.username || url.password) return null;
    return url.toString();
  } catch {
    return null;
  }
}

export function prepareSourceSignals(signals: SourceSignal[]) {
  const prepared = new Map<string, SourceSignal>();

  for (const signal of signals) {
    const title = cleanText(signal.title || "", 220);
    const externalId = cleanText(signal.externalId || "", 500);
    const sourceUrl = cleanUrl(signal.sourceUrl || "");
    const publishedAt = new Date(signal.publishedAt);
    if (!title || !externalId || !sourceUrl || Number.isNaN(publishedAt.getTime())) continue;

    const normalized: SourceSignal = {
      ...signal,
      externalId,
      title,
      excerpt: sanitizeExcerpt(signal.excerpt) || undefined,
      sourceUrl,
      engagementCount: Math.max(0, Math.round(Number(signal.engagementCount) || 0)),
      audienceCount: signal.audienceCount == null ? undefined : Math.max(0, Math.round(Number(signal.audienceCount) || 0)),
      publishedAt: publishedAt.toISOString(),
      metadata: signal.metadata ? { ...signal.metadata } : undefined,
    };
    const newsVisual = sanitizeNewsVisual(signal.metadata?.news_visual);
    if (normalized.metadata) {
      if (newsVisual) normalized.metadata.news_visual = newsVisual;
      else delete normalized.metadata.news_visual;
    }
    if (!isAiSignal(normalized)) continue;

    const key = `${normalized.source}:${normalized.externalId}`;
    const existing = prepared.get(key);
    if (!existing || normalized.engagementCount > existing.engagementCount) prepared.set(key, normalized);
  }

  return [...prepared.values()];
}
