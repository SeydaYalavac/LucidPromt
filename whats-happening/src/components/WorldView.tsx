"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useTrends } from "@/hooks/useTrendData";
import { NewsCard } from "./NewsCard";
import { TrendLoading, TrendUnavailable } from "./TrendStates";

export function WorldView() {
  const { data, error, isLoading } = useTrends({ limit: 5 });
  const trends = data?.trends || [];
  return <div className="mx-auto min-h-screen max-w-[1440px] px-5 pb-24 pt-32 sm:px-8 sm:pt-40">
    <header className="grid gap-8 border-b border-white/[0.08] pb-10 lg:grid-cols-[1fr_auto] lg:items-end">
      <div><p className="font-mono text-xs uppercase tracking-[0.18em] text-white/45">World desk</p><h1 className="mt-4 max-w-5xl text-balance text-[clamp(3rem,7vw,6.5rem)] font-medium leading-[0.9] tracking-[-0.065em] text-white">The stories moving now.</h1></div>
      <div className="max-w-md lg:pb-2"><p className="text-pretty text-base leading-7 text-[#A8A8AF]">The strongest current topic leads. Every briefing names what it is, why attention moved, and which sources support it.</p><Link href="/map" className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-white hover:text-white/70">Open the signal map <ArrowRight size={16} /></Link></div>
    </header>
    <section className="pt-12" aria-label="World trends">
      {isLoading && <TrendLoading />}
      {error && <TrendUnavailable />}
      {!!trends.length && <><NewsCard trend={trends[0]} featured rank={1} analyticsSource="world" /><div className="mt-5 grid gap-5 lg:grid-cols-2">{trends.slice(1, 5).map((trend, index) => <NewsCard key={trend.id} trend={trend} rank={index + 2} analyticsSource="world" />)}</div>{data?.mode === "demo" && <p className="mt-5 font-mono text-xs uppercase tracking-widest text-amber-200">Demo data is explicitly enabled in this environment.</p>}</>}
    </section>
  </div>;
}
