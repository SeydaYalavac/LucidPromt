"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import { getNextVisibleCount, matchesTrend, visibleDiscoveryCategories } from "@/lib/discovery";
import { useTrends } from "@/hooks/useTrendData";
import { useSavedTrends } from "@/hooks/useSavedTrends";
import { TrendEmpty, TrendLoading, TrendUnavailable } from "./TrendStates";
import { NewsCard } from "./NewsCard";
import { localeCategoryLabel, useLocale } from "@/i18n/locale";

type SortMode = "score" | "newest" | "velocity";

export function TrendingView({ initialQuery = "" }: { initialQuery?: string }) {
  const { data, error, isLoading } = useTrends({ limit: 200 });
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState<SortMode>("score");
  const [savedOnly, setSavedOnly] = useState(false);
  const [visibleCount, setVisibleCount] = useState(8);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const { saved } = useSavedTrends();
  const { locale, t } = useLocale();
  const categories = useMemo(() => visibleDiscoveryCategories(data?.trends || []), [data?.trends]);
  const activeCategory = categories.includes(category as (typeof categories)[number]) ? category : "All";

  const filtered = useMemo(() => {
    const result = (data?.trends || []).filter((trend) => matchesTrend(trend, query, activeCategory)).filter((trend) => !savedOnly || saved.includes(trend.slug));
    return [...result].sort((a, b) => sort === "newest" ? new Date(b.last_seen_at).getTime() - new Date(a.last_seen_at).getTime() : sort === "velocity" ? b.velocity_score - a.velocity_score : b.score - a.score);
  }, [activeCategory, data?.trends, query, saved, savedOnly, sort]);

  useEffect(() => {
    const target = loadMoreRef.current;
    if (!target) return;
    const observer = new IntersectionObserver((entries) => { if (entries[0]?.isIntersecting) setVisibleCount((count) => getNextVisibleCount(count, filtered.length)); }, { rootMargin: "240px" });
    observer.observe(target);
    return () => observer.disconnect();
  }, [filtered.length]);

  return <div className="mx-auto min-h-screen max-w-[1440px] px-5 pb-28 pt-32 sm:px-8 sm:pt-40">
    <header className="grid gap-6 border-b border-white/[0.1] pb-10 lg:grid-cols-[1fr_30rem] lg:items-end"><div><p className="font-mono text-xs uppercase tracking-[0.18em] text-white/45">{t("trending.kicker")}</p><h1 className="mt-4 text-[clamp(3rem,7vw,6.5rem)] font-medium leading-[0.9] tracking-[-0.065em] text-white">{t("trending.title")}</h1></div><div className="max-w-[55ch]"><p className="text-base leading-7 text-[#A8A8AF]">{t("trending.description")}</p>{data?.coverage && <p className="mt-3 font-mono text-xs uppercase tracking-[0.14em] text-white/45"><span className="tabular-nums text-white/70">{data.coverage.qualified_today}</span> {t("trending.today")} · {data.coverage.status === "target_met" ? t("trending.targetMet") : t("trending.belowTarget", { target: data.coverage.target })}</p>}</div></header>
    <div className="mt-10 grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_300px]">
        <section aria-label={t("trending.aria")}>
        {isLoading && <div className="grid gap-4"><TrendLoading compact /><TrendLoading compact /><TrendLoading compact /></div>}
        {error && <TrendUnavailable showDemandSurvey />}
        {!error && !isLoading && !filtered.length && <TrendEmpty />}
        <div className="grid gap-5">
          {filtered.slice(0, visibleCount).map((trend, index) => <NewsCard key={trend.id} trend={trend} rank={index + 1} analyticsSource="trending" />)}
        </div>
        <div ref={loadMoreRef} className="flex min-h-24 items-center justify-center font-mono text-xs uppercase tracking-widest text-white/35" aria-live="polite">{visibleCount < filtered.length ? t("trending.loadingMore") : filtered.length ? t("trending.shown", { count: filtered.length }) : ""}</div>
      </section>
      <aside className="order-first rounded-2xl border border-white/[0.1] bg-[#0B0B0D] p-6 lg:sticky lg:top-28 lg:order-last" aria-label={t("filters.aria")}><div className="flex items-center gap-2"><SlidersHorizontal size={17} className="text-white/55" /><h2 className="text-sm font-medium text-white">{t("filters.title")}</h2></div><label className="mt-6 block text-xs uppercase tracking-widest text-[#8B8B93]">{t("filters.search")}<input value={query} onChange={(event) => { setQuery(event.target.value); setVisibleCount(8); }} className="mt-2 h-12 w-full rounded-xl border border-white/10 bg-white/[0.035] px-4 text-sm text-white outline-none focus:border-white/50" placeholder={t("filters.placeholder")} /></label><label className="mt-5 block text-xs uppercase tracking-widest text-[#8B8B93]">{t("filters.category")}<select value={activeCategory} onChange={(event) => { setCategory(event.target.value); setVisibleCount(8); }} className="mt-2 h-12 w-full rounded-xl border border-white/10 bg-[#111114] px-4 text-sm text-white outline-none focus:border-white/50">{categories.map((item) => <option key={item} value={item}>{localeCategoryLabel(item, locale)}</option>)}</select></label><label className="mt-5 block text-xs uppercase tracking-widest text-[#8B8B93]">{t("filters.order")}<select value={sort} onChange={(event) => { setSort(event.target.value as SortMode); setVisibleCount(8); }} className="mt-2 h-12 w-full rounded-xl border border-white/10 bg-[#111114] px-4 text-sm text-white outline-none focus:border-white/50"><option value="score">{t("filters.highest")}</option><option value="velocity">{t("filters.fastest")}</option><option value="newest">{t("filters.newest")}</option></select></label><label className="mt-6 flex min-h-11 cursor-pointer items-center justify-between gap-3 rounded-xl border border-white/[0.08] px-4 text-sm text-[#C4C4CA]"><span>{t("filters.saved")}</span><input type="checkbox" checked={savedOnly} onChange={(event) => { setSavedOnly(event.target.checked); setVisibleCount(8); }} className="h-4 w-4 accent-white" /></label><button type="button" onClick={() => { setQuery(""); setCategory("All"); setSort("score"); setSavedOnly(false); setVisibleCount(8); }} className="mt-4 min-h-11 w-full text-xs uppercase tracking-widest text-white/45 hover:text-white">{t("filters.reset")}</button></aside>
    </div>
  </div>;
}
