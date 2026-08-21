"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { productDataFetcher } from "@/hooks/useTrendData";
import type { TrendListPayload } from "@/types/trends";
import { useLocale } from "@/i18n/locale";
import { CollectionHeader } from "./CollectionHeader";
import { NewsCard } from "./NewsCard";

export function CategoryView({ slug }: { slug: string }) {
  const router = useRouter();
  const { locale } = useLocale();
  const isSports = slug.trim().toLocaleLowerCase() === "sports";
  const { data, error, isLoading } = useSWR<TrendListPayload>(
    `/api/trends?category=${encodeURIComponent(slug)}&limit=200`,
    productDataFetcher,
  );
  const trends = data?.trends || [];

  useEffect(() => {
    if (isSports && !isLoading && (error || !trends.length)) router.replace("/explore");
  }, [error, isLoading, isSports, router, trends.length]);

  if (isSports && (isLoading || error || !trends.length)) {
    return <div className="h-56 animate-pulse rounded-3xl bg-[#111114]" aria-hidden="true" />;
  }

  return <>
    <CollectionHeader kind="category" value={slug} />
    {isLoading && <div className="mt-12 h-56 animate-pulse rounded-3xl bg-[#111114]" />}
    {error && <div className="mt-12 rounded-3xl border border-white/5 bg-[#111114] p-8 text-[#8B8B93]">{locale === "tr" ? "Canlı trend verisi henüz yapılandırılmadı." : "Live trend data is not configured yet."}</div>}
    {!isLoading && !error && <div className="mt-12 grid gap-5 lg:grid-cols-2">{trends.map((trend, index) => <NewsCard key={trend.id} trend={trend} rank={index + 1} analyticsSource="category" />)}{!trends.length && <p className="text-[#8B8B93]">{locale === "tr" ? "Bu görünümle eşleşen sinyal yok." : "No signals match this view."}</p>}</div>}
  </>;
}
