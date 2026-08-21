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
    <section className="w-full bg-[#0B0B0D] py-32">
      <div className="mx-auto max-w-7xl px-6">
        <h2 className="text-[clamp(40px,5vw,80px)] font-bold leading-none tracking-tighter text-white">{t("next.title")}</h2>
        <p className="mt-4 text-xl text-[#8B8B93]">{t("next.description")}</p>
        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {candidates.map((trend) => (
            <Link key={trend.id} href={`/trend/${trend.slug}`} className="relative flex min-h-64 flex-col justify-between overflow-hidden rounded-3xl border border-white/5 bg-[#111114] p-8 hover:border-white/15">
              <div className="absolute left-0 top-0 h-1 w-full bg-white/5"><div className="h-full bg-[#06b6d4]" style={{ width: `${trend.score}%` }} /></div>
              <div className="flex items-center justify-between"><span className="text-4xl font-bold text-white">{trend.score}</span><span className="text-xs font-bold uppercase tracking-widest text-white/55">{t("next.score")}</span></div>
              <div className="mt-10"><p className="text-xs font-bold uppercase tracking-widest text-[#8B8B93]">{localeCategoryLabel(trend.category, locale)}</p><h3 className="mt-2 text-2xl font-bold text-white">{trend.title}</h3><span className="mt-5 flex items-center gap-1 text-sm font-bold text-white/65"><ArrowUpRight size={16} /> {t("next.novelty", { value: trend.novelty_score })}</span></div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
