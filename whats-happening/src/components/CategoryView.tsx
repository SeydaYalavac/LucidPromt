"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { productDataFetcher } from "@/hooks/useTrendData";
import type { TrendListPayload } from "@/types/trends";
import { useLocale } from "@/i18n/locale";
import { CollectionHeader } from "./CollectionHeader";
import { NewsCard } from "./NewsCard";
import { evergreenGuidePath, evergreenGuidesForCategory } from "@/content/evergreen-guides";
import Link from "next/link";

export function CategoryView({ slug, initialData }: { slug: string; initialData?: TrendListPayload }) {
  const router = useRouter();
  const { locale } = useLocale();
  const { data, error, isLoading } = useSWR<TrendListPayload>(
    `/api/trends?category=${encodeURIComponent(slug)}&limit=200`,
    productDataFetcher,
    { fallbackData: initialData },
  );
  const trends = data?.trends || [];
  const guides = evergreenGuidesForCategory(trends[0]?.category || slug);

  useEffect(() => {
    if (!isLoading && !error && !trends.length) router.replace("/explore");
  }, [error, isLoading, router, trends.length]);

  if (!isLoading && !error && !trends.length) {
    return <div className="h-56 animate-pulse rounded-2xl bg-[#111114]" aria-hidden="true" />;
  }

  return <>
    <CollectionHeader kind="category" value={slug} />
    {guides.length > 0 && <section className="mt-10 border-y border-white/[0.1] py-6" aria-labelledby="category-evidence-guides">
      <div className="grid gap-4 sm:grid-cols-[11rem_1fr]">
        <p id="category-evidence-guides" className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/40">{locale === "tr" ? "Kanıt rehberleri" : "Evidence guides"}</p>
        <div className="space-y-3">{guides.map((guide) => <Link key={guide.slug} href={evergreenGuidePath(guide.slug)} className="group flex items-start justify-between gap-4 text-sm font-medium leading-6 text-white hover:text-[#D4D4D7]"><span>{guide.title[locale]}</span><span aria-hidden="true" className="text-white/30 group-hover:text-white">↗</span></Link>)}</div>
      </div>
    </section>}
    {isLoading && <div className="mt-12 h-56 animate-pulse rounded-2xl bg-[#111114]" />}
    {error && <div className="mt-12 rounded-2xl border border-white/5 bg-[#111114] p-8 text-[#8B8B93]">{locale === "tr" ? "Canlı trend verisi henüz yapılandırılmadı." : "Live trend data is not configured yet."}</div>}
    {!isLoading && !error && <div className="mt-12 grid gap-5 lg:grid-cols-2">{trends.map((trend, index) => <NewsCard key={trend.id} trend={trend} rank={index + 1} analyticsSource="category" />)}{!trends.length && <p className="text-[#8B8B93]">{locale === "tr" ? "Bu görünümle eşleşen sinyal yok." : "No signals match this view."}</p>}</div>}
  </>;
}
