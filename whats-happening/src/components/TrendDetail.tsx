"use client";

import { ArrowUpRight, Bookmark, Check, ExternalLink, Share2 } from "lucide-react";
import { TrendChat } from "./TrendChat";
import { useTrend } from "@/hooks/useTrendData";
import { useSavedTrends } from "@/hooks/useSavedTrends";
import { shareUrl } from "@/lib/share";
import { useState } from "react";
import { captureProductEvent } from "@/lib/analytics";
import { sourceLabel } from "@/lib/trend-content";
import type { TrendBriefEvidence } from "@/types/trends";

function dateLabel(value: string) {
  if (!value) return "Time unavailable";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Time unavailable";
  return date.toLocaleString([], { dateStyle: "medium", timeStyle: "short" });
}

function ClaimSources({
  referenceIds,
  evidenceById,
}: {
  referenceIds: string[];
  evidenceById: Map<string, TrendBriefEvidence>;
}) {
  return <span className="ml-2 inline-flex translate-y-[-0.1em] gap-1 align-baseline">
    {referenceIds.map((referenceId) => {
      const source = evidenceById.get(referenceId);
      if (!source) return null;
      return <a
        key={referenceId}
        href={`#${referenceId}`}
        aria-label={`Source: ${source.source_title}`}
        title={`${source.label}: ${source.source_title}`}
        className="inline-flex h-5 min-w-5 items-center justify-center rounded-full border border-white/15 px-1.5 font-mono text-[9px] leading-none text-white/55 transition-colors hover:border-white/40 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
      >
        {referenceId.replace("source-", "")}
      </a>;
    })}
  </span>;
}

