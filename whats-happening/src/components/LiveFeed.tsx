"use client";

import { motion } from "framer-motion";

const feed = [
  { time: "NOW", text: "AI searches accelerating in Germany", color: "text-[#06b6d4]" },
  { time: "12 SEC", text: "New gaming topic emerging in Japan", color: "text-[#8b5cf6]" },
  { time: "31 SEC", text: "Space discussion increasing worldwide", color: "text-[#f97316]" },
  { time: "48 SEC", text: "Technology signal detected in Korea", color: "text-white" },
  { time: "1 MIN", text: "New global topic entered Top 100", color: "text-white" },
];

export function LiveFeed() {
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
              key={i}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              className="flex items-center gap-6"
            >
              <span className="text-[10px] font-bold text-[#8B8B93] w-12 text-right">{item.time}</span>
              <p className={`text-sm font-medium ${item.color}`}>{item.text}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
