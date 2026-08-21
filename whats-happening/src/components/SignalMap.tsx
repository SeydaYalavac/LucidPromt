"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { geoNaturalEarth1, geoPath } from "d3-geo";
import { feature } from "topojson-client";
import worldAtlas from "world-atlas/countries-110m.json";
import type { FeatureCollection, Geometry } from "geojson";
import type { GeometryCollection, Topology } from "topojson-specification";
import { ArrowRight, ExternalLink, LocateFixed, Minus, Plus, Search, X } from "lucide-react";
import { useMapActivity } from "@/hooks/useTrendData";
import { clampMapScale, mapMarkerRadius } from "@/lib/map";
import type { CountryActivity } from "@/types/trends";
import { TrendUnavailable } from "./TrendStates";

const WIDTH = 960;
const HEIGHT = 520;
const projection = geoNaturalEarth1().fitExtent([[22, 22], [WIDTH - 22, HEIGHT - 22]], { type: "Sphere" });
const path = geoPath(projection);
type Atlas = Topology<{ countries: GeometryCollection }>;
const countries = feature(worldAtlas as unknown as Atlas, (worldAtlas as unknown as Atlas).objects.countries) as FeatureCollection<Geometry>;

type Transform = { x: number; y: number; scale: number };
const INITIAL_TRANSFORM: Transform = { x: 0, y: 0, scale: 1 };

function formatUtc(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Time unavailable";
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "UTC",
    timeZoneName: "short",
  }).format(date);
}

function matchesTopic(activity: CountryActivity, query: string, category: string) {
  const normalized = query.trim().toLocaleLowerCase();
  const countryMatches = !normalized || [activity.country.name, activity.country.code]
    .some((value) => value.toLocaleLowerCase().includes(normalized));
  const topics = activity.rising_topics.filter((topic) => {
    if (category !== "All AI" && topic.category !== category) return false;
    if (countryMatches) return true;
    return [topic.title, topic.summary, topic.category]
      .filter(Boolean)
      .some((value) => value!.toLocaleLowerCase().includes(normalized));
  });
  if (!topics.length) return null;
  return {
    ...activity,
    trend_count: topics.length,
    evidence_count: topics.reduce((sum, topic) => sum + topic.evidence_count, 0),
    source_count: new Set(topics.flatMap((topic) => topic.evidence.map((item) => item.provider))).size,
    latest_observed_at: topics.reduce((latest, topic) =>
      new Date(topic.latest_observed_at).getTime() > new Date(latest).getTime() ? topic.latest_observed_at : latest,
    topics[0].latest_observed_at),
    rising_topics: topics,
  };
}

