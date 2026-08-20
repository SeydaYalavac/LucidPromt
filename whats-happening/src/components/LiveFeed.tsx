"use client";

import { motion } from "framer-motion";
import { useSignals } from "@/hooks/useTrendData";

const sourceColor: Record<string, string> = {
  github: "text-[#06b6d4]",
  hacker_news: "text-[#f97316]",
  google_trends: "text-[#8b5cf6]",
};

export function LiveFeed() {
  const { data } = useSignals(8);
  const feed = data?.signals || [];
  return (
    <section className="w-full py-12 border-t border-white/5 bg-[#050505]">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex items-center gap-3 mb-8">
          <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
          <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-[#8B8B93]">Live Internet</h2>
        </div>
        
        <div className="flex flex-col gap-4">
          {feed.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              className="flex items-center gap-6"
            >
              <span className="text-[10px] font-bold text-[#8B8B93] w-24 text-right uppercase">{item.source.replace("_", " ")}</span>
              <p className={`text-sm font-medium ${sourceColor[item.source] || "text-white"}`}>{item.title}</p>
            </motion.div>
          ))}
          {!feed.length && <p className="text-sm text-[#8B8B93]">Waiting for the next ingestion run.</p>}
        </div>
      </div>
    </section>
  );
}
