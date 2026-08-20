"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Bookmark, Check, SlidersHorizontal } from "lucide-react";
import { discoveryCategories, getNextVisibleCount, matchesTrend } from "@/lib/discovery";
import { useTrends } from "@/hooks/useTrendData";
import { useSavedTrends } from "@/hooks/useSavedTrends";
import { TrendEmpty, TrendLoading, TrendUnavailable } from "./TrendStates";

type SortMode = "score" | "newest" | "velocity";

export function TrendingView({ initialQuery = "" }: { initialQuery?: string }) {
  const { data, error, isLoading } = useTrends({ limit: 50 });
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState<SortMode>("score");
  const [savedOnly, setSavedOnly] = useState(false);
  const [visibleCount, setVisibleCount] = useState(8);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const { saved, toggleSaved } = useSavedTrends();

  const filtered = useMemo(() => {
    const result = (data?.trends || []).filter((trend) => matchesTrend(trend, query, category)).filter((trend) => !savedOnly || saved.includes(trend.slug));
    return [...result].sort((a, b) => sort === "newest" ? new Date(b.last_seen_at).getTime() - new Date(a.last_seen_at).getTime() : sort === "velocity" ? b.velocity_score - a.velocity_score : b.score - a.score);
  }, [category, data?.trends, query, saved, savedOnly, sort]);

  useEffect(() => {
    const target = loadMoreRef.current;
    if (!target) return;
    const observer = new IntersectionObserver((entries) => { if (entries[0]?.isIntersecting) setVisibleCount((count) => getNextVisibleCount(count, filtered.length)); }, { rootMargin: "240px" });
    observer.observe(target);
    return () => observer.disconnect();
  }, [filtered.length]);

  return <div className="mx-auto min-h-screen max-w-[1440px] px-5 pb-28 pt-32 sm:px-8 sm:pt-40">
    <header className="border-b border-white/[0.08] pb-10"><p className="font-mono text-xs uppercase tracking-[0.22em] text-[#67E8F9]">Signal queue</p><h1 className="mt-5 text-[clamp(3.5rem,9vw,8rem)] font-medium leading-[0.86] tracking-[-0.075em] text-white">Trending now.</h1></header>
    <div className="mt-10 grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_300px]">
        <section aria-label="Trending signals">
        {isLoading && <div className="grid gap-4"><TrendLoading compact /><TrendLoading compact /><TrendLoading compact /></div>}
        {error && <TrendUnavailable />}
        {!error && !isLoading && !filtered.length && <TrendEmpty />}
        <div className="divide-y divide-white/[0.08] border-y border-white/[0.08]">
          {filtered.slice(0, visibleCount).map((trend, index) => { const isSaved = saved.includes(trend.slug); return <article key={trend.id} className="group grid grid-cols-[2.5rem_1fr_auto] gap-3 py-7 sm:grid-cols-[3rem_minmax(0,1fr)_auto] sm:gap-5 sm:py-9"><span className="pt-1 font-mono text-xs tabular-nums text-white/25">{String(index + 1).padStart(2, "0")}</span><Link href={`/trend/${trend.slug}`} className="min-w-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"><div className="flex flex-wrap items-center gap-2 font-mono text-[10px] uppercase tracking-[0.15em] text-[#8B8B93]"><span className="text-[#67E8F9]">{trend.category}</span><span>·</span><span>{trend.country?.name || "Worldwide"}</span><span>·</span><span>score {trend.score}</span></div><h2 className="mt-3 text-balance text-2xl font-medium leading-tight tracking-[-0.03em] text-white sm:text-3xl">{trend.title}</h2><p className="mt-3 max-w-[62ch] text-sm leading-6 text-[#8F8F98]">{trend.summary || `${trend.source_count} sources and ${trend.signal_count} signals are attached to this trend.`}</p></Link><div className="flex items-start gap-1"><button type="button" onClick={() => toggleSaved(trend.slug)} aria-label={isSaved ? `Remove ${trend.title} from saved trends` : `Save ${trend.title}`} aria-pressed={isSaved} className="flex min-h-11 min-w-11 items-center justify-center rounded-full text-white/40 hover:bg-white/[0.06] hover:text-white">{isSaved ? <Check size={17} className="text-[#67E8F9]" /> : <Bookmark size={17} />}</button><Link href={`/trend/${trend.slug}`} className="hidden min-h-11 min-w-11 items-center justify-center rounded-full text-white/40 hover:bg-white/[0.06] hover:text-white sm:flex" aria-label={`Open ${trend.title}`}><ArrowUpRight size={17} /></Link></div></article>; })}
        </div>
        <div ref={loadMoreRef} className="flex min-h-24 items-center justify-center font-mono text-xs uppercase tracking-widest text-white/35" aria-live="polite">{visibleCount < filtered.length ? "Loading more signals…" : filtered.length ? `${filtered.length} trends shown` : ""}</div>
      </section>
      <aside className="order-first rounded-[1.75rem] border border-white/[0.08] bg-[#0B0B0D] p-6 lg:sticky lg:top-28 lg:order-last" aria-label="Trend filters"><div className="flex items-center gap-2"><SlidersHorizontal size={17} className="text-[#67E8F9]" /><h2 className="text-sm font-medium text-white">Filter the queue</h2></div><label className="mt-6 block text-xs uppercase tracking-widest text-[#8B8B93]">Search<input value={query} onChange={(event) => { setQuery(event.target.value); setVisibleCount(8); }} className="mt-2 h-12 w-full rounded-xl border border-white/10 bg-white/[0.035] px-4 text-sm text-white outline-none focus:border-[#67E8F9]/70" placeholder="Topic or country" /></label><label className="mt-5 block text-xs uppercase tracking-widest text-[#8B8B93]">Category<select value={category} onChange={(event) => { setCategory(event.target.value); setVisibleCount(8); }} className="mt-2 h-12 w-full rounded-xl border border-white/10 bg-[#111114] px-4 text-sm text-white outline-none focus:border-[#67E8F9]/70">{discoveryCategories.map((item) => <option key={item}>{item}</option>)}</select></label><label className="mt-5 block text-xs uppercase tracking-widest text-[#8B8B93]">Order<select value={sort} onChange={(event) => { setSort(event.target.value as SortMode); setVisibleCount(8); }} className="mt-2 h-12 w-full rounded-xl border border-white/10 bg-[#111114] px-4 text-sm text-white outline-none focus:border-[#67E8F9]/70"><option value="score">Highest score</option><option value="velocity">Fastest velocity</option><option value="newest">Most recently seen</option></select></label><label className="mt-6 flex min-h-11 cursor-pointer items-center justify-between gap-3 rounded-xl border border-white/[0.08] px-4 text-sm text-[#C4C4CA]"><span>Saved only</span><input type="checkbox" checked={savedOnly} onChange={(event) => { setSavedOnly(event.target.checked); setVisibleCount(8); }} className="h-4 w-4 accent-cyan-400" /></label><button type="button" onClick={() => { setQuery(""); setCategory("All"); setSort("score"); setSavedOnly(false); setVisibleCount(8); }} className="mt-4 min-h-11 w-full text-xs uppercase tracking-widest text-white/45 hover:text-white">Reset filters</button></aside>
    </div>
  </div>;
}
