"use client";

import { useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { discoveryCategories, matchesTrend } from "@/lib/discovery";
import { useTrends } from "@/hooks/useTrendData";
import { NewsCard } from "./NewsCard";
import { TrendEmpty, TrendLoading, TrendUnavailable } from "./TrendStates";
import { localeCategoryLabel, useLocale } from "@/i18n/locale";

export function ExploreView() {
  const { data, error, isLoading } = useTrends({ limit: 50 });
  const [category, setCategory] = useState("All");
  const stripRef = useRef<HTMLDivElement>(null);
  const trends = useMemo(() => (data?.trends || []).filter((trend) => matchesTrend(trend, "", category)), [category, data?.trends]);
  const { locale, t } = useLocale();
  const scroll = (direction: number) => stripRef.current?.scrollBy({ left: direction * 300, behavior: "smooth" });

  return <div className="mx-auto min-h-screen max-w-[1440px] px-5 pb-28 pt-32 sm:px-8 sm:pt-40">
    <header className="grid gap-8 border-b border-white/[0.1] pb-10 lg:grid-cols-[1fr_auto] lg:items-end"><div><p className="font-mono text-xs uppercase tracking-[0.18em] text-white/45">{t("explore.kicker")}</p><h1 className="mt-4 text-[clamp(3rem,7vw,6.5rem)] font-medium leading-[0.9] tracking-[-0.065em] text-white">{t("explore.title")}</h1></div><p className="max-w-md text-pretty text-base leading-7 text-[#A8A8AF] lg:pb-2">{t("explore.description")}</p></header>
    <section className="py-8" aria-label={t("explore.categories")}><div className="flex items-center gap-3"><button type="button" onClick={() => scroll(-1)} className="hidden min-h-11 min-w-11 items-center justify-center rounded-full border border-white/10 text-white hover:bg-white/[0.06] sm:flex" aria-label={t("explore.left")}><ChevronLeft size={18} /></button><div ref={stripRef} className="flex flex-1 snap-x gap-2 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">{discoveryCategories.map((item) => <button key={item} type="button" onClick={() => setCategory(item)} aria-pressed={category === item} className={`min-h-11 shrink-0 snap-start rounded-full border px-5 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${category === item ? "border-white bg-white text-black" : "border-white/10 bg-white/[0.025] text-[#A1A1AA] hover:border-white/20 hover:text-white"}`}>{localeCategoryLabel(item, locale)}</button>)}</div><button type="button" onClick={() => scroll(1)} className="hidden min-h-11 min-w-11 items-center justify-center rounded-full border border-white/10 text-white hover:bg-white/[0.06] sm:flex" aria-label={t("explore.right")}><ChevronRight size={18} /></button></div></section>
    <section aria-live="polite" aria-label={`${category} trends`}>
      {isLoading && <div className="grid gap-5 md:grid-cols-2"><TrendLoading /><TrendLoading /></div>}
      {error && <TrendUnavailable />}
      {!error && !isLoading && !trends.length && <TrendEmpty message={t("explore.empty", { category: category === "All" ? "" : localeCategoryLabel(category, locale) })} />}
      {!!trends.length && <div className="grid gap-5 lg:grid-cols-2">{trends.map((trend, index) => <NewsCard key={trend.id} trend={trend} featured={index === 0 && category === "All"} rank={index + 1} analyticsSource="explore" />)}</div>}
    </section>
  </div>;
}
