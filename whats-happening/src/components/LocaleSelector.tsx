"use client";

import { useLocale, type Locale } from "@/i18n/locale";

export function LocaleSelector({ compact = false }: { compact?: boolean }) {
  const { locale, setLocale, t } = useLocale();
  const options: { value: Locale; label: string; longLabel: string }[] = [
    { value: "en", label: "EN", longLabel: t("locale.english") },
    { value: "tr", label: "TR", longLabel: t("locale.turkish") },
  ];

  return (
    <div
      className={`inline-flex items-center rounded-full border border-white/10 bg-white/[0.035] p-1 ${compact ? "gap-0" : "gap-1"}`}
      role="group"
      aria-label={t("locale.label")}
    >
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => setLocale(option.value)}
          aria-pressed={locale === option.value}
          title={option.longLabel}
          className={`flex min-h-9 min-w-9 items-center justify-center rounded-full px-2 text-[10px] font-semibold tracking-[0.12em] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${
            locale === option.value ? "bg-white text-black" : "text-white/55 hover:text-white"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
