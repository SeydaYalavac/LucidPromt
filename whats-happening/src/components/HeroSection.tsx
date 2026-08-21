"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Search, ChevronDown } from "lucide-react";
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
    <section className="relative flex min-h-[95vh] flex-col items-center justify-center px-4 pt-24 pb-12">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#0B0B0D] via-[#050505] to-[#050505]"></div>
      
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="flex w-full max-w-6xl flex-col items-center text-center"
      >
        <h1 className="text-balance text-[clamp(40px,6.5vw,96px)] font-bold leading-[0.9] tracking-tighter text-white">
          {t("hero.title").split("\n").map((line, index) => <span key={line}>{line}{index < 2 && <br />}</span>)}
        </h1>
        <p className="mt-8 max-w-2xl text-pretty text-lg font-medium leading-relaxed text-[#A3A3AA] md:text-2xl">
          {t("hero.description")}
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="mt-12 w-full max-w-2xl"
      >
        <form onSubmit={(event) => { event.preventDefault(); router.push(query.trim() ? `/trending?q=${encodeURIComponent(query.trim())}` : "/trending"); }} className="group relative flex h-20 w-full items-center overflow-hidden rounded-full border border-white/10 bg-white/[0.03] px-8 shadow-2xl backdrop-blur-xl transition-all hover:bg-white/[0.05] focus-within:border-white/30 focus-within:bg-white/[0.06] focus-within:ring-4 focus-within:ring-white/5">
          <Search className="text-[#8B8B93] transition-colors group-focus-within:text-white" size={28} />
          
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
                  className="text-xl text-[#8B8B93]"
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
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.6 }}
        className="mt-16 flex flex-col items-center gap-6"
      >
        <div className="flex items-center gap-3 rounded-full border border-white/5 bg-white/[0.02] px-6 py-2">
          <span className={`h-2 w-2 rounded-full ${dataUnavailable ? "bg-amber-300" : "bg-[#67E8F9]"}`} aria-hidden="true" />
          <span className="text-xs font-bold uppercase tracking-widest text-white">
            {dataUnavailable ? t("hero.dataUnavailable") : t("hero.dataConnected")}
          </span>
          <div className="ml-2 flex items-center gap-3 text-xs text-[#8B8B93] font-medium">
            <span>{signalData ? t("hero.signalsLoaded", { count: signalData.signals.length }) : t("hero.signalCountUnavailable")}</span>
            <span className="h-1 w-1 rounded-full bg-white/20"></span>
            <span>{trendData ? t("hero.trendsLoaded", { count: trendData.trends.length }) : t("hero.trendCountUnavailable")}</span>
            <span className="h-1 w-1 rounded-full bg-white/20"></span>
            <span>{t("hero.sourceLinked")}</span>
          </div>
        </div>

        <button type="button" onClick={() => document.getElementById("trending")?.scrollIntoView({ behavior: "smooth" })} className="group mt-12 flex min-h-11 flex-col items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-[#8B8B93] transition-colors hover:text-white">
          <span>{t("hero.explore")}</span>
          <ChevronDown size={16} className="animate-bounce" />
        </button>
      </motion.div>
    </section>
  );
}
