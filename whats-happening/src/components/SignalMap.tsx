"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { geoGraticule10, geoNaturalEarth1, geoPath } from "d3-geo";
import { feature } from "topojson-client";
import worldAtlas from "world-atlas/countries-110m.json";
import type { Feature, FeatureCollection, Geometry, GeoJsonProperties } from "geojson";
import type { GeometryCollection, Topology } from "topojson-specification";
import { ArrowRight, ExternalLink, LocateFixed, Maximize2, Minimize2, Minus, Plus, X } from "lucide-react";
import { useMapActivity } from "@/hooks/useTrendData";
import { clampMapScale, mapMarkerRadius } from "@/lib/map";
import type { Country, CountryActivity, MapDevelopmentPoint } from "@/types/trends";
import { TrendUnavailable } from "./TrendStates";
import { localeCategoryLabel, useLocale } from "@/i18n/locale";

const WIDTH = 960;
const HEIGHT = 520;
const projection = geoNaturalEarth1().fitExtent([[24, 24], [WIDTH - 24, HEIGHT - 24]], { type: "Sphere" });
const path = geoPath(projection);
const graticule = geoGraticule10();
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
  if (Number.isNaN(date.getTime())) return locale === "tr" ? "Saat kullanılamıyor" : "Time unavailable";
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

function DevelopmentDetail({
  activity,
  point,
  onSelect,
  onClose,
  panelRef,
  expanded,
}: {
  activity: CountryActivity;
  point: MapDevelopmentPoint;
  onSelect: (id: string) => void;
  onClose: () => void;
  panelRef: React.RefObject<HTMLElement | null>;
  expanded: boolean;
}) {
  const { locale } = useLocale();
  const l = (en: string, tr: string) => locale === "tr" ? tr : en;

  return <aside ref={panelRef} tabIndex={-1} className={`relative z-30 overflow-y-auto border-t border-white/[0.12] bg-[#0B0B0D] p-5 focus:outline-none sm:p-7 xl:border-l xl:border-t-0 ${expanded ? "max-h-[52dvh] xl:h-dvh xl:max-h-dvh xl:min-h-0" : "max-h-[720px] xl:max-h-none xl:min-h-[700px]"}`} aria-live="polite" aria-label={l(`${activity.country.name} news desk`, `${activity.country.name} haber masası`)}>
    <div className="flex items-start justify-between gap-5 border-b border-white/[0.1] pb-6">
      <div>
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/45">{l("Mapped news desk", "Haritalı haber masası")}</p>
        <h2 className="mt-2 text-3xl font-medium tracking-[-0.045em] text-white">{activity.country.name}</h2>
        <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.14em] text-white/40">{activity.evidence_count} {l(activity.evidence_count === 1 ? "verified development" : "verified developments", "doğrulanmış gelişme")}</p>
      </div>
      <button type="button" onClick={onClose} className="flex min-h-11 min-w-11 items-center justify-center rounded-full border border-white/15 text-white/60 transition-colors duration-150 hover:bg-white/[0.06] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-white" aria-label={l("Close news desk", "Haber masasını kapat")}><X size={17} /></button>
    </div>

    <article className="py-7">
      <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/42">{localeCategoryLabel(point.category, locale)} · {formatUtc(point.observed_at || point.published_at, locale)}</p>
      <h3 className="mt-3 text-balance text-[1.65rem] font-medium leading-[1.08] tracking-[-0.04em] text-white">{point.source_title}</h3>
      <p className="mt-5 text-pretty text-sm leading-6 text-[#B7B7BD]">{point.signal_summary || point.trend_summary || l("The official source recorded this AI topic without a longer summary.", "Resmi kaynak bu yapay zeka konusunu daha uzun bir özet olmadan kaydetti.")}</p>

      <dl className="mt-7 border-y border-white/[0.1] py-1 text-sm">
        <div className="grid grid-cols-[5.5rem_1fr] gap-3 border-b border-white/[0.07] py-4"><dt className="text-white/38">{l("Observed", "Gözlem")}</dt><dd className="text-white">{formatUtc(point.observed_at || point.published_at, locale)}</dd></div>
        <div className="grid grid-cols-[5.5rem_1fr] gap-3 border-b border-white/[0.07] py-4"><dt className="text-white/38">{l("Place", "Yer")}</dt><dd className="leading-6 text-white">{point.geographic_evidence}</dd></div>
        <div className="grid grid-cols-[5.5rem_1fr] gap-3 py-4"><dt className="text-white/38">{l("Topic", "Konu")}</dt><dd className="text-white">{point.trend_title}</dd></div>
      </dl>

      <a href={point.source_url} target="_blank" rel="noreferrer" className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-white px-5 text-sm font-semibold text-black transition-colors duration-150 hover:bg-[#E7E7E9] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-white">{l(`Open ${point.provider_label} source`, `${point.provider_label} kaynağını aç`)} <ExternalLink size={15} /></a>
      <Link href={`/trend/${point.trend_slug}`} className="mt-2 inline-flex min-h-11 w-full items-center justify-center gap-2 text-sm font-medium text-white/65 transition-colors duration-150 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">{l("Read the full briefing", "Tam özeti okuyun")} <ArrowRight size={15} /></Link>
    </article>

    {activity.developments.length > 1 && <div className="border-t border-white/[0.1] pt-6">
      <h3 className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/42">{l("More from this place", "Bu yerden daha fazlası")}</h3>
      <div className="mt-3 divide-y divide-white/[0.08]">{activity.developments.slice(0, 6).map((item, index) => <button key={item.id} type="button" onClick={() => onSelect(item.id)} aria-pressed={item.id === point.id} className={`group flex min-h-16 w-full items-center gap-4 py-3 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${item.id === point.id ? "text-white" : "text-white/55 hover:text-white"}`}><span className="font-mono text-[10px] tabular-nums text-white/28">{String(index + 1).padStart(2, "0")}</span><span className="line-clamp-2 text-sm leading-5">{item.source_title}</span><ArrowRight size={14} className="ml-auto shrink-0 text-white/25 transition-transform duration-150 group-hover:translate-x-0.5 group-hover:text-white/60" /></button>)}</div>
    </div>}
    <p className="mt-7 border-t border-white/[0.08] pt-5 text-xs leading-5 text-white/38">{l("Country-level evidence identifies an observed market. It does not establish an exact city, event origin, cause, or forecast.", "Ülke düzeyindeki kanıt, gözlemlenen bir pazarı tanımlar. Kesin bir şehir, olayın kökeni, neden veya tahmin ortaya koymaz.")}</p>
  </aside>;
}

