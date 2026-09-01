import { getSupabaseAdmin } from "../src/lib/supabase/admin";
import { isArchiveEligibleTrend, sanitizeSignal, sanitizeTrend } from "../src/lib/trend-content";
import type { Signal, Trend } from "../src/types/trends";

const PAGE_SIZE = 1_000;

type BackfillTrend = Pick<Trend, "id" | "slug" | "title" | "summary" | "last_seen_at" | "updated_at" | "archive_eligible">;

function argument(name: string) {
  const prefix = `--${name}=`;
  return process.argv.find((value) => value.startsWith(prefix))?.slice(prefix.length);
}

async function readAllRows<T>(
  readPage: (from: number, to: number) => Promise<{ data: T[] | null; error: { message: string } | null }>,
) {
  const rows: T[] = [];
  for (let offset = 0; ; offset += PAGE_SIZE) {
    const { data, error } = await readPage(offset, offset + PAGE_SIZE - 1);
    if (error) throw new Error(error.message);
    rows.push(...(data || []));
    if (!data || data.length < PAGE_SIZE) return rows;
  }
}

async function run() {
  const apply = process.argv.includes("--apply");
  const expected = Number(argument("expected"));
  const supabase = getSupabaseAdmin();
  const trends = await readAllRows<BackfillTrend>(async (from, to) => supabase
    .from("trends")
    .select("id,slug,title,summary,last_seen_at,updated_at,archive_eligible")
    .order("id")
    .range(from, to));
  const signals = await readAllRows<Signal>(async (from, to) => supabase
    .from("signals")
    .select("*")
    .order("id")
    .range(from, to));
  const safeSignals = signals.map(sanitizeSignal);
  const signalsByTrend = new Map<string, Signal[]>();
  for (const signal of safeSignals) {
    signalsByTrend.set(signal.trend_id, [...(signalsByTrend.get(signal.trend_id) || []), signal]);
  }
  const eligibleIds = new Set(
    trends
      .map(sanitizeTrend)
      .filter((trend) => isArchiveEligibleTrend(trend, signalsByTrend.get(trend.id) || []))
      .map((trend) => trend.id),
  );

  if (Number.isFinite(expected) && expected >= 0 && eligibleIds.size !== expected) {
    throw new Error(`Expected ${expected} eligible trends, calculated ${eligibleIds.size}; no rows were changed.`);
  }

  const changed = trends.filter((trend) => Boolean(trend.archive_eligible) !== eligibleIds.has(trend.id));
  if (apply) {
    for (let index = 0; index < changed.length; index += 100) {
      const group = changed.slice(index, index + 100);
      const results = await Promise.all(group.map((trend) => supabase
        .from("trends")
        .update({ archive_eligible: eligibleIds.has(trend.id) })
        .eq("id", trend.id)));
      const error = results.find((result) => result.error)?.error;
      if (error) throw error;
    }
  }

  console.log(JSON.stringify({
    mode: apply ? "apply" : "dry_run",
    trends: trends.length,
    signals: signals.length,
    eligible: eligibleIds.size,
    changed: changed.length,
  }));
}

run().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
