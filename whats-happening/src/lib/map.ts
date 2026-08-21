import {
  isEligibleEvidenceSignal,
  selectAiScopedTrends,
  sourceLabel,
  summarizeEvidenceSignal,
} from "./trend-content";
import { ACTIVE_TREND_WINDOW_HOURS, activeTrendCutoff } from "./trend-feed";
import type {
  Country,
  CountryActivity,
  MapDevelopmentPoint,
  MapActivityPayload,
  MapEvidenceLink,
  MapTrendActivity,
  Signal,
  Trend,
} from "../types/trends";

export function clampMapScale(scale: number) {
  return Math.min(4, Math.max(1, scale));
}

export function mapMarkerRadius(evidenceCount: number, maximumEvidenceCount: number) {
  if (evidenceCount <= 0 || maximumEvidenceCount <= 0) return 0;
  const share = Math.sqrt(evidenceCount / maximumEvidenceCount);
  return Math.round((7 + share * 15) * 10) / 10;
}

function timestamp(value: string | undefined | null) {
  const parsed = value ? new Date(value).getTime() : Number.NaN;
  return Number.isFinite(parsed) ? parsed : 0;
}

function evidenceTimestamp(signal: Signal) {
  return Math.max(timestamp(signal.observed_at), timestamp(signal.published_at));
}

function evidenceLink(signal: Signal): MapEvidenceLink {
  return {
    id: signal.id,
    provider: signal.source,
    provider_label: sourceLabel(signal.source),
    source_url: signal.source_url,
    source_title: signal.title,
    published_at: signal.published_at,
    observed_at: signal.observed_at,
    signal_summary: summarizeEvidenceSignal(signal) || `${sourceLabel(signal.source)} recorded this topic.`,
  };
}

function developmentPoint(country: Country, trend: Trend, signal: Signal): MapDevelopmentPoint {
  return {
    ...evidenceLink(signal),
    trend_id: trend.id,
    trend_slug: trend.slug,
    trend_title: trend.title,
    trend_summary: trend.summary,
    category: trend.category,
    country,
    geographic_precision: "country",
    geographic_evidence: `${country.name} market evidence from ${sourceLabel(signal.source)}. The source provides country-level context, not an exact event location.`,
  };
}

export function buildMapActivityPayload(
  countries: Country[],
  trends: Trend[],
  signals: Signal[],
  options: { mode: "live" | "demo"; now?: Date },
): MapActivityPayload {
  const now = options.now || new Date();
  const cutoff = activeTrendCutoff(now).getTime();
  const activeTrends = trends.filter((trend) => timestamp(trend.last_seen_at) >= cutoff);
  const scopedTrends = selectAiScopedTrends(activeTrends, signals);
  const trendsById = new Map(scopedTrends.map((trend) => [trend.id, trend]));
  const countryById = new Map(countries.map((country) => [country.id, country]));
  const signalsByCountryAndTrend = new Map<string, Signal[]>();
  const distinctEvidence = new Map<string, Signal>();

  for (const signal of signals) {
    if (!signal.country_id || !countryById.has(signal.country_id)) continue;
    if (!trendsById.has(signal.trend_id) || !isEligibleEvidenceSignal(signal)) continue;
    if (evidenceTimestamp(signal) < cutoff) continue;
    const evidenceKey = [
      signal.country_id,
      signal.trend_id,
      signal.source,
      signal.title.trim().toLocaleLowerCase(),
    ].join(":");
    const current = distinctEvidence.get(evidenceKey);
    if (!current || evidenceTimestamp(signal) > evidenceTimestamp(current)) {
      distinctEvidence.set(evidenceKey, signal);
    }
  }

  for (const signal of distinctEvidence.values()) {
    const groupKey = `${signal.country_id}:${signal.trend_id}`;
    signalsByCountryAndTrend.set(groupKey, [...(signalsByCountryAndTrend.get(groupKey) || []), signal]);
  }

  const activities = countries.flatMap<CountryActivity>((country) => {
    const trendActivities = scopedTrends.flatMap<MapTrendActivity>((trend) => {
      const matches = (signalsByCountryAndTrend.get(`${country.id}:${trend.id}`) || [])
        .sort((a, b) => evidenceTimestamp(b) - evidenceTimestamp(a));
      if (!matches.length) return [];
      const evidence = matches
        .filter((signal, index, items) => items.findIndex((item) => item.source_url === signal.source_url) === index)
        .map(evidenceLink);
      return [{
        id: trend.id,
        slug: trend.slug,
        title: trend.title,
        category: trend.category,
        summary: trend.summary,
        score: trend.score,
        velocity_score: trend.velocity_score,
        last_seen_at: trend.last_seen_at,
        evidence_count: matches.length,
        source_count: new Set(matches.map((signal) => signal.source)).size,
        latest_observed_at: new Date(Math.max(...matches.map(evidenceTimestamp))).toISOString(),
        evidence,
      }];
    }).sort((a, b) => b.velocity_score - a.velocity_score || b.score - a.score || timestamp(b.last_seen_at) - timestamp(a.last_seen_at));

    if (!trendActivities.length) return [];
    const countrySignals = [...signalsByCountryAndTrend.entries()]
      .filter(([key]) => key.startsWith(`${country.id}:`))
      .flatMap(([, items]) => items);
    const developments = trendActivities
      .flatMap((topic) => {
        const trend = trendsById.get(topic.id);
        if (!trend) return [];
        return (signalsByCountryAndTrend.get(`${country.id}:${topic.id}`) || [])
          .filter((signal, index, items) => items.findIndex((item) => item.source_url === signal.source_url) === index)
          .map((signal) => developmentPoint(country, trend, signal));
      })
      .sort((a, b) => Math.max(timestamp(b.observed_at), timestamp(b.published_at)) - Math.max(timestamp(a.observed_at), timestamp(a.published_at)));
    return [{
      country,
      trend_count: trendActivities.length,
      evidence_count: countrySignals.length,
      source_count: new Set(countrySignals.map((signal) => signal.source)).size,
      latest_observed_at: new Date(Math.max(...countrySignals.map(evidenceTimestamp))).toISOString(),
      rising_topics: trendActivities,
      developments,
    }];
  }).sort((a, b) => b.evidence_count - a.evidence_count || b.trend_count - a.trend_count || a.country.name.localeCompare(b.country.name));

  return {
    countries: [...countries].sort((a, b) => a.name.localeCompare(b.name)),
    activities,
    mode: options.mode,
    coverage: {
      countries_with_evidence: activities.length,
      countries_available: countries.length,
      attributed_evidence_count: activities.reduce((sum, activity) => sum + activity.evidence_count, 0),
      active_window_hours: ACTIVE_TREND_WINDOW_HOURS,
      as_of: now.toISOString(),
    },
  };
}