export function SignalMap() {
  const { data, error, isLoading } = useMapActivity();
  const { locale } = useLocale();
  const l = (en: string, tr: string) => locale === "tr" ? tr : en;
  const [transform, setTransform] = useState<Transform>(INITIAL_TRANSFORM);
  const [selectedCountryName, setSelectedCountryName] = useState<string | null>(null);
  const [selectedPointId, setSelectedPointId] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);
  const dragStart = useRef<{ x: number; y: number; originX: number; originY: number } | null>(null);
  const panelRef = useRef<HTMLElement>(null);
  const lastMapTrigger = useRef<SVGElement | null>(null);
  const activities = data?.activities || [];
  const selectedActivity = selectedCountryName ? activities.find((activity) => atlasName(activity.country) === selectedCountryName) || null : null;
  const selectedPoint = selectedActivity?.developments.find((point) => point.id === selectedPointId) || selectedActivity?.developments[0] || null;
  const maximumEvidence = Math.max(0, ...activities.map((activity) => activity.evidence_count));
  const activityByAtlasName = new Map(activities.map((activity) => [atlasName(activity.country), activity]));

  useEffect(() => {
    if (!selectedPoint || !panelRef.current) return;
    const panel = panelRef.current;
    const desktop = window.matchMedia("(min-width: 1280px)").matches;
    window.requestAnimationFrame(() => panel.focus({ preventScroll: desktop }));
  }, [selectedPoint]);

  useEffect(() => {
    if (!expanded) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function closeExpandedMap(event: KeyboardEvent) {
      if (event.key === "Escape") setExpanded(false);
    }
    window.addEventListener("keydown", closeExpandedMap);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeExpandedMap);
    };
  }, [expanded]);

  useEffect(() => {
    if (!selectedPoint) return;
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      setSelectedCountryName(null);
      setSelectedPointId(null);
      window.requestAnimationFrame(() => lastMapTrigger.current?.focus());
    }
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [selectedPoint]);

  function zoom(amount: number) {
    setTransform((current) => ({ ...current, scale: clampMapScale(current.scale + amount) }));
  }

  function reset() {
    setTransform(INITIAL_TRANSFORM);
  }

  function toggleExpandedMap() {
    if (!expanded) {
      setTransform((current) => ({ ...current, scale: Math.max(current.scale, 1.5) }));
    }
    setExpanded((value) => !value);
  }

  function closeNewsDesk() {
    setSelectedCountryName(null);
    setSelectedPointId(null);
    window.requestAnimationFrame(() => lastMapTrigger.current?.focus());
  }

  function chooseCountry(activity: CountryActivity, trigger: SVGElement) {
    lastMapTrigger.current = trigger;
    setSelectedCountryName(atlasName(activity.country));
    setSelectedPointId(activity.developments[0]?.id || null);
  }

  const asOf = data ? formatUtc(data.coverage.as_of, locale) : null;
  const hasActivity = activities.length > 0;

  return <div className="mx-auto min-h-screen max-w-[1680px] px-4 pb-20 pt-28 sm:px-6 sm:pt-32">
    <header className="grid gap-5 pb-7 lg:grid-cols-[minmax(0,1fr)_34rem] lg:items-end">
      <div>
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/42">{l("The live AI atlas", "Canlı yapay zeka atlası")}</p>
        <h1 className="mt-3 max-w-4xl text-balance text-[clamp(2.75rem,5.4vw,5.5rem)] font-medium leading-[0.92] tracking-[-0.06em] text-white">{l("Sourced developments, placed on the map.", "Kaynaklı gelişmeler haritada.")}</h1>
      </div>
      <p className="max-w-[58ch] text-pretty text-base leading-7 text-[#A8A8AF] lg:pb-1">{l("Only places supported by current country-attributed evidence light up. Choose one lit place to open the news behind it.", "Yalnızca güncel, ülkeye atfedilmiş kanıtla desteklenen yerler yanar. Arkasındaki haberi açmak için ışıklı bir yer seçin.")}</p>
    </header>

    <section className={`${expanded ? "fixed inset-0 z-[70] m-0 h-dvh overflow-y-auto rounded-none border-0" : "relative mt-2 overflow-hidden rounded-[1.5rem] border border-[rgba(226,222,213,0.2)]"} bg-[#070809] ${selectedActivity && selectedPoint ? "xl:grid xl:grid-cols-[minmax(0,1fr)_410px]" : ""}`} aria-label={l("Interactive world AI activity map", "Etkileşimli dünya yapay zeka etkinlik haritası")} aria-describedby="map-evidence-limit">
      <div className={`relative overflow-hidden bg-[#0A0A09] ${expanded ? "h-dvh min-h-0 max-h-none" : "h-[64svh] min-h-[430px] max-h-[780px] xl:h-[min(78svh,780px)]"}`}>
        <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-start justify-between gap-4 p-4 sm:p-6">
          <div className="border-l border-white/35 pl-3">
            <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-white/38">{data?.mode === "demo" ? l("Demo interaction preview", "Demo etkileşim önizlemesi") : l("Live evidence window", "Canlı kanıt aralığı")}</p>
            <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.14em] text-white/68">{isLoading ? l("Checking sources", "Kaynaklar kontrol ediliyor") : l(`${activities.length} lit ${activities.length === 1 ? "place" : "places"} · ${data?.coverage.attributed_evidence_count || 0} developments`, `${activities.length} ışıklı yer · ${data?.coverage.attributed_evidence_count || 0} gelişme`)}</p>
          </div>
          {asOf && <p className="hidden font-mono text-[9px] uppercase tracking-[0.14em] text-white/32 sm:block">{l("Updated", "Güncellendi")} {asOf}</p>}
        </div>

        <div className="absolute right-4 top-20 z-20 flex flex-col gap-2 sm:right-6">
          <button type="button" onClick={toggleExpandedMap} aria-pressed={expanded} className="flex min-h-11 min-w-11 items-center justify-center rounded-full border border-white/15 bg-[#0B0B0D]/95 text-white/75 transition-colors duration-150 hover:border-white/30 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-white" aria-label={expanded ? l("Exit full-screen map", "Tam ekran haritadan çık") : l("Expand map to full screen", "Haritayı tam ekrana büyüt")}>{expanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}</button>
          <button type="button" onClick={() => zoom(0.5)} className="flex min-h-11 min-w-11 items-center justify-center rounded-full border border-white/15 bg-[#0B0B0D]/95 text-white/75 transition-colors duration-150 hover:border-white/30 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-white" aria-label={l("Zoom map in", "Haritayı yakınlaştır")}><Plus size={16} /></button>
          <button type="button" onClick={() => zoom(-0.5)} className="flex min-h-11 min-w-11 items-center justify-center rounded-full border border-white/15 bg-[#0B0B0D]/95 text-white/75 transition-colors duration-150 hover:border-white/30 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-white" aria-label={l("Zoom map out", "Haritayı uzaklaştır")}><Minus size={16} /></button>
          <button type="button" onClick={reset} className="flex min-h-11 min-w-11 items-center justify-center rounded-full border border-white/15 bg-[#0B0B0D]/95 text-white/75 transition-colors duration-150 hover:border-white/30 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-white" aria-label={l("Reset map position", "Harita konumunu sıfırla")}><LocateFixed size={16} /></button>
        </div>

        <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="group" aria-label={l(`World map with ${activities.length} places showing verified AI developments`, `${activities.length} yerde doğrulanmış yapay zeka gelişmelerini gösteren dünya haritası`)} tabIndex={0} onKeyDown={(event) => { if (event.key === "+" || event.key === "=") zoom(0.5); if (event.key === "-") zoom(-0.5); if (event.key === "0") reset(); if (event.key === "ArrowLeft") setTransform((value) => ({ ...value, x: value.x + 24 })); if (event.key === "ArrowRight") setTransform((value) => ({ ...value, x: value.x - 24 })); if (event.key === "ArrowUp") setTransform((value) => ({ ...value, y: value.y + 24 })); if (event.key === "ArrowDown") setTransform((value) => ({ ...value, y: value.y - 24 })); }} onWheel={(event) => { event.preventDefault(); zoom(event.deltaY > 0 ? -0.2 : 0.2); }} onPointerDown={(event) => { if ((event.target as Element).closest('[role="button"]')) return; event.currentTarget.setPointerCapture(event.pointerId); dragStart.current = { x: event.clientX, y: event.clientY, originX: transform.x, originY: transform.y }; }} onPointerMove={(event) => { if (!dragStart.current) return; const ratio = WIDTH / event.currentTarget.getBoundingClientRect().width; setTransform((value) => ({ ...value, x: dragStart.current!.originX + (event.clientX - dragStart.current!.x) * ratio, y: dragStart.current!.originY + (event.clientY - dragStart.current!.y) * ratio })); }} onPointerUp={() => { dragStart.current = null; }} onPointerCancel={() => { dragStart.current = null; }} className="absolute inset-0 h-full w-full touch-none cursor-grab focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white/70">
          <g transform={`translate(${WIDTH / 2 + transform.x} ${HEIGHT / 2 + transform.y}) scale(${transform.scale}) translate(${-WIDTH / 2} ${-HEIGHT / 2})`}>
            <path d={path({ type: "Sphere" }) || undefined} fill="#070809" stroke="rgba(241,238,230,.18)" strokeWidth={0.8 / transform.scale} />
            <path d={path(graticule) || undefined} fill="none" stroke="rgba(241,238,230,.055)" strokeWidth={0.45 / transform.scale} />
            {atlasCountries.features.map((atlasCountry, index) => {
              const name = countryName(atlasCountry);
              const activity = activityByAtlasName.get(name);
              const selected = selectedCountryName === name;
              if (!activity) return <path key={atlasCountry.id == null ? index : String(atlasCountry.id)} d={path(atlasCountry) || undefined} aria-hidden="true" focusable="false" fill="#111316" stroke="rgba(241,238,230,.14)" strokeWidth={0.55 / transform.scale} className="pointer-events-none" />;
              const evidenceLabel = activity.evidence_count === 1 ? "verified development" : "verified developments";
              return <path key={atlasCountry.id == null ? index : String(atlasCountry.id)} d={path(atlasCountry) || undefined} role="button" tabIndex={0} aria-label={l(`${name}, ${activity.evidence_count} ${evidenceLabel}. Open its latest news.`, `${name}, ${activity.evidence_count} doğrulanmış gelişme. En yeni haberi aç.`)} onClick={(event) => { event.stopPropagation(); chooseCountry(activity, event.currentTarget); }} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); chooseCountry(activity, event.currentTarget); } }} fill={selected ? "#EEECE6" : "#5B5C5B"} stroke={selected ? "#FFFFFF" : "rgba(248,246,240,.9)"} strokeWidth={(selected ? 1.35 : 0.85) / transform.scale} className="cursor-pointer touch-manipulation outline-none transition-colors duration-150 hover:fill-[#767773] focus-visible:fill-[#767773] focus-visible:stroke-white" />;
            })}
            {activities.map((activity) => {
              const { latitude, longitude } = activity.country;
              if (latitude == null || longitude == null) return null;
              const point = projection([longitude, latitude]);
              if (!point) return null;
              const active = selectedCountryName === atlasName(activity.country);
              const radius = mapMarkerRadius(activity.evidence_count, maximumEvidence);
              const evidenceLabel = activity.evidence_count === 1 ? "verified AI development" : "verified AI developments";
              return <g key={activity.country.code} transform={`translate(${point[0]} ${point[1]})`} role="button" aria-label={l(`${activity.country.name}: ${activity.evidence_count} ${evidenceLabel}. Open latest news.`, `${activity.country.name}: ${activity.evidence_count} doğrulanmış yapay zeka gelişmesi. En yeni haberi aç.`)} tabIndex={0} onClick={(event) => { event.stopPropagation(); chooseCountry(activity, event.currentTarget); }} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); chooseCountry(activity, event.currentTarget); } }} className="cursor-pointer touch-manipulation outline-none focus-visible:[&_circle]:stroke-white">
                <circle r={(active ? radius + 5 : radius + 2) / transform.scale} fill={active ? "rgba(255,255,255,.2)" : "rgba(245,243,237,.08)"} stroke={active ? "#FFFFFF" : "rgba(245,243,237,.68)"} strokeWidth={(active ? 1.8 : 1) / transform.scale} />
                <circle r={2.4 / transform.scale} fill={active ? "#09090A" : "#F5F3ED"} />
                {activity.evidence_count > 1 && <text y={-11 / transform.scale} textAnchor="middle" fill="#F8F6F0" fontSize={9 / transform.scale} fontWeight="700">{activity.evidence_count}</text>}
              </g>;
            })}
          </g>
        </svg>

        {error && <div className="absolute inset-x-5 bottom-5 z-30 sm:inset-x-auto sm:bottom-6 sm:left-6 sm:w-[470px]"><TrendUnavailable message={l("The atlas is available, but source-attributed activity could not be loaded.", "Atlas kullanılabilir durumda ancak kaynağa atfedilmiş etkinlik yüklenemedi.")} /></div>}
        {!error && !isLoading && !hasActivity && <div className="absolute inset-x-4 bottom-4 z-10 max-w-[500px] border border-[rgba(226,222,213,0.22)] bg-[#0B0B0D]/95 p-5 backdrop-blur-xl sm:bottom-6 sm:left-6 sm:right-auto sm:p-6">
          <div className="flex items-center gap-3"><span className="h-2 w-2 rounded-full border border-white/55" aria-hidden="true" /><p className="font-mono text-[10px] uppercase tracking-[0.17em] text-white/45">{l("Coverage status", "Kapsama durumu")}</p></div>
          <h2 className="mt-3 text-2xl font-medium tracking-[-0.035em] text-white">{l("No place is lit yet.", "Henüz hiçbir yer ışıklı değil.")}</h2>
          <p className="mt-2 max-w-[46ch] text-sm leading-6 text-[#A8A8AF]">{l("Current AI developments do not yet carry enough verified country evidence. The atlas will light automatically when one does.", "Güncel yapay zeka gelişmeleri henüz yeterli doğrulanmış ülke kanıtı taşımıyor. Kanıt geldiğinde atlas otomatik olarak aydınlanacak.")}</p>
        </div>}
        {isLoading && <div className="absolute inset-x-4 bottom-4 z-10 max-w-sm border border-white/[0.14] bg-[#0B0B0D]/95 p-5 font-mono text-[10px] uppercase tracking-[0.16em] text-white/45 sm:bottom-6 sm:left-6 sm:right-auto">{l("Checking current geographic evidence…", "Güncel coğrafi kanıt kontrol ediliyor…")}</div>}

        {hasActivity && <div className="pointer-events-none absolute bottom-4 left-4 z-10 max-w-[calc(100%-5rem)] border-l border-white/30 pl-3 sm:bottom-6 sm:left-6"><p className="font-mono text-[9px] uppercase tracking-[0.14em] text-white/48">{l("Lit place = sourced news · number = grouped developments", "Işıklı yer = kaynaklı haber · sayı = gruplanmış gelişmeler")}</p></div>}
      </div>

      {selectedActivity && selectedPoint && <DevelopmentDetail activity={selectedActivity} point={selectedPoint} onSelect={setSelectedPointId} onClose={closeNewsDesk} panelRef={panelRef} expanded={expanded} />}
    </section>

    {hasActivity ? <section className="mt-14 border-t border-white/[0.09] pt-9" aria-labelledby="activity-list-heading">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_30rem] lg:items-end">
        <div><p className="font-mono text-[10px] uppercase tracking-[0.17em] text-white/38">{l("Text view", "Metin görünümü")}</p><h2 id="activity-list-heading" className="mt-2 text-3xl font-medium tracking-[-0.04em] text-white">{l("Every place currently lit.", "Şu anda ışıklı olan her yer.")}</h2></div>
        <p className="max-w-[55ch] text-sm leading-6 text-[#8F8F98]">{l("The same current, country-attributed news shown on the map, arranged for keyboard and screen-reader browsing.", "Haritada gösterilen aynı güncel, ülkeye atfedilmiş haberler; klavye ve ekran okuyucuyla gezinmek için düzenlendi.")}</p>
      </div>
      <div className="mt-7 divide-y divide-white/[0.09] border-y border-white/[0.09]">
        {activities.map((activity) => <details key={activity.country.code} className="group py-1">
          <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-4 py-4 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-white">
            <span className="min-w-0"><span className="text-base font-medium text-white">{activity.country.name}</span><span className="ml-3 hidden font-mono text-[10px] uppercase tracking-wider text-white/35 sm:inline">{formatUtc(activity.latest_observed_at, locale)}</span></span>
            <span className="flex shrink-0 items-center gap-3"><span className="font-mono text-xs tabular-nums text-white/55">{activity.evidence_count} {l("developments", "gelişme")}</span><Plus size={16} className="text-white/45 transition-transform duration-150 group-open:rotate-45" aria-hidden="true" /></span>
          </summary>
          <div className="grid gap-4 pb-7 sm:grid-cols-2 xl:grid-cols-3">
            {activity.developments.map((point) => <article key={point.id} className="editorial-card rounded-2xl border p-5">
              <p className="font-mono text-[10px] uppercase tracking-wider text-white/35">{localeCategoryLabel(point.category, locale)} · {formatUtc(point.observed_at, locale)}</p>
              <h3 className="mt-2 text-sm font-medium leading-5 text-white">{point.source_title}</h3>
              <p className="mt-3 line-clamp-3 text-sm leading-6 text-[#8F8F98]">{point.signal_summary}</p>
              <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1"><a href={point.source_url} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center gap-1.5 text-xs font-medium text-white hover:text-white/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">{point.provider_label}<ExternalLink size={12} /><span className="sr-only">{l(` source for ${point.source_title}, opens in a new tab`, ` ${point.source_title} kaynağı, yeni sekmede açılır`)}</span></a><Link href={`/trend/${point.trend_slug}`} className="inline-flex min-h-11 items-center gap-1.5 text-xs font-medium text-[#C4C4CA] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">{l("Full briefing", "Tam özet")}<ArrowRight size={12} /></Link></div>
            </article>)}
          </div>
        </details>)}
      </div>
    </section> : null}

    <div id="map-evidence-limit" className="mt-7 flex flex-col gap-4 border-t border-white/[0.08] pt-6 text-xs leading-5 text-white/38 sm:flex-row sm:items-start sm:justify-between">
      <p className="max-w-[72ch]">{l("Only current AI developments with source-attributed country evidence are lit. Country coordinates show a market, never city precision or the origin of an event. Coverage refreshes with the live trend feed.", "Yalnızca kaynağa atfedilmiş ülke kanıtı bulunan güncel yapay zeka gelişmeleri ışıklandırılır. Ülke koordinatları bir pazarı gösterir; şehir hassasiyeti veya olayın kökenini değil. Kapsama, canlı trend akışıyla yenilenir.")}</p>
      <p className="shrink-0 font-mono text-[9px] uppercase tracking-[0.14em] text-white/28">{l("Boundaries: Natural Earth · public domain", "Sınırlar: Natural Earth · kamu malı")}</p>
    </div>
    <Link href="/how-it-works" className="mt-3 inline-flex min-h-11 items-center gap-2 text-sm font-medium text-white/70 transition-colors duration-150 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">{l("Read the evidence method", "Kanıt yöntemini okuyun")} <ArrowRight size={15} /></Link>
  </div>;
}