export function TrendDetail({ slug }: { slug: string }) {
  const { saved, toggleSaved } = useSavedTrends();
  const [shareNotice, setShareNotice] = useState(false);
  const { data, error, isLoading } = useTrend(slug);
  if (isLoading) return <div className="mx-auto min-h-screen max-w-6xl px-6 pt-32"><div className="h-80 animate-pulse rounded-2xl bg-[#111114]" /></div>;
  if (error || !data) return <div className="mx-auto min-h-screen max-w-6xl px-6 pt-40 text-[#8B8B93]">This briefing is unavailable because verified production evidence could not be loaded.</div>;

  const { trend, signals, mode } = data;
  const brief = trend.brief;
  const evidence = brief?.evidence || signals.map((signal, index) => ({
    reference_id: `source-${index + 1}`,
    provider: signal.source,
    kind: "signal" as const,
    label: sourceLabel(signal.source),
    source_url: signal.source_url,
    source_title: signal.title,
    published_at: signal.published_at,
    observed_at: signal.observed_at,
    signal_summary: signal.excerpt || `${sourceLabel(signal.source)} evidence observed at ${dateLabel(signal.observed_at)}.`,
  }));
  const evidenceById = new Map(evidence.map((item) => [item.reference_id, item]));
  const article = brief?.article;
  const firstEvidence = evidence[0];
  const stats = [
    { label: "Velocity", value: trend.velocity_score },
    { label: "Reach", value: trend.reach_score },
    { label: "Novelty", value: trend.novelty_score },
  ];
  const isSaved = saved.includes(slug);
  const evidenceStatus = article && article.independent_source_count >= 2
    ? `${article.independent_source_count} independent evidence sites`
    : "Single-source evidence";

  return <main className="mx-auto max-w-6xl px-6 pb-24 pt-32 sm:pt-40">
    <article>
    <header className="border-b border-white/[0.1] pb-12">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-[10px] uppercase tracking-[0.15em] text-white/45">
        <span>Trend article</span><span>{trend.category}</span><span>{trend.country?.name || "Global"}</span><span>Score {trend.score}</span>
        {mode === "demo" && <span className="text-amber-200">Demo data</span>}
      </div>
      <h1 className="mt-6 max-w-5xl text-balance text-[clamp(2.8rem,7vw,6.5rem)] font-medium leading-[0.92] tracking-[-0.065em] text-white">{trend.title}</h1>
      <p className="mt-6 max-w-3xl text-pretty text-lg leading-8 text-[#B3B3BA]">{brief?.what_it_is || trend.summary || "Verified source context is not available for this topic yet."}</p>
      <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2 font-mono text-[10px] uppercase tracking-[0.12em] text-white/40">
        <span>{evidenceStatus}</span><span aria-hidden="true">·</span><time dateTime={article?.last_updated_at || brief?.freshest_observed_at || trend.last_seen_at}>Last updated {dateLabel(article?.last_updated_at || brief?.freshest_observed_at || trend.last_seen_at)}</time>
      </div>
      <div className="mt-8 flex flex-wrap items-center gap-3">
        {firstEvidence && <a href={firstEvidence.source_url} target="_blank" rel="noreferrer" onClick={() => captureProductEvent("source_evidence_viewed", { trend_slug: slug, source_type: firstEvidence.provider })} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-white px-5 text-sm font-semibold text-black hover:bg-[#E7E7E9] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">Open newest evidence <ArrowUpRight size={16} /></a>}
        <button type="button" onClick={() => { if (!isSaved) captureProductEvent("trend_saved", { trend_slug: slug, source: "detail" }); toggleSaved(slug); }} aria-pressed={isSaved} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/15 px-5 text-sm font-medium text-white hover:bg-white/[0.06]">{isSaved ? <Check size={16} /> : <Bookmark size={16} />} {isSaved ? "Saved" : "Save"}</button>
        <button type="button" onClick={async () => { try { const result = await shareUrl(trend.title, window.location.href); if (result === "copied") { setShareNotice(true); window.setTimeout(() => setShareNotice(false), 1800); } } catch {} }} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/15 px-5 text-sm font-medium text-white hover:bg-white/[0.06]"><Share2 size={16} /> {shareNotice ? "Link copied" : "Share"}</button>
      </div>
    </header>

    <div className="mt-14 grid items-start gap-14 lg:grid-cols-[minmax(0,1fr)_19rem]">
      <div>
        {article ? <div className="max-w-[70ch]">
          <div className="mb-14 border-y border-white/[0.1] py-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm font-medium text-white">{article.depth === "deep" ? "Deep research briefing" : "Concise evidence note"}</p>
              <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-white/40">{article.independent_source_count} independently hosted {article.independent_source_count === 1 ? "source" : "sources"}</p>
            </div>
            {article.depth === "concise" && <p className="mt-3 max-w-[64ch] text-sm leading-6 text-[#92929A]">The available evidence does not yet support a long-form account. This page will deepen automatically when a second independent source arrives.</p>}
          </div>

          <div className="space-y-16">
            {article.sections.map((section) => <section key={section.id} aria-labelledby={`${section.id}-heading`}>
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/40">{section.label}</p>
              <h2 id={`${section.id}-heading`} className="mt-3 text-balance text-3xl font-medium tracking-[-0.035em] text-white">{section.heading}</h2>
              <div className={`mt-6 ${section.id === "timeline" ? "border-l border-white/15 pl-6" : "space-y-5"}`}>
                {section.claims.map((claim, index) => <p
                  key={`${section.id}-${index}`}
                  className={`${section.id === "timeline" ? "relative mb-7 before:absolute before:-left-[1.7rem] before:top-[0.65rem] before:h-2 before:w-2 before:rounded-full before:bg-white/45 last:mb-0" : ""} text-pretty text-base leading-8 ${claim.kind === "limitation" ? "text-[#9B9BA3]" : "text-[#C8C8CD]"}`}
                >
                  {claim.text}
                  <ClaimSources referenceIds={claim.evidence_reference_ids} evidenceById={evidenceById} />
                </p>)}
              </div>
            </section>)}
          </div>
        </div> : <div className="rounded-2xl border border-white/[0.1] bg-[#0B0B0D] p-6 text-[#A8A8AF]">A source-backed article is not available. Unsupported sections are intentionally left blank.</div>}

        <section aria-labelledby="evidence-heading" className="mt-16 border-t border-white/[0.1] pt-12">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/40">Evidence trail</p>
          <h2 id="evidence-heading" className="mt-3 text-3xl font-medium tracking-[-0.035em] text-white">Sources behind this article</h2>
          <ol className="mt-8 divide-y divide-white/[0.1] border-y border-white/[0.1]">
            {evidence.map((item, index) => <li id={item.reference_id} key={`${item.kind}-${item.source_url}`} className="scroll-mt-28">
              <a href={item.source_url} target="_blank" rel="noreferrer" onClick={() => captureProductEvent("source_evidence_viewed", { trend_slug: slug, source_type: item.provider })} className="group grid gap-4 py-6 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white sm:grid-cols-[2rem_1fr_auto]">
                <span className="font-mono text-xs tabular-nums text-white/30">{String(index + 1).padStart(2, "0")}</span>
                <span><span className="flex flex-wrap items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-white/40"><span>{item.label}</span><span>·</span><span>{item.kind === "linked_report" ? "Linked report" : "Measured signal"}</span><span>·</span><span>{dateLabel(item.observed_at)}</span></span><span className="mt-3 block text-lg font-medium leading-6 text-white">{item.source_title}</span><span className="mt-3 block max-w-[68ch] text-sm leading-6 text-[#A8A8AF]">{item.signal_summary}</span></span>
                <ExternalLink className="mt-1 shrink-0 text-white/35 transition-colors group-hover:text-white" size={17} />
              </a>
            </li>)}
          </ol>
        </section>

        <div className="mt-16 border-t border-white/[0.1] pt-12">
        <TrendChat
          trendId={trend.id}
          slug={slug}
          mode={mode}
          trendTitle={trend.title}
          evidence={evidence.map((item) => ({ label: item.label, title: item.source_title, url: item.source_url }))}
        />
        </div>
      </div>

      <aside className="space-y-5 lg:sticky lg:top-28">
        <section className="rounded-2xl border border-white/[0.1] bg-[#0B0B0D] p-6">
          <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-white/40">Trend score</p>
          <p className="mt-3 text-6xl font-medium tracking-[-0.06em] text-white">{trend.score}</p>
          <div className="mt-7 space-y-5">{stats.map((stat) => <div key={stat.label}><div className="mb-2 flex justify-between text-xs"><span className="text-white/50">{stat.label}</span><span className="font-medium text-white">{stat.value}</span></div><div className="h-1 bg-white/10"><div className="h-full bg-white/70" style={{ width: `${stat.value}%` }} /></div></div>)}</div>
        </section>
        <section className="rounded-2xl border border-white/[0.1] bg-[#0B0B0D] p-6">
          <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-white/40">Evidence status</p>
          <dl className="mt-5 space-y-4 text-sm"><div className="flex justify-between gap-3"><dt className="text-white/50">Article depth</dt><dd className="text-right font-medium text-white">{article?.depth === "deep" ? "Deep" : "Concise"}</dd></div><div className="flex justify-between gap-3"><dt className="text-white/50">Independent sites</dt><dd className="text-right font-medium text-white">{article?.independent_source_count || brief?.linked_site_count || evidence.length}</dd></div><div className="flex justify-between gap-3"><dt className="text-white/50">Signal systems</dt><dd className="text-right font-medium text-white">{brief?.evidence_source_count || trend.source_count}</dd></div><div className="flex justify-between gap-3"><dt className="text-white/50">Last updated</dt><dd className="text-right font-medium text-white">{dateLabel(article?.last_updated_at || brief?.freshest_observed_at || trend.last_seen_at)}</dd></div><div className="flex justify-between gap-3"><dt className="text-white/50">First detected</dt><dd className="text-right font-medium text-white">{dateLabel(trend.first_seen_at)}</dd></div></dl>
        </section>
      </aside>
    </div>
    </article>
  </main>;
}
