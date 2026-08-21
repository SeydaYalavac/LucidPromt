"use client";

import Link from "next/link";
import { ArrowUpRight, Bookmark, Check, Share2 } from "lucide-react";
import type { Trend } from "@/types/trends";
import { useSavedTrends } from "@/hooks/useSavedTrends";
import { shareUrl } from "@/lib/share";
import { useState } from "react";
import { captureProductEvent } from "@/lib/analytics";
import { sourceLabel } from "@/lib/trend-content";

type CardSource = "category" | "country" | "explore" | "trending" | "world";

function evidenceTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Time unavailable";
  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    month: "short",
    timeZone: "UTC",
    timeZoneName: "short",
  }).format(date);
}

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
  const evidenceStatus = brief?.corroboration === "multi_source"
    ? `${brief.evidence_source_count} source systems`
    : "Single-source evidence";
  const evidenceProvider = trend.summary_source ? sourceLabel(trend.summary_source.source) : "Source linked";
  const checkedAt = brief?.freshest_observed_at || trend.summary_source?.observed_at || trend.last_seen_at;

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

    <Link href={`/trend/${trend.slug}`} className="mt-9 flex flex-1 flex-col focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">
      <h2 className={`text-balance font-medium leading-[1.05] tracking-[-0.04em] text-white ${featured ? "max-w-4xl text-[clamp(2.3rem,5vw,4.5rem)]" : "text-2xl sm:text-[1.7rem]"}`}>{trend.title}</h2>
      <p className={`mt-4 max-w-[68ch] text-pretty text-[#B3B3BA] ${featured ? "text-base leading-7" : "text-sm leading-6"}`}>{brief?.what_it_is || trend.summary || "A current topic with source evidence attached for review."}</p>
      <div className="mt-auto pt-8">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-white/[0.08] pt-5 font-mono text-[10px] uppercase tracking-[0.12em] text-white/40">
          <span>{evidenceProvider}</span>
          <span aria-hidden="true">·</span>
          <span>{evidenceStatus}</span>
          <span aria-hidden="true">·</span>
          <time dateTime={checkedAt}>{evidenceTime(checkedAt)}</time>
        </div>
        <span className="mt-6 inline-flex min-h-11 w-fit items-center gap-2 rounded-full bg-white px-5 text-sm font-semibold text-black transition-colors group-hover:bg-[#E7E7E9]">Read the full article <ArrowUpRight size={16} /></span>
      </div>
    </Link>
  </article>;
}
