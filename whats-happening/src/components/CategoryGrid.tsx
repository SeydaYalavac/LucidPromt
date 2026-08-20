"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const categories = [
  { name: "AI", span: "col-span-2 row-span-2", color: "from-blue-500/20" },
  { name: "SCIENCE", span: "col-span-1 row-span-1", color: "from-violet-500/20" },
  { name: "TECHNOLOGY", span: "col-span-1 row-span-1", color: "from-cyan-500/20" },
  { name: "BUSINESS", span: "col-span-1 row-span-2", color: "from-emerald-500/20" },
  { name: "SPORTS", span: "col-span-1 row-span-1", color: "from-orange-500/20" },
  { name: "ENTERTAINMENT", span: "col-span-2 row-span-1", color: "from-pink-500/20" },
];

export function CategoryGrid() {
  return (
    <section className="w-full py-24" id="explore">
      <div className="mx-auto max-w-7xl px-6">
        <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-[#8B8B93]">Explore The World</h2>
        
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4 auto-rows-[160px]">
          {categories.map((cat, i) => (
            <Link key={cat.name} href={`/category/${cat.name.toLowerCase()}`} className={cat.span}>
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
                className={`w-full h-full group relative overflow-hidden rounded-3xl bg-[#111114] border border-white/5 p-6 hover:border-white/10 transition-colors`}
              >
              <div className={`absolute inset-0 bg-gradient-to-br ${cat.color} to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100`} />
              <h3 className="relative z-10 text-xl md:text-2xl font-bold tracking-tight text-white group-hover:scale-105 transition-transform origin-bottom-left">
                {cat.name}
              </h3>
              </motion.div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
