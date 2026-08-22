import { resolveTrendContent, sanitizeExcerpt } from "../src/lib/trend-content";
import type { Signal, Trend } from "../src/types/trends";

export type BriefingBackfillTrend = Pick<
  Trend,
  "id" | "title" | "summary" | "what_happened" | "why_now" | "last_seen_at"
> & { updated_at?: string };

export type TrendBriefingPatch = Partial<Pick<Trend, "summary" | "what_happened" | "why_now">>;

const metadataLeakPattern = /ht:news_item_|\[object Object\]|"(?:ht:)?news_item_/i;

export function inspectTrendBriefingCoverage(trend: BriefingBackfillTrend, signals: Signal[]) {
  const resolved = resolveTrendContent(trend, signals);
  const brief = resolved.brief;
  const hasAttributedSource = Boolean(resolved.summary_source && brief?.evidence.length);
  const eligible = Boolean(resolved.summary && hasAttributedSource && brief);
  const patch: TrendBriefingPatch = {};

  if (eligible && !sanitizeExcerpt(trend.summary)) patch.summary = resolved.summary || undefined;
  if (eligible && !sanitizeExcerpt(trend.what_happened)) patch.what_happened = brief?.what_it_is;
  if (eligible && !sanitizeExcerpt(trend.why_now)) patch.why_now = brief?.why_trending;

  const hasTopicExplanation = Boolean(sanitizeExcerpt(trend.what_happened) || patch.what_happened);
  const hasWhyNow = Boolean(sanitizeExcerpt(trend.why_now) || patch.why_now);
  const hasNextCheck = Boolean(brief?.next_step?.trim());
  const generatedCopy = JSON.stringify({
    summary: resolved.summary,
    topic: sanitizeExcerpt(trend.what_happened) || patch.what_happened,
    why: sanitizeExcerpt(trend.why_now) || patch.why_now,
    next: brief?.next_step,
  });
  const metadataLeak = metadataLeakPattern.test(generatedCopy);
  const completeAfter = eligible
    && hasTopicExplanation
    && hasWhyNow
    && hasNextCheck
    && hasAttributedSource
    && !metadataLeak;

  return {
    eligible,
    hasAttributedSource,
    hasTopicExplanation,
    hasWhyNow,
    hasNextCheck,
    completeBefore: completeAfter && Object.keys(patch).length === 0,
    completeAfter,
    metadataLeak,
    failOpen: !eligible && Boolean(resolved.summary || resolved.brief || resolved.summary_source),
    depth: brief?.article.depth || null,
    independentSourceCount: brief?.article.independent_source_count || 0,
    patch,
  };
}
