"use client";

import { ArrowUpRight, Bookmark, Check, ExternalLink, Share2 } from "lucide-react";
import { TrendChat } from "./TrendChat";
import { useTrend } from "@/hooks/useTrendData";
import { useSavedTrends } from "@/hooks/useSavedTrends";
import { shareUrl } from "@/lib/share";
import { useState } from "react";
import { captureProductEvent } from "@/lib/analytics";
import { sourceLabel } from "@/lib/trend-content";

function dateLabel(value: string) {
  if (!value) return "Time unavailable";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Time unavailable";
  return date.toLocaleString([], { dateStyle: "medium", timeStyle: "short" });
}

export function TrendDetail({ slug }: { slug: string }) {
  const { saved, toggleSaved } = useSavedTrends();
  const [shareNotice, setShareNotice] = useState(false);
  const { data, error, isLoading } = useTrend(slug);
  if (isLoading) return <div className="mx-auto min-h-screen max-w-6xl px-6 pt-32"><div className="h-80 animate-pulse rounded-2xl bg-[#111114]" /></div>;
  if (error || !data) return <div className="mx-auto min-h-screen max-w-6xl px-6 pt-40 text-[#8B8B93]">This briefing is unavailable because verified production evidence could not be loaded.</div>;

  const { trend, signals, mode } = data;
  const brief = trend.brief;
  const evidence = brief?.evidence || signals.map((signal) => ({
    provider: signal.source,
    kind: "signal" as const,
    label: sourceLabel(signal.source),
    source_url: signal.source_url,
    source_title: signal.title,
    published_at: signal.published_at,
    observed_at: signal.observed_at,
    signal_summary: signal.excerpt || `${sourceLabel(signal.source)} evidence observed at ${dateLabel(signal.observed_at)}.`,
  }));
  const firstEvidence = evidence[0];
  const stats = [
    { label: "Velocity", value: trend.velocity_score },
    { label: "Reach", value: trend.reach_score },
    { label: "Novelty", value: trend.novelty_score },
  ];
  const isSaved = saved.includes(slug);

  return <main className="mx-auto max-w-6xl px-6 pb-24 pt-32 sm:pt-40">
    <header className="border-b border-white/[0.1] pb-12">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-[10px] uppercase tracking-[0.15em] text-white/45">
        <span>{trend.category}</span><span>{trend.country?.name || "Global"}</span><span>Score {trend.score}</span>
        {mode === "demo" && <span className="text-amber-200">Demo data</span>}
      </div>
      <h1 className="mt-6 max-w-5xl text-balance text-[clamp(2.8rem,7vw,6.5rem)] font-medium leading-[0.92] tracking-[-0.065em] text-white">{trend.title}</h1>
      <p className="mt-6 max-w-3xl text-pretty text-lg leading-8 text-[#B3B3BA]">{brief?.what_it_is || trend.summary || "Verified source context is not available for this topic yet."}</p>
      <div className="mt-8 flex flex-wrap items-center gap-3">
        {firstEvidence && <a href={firstEvidence.source_url} target="_blank" rel="noreferrer" onClick={() => captureProductEvent("source_evidence_viewed", { trend_slug: slug, source_type: firstEvidence.provider })} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-white px-5 text-sm font-semibold text-black hover:bg-[#E7E7E9] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">Open newest evidence <ArrowUpRight size={16} /></a>}
        <button type="button" onClick={() => { if (!isSaved) captureProductEvent("trend_saved", { trend_slug: slug, source: "detail" }); toggleSaved(slug); }} aria-pressed={isSaved} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/15 px-5 text-sm font-medium text-white hover:bg-white/[0.06]">{isSaved ? <Check size={16} /> : <Bookmark size={16} />} {isSaved ? "Saved" : "Save"}</button>
        <button type="button" onClick={async () => { try { const result = await shareUrl(trend.title, window.location.href); if (result === "copied") { setShareNotice(true); window.setTimeout(() => setShareNotice(false), 1800); } } catch {} }} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/15 px-5 text-sm font-medium text-white hover:bg-white/[0.06]"><Share2 size={16} /> {shareNotice ? "Link copied" : "Share"}</button>
      </div>
    </header>

    <div className="mt-12 grid items-start gap-12 lg:grid-cols-[minmax(0,1fr)_19rem]">
      <div className="space-y-14">
        <section aria-labelledby="briefing-heading">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div><p className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/40">Research briefing</p><h2 id="briefing-heading" className="mt-2 text-3xl font-medium tracking-[-0.035em] text-white">Why this matters now</h2></div>
            {brief && <span className="text-xs text-white/45">{brief.corroboration === "multi_source" ? `${brief.evidence_source_count} independent systems` : "Single-source signal"}</span>}
          </div>
          {brief ? <dl className="mt-8 divide-y divide-white/[0.1] border-y border-white/[0.1]">
            {[
              ["What it is", brief.what_it_is],
              ["Why it is trending", brief.why_trending],
              ["What it is useful for", brief.useful_for],
              ["What to do next", brief.next_step],
            ].map(([label, value]) => <div key={label} className="grid gap-3 py-6 sm:grid-cols-[10rem_1fr]"><dt className="text-sm font-medium text-white">{label}</dt><dd className="text-base leading-7 text-[#B3B3BA]">{value}</dd></div>)}
          </dl> : <div className="mt-8 rounded-2xl border border-white/[0.1] bg-[#0B0B0D] p-6 text-[#A8A8AF]">A source-backed explanation is not available. This topic will stay out of discovery cards until evidence can support it.</div>}
          {brief && <p className="mt-4 text-sm leading-6 text-white/45">{brief.caution}</p>}
        </section>

        <section aria-labelledby="evidence-heading">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/40">Evidence trail</p>
          <h2 id="evidence-heading" className="mt-2 text-3xl font-medium tracking-[-0.035em] text-white">Read the underlying sources</h2>
          <div className="mt-7 grid gap-4">
            {evidence.map((item) => <a key={`${item.kind}-${item.source_url}`} href={item.source_url} target="_blank" rel="noreferrer" onClick={() => captureProductEvent("source_evidence_viewed", { trend_slug: slug, source_type: item.provider })} className="group rounded-2xl border border-white/[0.1] bg-[#0B0B0D] p-6 hover:border-white/25 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
              <div className="flex items-start justify-between gap-5"><div><div className="flex flex-wrap items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-white/40"><span>{item.label}</span><span>·</span><span>{item.kind === "linked_report" ? "Linked report" : "Measured signal"}</span><span>·</span><span>{dateLabel(item.observed_at)}</span></div><h3 className="mt-3 text-lg font-medium leading-6 text-white">{item.source_title}</h3><p className="mt-3 max-w-[70ch] text-sm leading-6 text-[#A8A8AF]">{item.signal_summary}</p></div><ExternalLink className="mt-1 shrink-0 text-white/40 transition-colors group-hover:text-white" size={17} /></div>
            </a>)}
          </div>
        </section>

        <TrendChat trendId={trend.id} slug={slug} mode={mode} />
      </div>

      <aside className="space-y-5 lg:sticky lg:top-28">
        <section className="rounded-2xl border border-white/[0.1] bg-[#0B0B0D] p-6">
          <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-white/40">Trend score</p>
          <p className="mt-3 text-6xl font-medium tracking-[-0.06em] text-white">{trend.score}</p>
          <div className="mt-7 space-y-5">{stats.map((stat) => <div key={stat.label}><div className="mb-2 flex justify-between text-xs"><span className="text-white/50">{stat.label}</span><span className="font-medium text-white">{stat.value}</span></div><div className="h-1 bg-white/10"><div className="h-full bg-white/70" style={{ width: `${stat.value}%` }} /></div></div>)}</div>
        </section>
        <section className="rounded-2xl border border-white/[0.1] bg-[#0B0B0D] p-6">
          <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-white/40">Evidence status</p>
          <dl className="mt-5 space-y-4 text-sm"><div className="flex justify-between gap-3"><dt className="text-white/50">Signal systems</dt><dd className="text-right font-medium text-white">{brief?.evidence_source_count || trend.source_count}</dd></div><div className="flex justify-between gap-3"><dt className="text-white/50">Linked websites</dt><dd className="text-right font-medium text-white">{brief?.linked_site_count || evidence.length}</dd></div><div className="flex justify-between gap-3"><dt className="text-white/50">Freshest check</dt><dd className="text-right font-medium text-white">{dateLabel(brief?.freshest_observed_at || trend.last_seen_at)}</dd></div><div className="flex justify-between gap-3"><dt className="text-white/50">First detected</dt><dd className="text-right font-medium text-white">{dateLabel(trend.first_seen_at)}</dd></div></dl>
        </section>
      </aside>
    </div>
  </main>;
}
