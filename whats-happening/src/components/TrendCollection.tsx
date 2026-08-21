"use client";

import useSWR from "swr";
import type { TrendListPayload } from "@/types/trends";
import { productDataFetcher } from "@/hooks/useTrendData";
import { NewsCard } from "./NewsCard";

export function TrendCollection({ filter, value }: { filter: "country" | "category"; value: string }) {
  const { data, error, isLoading } = useSWR<TrendListPayload>(`/api/trends?${filter}=${encodeURIComponent(value)}&limit=30`, productDataFetcher);
  if (isLoading) return <div className="mt-12 h-56 animate-pulse rounded-3xl bg-[#111114]" />;
  if (error) return <div className="mt-12 rounded-3xl border border-white/5 bg-[#111114] p-8 text-[#8B8B93]">Live trend data is not configured yet.</div>;
  return <div className="mt-12 grid gap-5 lg:grid-cols-2">{(data?.trends || []).map((trend, index) => <NewsCard key={trend.id} trend={trend} rank={index + 1} analyticsSource={filter} />)}{!data?.trends.length && <p className="text-[#8B8B93]">No signals match this view.</p>}</div>;
}
