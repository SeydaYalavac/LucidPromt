"use client";

import { localeCategoryLabel, useLocale } from "@/i18n/locale";

export function CollectionHeader({ kind, value }: { kind: "category" | "country"; value: string }) {
  const { locale } = useLocale();
  const displayValue = value.replace(/-/g, " ");

  return (
    <>
      <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#8B8B93]">
        {kind === "category"
          ? (locale === "tr" ? "Kategori keşfi" : "Category explore")
          : (locale === "tr" ? "Ülkeye atfedilen kanıtlar" : "Country-attributed evidence")}
      </p>
      <h1 className="mt-4 text-5xl font-bold capitalize tracking-tighter text-white">
        {kind === "category" ? localeCategoryLabel(displayValue, locale) : displayValue}
      </h1>
    </>
  );
}
