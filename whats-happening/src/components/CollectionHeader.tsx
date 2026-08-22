"use client";

import Link from "next/link";
import { localeCategoryLabel, useLocale } from "@/i18n/locale";

export function CollectionHeader({ kind, value }: { kind: "category" | "country"; value: string }) {
  const { locale } = useLocale();
  const displayValue = value.replace(/-/g, " ");

  return (
    <>
      <nav aria-label={locale === "tr" ? "Sayfa yolu" : "Breadcrumb"} className="flex flex-wrap items-center gap-2 font-mono text-[10px] uppercase tracking-[0.15em] text-white/45">
        <Link href="/" className="rounded-sm hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">
          {locale === "tr" ? "Ana sayfa" : "Home"}
        </Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page">
          {kind === "category"
            ? (locale === "tr" ? "Kategori" : "Category")
            : (locale === "tr" ? "Ülke kanıtı" : "Country evidence")}
        </span>
      </nav>
      <h1 className="mt-4 text-5xl font-bold capitalize tracking-tighter text-white">
        {kind === "category" ? localeCategoryLabel(displayValue, locale) : displayValue}
      </h1>
    </>
  );
}
