"use client";

import Link from "next/link";
import { ArrowRight, TrendingUp } from "lucide-react";
import { useTrends } from "@/hooks/useTrendData";
import { useLocale, localeCategoryLabel } from "@/i18n/locale";

function observedAt(value: string) {
  return new Date(value).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function GlobalPulse() {
  const { data, error, isLoading } = useTrends({ globalPulse: true, limit: 5 });
  const trends = data?.trends || [];
  const { locale, t } = useLocale();

  return (
    <section className="w-full bg-[#070706] py-20 sm:py-28" id="trending">
      <div className="mx-auto max-w-[1440px] px-5 sm:px-8">
        <div className="grid gap-5 border-b border-white/[0.1] pb-9 lg:grid-cols-[1fr_auto] lg:items-end">
        <h2 className="text-[clamp(2.8rem,6vw,6rem)] font-medium leading-[0.9] tracking-[-0.06em] text-[#F1EFE9]">
          {t("pulse.title")}
        </h2>
        <div className="flex max-w-xl flex-wrap items-center gap-3 text-sm leading-6 text-[#96938C] lg:justify-end lg:text-right">
          <p>{t("pulse.description")}</p>
          {data?.mode === "demo" && (
            <span className="rounded-full border border-amber-300/30 bg-amber-300/10 px-3 py-1 text-[10px] font-bold tracking-[0.18em] text-amber-200">
              {t("pulse.demo")}
            </span>
          )}
        </div></div>
        
        {error && (
          <div className="editorial-card mt-16 rounded-2xl border p-8 text-[#8B8B93]">
            {t("pulse.unavailable")}
          </div>
        )}
        {isLoading && <div className="editorial-card mt-16 h-[424px] animate-pulse rounded-2xl border" />}
        {!!trends.length && (
        <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-12 md:auto-rows-[190px]">
          <Link href={`/trend/${trends[0].slug}`} className="editorial-card editorial-card-interactive group relative row-span-2 flex flex-col justify-between overflow-hidden rounded-2xl border p-6 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white sm:p-8 md:col-span-8">
            <div className="relative z-10 flex justify-between items-start">
              <span className="font-mono text-xs tracking-[0.16em] text-white/35">LEAD / 01</span>
              <div className="flex flex-col items-end gap-2">
                <span className="rounded-full bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-white">
                  {localeCategoryLabel(trends[0].category, locale)}
                </span>
                <span className="flex items-center gap-1 text-lg font-bold text-[#D8D4CA]">
                  <TrendingUp size={20} /> {trends[0].growth_percent == null ? t("pulse.velocity", { value: trends[0].velocity_score }) : `${trends[0].growth_percent >= 0 ? "+" : ""}${Math.round(trends[0].growth_percent)}%`}
                </span>
              </div>
            </div>
            <div className="relative z-10 mt-auto">
              <h3 className="max-w-4xl text-4xl font-medium leading-[0.98] tracking-[-0.04em] text-white md:text-6xl">
                {trends[0].title}
              </h3>
              <div className="mt-6 flex items-center justify-between text-[#8B8B93]">
                <div className="flex items-center gap-4 text-sm font-medium">
                  <span>{trends[0].country?.name || t("pulse.countryUnknown")}</span>
                  <span className="h-1 w-1 rounded-full bg-white/20"></span>
                  <span>{t("pulse.updated", { time: observedAt(trends[0].last_seen_at) })}</span>
                </div>
                <div className="flex items-center gap-2 text-white font-medium group-hover:translate-x-2 transition-transform">
                  {t("pulse.why")} <ArrowRight size={16} />
                </div>
              </div>
            </div>
          </Link>

          {trends.slice(1, 3).map((trend, index) => (
            <Link key={trend.id} href={`/trend/${trend.slug}`} className="editorial-card editorial-card-interactive group relative row-span-1 flex flex-col justify-between overflow-hidden rounded-2xl border p-6 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white md:col-span-4">
              <div className="relative z-10 flex justify-between items-start">
                <span className="font-mono text-xs tracking-[0.16em] text-white/35">0{index + 2}</span>
                <span className="flex items-center gap-1 font-bold text-[#C9C5BC]">
                  <TrendingUp size={16} /> {trend.growth_percent == null ? t("pulse.velocity", { value: trend.velocity_score }) : `${trend.growth_percent >= 0 ? "+" : ""}${Math.round(trend.growth_percent)}%`}
                </span>
              </div>
              <div className="relative z-10 mt-4">
                <span className="text-xs font-bold uppercase tracking-widest text-[#8B8B93]">{localeCategoryLabel(trend.category, locale)}</span>
                <h3 className="mt-2 text-2xl font-medium leading-tight text-white">{trend.title}</h3>
              </div>
            </Link>
          ))}
        </div>
        )}
      </div>
    </section>
  );
}
