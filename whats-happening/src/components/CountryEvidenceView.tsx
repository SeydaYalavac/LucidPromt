"use client";

import Link from "next/link";
import { useLocale } from "@/i18n/locale";
import type { RetainedCountryPagePayload } from "@/types/trends";
import { CollectionHeader } from "./CollectionHeader";
import { NewsCard } from "./NewsCard";

function pagePath(slug: string, page: number) {
  const path = `/country/${encodeURIComponent(slug)}`;
  return page > 1 ? `${path}?page=${page}` : path;
}

export function CountryEvidenceView({ data }: { data: RetainedCountryPagePayload }) {
  const { locale } = useLocale();
  const countryName = data.country.name;

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
          {locale === "tr" ? `Sayfa ${data.pagination.page} / ${data.pagination.page_count}` : `Page ${data.pagination.page} of ${data.pagination.page_count}`} · {data.evidence_count} {locale === "tr" ? "coğrafi kanıt" : "geographic evidence items"}
        </p>
      </div>
      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        {data.trends.map((trend, index) => <NewsCard key={trend.id} trend={trend} rank={(data.pagination.page - 1) * data.pagination.page_size + index + 1} analyticsSource="country" />)}
      </div>
      <nav aria-label={`${countryName} archive pagination`} className="mt-12 flex gap-3 border-y border-white/[0.1] py-5">
        {data.pagination.has_previous && <Link href={pagePath(data.country.slug, data.pagination.page - 1)} className="inline-flex min-h-11 items-center border border-white/[0.12] px-4 text-sm text-white hover:border-white/30">{locale === "tr" ? "Önceki" : "Previous"}</Link>}
        {data.pagination.has_next && <Link href={pagePath(data.country.slug, data.pagination.page + 1)} className="inline-flex min-h-11 items-center border border-white/[0.12] px-4 text-sm text-white hover:border-white/30">{locale === "tr" ? "Sonraki" : "Next"}</Link>}
      </nav>
    </section>
  </>;
}
