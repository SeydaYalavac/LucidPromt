"use client";

import Link from "next/link";
import { ArrowRight, TrendingUp } from "lucide-react";
import { useTrends } from "@/hooks/useTrendData";

function observedAt(value: string) {
  return new Date(value).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function GlobalPulse() {
  const { data, error, isLoading } = useTrends({ globalPulse: true, limit: 5 });
  const trends = data?.trends || [];

  return (
    <section className="w-full py-32 bg-[#050505]" id="trending">
      <div className="mx-auto max-w-7xl px-6">
        <h2 className="text-[clamp(40px,5vw,80px)] font-bold tracking-tighter text-white leading-none">
          GLOBAL PULSE
        </h2>
        <div className="mt-4 flex flex-wrap items-center gap-3 text-xl text-[#8B8B93]">
          <p>The most important trends shaping the world right now.</p>
          {data?.mode === "demo" && (
            <span className="rounded-full border border-amber-300/30 bg-amber-300/10 px-3 py-1 text-[10px] font-bold tracking-[0.18em] text-amber-200">
              DEMO DATA
            </span>
          )}
        </div>
        
        {error && (
          <div className="mt-16 rounded-3xl border border-white/10 bg-[#111114] p-8 text-[#8B8B93]">
            Live ingestion is waiting for its Supabase connection.
          </div>
        )}
        {isLoading && <div className="mt-16 h-[424px] animate-pulse rounded-3xl bg-[#111114]" />}
        {!!trends.length && (
        <div className="mt-16 grid grid-cols-1 md:grid-cols-12 gap-6 auto-rows-[200px]">
          <Link href={`/trend/${trends[0].slug}`} className="md:col-span-8 row-span-2 group relative overflow-hidden rounded-3xl bg-[#111114] border border-white/5 hover:border-white/20 transition-all flex flex-col justify-between p-8">
            <div className="absolute inset-0 bg-gradient-to-br from-[#06b6d4]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <div className="relative z-10 flex justify-between items-start">
              <span className="text-6xl font-black text-white/40 group-hover:text-white/60 transition-colors">01</span>
              <div className="flex flex-col items-end gap-2">
                <span className="rounded-full bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-white">
                  {trends[0].category}
                </span>
                <span className="text-[#06b6d4] font-bold text-lg flex items-center gap-1">
                  <TrendingUp size={20} /> +{Math.round(trends[0].growth_percent || trends[0].velocity_score)}%
                </span>
              </div>
            </div>
            <div className="relative z-10 mt-auto">
              <h3 className="text-4xl md:text-5xl font-bold text-white tracking-tight leading-tight">
                {trends[0].title}
              </h3>
              <div className="mt-6 flex items-center justify-between text-[#8B8B93]">
                <div className="flex items-center gap-4 text-sm font-medium">
                  <span>{trends[0].country?.name || "Worldwide"}</span>
                  <span className="h-1 w-1 rounded-full bg-white/20"></span>
                  <span>Updated {observedAt(trends[0].last_seen_at)}</span>
                </div>
                <div className="flex items-center gap-2 text-white font-medium group-hover:translate-x-2 transition-transform">
                  Understand why <ArrowRight size={16} />
                </div>
              </div>
            </div>
          </Link>

          {trends.slice(1, 3).map((trend, index) => (
            <Link key={trend.id} href={`/trend/${trend.slug}`} className="md:col-span-4 row-span-1 group relative overflow-hidden rounded-3xl bg-[#111114] border border-white/5 hover:border-white/20 transition-all flex flex-col justify-between p-6">
              <div className="absolute inset-0 bg-gradient-to-br from-[#8b5cf6]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              <div className="relative z-10 flex justify-between items-start">
                <span className="text-3xl font-black text-white/40 group-hover:text-white/60 transition-colors">0{index + 2}</span>
                <span className="text-[#a78bfa] font-bold flex items-center gap-1">
                  <TrendingUp size={16} /> +{Math.round(trend.growth_percent || trend.velocity_score)}%
                </span>
              </div>
              <div className="relative z-10 mt-4">
                <span className="text-xs font-bold uppercase tracking-widest text-[#8B8B93]">{trend.category}</span>
                <h3 className="mt-1 text-xl font-bold text-white leading-tight">{trend.title}</h3>
              </div>
            </Link>
          ))}
        </div>
        )}
      </div>
    </section>
  );
}
