"use client";

import Link from "next/link";
import useSWR from "swr";
import type { TrendListPayload } from "@/types/trends";

const fetcher = async (url: string) => {
  const response = await fetch(url);
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Live data failed");
  return data as TrendListPayload;
};

export function TrendCollection({ filter, value }: { filter: "country" | "category"; value: string }) {
  const { data, error, isLoading } = useSWR<TrendListPayload>(`/api/trends?${filter}=${encodeURIComponent(value)}&limit=30`, fetcher);
  if (isLoading) return <div className="mt-12 h-56 animate-pulse rounded-3xl bg-[#111114]" />;
  if (error) return <div className="mt-12 rounded-3xl border border-white/5 bg-[#111114] p-8 text-[#8B8B93]">Live trend data is not configured yet.</div>;
  return <div className="mt-12 grid gap-4">{(data?.trends || []).map((trend, index) => <Link key={trend.id} href={`/trend/${trend.slug}`} className="flex items-center justify-between rounded-2xl border border-white/5 bg-[#111114] p-6 hover:border-white/15"><div className="flex items-center gap-5"><span className="font-mono text-sm text-[#8B8B93]">{String(index + 1).padStart(2, "0")}</span><div><p className="text-lg font-bold text-white">{trend.title}</p><p className="mt-1 text-xs uppercase tracking-wider text-[#8B8B93]">{trend.category}</p></div></div><span className="font-bold text-[#06b6d4]">{trend.score}</span></Link>)}{!data?.trends.length && <p className="text-[#8B8B93]">No signals match this view.</p>}</div>;
}
