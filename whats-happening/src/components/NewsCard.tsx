"use client";

import Link from "next/link";
import { ArrowUpRight, Bookmark, Check, ExternalLink, Share2 } from "lucide-react";
import type { Trend } from "@/types/trends";
import { useSavedTrends } from "@/hooks/useSavedTrends";
import { shareUrl } from "@/lib/share";
import { useState } from "react";
import { captureProductEvent } from "@/lib/analytics";
import { sourceLabel } from "@/lib/trend-content";

export function NewsCard({
  trend,
  featured = false,
  rank,
  analyticsSource,
}: {
  trend: Trend;
  featured?: boolean;
  rank?: number;
  analyticsSource: "explore" | "world";
}) {
  const { saved, toggleSaved } = useSavedTrends();
  const [shareState, setShareState] = useState<"idle" | "copied">("idle");
  const isSaved = saved.includes(trend.slug);

  async function share() {
    try {
      const result = await shareUrl(trend.title, `${window.location.origin}/trend/${trend.slug}`);
      if (result === "copied") { setShareState("copied"); window.setTimeout(() => setShareState("idle"), 1800); }
    } catch { /* A cancelled native share needs no error state. */ }
  }

  return <article className={`group relative flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-white/[0.08] bg-[#0B0B0D] p-6 transition-colors hover:border-white/20 sm:p-7 ${featured ? "min-h-[440px] sm:p-10" : "min-h-[320px]"}`}>
    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_0%,rgba(6,182,212,.12),transparent_38%)] opacity-60" />
    <div className="relative flex items-start justify-between gap-5">
      <div className="flex items-center gap-3"><span className="font-mono text-xs tabular-nums text-white/25">{String(rank || trend.score).padStart(2, "0")}</span><span className="rounded-full border border-white/10 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-[#67E8F9]">{trend.category}</span></div>
      <div className="flex gap-1">
        <button type="button" onClick={() => { if (!isSaved) captureProductEvent("trend_saved", { trend_slug: trend.slug, source: analyticsSource }); toggleSaved(trend.slug); }} className="flex min-h-11 min-w-11 items-center justify-center rounded-full text-white/45 hover:bg-white/[0.07] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white" aria-label={isSaved ? `Remove ${trend.title} from saved trends` : `Save ${trend.title}`} aria-pressed={isSaved}>{isSaved ? <Check size={17} className="text-[#67E8F9]" /> : <Bookmark size={17} />}</button>
        <button type="button" onClick={share} className="flex min-h-11 min-w-11 items-center justify-center rounded-full text-white/45 hover:bg-white/[0.07] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white" aria-label={`Share ${trend.title}`}>{shareState === "copied" ? <Check size={17} className="text-[#67E8F9]" /> : <Share2 size={17} />}</button>
      </div>
    </div>
    <Link href={`/trend/${trend.slug}`} className="relative mt-auto block pt-12 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">
      <p className="font-mono text-xs uppercase tracking-[0.16em] text-[#8B8B93]">{trend.country?.name || "Country not attributed"} · score {trend.score}</p>
      <h2 className={`mt-4 text-balance font-medium leading-[1.02] tracking-[-0.045em] text-white ${featured ? "max-w-4xl text-[clamp(2.5rem,6vw,5rem)]" : "text-2xl sm:text-3xl"}`}>{trend.title}</h2>
      {trend.summary && <p className={`max-w-[58ch] text-pretty text-[#A1A1AA] ${featured ? "mt-6 text-base leading-7" : "mt-4 line-clamp-3 text-sm leading-6"}`}>{trend.summary}</p>}
      <span className="mt-7 inline-flex items-center gap-2 text-sm font-medium text-white">Follow the evidence <ArrowUpRight size={16} className="transition-transform duration-150 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" /></span>
    </Link>
    {trend.summary_source && <a href={trend.summary_source.source_url} target="_blank" rel="noreferrer" onClick={() => captureProductEvent("source_evidence_viewed", { trend_slug: trend.slug, source_type: trend.summary_source?.source || "unknown" })} className="relative mt-4 inline-flex w-fit items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-white/40 transition-colors hover:text-[#67E8F9] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">Source: {sourceLabel(trend.summary_source.source)} <ExternalLink size={12} /></a>}
  </article>;
}