function CountryDetail({ activity }: { activity: CountryActivity }) {
  return <aside className="rounded-[1.75rem] border border-white/[0.09] bg-[#0B0B0D] p-6 sm:p-7" aria-live="polite">
    <div className="flex items-start justify-between gap-5">
      <div>
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/45">Selected market</p>
        <h2 className="mt-2 text-3xl font-medium tracking-[-0.04em] text-white">{activity.country.name}</h2>
      </div>
      <span className="rounded-full bg-white px-3 py-1.5 font-mono text-xs font-semibold tabular-nums text-black">{activity.evidence_count}</span>
    </div>
    <p className="mt-5 text-sm leading-6 text-[#A8A8AF]">
      {activity.evidence_count} source-attributed evidence {activity.evidence_count === 1 ? "record" : "records"} across {activity.trend_count} current AI {activity.trend_count === 1 ? "topic" : "topics"}. Latest observation: {formatUtc(activity.latest_observed_at)}.
    </p>
    <div className="mt-7 border-t border-white/[0.08] pt-6">
      <h3 className="text-sm font-medium text-white">Rising topics</h3>
      <ol className="mt-4 space-y-6">
        {activity.rising_topics.slice(0, 5).map((topic) => <li key={topic.id}>
          <div className="flex items-start justify-between gap-4">
            <Link href={`/trend/${topic.slug}`} className="text-sm font-medium leading-5 text-white underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-white">{topic.title}</Link>
            <span className="shrink-0 font-mono text-[10px] uppercase tracking-wider text-white/40">velocity {topic.velocity_score}/100</span>
          </div>
          {topic.summary && <p className="mt-2 text-sm leading-6 text-[#8F8F98]">{topic.summary}</p>}
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2">
            {topic.evidence.map((item) => <a key={item.id} href={item.source_url} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center gap-1.5 text-xs font-medium text-[#D8D8DC] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-white">
              {item.provider_label} <ExternalLink size={12} aria-hidden="true" />
              <span className="sr-only"> for {topic.title}, opens in a new tab</span>
            </a>)}
          </div>
        </li>)}
      </ol>
      {activity.rising_topics.length > 5 && <p className="mt-5 font-mono text-[10px] uppercase tracking-wider text-white/35">{activity.rising_topics.length - 5} more matching topics in the list below</p>}
    </div>
    <p className="mt-7 border-t border-white/[0.08] pt-5 text-xs leading-5 text-white/40">Market attribution identifies where an official source observed attention. Trend records use “earliest attributed geography” only when one earliest market is supported. Neither label establishes where a topic began, why it rose, or whether momentum will last.</p>
  </aside>;
}

export function SignalMap() {
  const { data, error, isLoading } = useMapActivity();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All AI");
  const [transform, setTransform] = useState<Transform>(INITIAL_TRANSFORM);
  const [selectedCode, setSelectedCode] = useState<string | null>(null);
  const dragStart = useRef<{ x: number; y: number; originX: number; originY: number } | null>(null);
  const categories = useMemo(() => ["All AI", ...new Set((data?.activities || []).flatMap((activity) => activity.rising_topics.map((topic) => topic.category)))], [data?.activities]);
  const activities = useMemo(() => (data?.activities || []).flatMap((activity) => {
    const match = matchesTopic(activity, query, category);
    return match ? [match] : [];
  }), [category, data?.activities, query]);
  const selected = activities.find((activity) => activity.country.code === selectedCode) || activities[0] || null;
  const maximumEvidence = Math.max(0, ...activities.map((activity) => activity.evidence_count));

  function zoom(amount: number) {
    setTransform((current) => ({ ...current, scale: clampMapScale(current.scale + amount) }));
  }
  function reset() {
    setTransform(INITIAL_TRANSFORM);
    setSelectedCode(null);
  }

  return <div className="mx-auto min-h-screen max-w-[1600px] px-4 pb-20 pt-28 sm:px-6 sm:pt-32">
    <header className="grid gap-6 border-b border-white/[0.08] pb-8 lg:grid-cols-[1fr_34rem] lg:items-end">
      <div>
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-white/45">Source-attributed AI activity</p>
        <h1 className="mt-3 max-w-4xl text-balance text-[clamp(3rem,7vw,6.5rem)] font-medium leading-[0.9] tracking-[-0.065em] text-white">Global AI activity, mapped.</h1>
      </div>
      <div className="max-w-[60ch] lg:pb-1">
        <p className="text-pretty text-base leading-7 text-[#A8A8AF]">See where current AI topics appear in official source evidence, compare market activity, and open the reporting behind every signal.</p>
        {data && <p className="mt-4 font-mono text-xs uppercase tracking-[0.12em] text-white/45"><span className="tabular-nums text-white/75">{data.coverage.countries_with_evidence}</span> markets · <span className="tabular-nums text-white/75">{data.coverage.attributed_evidence_count}</span> evidence records · {formatUtc(data.coverage.as_of)}</p>}
      </div>
    </header>

    <div className="mt-8 grid gap-5 xl:grid-cols-[minmax(0,1fr)_390px] xl:items-start">
      <section className="relative min-h-[660px] overflow-hidden rounded-[2rem] border border-white/[0.09] bg-[#08090A]" aria-label="Interactive world AI activity map" aria-describedby="map-evidence-limit">
        <div className="absolute left-4 right-4 top-4 z-20 grid gap-2 sm:left-6 sm:right-auto sm:grid-cols-[minmax(240px,330px)_190px]">
          <label className="flex min-h-12 items-center gap-3 rounded-2xl border border-white/10 bg-[#0B0B0D]/95 px-4 shadow-2xl backdrop-blur-xl"><Search size={16} className="text-white/40" aria-hidden="true" /><span className="sr-only">Search map activity</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search market or AI topic" className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/35" />{query && <button type="button" onClick={() => setQuery("")} aria-label="Clear map search" className="flex min-h-11 min-w-11 items-center justify-center text-white/40 hover:text-white"><X size={15} /></button>}</label>
          <label className="sr-only" htmlFor="map-category">AI topic category</label><select id="map-category" value={category} onChange={(event) => setCategory(event.target.value)} className="min-h-12 rounded-2xl border border-white/10 bg-[#0B0B0D]/95 px-4 text-sm text-white outline-none backdrop-blur-xl focus:border-white/50">{categories.map((item) => <option key={item}>{item}</option>)}</select>
        </div>

        <div className="absolute bottom-6 right-5 z-20 flex flex-col gap-2"><button type="button" onClick={() => zoom(0.5)} className="flex min-h-11 min-w-11 items-center justify-center rounded-full border border-white/10 bg-[#0B0B0D]/95 text-white hover:bg-[#17171B] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-white" aria-label="Zoom map in"><Plus size={17} /></button><button type="button" onClick={() => zoom(-0.5)} className="flex min-h-11 min-w-11 items-center justify-center rounded-full border border-white/10 bg-[#0B0B0D]/95 text-white hover:bg-[#17171B] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-white" aria-label="Zoom map out"><Minus size={17} /></button><button type="button" onClick={reset} className="flex min-h-11 min-w-11 items-center justify-center rounded-full border border-white/10 bg-[#0B0B0D]/95 text-white hover:bg-[#17171B] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-white" aria-label="Reset map position"><LocateFixed size={17} /></button></div>

        <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label={`World map with ${activities.length} markets showing source-attributed AI activity`} tabIndex={0} onKeyDown={(event) => { if (event.key === "+" || event.key === "=") zoom(0.5); if (event.key === "-") zoom(-0.5); if (event.key === "0") reset(); if (event.key === "ArrowLeft") setTransform((value) => ({ ...value, x: value.x + 24 })); if (event.key === "ArrowRight") setTransform((value) => ({ ...value, x: value.x - 24 })); if (event.key === "ArrowUp") setTransform((value) => ({ ...value, y: value.y + 24 })); if (event.key === "ArrowDown") setTransform((value) => ({ ...value, y: value.y - 24 })); }} onWheel={(event) => { event.preventDefault(); zoom(event.deltaY > 0 ? -0.2 : 0.2); }} onPointerDown={(event) => { event.currentTarget.setPointerCapture(event.pointerId); dragStart.current = { x: event.clientX, y: event.clientY, originX: transform.x, originY: transform.y }; }} onPointerMove={(event) => { if (!dragStart.current) return; const ratio = WIDTH / event.currentTarget.getBoundingClientRect().width; setTransform((value) => ({ ...value, x: dragStart.current!.originX + (event.clientX - dragStart.current!.x) * ratio, y: dragStart.current!.originY + (event.clientY - dragStart.current!.y) * ratio })); }} onPointerUp={() => { dragStart.current = null; }} onPointerCancel={() => { dragStart.current = null; }} className="absolute inset-0 h-full w-full touch-none cursor-grab focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white/70">
          <g transform={`translate(${transform.x} ${transform.y}) scale(${transform.scale})`}>
            <path d={path({ type: "Sphere" }) || undefined} fill="#08090A" stroke="rgba(255,255,255,.1)" strokeWidth={0.8 / transform.scale} />
            {countries.features.map((country, index) => <path key={country.id == null ? index : String(country.id)} d={path(country) || undefined} fill="#111317" stroke="rgba(255,255,255,.12)" strokeWidth={0.55 / transform.scale} />)}
            {activities.map((activity) => {
              const { latitude, longitude } = activity.country;
              if (latitude == null || longitude == null) return null;
              const point = projection([longitude, latitude]);
              if (!point) return null;
              const active = selected?.country.code === activity.country.code;
              const radius = mapMarkerRadius(activity.evidence_count, maximumEvidence);
              return <g key={activity.country.code} transform={`translate(${point[0]} ${point[1]})`} role="button" aria-label={`${activity.country.name}: ${activity.evidence_count} evidence records across ${activity.trend_count} AI topics`} tabIndex={0} onClick={(event) => { event.stopPropagation(); setSelectedCode(activity.country.code); }} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); setSelectedCode(activity.country.code); } }} className="cursor-pointer outline-none focus-visible:[&_circle]:stroke-white">
                <circle r={(active ? radius + 4 : radius) / transform.scale} fill={active ? "rgba(245,245,245,.22)" : "rgba(245,245,245,.12)"} stroke={active ? "#F5F5F5" : "rgba(245,245,245,.68)"} strokeWidth={(active ? 1.8 : 1.1) / transform.scale} />
                <circle r={2.3 / transform.scale} fill="#F5F5F5" />
              </g>;
            })}
          </g>
        </svg>

        <div className="absolute bottom-5 left-5 z-10 max-w-[calc(100%-6rem)] rounded-xl border border-white/[0.07] bg-[#0B0B0D]/90 px-4 py-3 font-mono uppercase backdrop-blur-xl"><p className="text-[10px] tracking-widest text-white/45">Circle size = evidence count · drag to pan · 0 to reset</p><p className="mt-1.5 text-[8px] tracking-wider text-white/20">Boundary data: Natural Earth via world-atlas · public domain</p></div>
        {error && <div className="absolute inset-x-5 top-28 z-30 sm:inset-x-auto sm:left-6 sm:w-[470px]"><TrendUnavailable message="The map remains available, but source-attributed activity could not be loaded." /></div>}
        {!error && !isLoading && !activities.length && <div className="absolute left-1/2 top-1/2 z-10 w-[min(90%,420px)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-white/[0.08] bg-[#0B0B0D]/94 p-6 text-center text-sm leading-6 text-[#A8A8AF]">No source-attributed AI activity matches this filter. Countries without current evidence remain unmarked.</div>}
        {isLoading && <div className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 font-mono text-xs uppercase tracking-widest text-white/40">Loading live evidence…</div>}
      </section>
      {selected ? <CountryDetail activity={selected} /> : <aside className="rounded-[1.75rem] border border-white/[0.09] bg-[#0B0B0D] p-7 text-sm leading-6 text-[#8F8F98]">Choose a marked market to inspect its current AI topics, timestamps, and direct source evidence.</aside>}
    </div>

    <section className="mt-14 border-t border-white/[0.08] pt-10" aria-labelledby="activity-list-heading">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div><p className="font-mono text-xs uppercase tracking-[0.16em] text-white/40">Accessible map alternative</p><h2 id="activity-list-heading" className="mt-2 text-3xl font-medium tracking-[-0.04em] text-white">Browse activity as a list.</h2></div>
        <p className="max-w-md text-sm leading-6 text-[#8F8F98]">The list uses the same filters, evidence counts, topics, and source links as the map.</p>
      </div>
      <div className="mt-7 divide-y divide-white/[0.08] border-y border-white/[0.08]">
        {activities.map((activity) => <details key={activity.country.code} className="group py-1">
          <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-5 py-4 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-white">
            <span><span className="text-base font-medium text-white">{activity.country.name}</span><span className="ml-3 font-mono text-[10px] uppercase tracking-wider text-white/35">{formatUtc(activity.latest_observed_at)}</span></span>
            <span className="flex items-center gap-5"><span className="font-mono text-xs tabular-nums text-white/55">{activity.trend_count} topics · {activity.evidence_count} evidence</span><Plus size={16} className="text-white/45 group-open:rotate-45" aria-hidden="true" /></span>
          </summary>
          <div className="grid gap-4 pb-7 sm:grid-cols-2 xl:grid-cols-3">
            {activity.rising_topics.map((topic) => <article key={topic.id} className="rounded-2xl border border-white/[0.08] bg-[#0B0B0D] p-5">
              <p className="font-mono text-[10px] uppercase tracking-wider text-white/35">Velocity {topic.velocity_score}/100 · {topic.evidence_count} evidence</p>
              <h3 className="mt-2 text-sm font-medium leading-5 text-white"><Link href={`/trend/${topic.slug}`} className="hover:underline">{topic.title}</Link></h3>
              {topic.summary && <p className="mt-3 text-sm leading-6 text-[#8F8F98]">{topic.summary}</p>}
              <div className="mt-4 flex flex-wrap gap-3">{topic.evidence.map((item) => <a key={item.id} href={item.source_url} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center gap-1.5 text-xs text-[#D8D8DC] hover:text-white">{item.provider_label}<ExternalLink size={12} /><span className="sr-only"> for {topic.title}, opens in a new tab</span></a>)}</div>
            </article>)}
          </div>
        </details>)}
      </div>
      <p id="map-evidence-limit" className="mt-6 max-w-[70ch] text-xs leading-5 text-white/40">Only countries with current, source-attributed AI evidence are marked. A market tag describes the feed where attention was observed, not exact origin, cause, total national activity, or a forecast. The map refreshes from the same 10-minute ingestion cycle as the live trend feed.</p>
      <Link href="/how-it-works" className="mt-5 inline-flex min-h-11 items-center gap-2 text-sm font-medium text-white hover:text-white/70">Read the evidence method <ArrowRight size={15} /></Link>
    </section>
  </div>;
}
