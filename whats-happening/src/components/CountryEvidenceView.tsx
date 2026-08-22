"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { localeCategoryLabel, useLocale } from "@/i18n/locale";
import { trendPath } from "@/lib/trend-page-graph";
import type { CountryActivity } from "@/types/trends";
import { CollectionHeader } from "./CollectionHeader";

function observedLabel(value: string, locale: "en" | "tr") {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return locale === "tr" ? "Zaman bilgisi yok" : "Time unavailable";
  return new Intl.DateTimeFormat(locale === "tr" ? "tr-TR" : "en-US", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "UTC",
  }).format(date);
}

export function CountryEvidenceView({ activity }: { activity: CountryActivity }) {
  const { locale } = useLocale();
  const countryName = activity.country.name;

  return <>
    <CollectionHeader kind="country" value={countryName} />
    <p className="mt-6 max-w-[68ch] text-pretty text-base leading-7 text-[#A8A8AF]">
      {locale === "tr"
        ? `${countryName} ile açıkça ilişkilendirilen güncel kaynak kanıtları. Coğrafya, olayın kökenini değil gözlemlenen pazarı veya kaynağın belirttiği konumu gösterir.`
        : `Current source evidence explicitly attributed to ${countryName}. Geography shows an observed market or source-provided location, not where an event originated.`}
    </p>

    <section aria-labelledby="country-trends-heading" className="mt-12 border-t border-white/[0.1] pt-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h2 id="country-trends-heading" className="text-2xl font-medium tracking-[-0.03em] text-white">
          {locale === "tr" ? "Kaynakla doğrulanan trendler" : "Source-backed trends"}
        </h2>
        <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-white/40">
          {activity.evidence_count} {locale === "tr" ? "coğrafi kanıt" : "geographic evidence items"}
        </p>
      </div>
      <ol className="mt-6 divide-y divide-white/[0.1] border-y border-white/[0.1]">
        {activity.rising_topics.map((trend, index) => <li key={trend.id} className="min-w-0">
          <Link href={trendPath(trend.slug)} className="group grid min-w-0 gap-4 py-7 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white sm:grid-cols-[2rem_minmax(0,1fr)_auto]">
            <span className="font-mono text-xs tabular-nums text-white/30">{String(index + 1).padStart(2, "0")}</span>
            <span className="min-w-0">
              <span className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[10px] uppercase tracking-[0.12em] text-white/40">
                <span>{localeCategoryLabel(trend.category, locale)}</span>
                <span>{locale === "tr" ? `${trend.evidence_count} kanıt` : `${trend.evidence_count} evidence`}</span>
                <time dateTime={trend.latest_observed_at}>{observedLabel(trend.latest_observed_at, locale)}</time>
              </span>
              <span className="mt-3 block break-words text-balance text-2xl font-medium tracking-[-0.03em] text-white">{trend.title}</span>
              {trend.summary && <span className="mt-3 block max-w-[68ch] break-words text-pretty text-sm leading-6 text-[#A8A8AF]">{trend.summary}</span>}
            </span>
            <span className="inline-flex min-h-11 items-center gap-2 self-end text-sm font-medium text-white/60 group-hover:text-white">
              {locale === "tr" ? "Makaleyi oku" : "Read article"} <ArrowUpRight size={16} />
            </span>
          </Link>
        </li>)}
      </ol>
    </section>
  </>;
}
