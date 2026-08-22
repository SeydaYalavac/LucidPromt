"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Command, Search, X } from "lucide-react";
import { primaryNavigation } from "@/lib/discovery";
import { useTrends } from "@/hooks/useTrendData";
import { localeCategoryLabel, useLocale, type TranslationKey } from "@/i18n/locale";

export function SearchOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const { data } = useTrends({ limit: 200 });
  const { locale, t } = useLocale();
  const navigationLabels: Record<(typeof primaryNavigation)[number]["href"], TranslationKey> = {
    "/world": "nav.world", "/trending": "nav.trending", "/explore": "nav.explore", "/map": "nav.map", "/security-research": "nav.security", "/pricing": "nav.pricing",
  };

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const normalized = query.trim().toLocaleLowerCase();
    return (data?.trends || [])
      .filter((trend) => [trend.title, trend.category, localeCategoryLabel(trend.category, locale), trend.country?.name].filter(Boolean).some((value) => value!.toLocaleLowerCase().includes(normalized)))
      .slice(0, 6);
  }, [data?.trends, locale, query]);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    requestAnimationFrame(() => inputRef.current?.focus());
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (open && event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose, open]);

  if (!open) return null;
  const selectableCount = results.length || primaryNavigation.length;

  function submitSearch() {
    if (results[activeIndex]) router.push(`/trend/${results[activeIndex].slug}`);
    else if (query.trim()) router.push(`/trending?q=${encodeURIComponent(query.trim())}`);
    else router.push(primaryNavigation[activeIndex]?.href || "/trending");
    onClose();
  }

  return (
    <div className="fixed inset-0 z-[80] bg-[#050505]/96 backdrop-blur-xl" role="dialog" aria-modal="true" aria-label={t("search.dialog")}>
      <div className="mx-auto flex min-h-full max-w-5xl flex-col px-5 py-5 sm:px-8 sm:py-8">
        <div className="flex items-center justify-between border-b border-white/10 pb-5">
          <Link href="/" onClick={onClose} className="text-xs font-semibold tracking-[0.2em] text-white">WHAT&apos;S HAPPENING</Link>
          <button type="button" onClick={onClose} className="flex min-h-11 items-center gap-2 rounded-full border border-white/10 px-4 text-xs uppercase tracking-widest text-[#B8B8C0] hover:bg-white/[0.06] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white" aria-label={t("search.close")}>
            {t("search.close")} <X size={16} aria-hidden="true" />
          </button>
        </div>

        <div className="flex flex-1 flex-col justify-center py-12 sm:py-20">
          <p className="font-mono text-xs uppercase tracking-[0.22em] text-white/55">{t("search.heading")}</p>
          <div className="mt-6 flex items-center gap-4 border-b border-white/20 pb-5 focus-within:border-white">
            <Search className="shrink-0 text-[#8B8B93]" size={30} aria-hidden="true" />
            <input
              ref={inputRef}
              value={query}
              onChange={(event) => { setQuery(event.target.value); setActiveIndex(0); }}
              onKeyDown={(event) => {
                if (event.key === "ArrowDown") { event.preventDefault(); setActiveIndex((index) => (index + 1) % selectableCount); }
                if (event.key === "ArrowUp") { event.preventDefault(); setActiveIndex((index) => (index - 1 + selectableCount) % selectableCount); }
                if (event.key === "Enter") { event.preventDefault(); submitSearch(); }
              }}
              placeholder={t("search.placeholder")}
              aria-label={t("nav.search")}
              aria-controls="search-results"
              className="min-w-0 flex-1 bg-transparent text-[clamp(1.5rem,5vw,3.75rem)] font-medium tracking-[-0.04em] text-white outline-none placeholder:text-white/20"
            />
            <span className="hidden items-center gap-1 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 font-mono text-xs text-white/45 sm:flex"><Command size={13} /> K</span>
          </div>

          <div id="search-results" className="mt-8 grid gap-2" aria-live="polite">
            {query && results.map((trend, index) => (
              <Link key={trend.id} href={`/trend/${trend.slug}`} onClick={onClose} onMouseEnter={() => setActiveIndex(index)} className={`group grid min-h-16 grid-cols-[1fr_auto] items-center gap-4 rounded-2xl px-4 py-3 transition-colors ${index === activeIndex ? "bg-white/[0.08]" : "hover:bg-white/[0.05]"}`}>
                <span><span className="block text-base font-medium text-white">{trend.title}</span><span className="mt-1 block text-xs uppercase tracking-widest text-[#8B8B93]">{localeCategoryLabel(trend.category, locale)} · {trend.country?.name || t("search.countryUnknown")}</span></span>
                <ArrowRight className="text-white/35 transition-transform group-hover:translate-x-1 group-hover:text-white" size={18} />
              </Link>
            ))}
            {query && !results.length && (
              <button type="button" onClick={submitSearch} className="group flex min-h-16 items-center justify-between rounded-2xl bg-white/[0.05] px-4 text-left text-white hover:bg-white/[0.08]">
                <span>{t("search.all", { query })}</span><ArrowRight size={18} className="text-white/45" />
              </button>
            )}
            {!query && (
              <div className="grid gap-2 sm:grid-cols-2">
                {primaryNavigation.map((item, index) => (
                  <Link key={item.href} href={item.href} onClick={onClose} onMouseEnter={() => setActiveIndex(index)} className={`flex min-h-14 items-center justify-between rounded-2xl px-4 text-sm text-[#C4C4CA] ${index === activeIndex ? "bg-white/[0.08] text-white" : "bg-white/[0.03] hover:bg-white/[0.06]"}`}>
                    {t(navigationLabels[item.href])}<ArrowRight size={15} aria-hidden="true" />
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
        <p className="text-xs text-white/35">{t("search.instructions")}</p>
      </div>
    </div>
  );
}
