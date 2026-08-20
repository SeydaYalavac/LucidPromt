"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { trends } from "@/data/trends";
import { ArrowUpRight, TrendingUp } from "lucide-react";

export function TrendingNow() {
  return (
    <section className="w-full py-24" id="trending">
      <div className="mx-auto max-w-7xl px-6">
        <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-[#8B8B93]">Trending Now</h2>
        
        <div className="mt-8 flex gap-6 overflow-x-auto pb-8 snap-x snap-mandatory hide-scrollbar">
          {trends.map((trend, i) => (
            <Link key={trend.id} href={`/trend/${trend.slug}`}>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="group relative flex-none w-[320px] snap-center flex flex-col justify-between rounded-3xl border border-white/5 bg-[#111114] p-6 transition-all hover:bg-[#17171B] hover:border-white/10"
              >
              <div className="flex items-center justify-between">
                <span className="text-4xl font-bold tracking-tighter text-white/10 group-hover:text-white/20 transition-colors">
                  #{trend.rank.toString().padStart(2, "0")}
                </span>
                <span className="rounded-full bg-white/5 px-3 py-1 text-xs font-medium text-[#8B8B93]">
                  {trend.category}
                </span>
              </div>
              
              <div className="mt-12">
                <h3 className="text-xl font-semibold text-white">{trend.title}</h3>
                <div className="mt-4 flex items-center gap-3">
                  <div className="flex items-center gap-1 text-[#06b6d4]">
                    <TrendingUp size={16} />
                    <span className="font-bold">+{trend.growth}%</span>
                  </div>
                  <span className="text-sm text-[#8B8B93]">{trend.country}</span>
                </div>
              </div>

              {/* Sparkline approximation */}
              <div className="mt-6 flex h-8 items-end gap-1 opacity-50 group-hover:opacity-100 transition-opacity">
                {trend.sparkline.map((val, idx) => (
                  <div
                    key={idx}
                    className="w-full rounded-t-sm bg-[#06b6d4]"
                    style={{ height: `${(val / Math.max(...trend.sparkline)) * 100}%` }}
                  />
                ))}
              </div>

              {/* Hover effect glow */}
              <div className="absolute inset-0 -z-10 rounded-3xl bg-gradient-to-b from-[#06b6d4]/0 to-[#06b6d4]/0 opacity-0 blur-xl transition-all duration-500 group-hover:from-[#06b6d4]/5 group-hover:to-transparent group-hover:opacity-100" />
            </motion.div>
          </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
