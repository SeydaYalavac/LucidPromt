import { isEligibleEvidenceSignal, selectAiScopedTrends } from "./trend-content";
import { isAiSportsSignal } from "./trend-category";
import type { Signal, Trend, TrendListPayload } from "../types/trends";

export const DAILY_TREND_TARGET = 100;
export const MAX_TREND_PAGE_SIZE = 200;
export const ACTIVE_TREND_WINDOW_HOURS = 48;

export type TrendFeedOptions = {
  limit: number;
  offset: number;
  now?: Date;
  mode: "live" | "demo";
};

export function utcDayStart(now = new Date()) {
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

export function activeTrendCutoff(now = new Date()) {
  return new Date(now.getTime() - ACTIVE_TREND_WINDOW_HOURS * 60 * 60 * 1_000);
}

export function boundedInteger(value: string | null, fallback: number, maximum: number) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(maximum, Math.max(0, Math.floor(parsed)));
}

function timestamp(value: string | undefined) {
  const parsed = value ? new Date(value).getTime() : Number.NaN;
  return Number.isFinite(parsed) ? parsed : 0;
}

function isSportsCategory(category: string) {
  return category.trim().toLocaleLowerCase() === "sports";
}

function isCurrentAiSportsEvidence(signal: Signal, cutoff: number) {
  return isEligibleEvidenceSignal(signal)
    && isAiSportsSignal(signal)
    && timestamp(signal.published_at) > 0
    && timestamp(signal.observed_at || signal.published_at) >= cutoff;
}

function hasUsableTitle(trend: Pick<Trend, "title">) {
  return Boolean(trend.title?.trim());
}

export function buildTrendListPayload(
  trends: Trend[],
  signals: Signal[],
  { limit, offset, mode, now = new Date() }: TrendFeedOptions,
): TrendListPayload {
  const cutoff = activeTrendCutoff(now).getTime();
  const dayStart = utcDayStart(now);
  const deduped = new Map<string, Trend>();

  for (const trend of trends) {
    if (!hasUsableTitle(trend) || timestamp(trend.last_seen_at) < cutoff) continue;
    const key = trend.slug?.trim() || trend.id;
    if (!deduped.has(key)) deduped.set(key, trend);
  }

  const currentSportsTrendIds = new Set(
    signals.filter((signal) => isCurrentAiSportsEvidence(signal, cutoff)).map((signal) => signal.trend_id),
  );
  const qualified = selectAiScopedTrends([...deduped.values()], signals, now)
    .filter((trend) => !isSportsCategory(trend.category) || currentSportsTrendIds.has(trend.id))
    .map((trend) => ({
      ...trend,
      evidence_status: trend.brief?.corroboration || ("single_source" as const),
    }));
  const qualifiedToday = qualified.filter((trend) => timestamp(trend.last_seen_at) >= dayStart.getTime()).length;
  const page = qualified.slice(offset, offset + limit);

  return {
    trends: page,
    mode,
    coverage: {
      target: DAILY_TREND_TARGET,
      qualified_today: qualifiedToday,
      active_qualified: qualified.length,
      returned: page.length,
      status: qualifiedToday >= DAILY_TREND_TARGET ? "target_met" : "under_supply",
      utc_day: dayStart.toISOString().slice(0, 10),
      as_of: now.toISOString(),
      active_window_hours: ACTIVE_TREND_WINDOW_HOURS,
    },
    pagination: {
      limit,
      offset,
      total: qualified.length,
      has_more: offset + page.length < qualified.length,
    },
  };
}
