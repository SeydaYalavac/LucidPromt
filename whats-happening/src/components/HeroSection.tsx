"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Search, ChevronDown } from "lucide-react";
import { useState, useEffect } from "react";
import { useSignals, useTrends } from "@/hooks/useTrendData";

const placeholders = [
  "What's trending worldwide?",
  "Why is everyone talking about AI?",
  "What's happening in Japan?",
  "What exploded in the last hour?",
  "What's trending in science?"
];

export function HeroSection() {
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const { data: trendData } = useTrends({ limit: 50 });
  const { data: signalData } = useSignals(100);

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % placeholders.length);
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
        className="flex flex-col items-center text-center w-full max-w-4xl"
      >
        <h1 className="text-[clamp(64px,10vw,160px)] font-bold leading-[0.85] tracking-tighter text-white">
          WHAT&apos;S<br />HAPPENING?
        </h1>
        <p className="mt-8 text-xl font-medium tracking-wide text-[#8B8B93] md:text-2xl">
          See what the world is talking about right now.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="mt-12 w-full max-w-2xl"
      >
        <div className="group relative flex h-20 w-full items-center overflow-hidden rounded-full border border-white/10 bg-white/[0.03] px-8 shadow-2xl backdrop-blur-xl transition-all hover:bg-white/[0.05] focus-within:border-white/30 focus-within:bg-white/[0.06] focus-within:ring-4 focus-within:ring-white/5">
          <Search className="text-[#8B8B93] transition-colors group-focus-within:text-white" size={28} />
          
          <div className="relative flex-1 h-full ml-6">
            <input
              type="text"
              className="peer absolute inset-0 h-full w-full bg-transparent text-xl text-white placeholder-transparent focus:outline-none"
              placeholder="Search..."
            />
            {/* Rotating Placeholder */}
            <div className="pointer-events-none absolute inset-0 flex items-center peer-focus:hidden">
              <AnimatePresence mode="wait">
                <motion.span
                  key={placeholderIndex}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.4 }}
                  className="text-xl text-[#8B8B93]/70"
                >
                  {placeholders[placeholderIndex]}
                </motion.span>
              </AnimatePresence>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-1 rounded-md border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs text-[#8B8B93]">
            <kbd className="font-sans font-medium">⌘</kbd>
            <kbd className="font-sans font-medium">K</kbd>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.6 }}
        className="mt-16 flex flex-col items-center gap-6"
      >
        <div className="flex items-center gap-3 rounded-full border border-white/5 bg-white/[0.02] px-6 py-2">
          <div className="relative flex h-2.5 w-2.5 items-center justify-center">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500"></span>
          </div>
          <span className="text-xs font-bold uppercase tracking-widest text-white">Live World</span>
          <div className="ml-2 flex items-center gap-3 text-xs text-[#8B8B93] font-medium">
            <span>{signalData?.signals.length ?? "—"} recent signals</span>
            <span className="h-1 w-1 rounded-full bg-white/20"></span>
            <span>{trendData?.trends.length ?? "—"} active trends</span>
            <span className="h-1 w-1 rounded-full bg-white/20"></span>
            <span>updating now</span>
          </div>
        </div>

        <button className="group mt-12 flex flex-col items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-[#8B8B93] transition-colors hover:text-white">
          <span>Explore</span>
          <ChevronDown size={16} className="animate-bounce" />
        </button>
      </motion.div>
    </section>
  );
}
