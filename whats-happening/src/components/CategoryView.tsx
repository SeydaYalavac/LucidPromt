"use client";

import type { RetainedTrendPagePayload } from "@/types/trends";
import { useLocale } from "@/i18n/locale";
import { CollectionHeader } from "./CollectionHeader";
import { NewsCard } from "./NewsCard";
import { evergreenGuidePath, evergreenGuidesForCategory } from "@/content/evergreen-guides";
import Link from "next/link";
import { retainedHubPath } from "@/lib/trend-hubs";

export function CategoryView({ data }: { data: RetainedTrendPagePayload }) {
  const { locale } = useLocale();
  const trends = data.trends;
  const guides = evergreenGuidesForCategory(data.collection.label);
  const hub = { slug: data.collection.slug, label: data.collection.label, categories: [] };

  return <>
    <CollectionHeader kind="category" value={data.collection.label} />
    <p className="mt-5 font-mono text-[10px] uppercase tracking-[0.14em] text-white/40">
      {locale === "tr" ? `Sayfa ${data.pagination.page} / ${data.pagination.page_count}` : `Page ${data.pagination.page} of ${data.pagination.page_count}`} · {data.pagination.total.toLocaleString(locale === "tr" ? "tr-TR" : "en-US")} {locale === "tr" ? "kalıcı trend" : "retained trends"}
    </p>
    {guides.length > 0 && <section className="mt-10 border-y border-white/[0.1] py-6" aria-labelledby="category-evidence-guides">
      <div className="grid gap-4 sm:grid-cols-[11rem_1fr]">
        <p id="category-evidence-guides" className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/40">{locale === "tr" ? "Kanıt rehberleri" : "Evidence guides"}</p>
        <div className="space-y-3">{guides.map((guide) => <Link key={guide.slug} href={evergreenGuidePath(guide.slug)} className="group flex items-start justify-between gap-4 text-sm font-medium leading-6 text-white hover:text-[#D4D4D7]"><span>{guide.title[locale]}</span><span aria-hidden="true" className="text-white/30 group-hover:text-white">↗</span></Link>)}</div>
      </div>
    </section>}
    <div className="mt-12 grid gap-5 lg:grid-cols-2">{trends.map((trend, index) => <NewsCard key={trend.id} trend={trend} rank={(data.pagination.page - 1) * data.pagination.page_size + index + 1} analyticsSource="category" />)}</div>
    <nav aria-label={`${data.collection.label} archive pagination`} className="mt-12 flex flex-wrap items-center justify-between gap-4 border-y border-white/[0.1] py-5">
      <div className="flex gap-3">
        {data.pagination.has_previous && <Link href={retainedHubPath(hub, data.pagination.page - 1)} className="inline-flex min-h-11 items-center border border-white/[0.12] px-4 text-sm text-white hover:border-white/30">{locale === "tr" ? "Önceki" : "Previous"}</Link>}
        {data.pagination.has_next && <Link href={retainedHubPath(hub, data.pagination.page + 1)} className="inline-flex min-h-11 items-center border border-white/[0.12] px-4 text-sm text-white hover:border-white/30">{locale === "tr" ? "Sonraki" : "Next"}</Link>}
      </div>
      <Link href="/#retained-hubs-heading" className="text-sm text-white/50 hover:text-white">{locale === "tr" ? "Tüm arşiv sayfaları" : "All archive pages"}</Link>
    </nav>
  </>;
}
