"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { geoNaturalEarth1, geoPath } from "d3-geo";
import { feature } from "topojson-client";
import worldAtlas from "world-atlas/countries-110m.json";
import type { FeatureCollection, Geometry } from "geojson";
import type { GeometryCollection, Topology } from "topojson-specification";
import { Crosshair, LocateFixed, Minus, Plus, Search, X } from "lucide-react";
import { discoveryCategories, matchesTrend } from "@/lib/discovery";
import { useTrends } from "@/hooks/useTrendData";
import { TrendUnavailable } from "./TrendStates";
import { clampMapScale } from "@/lib/map";

const WIDTH = 960;
const HEIGHT = 520;
const projection = geoNaturalEarth1().fitExtent([[22, 22], [WIDTH - 22, HEIGHT - 22]], { type: "Sphere" });
const path = geoPath(projection);
type Atlas = Topology<{ countries: GeometryCollection }>;
const countries = feature(worldAtlas as unknown as Atlas, (worldAtlas as unknown as Atlas).objects.countries) as FeatureCollection<Geometry>;

type Transform = { x: number; y: number; scale: number };
const INITIAL_TRANSFORM: Transform = { x: 0, y: 0, scale: 1 };

export function SignalMap() {
  const { data, error } = useTrends({ limit: 50 });
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [transform, setTransform] = useState<Transform>(INITIAL_TRANSFORM);
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const dragStart = useRef<{ x: number; y: number; originX: number; originY: number } | null>(null);
  const trends = useMemo(() => (data?.trends || []).filter((trend) => trend.country?.latitude != null && trend.country?.longitude != null).filter((trend) => matchesTrend(trend, query, category)), [category, data?.trends, query]);
  const selected = trends.find((trend) => trend.slug === selectedSlug) || null;

  function zoom(amount: number) { setTransform((current) => ({ ...current, scale: clampMapScale(current.scale + amount) })); }
  function reset() { setTransform(INITIAL_TRANSFORM); setSelectedSlug(null); }

  return <div className="mx-auto min-h-screen max-w-[1600px] px-4 pb-16 pt-28 sm:px-6 sm:pt-32">
    <header className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="font-mono text-xs uppercase tracking-[0.22em] text-[#67E8F9]">Country-attributed signals</p><h1 className="mt-3 text-[clamp(2.7rem,7vw,6rem)] font-medium leading-none tracking-[-0.065em] text-white">The signal map.</h1></div><p className="max-w-md text-sm leading-6 text-[#8F8F98]">Country pins reflect the earliest country-tagged observation available. They do not claim where a topic was invented.</p></header>
    <section className="relative min-h-[80vh] overflow-hidden rounded-[2rem] border border-white/[0.08] bg-[#08090A]" aria-label="Interactive world trend map">
      <div className="absolute left-4 right-4 top-4 z-20 grid gap-2 sm:left-6 sm:right-auto sm:grid-cols-[minmax(220px,320px)_170px]">
        <label className="flex min-h-12 items-center gap-3 rounded-2xl border border-white/10 bg-[#0B0B0D]/95 px-4 shadow-2xl backdrop-blur-xl"><Search size={16} className="text-white/40" /><span className="sr-only">Search map</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search a trend or country" className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/35" />{query && <button type="button" onClick={() => setQuery("")} aria-label="Clear map search" className="text-white/40 hover:text-white"><X size={15} /></button>}</label>
        <label className="sr-only" htmlFor="map-category">Map category</label><select id="map-category" value={category} onChange={(event) => setCategory(event.target.value)} className="min-h-12 rounded-2xl border border-white/10 bg-[#0B0B0D]/95 px-4 text-sm text-white outline-none backdrop-blur-xl focus:border-[#67E8F9]/70">{discoveryCategories.map((item) => <option key={item}>{item}</option>)}</select>
      </div>

      <div className="absolute bottom-5 right-5 z-20 flex flex-col gap-2"><button type="button" onClick={() => zoom(0.5)} className="flex min-h-11 min-w-11 items-center justify-center rounded-full border border-white/10 bg-[#0B0B0D]/95 text-white hover:bg-[#17171B]" aria-label="Zoom map in"><Plus size={17} /></button><button type="button" onClick={() => zoom(-0.5)} className="flex min-h-11 min-w-11 items-center justify-center rounded-full border border-white/10 bg-[#0B0B0D]/95 text-white hover:bg-[#17171B]" aria-label="Zoom map out"><Minus size={17} /></button><button type="button" onClick={reset} className="flex min-h-11 min-w-11 items-center justify-center rounded-full border border-white/10 bg-[#0B0B0D]/95 text-white hover:bg-[#17171B]" aria-label="Reset map position"><LocateFixed size={17} /></button></div>

      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label={`World map with ${trends.length} country-attributed trend pins`} tabIndex={0} onKeyDown={(event) => { if (event.key === "+" || event.key === "=") zoom(0.5); if (event.key === "-") zoom(-0.5); if (event.key === "0") reset(); if (event.key === "ArrowLeft") setTransform((value) => ({ ...value, x: value.x + 24 })); if (event.key === "ArrowRight") setTransform((value) => ({ ...value, x: value.x - 24 })); if (event.key === "ArrowUp") setTransform((value) => ({ ...value, y: value.y + 24 })); if (event.key === "ArrowDown") setTransform((value) => ({ ...value, y: value.y - 24 })); }} onWheel={(event) => { event.preventDefault(); zoom(event.deltaY > 0 ? -0.2 : 0.2); }} onPointerDown={(event) => { event.currentTarget.setPointerCapture(event.pointerId); dragStart.current = { x: event.clientX, y: event.clientY, originX: transform.x, originY: transform.y }; }} onPointerMove={(event) => { if (!dragStart.current) return; const ratio = WIDTH / event.currentTarget.getBoundingClientRect().width; setTransform((value) => ({ ...value, x: dragStart.current!.originX + (event.clientX - dragStart.current!.x) * ratio, y: dragStart.current!.originY + (event.clientY - dragStart.current!.y) * ratio })); }} onPointerUp={() => { dragStart.current = null; }} className="absolute inset-0 h-full w-full touch-none cursor-grab bg-[radial-gradient(circle_at_center,rgba(6,182,212,.06),transparent_55%)] focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#67E8F9]">
        <g transform={`translate(${transform.x} ${transform.y}) scale(${transform.scale})`}>
          <path d={path({ type: "Sphere" }) || undefined} fill="#08090A" stroke="rgba(255,255,255,.09)" strokeWidth={0.8 / transform.scale} />
          {countries.features.map((country) => <path key={String(country.id)} d={path(country) || undefined} fill="#111317" stroke="rgba(255,255,255,.11)" strokeWidth={0.55 / transform.scale} />)}
          {trends.map((trend) => { const point = projection([trend.country!.longitude!, trend.country!.latitude!]); if (!point) return null; const active = selectedSlug === trend.slug; return <g key={trend.id} transform={`translate(${point[0]} ${point[1]})`} role="button" aria-label={`${trend.title}, ${trend.country?.name}`} tabIndex={0} onClick={(event) => { event.stopPropagation(); setSelectedSlug(trend.slug); }} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") setSelectedSlug(trend.slug); }} className="cursor-pointer outline-none"><circle r={(active ? 12 : 8) / transform.scale} fill="rgba(6,182,212,.18)" stroke="#67E8F9" strokeWidth={1.2 / transform.scale} /><circle r={2.5 / transform.scale} fill="#F5F5F5" /></g>; })}
        </g>
      </svg>

      <div className="absolute bottom-5 left-5 z-20 max-w-[calc(100%-6rem)] sm:left-6 sm:max-w-sm">{selected ? <article className="rounded-2xl border border-white/10 bg-[#0B0B0D]/96 p-5 shadow-2xl backdrop-blur-xl"><div className="flex items-start justify-between gap-4"><div><p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#67E8F9]">{selected.country?.name} · score {selected.score}</p><h2 className="mt-2 text-lg font-medium leading-snug text-white">{selected.title}</h2></div><button type="button" onClick={() => setSelectedSlug(null)} aria-label="Close selected trend" className="text-white/35 hover:text-white"><X size={16} /></button></div><Link href={`/trend/${selected.slug}`} className="mt-4 inline-flex min-h-11 items-center gap-2 text-sm font-medium text-white hover:text-[#67E8F9]">Open evidence <Crosshair size={15} /></Link></article> : <div className="rounded-xl border border-white/[0.07] bg-[#0B0B0D]/90 px-4 py-3 font-mono text-[10px] uppercase tracking-widest text-white/45 backdrop-blur-xl">Drag to pan · scroll to zoom · 0 to reset</div>}</div>
      {error && <div className="absolute inset-x-5 top-28 z-30 sm:inset-x-auto sm:left-6 sm:w-[470px]"><TrendUnavailable message="The map remains interactive, but trend pins will appear only after the production Supabase feed is connected." /></div>}
      {!error && !trends.length && <div className="absolute left-1/2 top-1/2 z-10 w-[min(90%,420px)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-white/[0.08] bg-[#0B0B0D]/92 p-6 text-center text-sm leading-6 text-[#8F8F98]">No country-attributed trends match this filter.</div>}
      <p className="absolute bottom-2 right-20 z-10 font-mono text-[8px] uppercase tracking-wider text-white/20">Boundary data: Natural Earth via world-atlas · public domain</p>
    </section>
  </div>;
}
