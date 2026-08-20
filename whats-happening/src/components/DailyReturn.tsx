"use client";

import { motion } from "framer-motion";
import { Clock, TrendingUp, Sparkles, Globe } from "lucide-react";

export function DailyReturn() {
  return (
    <section className="w-full py-12 border-b border-white/5 bg-[#0B0B0D]">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white">Since You Were Here</h2>
            <div className="mt-4 flex flex-wrap items-center gap-4 text-sm font-medium text-[#8B8B93]">
              <span className="flex items-center gap-2"><TrendingUp size={16} className="text-[#06b6d4]" /> 12 new trends</span>
              <span className="flex items-center gap-2"><Globe size={16} className="text-[#8b5cf6]" /> 3 major changes</span>
              <span className="flex items-center gap-2"><Sparkles size={16} className="text-[#f97316]" /> 1 predicted topic exploded</span>
            </div>
          </div>
          <button className="rounded-full bg-white text-black px-6 py-2.5 text-sm font-semibold hover:bg-white/90 transition-colors">
            Catch me up
          </button>
        </div>

        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { tag: "AI", growth: "+42%", color: "text-[#06b6d4]" },
            { tag: "Biology", growth: "+18%", color: "text-[#8b5cf6]" },
            { tag: "Space", growth: "+91%", color: "text-[#f97316]" },
            { tag: "Gaming", growth: "+11%", color: "text-[#3b82f6]" },
          ].map((item, i) => (
            <motion.div
              key={item.tag}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="flex items-center justify-between rounded-2xl bg-[#111114] border border-white/5 p-4 hover:bg-[#17171B] transition-colors cursor-pointer"
            >
              <span className="font-semibold text-white">{item.tag}</span>
              <span className={`font-bold ${item.color}`}>{item.growth}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
