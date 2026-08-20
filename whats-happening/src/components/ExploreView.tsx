"use client";

import { useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { discoveryCategories, matchesTrend } from "@/lib/discovery";
import { useTrends } from "@/hooks/useTrendData";
import { NewsCard } from "./NewsCard";
import { TrendEmpty, TrendLoading, TrendUnavailable } from "./TrendStates";

export function ExploreView() {
  const { data, error, isLoading } = useTrends({ limit: 50 });
  const [category, setCategory] = useState("All");
  const stripRef = useRef<HTMLDivElement>(null);
  const trends = useMemo(() => (data?.trends || []).filter((trend) => matchesTrend(trend, "", category)), [category, data?.trends]);
  const scroll = (direction: number) => stripRef.current?.scrollBy({ left: direction * 300, behavior: "smooth" });

  return <div className="mx-auto min-h-screen max-w-[1440px] px-5 pb-28 pt-32 sm:px-8 sm:pt-40">
    <header className="grid gap-8 border-b border-white/[0.08] pb-10 lg:grid-cols-[1fr_auto] lg:items-end"><div><p className="font-mono text-xs uppercase tracking-[0.22em] text-[#67E8F9]">Explore the evidence</p><h1 className="mt-5 text-[clamp(3.5rem,9vw,8rem)] font-medium leading-[0.86] tracking-[-0.075em] text-white">Find your signal.</h1></div><p className="max-w-md text-pretty text-base leading-7 text-[#A1A1AA] lg:pb-2">Move across categories, then open any story to inspect where it came from and why it is moving.</p></header>
    <section className="py-8" aria-label="Trend categories"><div className="flex items-center gap-3"><button type="button" onClick={() => scroll(-1)} className="hidden min-h-11 min-w-11 items-center justify-center rounded-full border border-white/10 text-white hover:bg-white/[0.06] sm:flex" aria-label="Scroll categories left"><ChevronLeft size={18} /></button><div ref={stripRef} className="flex flex-1 snap-x gap-2 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">{discoveryCategories.map((item) => <button key={item} type="button" onClick={() => setCategory(item)} aria-pressed={category === item} className={`min-h-11 shrink-0 snap-start rounded-full border px-5 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${category === item ? "border-white bg-white text-black" : "border-white/10 bg-white/[0.025] text-[#A1A1AA] hover:border-white/20 hover:text-white"}`}>{item}</button>)}</div><button type="button" onClick={() => scroll(1)} className="hidden min-h-11 min-w-11 items-center justify-center rounded-full border border-white/10 text-white hover:bg-white/[0.06] sm:flex" aria-label="Scroll categories right"><ChevronRight size={18} /></button></div></section>
    <section aria-live="polite" aria-label={`${category} trends`}>
      {isLoading && <div className="grid gap-5 md:grid-cols-2"><TrendLoading /><TrendLoading /></div>}
      {error && <TrendUnavailable />}
      {!error && !isLoading && !trends.length && <TrendEmpty message={`No ${category === "All" ? "" : category + " "}trends are available yet.`} />}
      {!!trends.length && <div className="columns-1 gap-5 md:columns-2 xl:columns-3">{trends.map((trend, index) => <div key={trend.id} className="mb-5 break-inside-avoid"><NewsCard trend={trend} featured={index % 5 === 0} rank={index + 1} /></div>)}</div>}
    </section>
  </div>;
}
