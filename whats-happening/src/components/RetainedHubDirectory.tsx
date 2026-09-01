"use client";

import Link from "next/link";
import { useLocale } from "@/i18n/locale";
import { retainedHubPath } from "@/lib/trend-hubs";
import type { RetainedHubDirectoryItem } from "@/types/trends";

export function RetainedHubDirectory({ hubs }: { hubs: RetainedHubDirectoryItem[] }) {
  const { locale } = useLocale();
  if (!hubs.length) return null;

  return (
    <section className="border-t border-white/[0.08] px-6 py-20" aria-labelledby="retained-hubs-heading">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-5 md:grid-cols-[minmax(0,0.8fr)_minmax(0,1.8fr)]">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/40">
              {locale === "tr" ? "Kalıcı arşiv" : "Retained archive"}
            </p>
            <h2 id="retained-hubs-heading" className="mt-4 max-w-md text-balance text-3xl font-medium tracking-[-0.04em] text-white md:text-4xl">
              {locale === "tr" ? "Her kaynaklı trend, düzenli bir yuvada." : "Every source-backed trend, kept within reach."}
            </h2>
            <p className="mt-4 max-w-[42ch] text-sm leading-6 text-[#8B8B93]">
              {locale === "tr"
                ? "Kategoriye ve ardından numaralı arşiv sayfasına gidin. Her sayfa en fazla 30 kayıt gösterir."
                : "Choose a category, then a numbered archive page. Each page contains no more than 30 records."}
            </p>
          </div>

          <div className="divide-y divide-white/[0.08] border-y border-white/[0.08]">
            {hubs.map((hub) => (
              <article key={hub.slug} className="grid gap-4 py-6 sm:grid-cols-[minmax(12rem,0.8fr)_minmax(0,1.2fr)]">
                <div>
                  <Link href={`/category/${hub.slug}`} className="text-lg font-medium tracking-[-0.02em] text-white hover:text-white/70">
                    {hub.label}
                  </Link>
                  <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.12em] text-white/35">
                    {hub.total.toLocaleString(locale === "tr" ? "tr-TR" : "en-US")} {locale === "tr" ? "trend" : "trends"}
                  </p>
                </div>
                <nav aria-label={`${hub.label} archive pages`} className="flex flex-wrap gap-2">
                  {Array.from({ length: hub.page_count }, (_, index) => index + 1).map((page) => (
                    <Link
                      key={page}
                      href={retainedHubPath({ slug: hub.slug, label: hub.label, categories: [] }, page)}
                      className="inline-flex min-h-8 min-w-8 items-center justify-center border border-white/[0.1] px-2 font-mono text-[10px] tabular-nums text-white/50 hover:border-white/30 hover:text-white"
                    >
                      {page}
                    </Link>
                  ))}
                </nav>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
