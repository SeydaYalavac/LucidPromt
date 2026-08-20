"use client";

import { Share, BookmarkPlus, ExternalLink } from "lucide-react";
import { TrendChat } from "./TrendChat";
import { useTrend } from "@/hooks/useTrendData";

export function TrendDetail({ slug }: { slug: string }) {
  const { data, error, isLoading } = useTrend(slug);
  if (isLoading) return <div className="mx-auto min-h-screen max-w-5xl px-6 pt-32"><div className="h-80 animate-pulse rounded-3xl bg-[#111114]" /></div>;
  if (error || !data) return <div className="mx-auto min-h-screen max-w-5xl px-6 pt-40 text-[#8B8B93]">This live trend is not available yet.</div>;
  const { trend, signals, mode } = data;
  const firstDetected = new Date(trend.first_seen_at).toLocaleString([], { dateStyle: "medium", timeStyle: "short" });
  const stats = [
    { label: "VELOCITY", val: trend.velocity_score },
    { label: "REACH", val: trend.reach_score },
    { label: "NOVELTY", val: trend.novelty_score },
  ];

  return (
    <div className="mx-auto max-w-5xl px-6 pb-24 pt-32">
      <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-[#06b6d4]">Global pulse · {trend.score}</span>
            {mode === "demo" && <span className="rounded-full border border-amber-300/30 px-3 py-1 text-[10px] font-bold tracking-widest text-amber-200">DEMO DATA</span>}
          </div>
          <h1 className="mt-6 max-w-4xl text-[clamp(40px,6vw,76px)] font-bold leading-[0.98] tracking-tighter text-white">{trend.title}</h1>
          <div className="mt-5 flex flex-wrap items-center gap-4 text-sm font-medium text-[#8B8B93]">
            <span className="font-bold text-[#06b6d4]">↑ {Math.round(trend.growth_percent || trend.velocity_score)}%</span>
            <span>{trend.source_count} independent sources</span>
            <span>First detected {firstDetected}</span>
          </div>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-medium text-white"><BookmarkPlus size={16} /> Save</button>
          <button onClick={() => navigator.share?.({ title: trend.title, url: window.location.href })} className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-medium text-white"><Share size={16} /> Share</button>
        </div>
      </div>

      <div className="mt-16 grid grid-cols-1 gap-12 md:grid-cols-12">
        <div className="space-y-12 md:col-span-8">
          <section>
            <p className="mb-6 text-sm font-bold uppercase tracking-[0.2em] text-[#8B8B93]">The why layer</p>
            {trend.why_status === "complete" ? (
              <div className="space-y-6">
                {[{ label: "What happened?", value: trend.what_happened }, { label: "Why now?", value: trend.why_now }, { label: "Where it started?", value: trend.where_started }].map((item, index) => (
                  <article key={item.label} className="border-l-2 border-[#06b6d4] pl-5" style={{ borderColor: index === 1 ? "#8b5cf6" : index === 2 ? "#f97316" : undefined }}>
                    <h2 className="text-xs font-bold uppercase tracking-widest text-[#8B8B93]">{item.label}</h2>
                    <p className="mt-2 text-lg leading-relaxed text-white">{item.value}</p>
                  </article>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-white/5 bg-[#111114] p-6 text-[#8B8B93]">The evidence summary is {trend.why_status}. Raw signals remain available below.</div>
            )}
          </section>

          <section>
            <h2 className="mb-5 text-sm font-bold uppercase tracking-[0.2em] text-[#8B8B93]">Evidence trail</h2>
            <div className="space-y-3">
              {signals.map((signal) => (
                <a key={signal.id} href={signal.source_url} target="_blank" rel="noreferrer" className="flex items-start justify-between gap-4 rounded-2xl border border-white/5 bg-[#111114] p-5 hover:border-white/15">
                  <div><span className="font-mono text-[10px] uppercase tracking-wider text-[#06b6d4]">{signal.source.replace("_", " ")}</span><p className="mt-1 text-sm font-semibold text-white">{signal.title}</p></div>
                  <ExternalLink className="mt-1 shrink-0 text-[#8B8B93]" size={16} />
                </a>
              ))}
            </div>
          </section>

          <TrendChat trendId={trend.id} slug={slug} mode={mode} />
        </div>

        <aside className="space-y-6 md:col-span-4">
          <section className="rounded-3xl border border-white/5 bg-[#111114] p-8">
            <h2 className="mb-8 text-center text-sm font-bold uppercase tracking-[0.2em] text-[#8B8B93]">Trend score</h2>
            <div className="mx-auto mb-8 flex h-32 w-32 items-center justify-center rounded-full border-4 border-[#06b6d4] bg-white/5"><span className="text-4xl font-black text-white">{trend.score}</span></div>
            <div className="space-y-4">
              {stats.map((stat) => <div key={stat.label}><div className="mb-1 flex justify-between text-xs font-bold"><span className="text-[#8B8B93]">{stat.label}</span><span className="text-white">{stat.val}</span></div><div className="h-1.5 rounded-full bg-white/10"><div className="h-full rounded-full bg-white" style={{ width: `${stat.val}%` }} /></div></div>)}
            </div>
          </section>
          <section className="rounded-3xl border border-white/5 bg-[#111114] p-7"><p className="text-xs font-bold uppercase tracking-widest text-[#8B8B93]">Signal quality</p><dl className="mt-5 space-y-3 text-sm"><div className="flex justify-between"><dt className="text-[#8B8B93]">Sources</dt><dd className="font-bold text-white">{trend.source_count}</dd></div><div className="flex justify-between"><dt className="text-[#8B8B93]">Signals</dt><dd className="font-bold text-white">{trend.signal_count}</dd></div></dl></section>
        </aside>
      </div>
    </div>
  );
}
