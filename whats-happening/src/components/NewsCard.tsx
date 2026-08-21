"use client";

import Link from "next/link";
import { ArrowUpRight, Bookmark, Check, ExternalLink, Share2 } from "lucide-react";
import type { Trend } from "@/types/trends";
import { useSavedTrends } from "@/hooks/useSavedTrends";
import { shareUrl } from "@/lib/share";
import { useState } from "react";
import { captureProductEvent } from "@/lib/analytics";

type CardSource = "category" | "country" | "explore" | "trending" | "world";

export function NewsCard({
  trend,
  featured = false,
  rank,
  analyticsSource,
}: {
  trend: Trend;
  featured?: boolean;
  rank?: number;
  analyticsSource: CardSource;
}) {
  const { saved, toggleSaved } = useSavedTrends();
  const [shareState, setShareState] = useState<"idle" | "copied">("idle");
  const isSaved = saved.includes(trend.slug);
  const brief = trend.brief;
  const evidence = brief?.evidence.slice(0, featured ? 3 : 2) || [];

  async function share() {
    try {
      const result = await shareUrl(trend.title, `${window.location.origin}/trend/${trend.slug}`);
      if (result === "copied") {
        setShareState("copied");
        window.setTimeout(() => setShareState("idle"), 1800);
      }
    } catch { /* A cancelled native share needs no error state. */ }
  }

  return <article className={`group flex h-full flex-col rounded-2xl border border-white/[0.1] bg-[#0B0B0D] p-6 transition-colors hover:border-white/25 ${featured ? "sm:p-9" : "sm:p-7"}`}>
    <div className="flex items-start justify-between gap-5">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[10px] uppercase tracking-[0.14em] text-white/45">
        <span className="tabular-nums text-white/25">{String(rank || trend.score).padStart(2, "0")}</span>
        <span>{trend.category}</span>
        <span>{trend.country?.name || "Global"}</span>
        <span>Score {trend.score}</span>
      </div>
      <div className="flex shrink-0 gap-1">
        <button type="button" onClick={() => { if (!isSaved) captureProductEvent("trend_saved", { trend_slug: trend.slug, source: analyticsSource }); toggleSaved(trend.slug); }} className="flex min-h-11 min-w-11 items-center justify-center rounded-full text-white/45 hover:bg-white/[0.07] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white" aria-label={isSaved ? `Remove ${trend.title} from saved trends` : `Save ${trend.title}`} aria-pressed={isSaved}>{isSaved ? <Check size={17} /> : <Bookmark size={17} />}</button>
        <button type="button" onClick={share} className="flex min-h-11 min-w-11 items-center justify-center rounded-full text-white/45 hover:bg-white/[0.07] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white" aria-label={`Share ${trend.title}`}>{shareState === "copied" ? <Check size={17} /> : <Share2 size={17} />}</button>
      </div>
    </div>

    <Link href={`/trend/${trend.slug}`} className="mt-9 block focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">
      <h2 className={`text-balance font-medium leading-[1.05] tracking-[-0.04em] text-white ${featured ? "max-w-4xl text-[clamp(2.3rem,5vw,4.5rem)]" : "text-2xl sm:text-[1.7rem]"}`}>{trend.title}</h2>
      <p className={`mt-4 max-w-[68ch] text-pretty text-[#B3B3BA] ${featured ? "text-base leading-7" : "text-sm leading-6"}`}>{brief?.what_it_is || trend.summary || "A current topic with source evidence attached for review."}</p>
    </Link>

    {brief ? <div className={`mt-7 grid gap-5 border-t border-white/[0.08] pt-6 ${featured ? "sm:grid-cols-2" : ""}`}>
      <div>
        <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-white/40">Why it is trending</p>
        <p className="mt-2 text-sm leading-6 text-[#D0D0D5]">{brief.why_trending}</p>
      </div>
      <div>
        <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-white/40">Useful for</p>
        <p className="mt-2 text-sm leading-6 text-[#D0D0D5]">{brief.useful_for}</p>
      </div>
    </div> : null}

    <div className="mt-auto pt-7">
      {brief && <div className="border-t border-white/[0.08] pt-5">
        <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-white/40">What to do next</p>
        <p className="mt-2 text-sm leading-6 text-[#A8A8AF]">{brief.next_step}</p>
      </div>}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
        <Link href={`/trend/${trend.slug}`} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-white px-5 text-sm font-semibold text-black transition-colors hover:bg-[#E7E7E9] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">Open briefing <ArrowUpRight size={16} /></Link>
        {!!evidence.length && <div className="flex flex-wrap items-center gap-3">
          {evidence.map((item) => <a key={item.source_url} href={item.source_url} target="_blank" rel="noreferrer" onClick={() => captureProductEvent("source_evidence_viewed", { trend_slug: trend.slug, source_type: item.provider })} className="inline-flex min-h-11 items-center gap-1.5 text-xs text-white/55 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">{item.label} <ExternalLink size={12} /></a>)}
        </div>}
      </div>
    </div>
  </article>;
}
