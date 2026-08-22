"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Search } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSignals, useTrends } from "@/hooks/useTrendData";
import { useLocale } from "@/i18n/locale";

export function HeroSection() {
  const router = useRouter();
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [query, setQuery] = useState("");
  const { data: trendData, error: trendError } = useTrends({ limit: 50 });
  const { data: signalData, error: signalError } = useSignals(100);
  const dataUnavailable = Boolean(trendError || signalError);
  const { locale, t } = useLocale();
  const placeholders = [t("hero.placeholder1"), t("hero.placeholder2"), t("hero.placeholder3"), t("hero.placeholder4"), t("hero.placeholder5")];

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % 5);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="page-grid relative border-b border-white/[0.08] px-5 pb-20 pt-36 sm:px-8 sm:pb-24 sm:pt-44">
      <div className="mx-auto grid w-full max-w-[1440px] gap-14 lg:grid-cols-[minmax(0,1.38fr)_minmax(300px,0.62fr)] lg:items-end lg:gap-20">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-5xl"
      >
        <p className="eyebrow">{locale === "tr" ? "Kaynaklı AI trend istihbaratı" : "Source-linked AI trend intelligence"}</p>
        <h1 className="mt-7 text-balance text-[clamp(2.75rem,8.5vw,8.8rem)] font-medium leading-[0.84] tracking-[-0.068em] text-[#F1EFE9] sm:text-[clamp(3.8rem,8.5vw,8.8rem)]">
          {t("hero.title").split("\n").map((line, index) => <span key={line}>{line}{index < 2 && <br />}</span>)}
        </h1>
        <p className="mt-8 max-w-2xl text-pretty text-base leading-7 text-[#AAA79F] sm:text-lg sm:leading-8">
          {t("hero.description")}
        </p>
        <form onSubmit={(event) => { event.preventDefault(); router.push(query.trim() ? `/trending?q=${encodeURIComponent(query.trim())}` : "/trending"); }} className="group relative mt-10 flex min-h-16 w-full max-w-2xl items-center border-y border-white/[0.16] bg-[#0D0D0C] px-5 transition-colors hover:bg-[#11110F] focus-within:border-white/35">
          <Search className="text-white/45 transition-colors group-focus-within:text-white" size={21} />
          
          <div className="relative flex-1 h-full ml-6">
            <input
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              aria-label={t("hero.search")}
              className="peer absolute inset-0 h-full w-full bg-transparent text-xl text-white placeholder-transparent focus:outline-none"
              placeholder={locale === "tr" ? "Ara..." : "Search..."}
            />
            {/* Rotating Placeholder */}
            <div className="pointer-events-none absolute inset-0 flex items-center peer-focus:hidden">
              <AnimatePresence mode="wait">
                <motion.span
                  key={placeholderIndex}
                  initial={{ y: 10 }}
                  animate={{ y: 0 }}
                  exit={{ y: -10 }}
                  transition={{ duration: 0.4 }}
                className="text-sm text-[#8F8C85] sm:text-base"
                >
                  {placeholders[placeholderIndex]}
                </motion.span>
              </AnimatePresence>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-1 rounded-md border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs text-[#8B8B93]">
            <span className="font-sans font-medium">Enter</span>
          </div>
        </form>
        <Link href="/trending" className="mt-5 inline-flex min-h-11 items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-white/55 transition-colors hover:text-white">{t("hero.explore")} <ArrowRight size={14} /></Link>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.6 }}
        className="border-t border-white/[0.16] pt-6 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0"
      >
        <div className="flex items-center gap-3 border-b border-white/[0.1] pb-6">
          <span className={`h-2 w-2 rounded-full ${dataUnavailable ? "bg-amber-300" : "bg-[#D8D4CA]"}`} aria-hidden="true" />
          <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white">
            {dataUnavailable ? t("hero.dataUnavailable") : t("hero.dataConnected")}
          </span>
        </div>
        <dl className="divide-y divide-white/[0.1]">
          <div className="flex items-end justify-between gap-4 py-6"><dt className="eyebrow">{locale === "tr" ? "Sinyaller" : "Signals"}</dt><dd className="text-4xl font-medium tracking-[-0.05em] text-[#ECE8DF]">{signalData ? signalData.signals.length : "—"}</dd></div>
          <div className="flex items-end justify-between gap-4 py-6"><dt className="eyebrow">{locale === "tr" ? "Trendler" : "Trends"}</dt><dd className="text-4xl font-medium tracking-[-0.05em] text-[#ECE8DF]">{trendData ? trendData.trends.length : "—"}</dd></div>
          <div className="flex items-center justify-between gap-4 py-6"><dt className="eyebrow">{locale === "tr" ? "Kanıt" : "Evidence"}</dt><dd className="max-w-[10rem] text-right text-[10px] font-semibold uppercase tracking-[0.1em] text-white/70">{t("hero.sourceLinked")}</dd></div>
        </dl>
      </motion.div>
      </div>
    </section>
  );
}
