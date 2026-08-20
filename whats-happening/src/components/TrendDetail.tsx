"use client";

import { motion } from "framer-motion";
import { Share, BookmarkPlus, ChevronRight } from "lucide-react";
import { TrendChat } from "./TrendChat";

export function TrendDetail({ slug }: { slug: string }) {
  const title = slug.replace(/-/g, " ");

  return (
    <div className="mx-auto max-w-5xl px-6 pt-32 pb-24">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-[#06b6d4]">
            #1 World Trend
          </span>
          <h1 className="mt-6 text-[clamp(40px,5vw,80px)] font-bold tracking-tighter text-white capitalize leading-none">
            {title}
          </h1>
          <div className="mt-4 flex items-center gap-4 text-sm font-medium text-[#8B8B93]">
            <span className="text-[#06b6d4] font-bold">↑ 218%</span>
            <span>Trending across 43 countries</span>
            <span>Started 3 hours ago</span>
          </div>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-6 py-2.5 text-sm font-medium text-white hover:bg-white/10 transition-colors">
            <BookmarkPlus size={16} /> Save
          </button>
          <button className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-6 py-2.5 text-sm font-medium text-white hover:bg-white/10 transition-colors">
            <Share size={16} /> Share
          </button>
        </div>
      </div>

      <div className="mt-16 grid grid-cols-1 md:grid-cols-12 gap-12">
        {/* LEFT COLUMN: THE WHY LAYER */}
        <div className="md:col-span-8 space-y-12">
          
          <section>
            <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-[#8B8B93] mb-6">Why is this happening?</h2>
            <div className="prose prose-invert max-w-none">
              <p className="text-xl text-white leading-relaxed">
                A sudden surge in global search interest occurred after a major breakthrough was announced by a leading research lab. The discussion rapidly expanded from technical forums to mainstream news within two hours.
              </p>
              
              <div className="mt-8 grid gap-4">
                <div className="border-l-2 border-[#06b6d4] pl-4">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-[#8B8B93]">What Changed</h3>
                  <p className="mt-1 text-white">New capabilities were demonstrated that fundamentally alter previous assumptions about the technology.</p>
                </div>
                <div className="border-l-2 border-[#8b5cf6] pl-4">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-[#8B8B93]">Where it started</h3>
                  <p className="mt-1 text-white">Originating in developer communities in San Francisco, it quickly spread to Japan and Europe.</p>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-[#8B8B93] mb-6">People are asking</h2>
            <div className="grid gap-3">
              {["Why is this trending now?", "Who started it?", "What happens next?"].map((q) => (
                <button key={q} className="flex items-center justify-between rounded-2xl border border-white/5 bg-[#111114] p-5 text-left hover:bg-[#17171B] transition-colors">
                  <span className="text-lg font-semibold text-white">{q}</span>
                  <ChevronRight className="text-[#8B8B93]" />
                </button>
              ))}
            </div>
          </section>

          {/* CHAT/DISCUSSION SECTION */}
          <TrendChat />
        </div>

        {/* RIGHT COLUMN: TREND SCORE & COMMUNITY */}
        <div className="md:col-span-4 space-y-12">
          
          <section className="rounded-3xl border border-white/5 bg-[#111114] p-8">
            <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-[#8B8B93] mb-8 text-center">Trend Score</h2>
            <div className="flex justify-center mb-8">
              <div className="relative flex h-32 w-32 items-center justify-center rounded-full border-4 border-[#06b6d4] bg-white/5">
                <span className="text-4xl font-black text-white">94</span>
              </div>
            </div>
            
            <div className="space-y-4">
              {[
                { label: "VELOCITY", val: 94 },
                { label: "REACH", val: 88 },
                { label: "NOVELTY", val: 91 },
                { label: "DISCUSSION", val: 97 },
              ].map(stat => (
                <div key={stat.label}>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="text-[#8B8B93]">{stat.label}</span>
                    <span className="text-white">{stat.val}</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-white/10">
                    <div className="h-full rounded-full bg-white" style={{ width: `${stat.val}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-3xl border border-white/5 bg-[#111114] p-8">
            <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-[#8B8B93] mb-6">Community Signals</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-white font-medium">Important</span>
                <span className="text-[#06b6d4] font-bold">68%</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-white font-medium">Overhyped</span>
                <span className="text-[#f97316] font-bold">21%</span>
              </div>
              <div className="flex justify-between items-center text-sm border-t border-white/5 pt-4">
                <span className="text-[#8B8B93]">Predictions</span>
                <span className="text-white font-bold">1.8K</span>
              </div>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
