"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { useTrends } from "@/hooks/useTrendData";
import { localeCategoryLabel, useLocale } from "@/i18n/locale";

export function NextBigThing() {
  const { data } = useTrends({ limit: 20 });
  const candidates = (data?.trends || []).filter((trend) => !trend.is_global_pulse).slice(0, 3);
  const { locale, t } = useLocale();
  if (!candidates.length) return null;

  return (
    <section className="w-full border-y border-white/[0.08] bg-[#0D0D0C] py-20 sm:py-28">
      <div className="mx-auto max-w-[1440px] px-5 sm:px-8">
        <div className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr] lg:items-end"><h2 className="text-[clamp(2.8rem,5vw,5.5rem)] font-medium leading-[0.9] tracking-[-0.055em] text-white">{t("next.title")}</h2><p className="max-w-xl text-sm leading-6 text-[#96938C] lg:justify-self-end">{t("next.description")}</p></div>
        <div className="mt-12 border-y border-white/[0.12]">
          {candidates.map((trend, index) => (
            <Link key={trend.id} href={`/trend/${trend.slug}`} className="group grid min-h-32 gap-5 border-b border-white/[0.1] py-7 transition-colors last:border-b-0 hover:bg-white/[0.025] sm:grid-cols-[4rem_1fr_auto] sm:items-center sm:px-3">
              <span className="font-mono text-xs tracking-[0.16em] text-white/30">0{index + 1}</span>
              <div><p className="eyebrow">{localeCategoryLabel(trend.category, locale)}</p><h3 className="mt-2 text-3xl font-medium tracking-[-0.025em] text-white sm:text-4xl">{trend.title}</h3></div>
              <div className="flex items-center justify-between gap-8 sm:justify-end"><span className="font-mono text-xs uppercase tracking-[0.12em] text-white/40">{t("next.score")} <b className="ml-2 text-lg font-medium text-white">{trend.score}</b></span><ArrowUpRight size={18} className="text-white/45 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-white" /></div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
