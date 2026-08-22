"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { geoNaturalEarth1, geoPath } from "d3-geo";
import { feature } from "topojson-client";
import worldAtlas from "world-atlas/countries-110m.json";
import type { Feature, FeatureCollection, Geometry, GeoJsonProperties } from "geojson";
import type { GeometryCollection, Topology } from "topojson-specification";
import { ArrowRight, ExternalLink, LocateFixed, Minus, Plus, X } from "lucide-react";
import { useMapActivity } from "@/hooks/useTrendData";
import { clampMapScale, mapMarkerRadius } from "@/lib/map";
import type { Country, CountryActivity, MapDevelopmentPoint } from "@/types/trends";
import { TrendUnavailable } from "./TrendStates";
import { localeCategoryLabel, useLocale } from "@/i18n/locale";

const WIDTH = 960;
const HEIGHT = 520;
const projection = geoNaturalEarth1().fitExtent([[22, 22], [WIDTH - 22, HEIGHT - 22]], { type: "Sphere" });
const path = geoPath(projection);
type Atlas = Topology<{ countries: GeometryCollection }>;
const atlasCountries = feature(worldAtlas as unknown as Atlas, (worldAtlas as unknown as Atlas).objects.countries) as FeatureCollection<Geometry, { name?: string }>;

type Transform = { x: number; y: number; scale: number };
const INITIAL_TRANSFORM: Transform = { x: 0, y: 0, scale: 1 };

const ATLAS_NAME_BY_CODE: Record<string, string> = {
  US: "United States of America",
  KR: "South Korea",
};

function formatUtc(value: string, locale = "en") {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Time unavailable";
  return new Intl.DateTimeFormat(locale === "tr" ? "tr-TR" : "en", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "UTC",
    timeZoneName: "short",
  }).format(date);
}

function atlasName(country: Country) {
  return ATLAS_NAME_BY_CODE[country.code] || country.name;
}

function countryName(country: Feature<Geometry, GeoJsonProperties>) {
  return typeof country.properties?.name === "string" ? country.properties.name : "Unknown country";
}

