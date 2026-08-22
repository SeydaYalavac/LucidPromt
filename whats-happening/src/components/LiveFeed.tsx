"use client";

import { motion } from "framer-motion";
import { useSignals } from "@/hooks/useTrendData";
import { useLocale } from "@/i18n/locale";

export function LiveFeed() {
  const { data } = useSignals(8);
  const feed = data?.signals || [];
  const { t } = useLocale();
  return (
    <section className="w-full bg-[#070706] py-16 sm:py-20">
      <div className="mx-auto max-w-[1440px] px-5 sm:px-8">
        <div className="mb-8 flex items-center justify-between border-b border-white/[0.1] pb-5">
          <h2 className="eyebrow">{t("feed.title")}</h2><span className="flex items-center gap-2 text-[10px] uppercase tracking-[0.14em] text-white/35"><i className="h-1.5 w-1.5 rounded-full bg-[#D8D4CA]" /> live</span>
        </div>
        
        <div className="divide-y divide-white/[0.08]">
          {feed.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              className="grid gap-3 py-4 sm:grid-cols-[10rem_1fr] sm:items-center"
            >
              <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-white/35">{item.source.replace("_", " ")}</span>
              <p className="text-sm font-medium text-[#D8D5CD]">{item.title}</p>
            </motion.div>
          ))}
          {!feed.length && <p className="text-sm text-[#8B8B93]">{t("feed.empty")}</p>}
        </div>
      </div>
    </section>
  );
}
