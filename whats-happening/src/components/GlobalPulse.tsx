"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, TrendingUp } from "lucide-react";

export function GlobalPulse() {
  return (
    <section className="w-full py-32 bg-[#050505]" id="trending">
      <div className="mx-auto max-w-7xl px-6">
        <h2 className="text-[clamp(40px,5vw,80px)] font-bold tracking-tighter text-white leading-none">
          GLOBAL PULSE
        </h2>
        <p className="mt-4 text-xl text-[#8B8B93]">The most important trends shaping the world right now.</p>
        
        <div className="mt-16 grid grid-cols-1 md:grid-cols-12 gap-6 auto-rows-[200px]">
          {/* MASSIVE LEAD STORY */}
          <Link href="/trend/artificial-intelligence" className="md:col-span-8 row-span-2 group relative overflow-hidden rounded-3xl bg-[#111114] border border-white/5 hover:border-white/20 transition-all flex flex-col justify-between p-8">
            <div className="absolute inset-0 bg-gradient-to-br from-[#06b6d4]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <div className="relative z-10 flex justify-between items-start">
              <span className="text-6xl font-black text-white/40 group-hover:text-white/60 transition-colors">01</span>
              <div className="flex flex-col items-end gap-2">
                <span className="rounded-full bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-white">
                  Artificial Intelligence
                </span>
                <span className="text-[#06b6d4] font-bold text-lg flex items-center gap-1">
                  <TrendingUp size={20} /> +218%
                </span>
              </div>
            </div>
            <div className="relative z-10 mt-auto">
              <h3 className="text-4xl md:text-5xl font-bold text-white tracking-tight leading-tight">
                The AI race just<br />accelerated again.
              </h3>
              <div className="mt-6 flex items-center justify-between text-[#8B8B93]">
                <div className="flex items-center gap-4 text-sm font-medium">
                  <span>Worldwide</span>
                  <span className="h-1 w-1 rounded-full bg-white/20"></span>
                  <span>12 min ago</span>
                </div>
                <div className="flex items-center gap-2 text-white font-medium group-hover:translate-x-2 transition-transform">
                  Understand why <ArrowRight size={16} />
                </div>
              </div>
            </div>
          </Link>

          {/* MEDIUM STORY 1 */}
          <Link href="/trend/space" className="md:col-span-4 row-span-1 group relative overflow-hidden rounded-3xl bg-[#111114] border border-white/5 hover:border-white/20 transition-all flex flex-col justify-between p-6">
            <div className="absolute inset-0 bg-gradient-to-br from-[#8b5cf6]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <div className="relative z-10 flex justify-between items-start">
              <span className="text-3xl font-black text-white/40 group-hover:text-white/60 transition-colors">02</span>
              <span className="text-[#a78bfa] font-bold flex items-center gap-1">
                <TrendingUp size={16} /> +174%
              </span>
            </div>
            <div className="relative z-10 mt-4">
              <span className="text-xs font-bold uppercase tracking-widest text-[#8B8B93]">Space</span>
              <h3 className="mt-1 text-xl font-bold text-white leading-tight">Something unusual is happening in space research.</h3>
            </div>
          </Link>

          {/* MEDIUM STORY 2 */}
          <Link href="/trend/culture" className="md:col-span-4 row-span-1 group relative overflow-hidden rounded-3xl bg-[#111114] border border-white/5 hover:border-white/20 transition-all flex flex-col justify-between p-6">
            <div className="absolute inset-0 bg-gradient-to-br from-[#f97316]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <div className="relative z-10 flex justify-between items-start">
              <span className="text-3xl font-black text-white/40 group-hover:text-white/60 transition-colors">03</span>
              <span className="text-[#f97316] font-bold flex items-center gap-1">
                <TrendingUp size={16} /> +142%
              </span>
            </div>
            <div className="relative z-10 mt-4">
              <span className="text-xs font-bold uppercase tracking-widest text-[#8B8B93]">Culture</span>
              <h3 className="mt-1 text-xl font-bold text-white leading-tight">A new internet phenomenon is spreading globally.</h3>
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}
