import type { SourceSignal } from "@/types/trends";

export interface TrendScore {
  velocity: number;
  reach: number;
  novelty: number;
  total: number;
}

const clamp = (value: number) => Math.max(0, Math.min(100, Math.round(value)));

export function scoreSignals(signals: SourceSignal[], now = Date.now()): TrendScore {
  if (!signals.length) return { velocity: 0, reach: 0, novelty: 0, total: 0 };

  const agesInHours = signals.map((signal) =>
    Math.max(0.25, (now - new Date(signal.publishedAt).getTime()) / 3_600_000),
  );
  const engagement = signals.reduce((sum, signal) => sum + Math.max(0, signal.engagementCount), 0);
  const audience = signals.reduce((sum, signal) => sum + Math.max(0, signal.audienceCount || 0), 0);
  const sourceDiversity = new Set(signals.map((signal) => signal.source)).size;
  const recentSignals = agesInHours.filter((hours) => hours <= 6).length;

  const velocity = clamp(22 * Math.log10(1 + engagement / Math.min(...agesInHours)) + recentSignals * 7);
  const reach = clamp(18 * Math.log10(1 + engagement + audience / 100) + sourceDiversity * 9);
  const titleTokens = signals.flatMap((signal) =>
    signal.title.toLowerCase().match(/[a-z0-9]{4,}/g) || [],
  );
  const uniqueRatio = new Set(titleTokens).size / Math.max(1, titleTokens.length);
  const novelty = clamp(35 + uniqueRatio * 35 + Math.min(3, sourceDiversity) * 10);
  const total = clamp(velocity * 0.45 + reach * 0.35 + novelty * 0.2);

  return { velocity, reach, novelty, total };
}

export function slugifyTitle(title: string) {
  return title
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

export function clusterSignals(signals: SourceSignal[]) {
  const clusters = new Map<string, SourceSignal[]>();
  for (const signal of signals) {
    const key = slugifyTitle(signal.title)
      .split("-")
      .filter((token) => !["with", "from", "that", "this", "new", "the"].includes(token))
      .slice(0, 5)
      .sort()
      .join("-");
    clusters.set(key, [...(clusters.get(key) || []), signal]);
  }
  return [...clusters.values()];
}

export function earliestAttributedSignal(signals: SourceSignal[]) {
  const attributed = [...signals]
    .filter((signal) => signal.countryCode && signal.countryAttribution?.country_code === signal.countryCode)
    .sort((a, b) => new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime()
      || String(a.countryCode).localeCompare(String(b.countryCode)));
  const earliest = attributed[0];
  if (!earliest) return undefined;
  const earliestTime = new Date(earliest.publishedAt).getTime();
  const tiedCountries = new Set(attributed
    .filter((signal) => new Date(signal.publishedAt).getTime() === earliestTime)
    .map((signal) => signal.countryCode));
  return tiedCountries.size === 1 ? earliest : undefined;
}
