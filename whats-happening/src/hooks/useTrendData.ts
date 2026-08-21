"use client";

import useSWR from "swr";
import type { ChatMessage, Signal, TrendDetailPayload, TrendListPayload } from "@/types/trends";
import {
  captureProductEventOnce,
  stableRouteName,
} from "@/lib/analytics";

function stableApiEndpoint(url: string) {
  const pathname = url.split(/[?#]/, 1)[0];
  if (/^\/api\/trends\/[^/]+\/messages$/.test(pathname)) return "/api/trends/[slug]/messages";
  if (/^\/api\/trends\/[^/]+$/.test(pathname)) return "/api/trends/[slug]";
  return pathname;
}

async function fetcher<T>(url: string): Promise<T> {
  const endpoint = stableApiEndpoint(url);
  let response: Response;
  try {
    response = await fetch(url);
  } catch {
    captureProductEventOnce(`api_error:network:${endpoint}`, "api_error", {
      endpoint,
      failure_type: "network",
      status_code: 0,
    });
    throw new Error("Live data request failed");
  }

  let payload: { error?: string; code?: string };
  try {
    payload = await response.json();
  } catch {
    captureProductEventOnce(`api_error:invalid:${endpoint}`, "api_error", {
      endpoint,
      failure_type: "invalid_response",
      status_code: response.status,
    });
    throw new Error("Live data returned an invalid response");
  }

  if (!response.ok) {
    if (payload.code === "LIVE_DATA_UNAVAILABLE") {
      captureProductEventOnce(`live_data_unavailable:${endpoint}`, "live_data_unavailable", {
        endpoint,
        route: stableRouteName(window.location.pathname),
        status_code: response.status,
      });
    } else {
      captureProductEventOnce(`api_error:http:${endpoint}:${response.status}`, "api_error", {
        endpoint,
        failure_type: "http",
        status_code: response.status,
      });
    }
    throw new Error(payload.error || "Live data request failed");
  }
  return payload as T;
}

export { fetcher as productDataFetcher };

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
