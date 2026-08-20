"use client";

import useSWR from "swr";
import type { ChatMessage, Signal, TrendDetailPayload, TrendListPayload } from "@/types/trends";

async function fetcher<T>(url: string): Promise<T> {
  const response = await fetch(url);
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.error || "Live data request failed");
  return payload as T;
}

export function useTrends(options: { globalPulse?: boolean; limit?: number } = {}) {
  const query = new URLSearchParams();
  if (options.globalPulse) query.set("globalPulse", "true");
  query.set("limit", String(options.limit || 10));
  return useSWR<TrendListPayload>(`/api/trends?${query}`, fetcher, { refreshInterval: 30_000 });
}

export function useTrend(slug: string) {
  return useSWR<TrendDetailPayload>(slug ? `/api/trends/${slug}` : null, fetcher, { refreshInterval: 30_000 });
}

export function useSignals(limit = 20) {
  return useSWR<{ signals: Signal[]; mode: "live" | "demo" }>(`/api/signals?limit=${limit}`, fetcher, {
    refreshInterval: 15_000,
  });
}

export function useMessages(slug: string) {
  return useSWR<{ messages: ChatMessage[]; mode: "live" | "demo" }>(
    slug ? `/api/trends/${slug}/messages` : null,
    fetcher,
  );
}