function DevelopmentDetail({ activity, point, onSelect, onClose }: { activity: CountryActivity; point: MapDevelopmentPoint; onSelect: (id: string) => void; onClose: () => void }) {
  const { locale } = useLocale();
  const l = (en: string, tr: string) => locale === "tr" ? tr : en;

  return <aside className="editorial-card rounded-[1.75rem] border p-6 sm:p-7" aria-live="polite">
    <div className="flex items-start justify-between gap-5">
      <div>
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/45">{l("Verified development", "Doğrulanmış gelişme")} · {activity.country.name}</p>
        <h2 className="mt-2 text-2xl font-medium leading-tight tracking-[-0.035em] text-white">{point.source_title}</h2>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <span className="rounded-full border border-white/15 bg-white px-3 py-1.5 font-mono text-xs font-semibold tabular-nums text-black">{activity.developments.length}</span>
        <button type="button" onClick={onClose} className="flex min-h-11 min-w-11 items-center justify-center rounded-full border border-white/15 text-white/60 hover:bg-white/[0.06] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-white" aria-label={l("Close development", "Gelişmeyi kapat")}><X size={16} /></button>
      </div>
    </div>
    <p className="mt-5 text-sm leading-6 text-[#B7B7BD]">{point.signal_summary || point.trend_summary || l("The official source recorded this AI topic without a longer summary.", "Resmi kaynak bu yapay zeka konusunu daha uzun bir özet olmadan kaydetti.")}</p>
    <dl className="mt-6 space-y-4 border-y border-white/[0.09] py-5 text-sm">
      <div className="grid grid-cols-[5rem_1fr] gap-3"><dt className="text-white/40">{l("Observed", "Gözlem")}</dt><dd className="text-white">{formatUtc(point.observed_at || point.published_at, locale)}</dd></div>
      <div className="grid grid-cols-[5rem_1fr] gap-3"><dt className="text-white/40">{l("Geography", "Coğrafya")}</dt><dd className="leading-6 text-white">{point.geographic_evidence}</dd></div>
      <div className="grid grid-cols-[5rem_1fr] gap-3"><dt className="text-white/40">{l("Topic", "Konu")}</dt><dd className="text-white">{point.trend_title}</dd></div>
    </dl>
    <div className="mt-6 grid gap-3 sm:grid-cols-2">
      <a href={point.source_url} target="_blank" rel="noreferrer" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-white px-5 text-sm font-semibold text-black hover:bg-[#E7E7E9] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-white">{l(`Open ${point.provider_label} source`, `${point.provider_label} kaynağını aç`)} <ExternalLink size={15} /></a>
      <Link href={`/trend/${point.trend_slug}`} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/15 px-5 text-sm font-medium text-white hover:bg-white/[0.06] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-white">{l("Read trend article", "Trend makalesini oku")} <ArrowRight size={15} /></Link>
    </div>
    {activity.developments.length > 1 && <div className="mt-8 border-t border-white/[0.09] pt-6">
      <h3 className="text-sm font-medium text-white">{l("Developments in this cluster", "Bu kümedeki gelişmeler")}</h3>
      <div className="mt-3 space-y-2">{activity.developments.slice(0, 6).map((item, index) => <button key={item.id} type="button" onClick={() => onSelect(item.id)} className={`editorial-card editorial-card-interactive flex min-h-12 w-full items-center gap-3 rounded-xl border px-3 text-left text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${item.id === point.id ? "editorial-card-selected text-white" : "text-white/65 hover:text-white"}`}><span className="font-mono text-[10px] tabular-nums text-white/35">{String(index + 1).padStart(2, "0")}</span><span className="line-clamp-2 leading-5">{item.source_title}</span></button>)}</div>
    </div>}
    <p className="mt-7 border-t border-white/[0.08] pt-5 text-xs leading-5 text-white/40">{l("Country-level source evidence does not establish an exact city, event origin, cause, or forecast.", "Ülke düzeyindeki kaynak kanıtı kesin bir şehir, olayın kökeni, neden veya tahmin ortaya koymaz.")}</p>
  </aside>;
}

export function SignalMap() {
  const { data, error, isLoading } = useMapActivity();
  const { locale } = useLocale();
  const l = (en: string, tr: string) => locale === "tr" ? tr : en;
  const [transform, setTransform] = useState<Transform>(INITIAL_TRANSFORM);
  const [selectedCountryName, setSelectedCountryName] = useState<string | null>(null);
  const [selectedPointId, setSelectedPointId] = useState<string | null>(null);
  const dragStart = useRef<{ x: number; y: number; originX: number; originY: number } | null>(null);
  const activities = data?.activities || [];
  const selectedActivity = selectedCountryName ? activities.find((activity) => atlasName(activity.country) === selectedCountryName) || null : null;
  const selectedPoint = selectedActivity?.developments.find((point) => point.id === selectedPointId) || selectedActivity?.developments[0] || null;
  const maximumEvidence = Math.max(0, ...activities.map((activity) => activity.evidence_count));
  const activityByAtlasName = new Map(activities.map((activity) => [atlasName(activity.country), activity]));

  function zoom(amount: number) {
    setTransform((current) => ({ ...current, scale: clampMapScale(current.scale + amount) }));
  }
  function reset() {
    setTransform(INITIAL_TRANSFORM);
    setSelectedCountryName(null);
    setSelectedPointId(null);
  }
  function chooseCountry(activity: CountryActivity) {
    setSelectedCountryName(atlasName(activity.country));
    setSelectedPointId(activity.developments[0]?.id || null);
  }

  return <div className="mx-auto min-h-screen max-w-[1600px] px-4 pb-20 pt-28 sm:px-6 sm:pt-32">
    <header className="grid gap-6 border-b border-white/[0.08] pb-8 lg:grid-cols-[1fr_34rem] lg:items-end">
      <div>
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-white/45">{l("Source-attributed AI activity", "Kaynağa atfedilmiş yapay zeka etkinliği")}</p>
        <h1 className="mt-3 max-w-4xl text-balance text-[clamp(3rem,7vw,6.5rem)] font-medium leading-[0.9] tracking-[-0.065em] text-white">{l("Global AI developments, mapped.", "Küresel yapay zeka gelişmeleri haritada.")}</h1>
      </div>
      <div className="max-w-[60ch] lg:pb-1">
        <p className="text-pretty text-base leading-7 text-[#A8A8AF]">{l("Only places with a current, source-attributed AI development light up. Select a lit place to open its news and evidence.", "Yalnızca güncel, kaynakla ülkeye atfedilmiş yapay zeka gelişmesi bulunan yerler yanar. Haber ve kanıtı açmak için ışıklı bir yere dokunun.")}</p>
        {data?.mode === "demo" && <p className="mt-4 inline-flex rounded-full border border-white/20 bg-white/[0.08] px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-white">{l("Demo data · interaction preview", "Demo verisi · etkileşim önizlemesi")}</p>}
        {data && <p className="mt-4 font-mono text-xs uppercase tracking-[0.12em] text-white/45"><span className="tabular-nums text-white/75">{data.coverage.countries_with_evidence}</span> {l("lit markets", "aydınlatılmış pazar")} · <span className="tabular-nums text-white/75">{data.coverage.attributed_evidence_count}</span> {l("developments", "gelişme")} · {formatUtc(data.coverage.as_of, locale)}</p>}
      </div>
    </header>

    <div className={`mt-7 grid gap-5 xl:items-start ${selectedActivity && selectedPoint ? "xl:grid-cols-[minmax(0,1fr)_410px]" : "grid-cols-1"}`}>
      <section className="editorial-card relative min-h-[560px] overflow-hidden rounded-[2rem] border sm:min-h-[660px]" aria-label={l("Interactive world AI activity map", "Etkileşimli dünya yapay zeka etkinlik haritası")} aria-describedby="map-evidence-limit">
        <div className="absolute bottom-6 right-5 z-20 flex flex-col gap-2"><button type="button" onClick={() => zoom(0.5)} className="flex min-h-11 min-w-11 items-center justify-center rounded-full border border-white/15 bg-[#0B0B0D]/95 text-white hover:bg-[#17171B] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-white" aria-label={l("Zoom map in", "Haritayı yakınlaştır")}><Plus size={17} /></button><button type="button" onClick={() => zoom(-0.5)} className="flex min-h-11 min-w-11 items-center justify-center rounded-full border border-white/15 bg-[#0B0B0D]/95 text-white hover:bg-[#17171B] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-white" aria-label={l("Zoom map out", "Haritayı uzaklaştır")}><Minus size={17} /></button><button type="button" onClick={reset} className="flex min-h-11 min-w-11 items-center justify-center rounded-full border border-white/15 bg-[#0B0B0D]/95 text-white hover:bg-[#17171B] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-white" aria-label={l("Reset map position", "Harita konumunu sıfırla")}><LocateFixed size={17} /></button></div>

        <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="group" aria-label={l(`World map with ${activities.length} markets showing verified AI developments`, `${activities.length} pazarda doğrulanmış yapay zeka gelişmelerini gösteren dünya haritası`)} tabIndex={0} onKeyDown={(event) => { if (event.key === "+" || event.key === "=") zoom(0.5); if (event.key === "-") zoom(-0.5); if (event.key === "0") reset(); if (event.key === "ArrowLeft") setTransform((value) => ({ ...value, x: value.x + 24 })); if (event.key === "ArrowRight") setTransform((value) => ({ ...value, x: value.x - 24 })); if (event.key === "ArrowUp") setTransform((value) => ({ ...value, y: value.y + 24 })); if (event.key === "ArrowDown") setTransform((value) => ({ ...value, y: value.y - 24 })); }} onWheel={(event) => { event.preventDefault(); zoom(event.deltaY > 0 ? -0.2 : 0.2); }} onPointerDown={(event) => { if ((event.target as Element).closest('[role="button"]')) return; event.currentTarget.setPointerCapture(event.pointerId); dragStart.current = { x: event.clientX, y: event.clientY, originX: transform.x, originY: transform.y }; }} onPointerMove={(event) => { if (!dragStart.current) return; const ratio = WIDTH / event.currentTarget.getBoundingClientRect().width; setTransform((value) => ({ ...value, x: dragStart.current!.originX + (event.clientX - dragStart.current!.x) * ratio, y: dragStart.current!.originY + (event.clientY - dragStart.current!.y) * ratio })); }} onPointerUp={() => { dragStart.current = null; }} onPointerCancel={() => { dragStart.current = null; }} className="absolute inset-0 h-full w-full touch-none cursor-grab focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white/70">
          <g transform={`translate(${transform.x} ${transform.y}) scale(${transform.scale})`}>
            <path d={path({ type: "Sphere" }) || undefined} fill="#08090A" stroke="rgba(255,255,255,.12)" strokeWidth={0.8 / transform.scale} />
            {atlasCountries.features.map((atlasCountry, index) => {
              const name = countryName(atlasCountry);
              const activity = activityByAtlasName.get(name);
              const selected = selectedCountryName === name;
              if (!activity) return <path key={atlasCountry.id == null ? index : String(atlasCountry.id)} d={path(atlasCountry) || undefined} aria-hidden="true" focusable="false" fill="#111317" stroke="rgba(255,255,255,.15)" strokeWidth={0.55 / transform.scale} className="pointer-events-none" />;
              const evidenceLabel = activity.evidence_count === 1 ? "verified development" : "verified developments";
              return <path key={atlasCountry.id == null ? index : String(atlasCountry.id)} d={path(atlasCountry) || undefined} role="button" tabIndex={0} aria-label={l(`${name}, ${activity.evidence_count} ${evidenceLabel}. Open latest news.`, `${name}, ${activity.evidence_count} doğrulanmış gelişme. En yeni haberi aç.`)} onClick={(event) => { event.stopPropagation(); chooseCountry(activity); }} onPointerUp={(event) => { event.stopPropagation(); chooseCountry(activity); }} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); chooseCountry(activity); } }} fill={selected ? "#34373C" : "#23262B"} stroke={selected ? "#F5F5F5" : "rgba(245,245,245,.55)"} strokeWidth={(selected ? 1.2 : 0.7) / transform.scale} className="cursor-pointer touch-manipulation outline-none focus-visible:stroke-white" />;
            })}
            {activities.map((activity) => {
              const { latitude, longitude } = activity.country;
              if (latitude == null || longitude == null) return null;
              const point = projection([longitude, latitude]);
              if (!point) return null;
              const active = selectedCountryName === atlasName(activity.country);
              const radius = mapMarkerRadius(activity.evidence_count, maximumEvidence);
              const evidenceLabel = activity.evidence_count === 1 ? "verified AI development" : "verified AI developments";
              return <g key={activity.country.code} transform={`translate(${point[0]} ${point[1]})`} role="button" aria-label={l(`${activity.country.name}: cluster of ${activity.evidence_count} ${evidenceLabel}. Open latest development.`, `${activity.country.name}: ${activity.evidence_count} doğrulanmış yapay zeka gelişmesi kümesi. En yeni gelişmeyi aç.`)} tabIndex={0} onClick={(event) => { event.stopPropagation(); chooseCountry(activity); }} onPointerUp={(event) => { event.stopPropagation(); chooseCountry(activity); }} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); chooseCountry(activity); } }} className="cursor-pointer touch-manipulation outline-none focus-visible:[&_circle]:stroke-white">
                <circle r={(active ? radius + 4 : radius) / transform.scale} fill={active ? "rgba(245,245,245,.28)" : "rgba(245,245,245,.16)"} stroke={active ? "#F5F5F5" : "rgba(245,245,245,.78)"} strokeWidth={(active ? 1.8 : 1.1) / transform.scale} />
                <circle r={2.3 / transform.scale} fill="#F5F5F5" />
                {activity.evidence_count > 1 && <text y={-10 / transform.scale} textAnchor="middle" fill="#F5F5F5" fontSize={9 / transform.scale} fontWeight="700">{activity.evidence_count}</text>}
              </g>;
            })}
          </g>
        </svg>

        <div className="editorial-card absolute bottom-5 left-5 z-10 max-w-[calc(100%-6rem)] rounded-xl border px-4 py-3 font-mono uppercase backdrop-blur-xl"><p className="text-[10px] tracking-widest text-white/55">{l("Point = verified development · number = cluster · drag to pan", "Nokta = doğrulanmış gelişme · sayı = küme · kaydırmak için sürükleyin")}</p><p className="mt-1.5 text-[8px] tracking-wider text-white/25">{l("Boundary data: Natural Earth via world-atlas · public domain", "Sınır verisi: world-atlas üzerinden Natural Earth · kamu malı")}</p></div>
        {error && <div className="absolute inset-x-5 top-6 z-30 sm:inset-x-auto sm:left-6 sm:w-[470px]"><TrendUnavailable message={l("The map remains available, but source-attributed activity could not be loaded.", "Harita kullanılabilir durumda ancak kaynağa atfedilmiş etkinlik yüklenemedi.")} /></div>}
        {!error && !isLoading && !activities.length && <div className="editorial-card absolute left-1/2 top-1/2 z-10 w-[min(90%,440px)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border p-6 text-center text-sm leading-6 text-[#A8A8AF]">{l("No current AI development has enough source evidence for country attribution. The map stays dark until verified geographic evidence arrives.", "Hiçbir güncel yapay zeka gelişmesinde ülke atfı için yeterli kaynak kanıtı yok. Doğrulanmış coğrafi kanıt gelene kadar harita karanlık kalır.")}</div>}
        {isLoading && <div className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 font-mono text-xs uppercase tracking-widest text-white/40">{l("Loading live evidence…", "Canlı kanıt yükleniyor…")}</div>}
      </section>
      {selectedActivity && selectedPoint && <DevelopmentDetail activity={selectedActivity} point={selectedPoint} onSelect={setSelectedPointId} onClose={() => { setSelectedCountryName(null); setSelectedPointId(null); }} />}
    </div>

    <section className="mt-14 border-t border-white/[0.08] pt-10" aria-labelledby="activity-list-heading">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div><p className="font-mono text-xs uppercase tracking-[0.16em] text-white/40">{l("Accessible map alternative", "Erişilebilir harita alternatifi")}</p><h2 id="activity-list-heading" className="mt-2 text-3xl font-medium tracking-[-0.04em] text-white">{l("Browse every verified development.", "Doğrulanmış tüm gelişmelere göz atın.")}</h2></div>
        <p className="max-w-md text-sm leading-6 text-[#8F8F98]">{l("This list contains the same current, country-attributed news shown by the lit places on the map.", "Bu liste, haritadaki ışıklı yerlerde gösterilen güncel ve ülkeye atfedilmiş haberlerin aynısını içerir.")}</p>
      </div>
      <div className="mt-7 divide-y divide-white/[0.08] border-y border-white/[0.08]">
        {activities.map((activity) => <details key={activity.country.code} className="group py-1">
          <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-4 py-4 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-white">
            <span className="min-w-0"><span className="text-base font-medium text-white">{activity.country.name}</span><span className="ml-3 hidden font-mono text-[10px] uppercase tracking-wider text-white/35 sm:inline">{formatUtc(activity.latest_observed_at)}</span></span>
            <span className="flex shrink-0 items-center gap-3"><span className="font-mono text-xs tabular-nums text-white/55">{activity.evidence_count} {l("developments", "gelişme")}</span><Plus size={16} className="text-white/45 group-open:rotate-45" aria-hidden="true" /></span>
          </summary>
          <div className="grid gap-4 pb-7 sm:grid-cols-2 xl:grid-cols-3">
            {activity.developments.map((point) => <article key={point.id} className="editorial-card rounded-2xl border p-5">
              <p className="font-mono text-[10px] uppercase tracking-wider text-white/35">{localeCategoryLabel(point.category, locale)} · {formatUtc(point.observed_at, locale)}</p>
              <h3 className="mt-2 text-sm font-medium leading-5 text-white">{point.source_title}</h3>
              <p className="mt-3 line-clamp-3 text-sm leading-6 text-[#8F8F98]">{point.signal_summary}</p>
              <p className="mt-4 text-xs leading-5 text-white/40">{point.country.name} · {l("country-level evidence", "ülke düzeyinde kanıt")}</p>
              <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2"><a href={point.source_url} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center gap-1.5 text-xs font-medium text-white hover:text-white/70">{point.provider_label}<ExternalLink size={12} /><span className="sr-only">{l(` source for ${point.source_title}, opens in a new tab`, ` ${point.source_title} kaynağı, yeni sekmede açılır`)}</span></a><Link href={`/trend/${point.trend_slug}`} className="inline-flex min-h-11 items-center gap-1.5 text-xs font-medium text-[#C4C4CA] hover:text-white">{l("Trend article", "Trend makalesi")}<ArrowRight size={12} /></Link></div>
            </article>)}
          </div>
        </details>)}
      </div>
      <p id="map-evidence-limit" className="mt-6 max-w-[70ch] text-xs leading-5 text-white/40">{l("Only current AI developments with source-attributed country evidence are lit. Country-level points use the market coordinate and never imply city precision or origin. The map refreshes from the same 10-minute ingestion cycle as the live trend feed.", "Yalnızca kaynağa atfedilmiş ülke kanıtı bulunan güncel yapay zeka gelişmeleri ışıklandırılır. Ülke düzeyindeki noktalar pazar koordinatını kullanır; şehir hassasiyeti veya köken anlamına gelmez. Harita, canlı trend akışıyla aynı 10 dakikalık veri alım döngüsünden yenilenir.")}</p>
      <Link href="/how-it-works" className="mt-5 inline-flex min-h-11 items-center gap-2 text-sm font-medium text-white hover:text-white/70">{l("Read the evidence method", "Kanıt yöntemini okuyun")} <ArrowRight size={15} /></Link>
    </section>
  </div>;
}
