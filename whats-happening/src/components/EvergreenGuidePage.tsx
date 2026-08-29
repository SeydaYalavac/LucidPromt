"use client";

import { ArrowRight, CheckCircle2, ExternalLink, ShieldAlert } from "lucide-react";
import Link from "next/link";
import {
  evergreenGuidePath,
  evergreenGuides,
  evergreenSourceById,
  getEvergreenGuideAudit,
  type EvergreenGuideSlug,
} from "@/content/evergreen-guides";
import { useLocale } from "@/i18n/locale";

type LiveTrendLink = { slug: string; title: string; category: string; lastSeenAt: string };

const copy = {
  en: {
    breadcrumb: "Evidence guides",
    evidenceChecked: "Evidence checked",
    contentReviewed: "Content reviewed",
    verified: "Verified",
    auditUnavailable: "This guide is unavailable while its official evidence needs review.",
    auditUnavailableBody: "A source is missing or changed. The guide stays closed until an editor verifies every linked claim.",
    sections: "system checkpoints",
    sources: "official sources",
    mechanism: "How it works",
    evaluate: "What to inspect",
    decision: "Decision rule",
    limits: "Known limits",
    sequence: "Operating sequence",
    evidence: "Evidence for this checkpoint",
    directAnswer: "Direct answer",
    action: "Inspect live AI trends",
    current: "Current matched signals",
    currentBody: "These live trend pages match the guide topic by an exact title rule. General AI stories are excluded.",
    updated: "Last seen",
    related: "Other evidence guides",
    sourceDesk: "Official source record",
    unavailableAction: "Return to live AI trends",
  },
  tr: {
    breadcrumb: "Kanıt rehberleri",
    evidenceChecked: "Kanıt denetimi",
    contentReviewed: "İçerik incelemesi",
    verified: "Doğrulandı",
    auditUnavailable: "Resmî kanıt inceleme gerektirirken bu rehber kullanılamaz.",
    auditUnavailableBody: "Bir kaynak eksik veya değişti. Editör bağlı her iddiayı doğrulayana kadar rehber kapalı kalır.",
    sections: "sistem kontrol noktası",
    sources: "resmî kaynak",
    mechanism: "Nasıl çalışır",
    evaluate: "Neyi incelemeli",
    decision: "Karar kuralı",
    limits: "Bilinen sınırlar",
    sequence: "İşletim sırası",
    evidence: "Bu kontrol noktasının kanıtı",
    directAnswer: "Doğrudan yanıt",
    action: "Canlı yapay zeka trendlerini incele",
    current: "Güncel eşleşen sinyaller",
    currentBody: "Bu canlı trend sayfaları rehber konusuyla kesin başlık kuralıyla eşleşir. Genel yapay zeka haberleri hariç tutulur.",
    updated: "Son görülme",
    related: "Diğer kanıt rehberleri",
    sourceDesk: "Resmî kaynak kaydı",
    unavailableAction: "Canlı yapay zeka trendlerine dön",
  },
};

function formatDate(value: string, locale: "en" | "tr") {
  return new Intl.DateTimeFormat(locale === "tr" ? "tr-TR" : "en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(value.length === 10 ? `${value}T00:00:00Z` : value));
}

function SourceMarks({ sourceIds, label }: { sourceIds: string[]; label: string }) {
  return <span className="ml-2 inline-flex flex-wrap gap-1 align-baseline" aria-label={label}>
    {sourceIds.map((sourceId, index) => {
      const source = evergreenSourceById.get(sourceId);
      return source ? <a
        key={sourceId}
        href={source.url}
        target="_blank"
        rel="noreferrer"
        title={`${source.title} · ${source.publisher}`}
        className="inline-flex h-5 min-w-5 translate-y-[-0.08em] items-center justify-center rounded-full border border-white/15 px-1.5 font-mono text-[9px] leading-none text-white/55 transition-colors hover:border-white/45 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
      >{index + 1}</a> : null;
    })}
  </span>;
}

export function EvergreenGuidePage({ slug, liveTrends }: { slug: EvergreenGuideSlug; liveTrends: LiveTrendLink[] }) {
  const { locale } = useLocale();
  const language = locale === "tr" ? "tr" : "en";
  const t = copy[language];
  const guide = evergreenGuides[slug];
  const audit = getEvergreenGuideAudit(guide);
  const companions = Object.values(evergreenGuides).filter((candidate) => candidate.slug !== slug);

  if (!audit.complete || audit.reviewRequired) {
    return <div className="mx-auto min-h-[70vh] max-w-3xl px-5 pb-24 pt-40 sm:px-8">
      <ShieldAlert className="text-white/60" aria-hidden="true" />
      <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.18em] text-white/40">{guide.kicker[language]}</p>
      <h1 className="mt-4 text-balance text-4xl font-medium tracking-[-0.04em] text-white sm:text-5xl">{t.auditUnavailable}</h1>
      <p className="mt-5 max-w-[58ch] text-base leading-7 text-[#A5A5AC]">{t.auditUnavailableBody}</p>
      <Link href="/category/artificial-intelligence" className="mt-8 inline-flex min-h-11 items-center gap-2 rounded-lg border border-white/15 px-5 text-sm font-semibold text-white hover:bg-white/[0.06]">{t.unavailableAction}<ArrowRight size={16} /></Link>
    </div>;
  }

  return <article className="mx-auto max-w-[1280px] px-5 pb-24 pt-32 sm:px-8 lg:px-12 lg:pt-40">
    <header className="border-b border-white/[0.12] pb-12 lg:pb-16">
      <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-white/45">
        <Link href="/category/artificial-intelligence" className="hover:text-white">{t.breadcrumb}</Link><span aria-hidden="true">/</span><span aria-current="page">{guide.kicker[language]}</span>
      </nav>
      <div className="mt-7 grid gap-10 lg:grid-cols-[minmax(0,1.35fr)_minmax(17rem,0.65fr)] lg:items-end lg:gap-16">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#A5A5AC]">{guide.kicker[language]}</p>
          <h1 className="mt-5 max-w-5xl text-balance text-[clamp(2.8rem,7vw,6.3rem)] font-medium leading-[0.92] tracking-[-0.065em] text-[#F3F3F1]">{guide.title[language]}</h1>
          <p className="mt-7 max-w-[66ch] text-pretty text-lg leading-8 text-[#B3B3BA]">{guide.description[language]}</p>
        </div>
        <div className="border-l border-white/[0.16] pl-6 lg:mb-1">
          <p className="text-pretty text-base font-medium leading-7 text-[#E0E0DD]">{guide.promise[language]}</p>
          <p className="mt-4 text-sm leading-6 text-[#8F8F97]">{guide.audience[language]}</p>
          <Link href="/category/artificial-intelligence" className="primary-action mt-6 gap-2">{t.action}<ArrowRight size={15} /></Link>
        </div>
      </div>
    </header>

    <section className="grid border-b border-white/[0.12] text-sm text-[#A5A5AC] sm:grid-cols-4" aria-label="Guide audit status">
      <p className="border-b border-white/[0.12] py-4 sm:border-b-0 sm:border-r sm:pr-5"><strong className="mr-2 font-mono text-white">{audit.sectionCount}</strong>{t.sections}</p>
      <p className="border-b border-white/[0.12] py-4 sm:border-b-0 sm:border-r sm:px-5"><strong className="mr-2 font-mono text-white">{audit.sourceCount}</strong>{t.sources}</p>
      <p className="border-b border-white/[0.12] py-4 sm:border-b-0 sm:border-r sm:px-5"><strong className="mr-2 font-mono text-white">{formatDate(audit.checkedAt, language)}</strong>{t.evidenceChecked}</p>
      <p className="py-4 sm:pl-5"><strong className="mr-2 font-mono text-white">{formatDate(audit.lastVerified, language)}</strong>{t.contentReviewed}</p>
    </section>

    <section className="border-b border-white/[0.12] py-10 sm:py-14" aria-labelledby="direct-answer-heading">
      <div className="grid gap-5 sm:grid-cols-[4rem_minmax(0,1fr)]">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/40">{t.directAnswer}</p>
        <div>
          <h2 id="direct-answer-heading" className="max-w-4xl text-balance text-2xl font-medium tracking-[-0.035em] text-white sm:text-3xl">{guide.answerQuestion[language]}</h2>
          <p className="mt-4 max-w-[68ch] text-pretty text-base leading-8 text-[#D0D0D3]">{guide.directAnswer[language]}<SourceMarks sourceIds={guide.answerSourceIds} label={t.evidence} /></p>
        </div>
      </div>
    </section>

    <aside className="mt-8 border-l-2 border-white/20 py-1 pl-5 text-sm leading-6 text-[#96969E]">{guide.disclaimer[language]}<SourceMarks sourceIds={guide.answerSourceIds} label={t.evidence} /></aside>

    <div className="mt-14 grid items-start gap-14 lg:grid-cols-[minmax(0,1fr)_17rem]">
      <div className="divide-y divide-white/[0.12] border-y border-white/[0.12]">
        {guide.sections.map((section, index) => <section key={section.id} id={section.id} className="scroll-mt-28 py-12 sm:py-16">
          <div className="grid gap-6 sm:grid-cols-[4rem_minmax(0,1fr)]">
            <p className="font-mono text-sm tabular-nums text-white/30">{String(index + 1).padStart(2, "0")}</p>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/40">{section.category[language]}</p>
              <h2 className="mt-3 text-balance text-3xl font-medium tracking-[-0.04em] text-white sm:text-4xl">{section.title[language]}</h2>
              <p className="mt-5 max-w-[68ch] text-pretty text-base leading-8 text-[#BDBDC2]">{section.summary[language]}<SourceMarks sourceIds={section.sourceIds} label={t.evidence} /></p>

              <div className="mt-9 border-y border-white/[0.1] py-6">
                <h3 className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/40">{t.mechanism}</h3>
                <p className="mt-3 max-w-[68ch] text-pretty text-base leading-8 text-[#D0D0D3]">{section.mechanism[language]}<SourceMarks sourceIds={section.sourceIds} label={t.evidence} /></p>
              </div>

              <div className="grid gap-px border-b border-white/[0.1] bg-white/[0.1] md:grid-cols-2">
                <div className="bg-[#070706] py-7 pr-0 md:pr-7"><h3 className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/40">{t.evaluate}</h3><p className="mt-3 text-pretty text-sm leading-7 text-[#B7B7BC]">{section.evaluate[language]}<SourceMarks sourceIds={section.sourceIds} label={t.evidence} /></p></div>
                <div className="bg-[#070706] py-7 md:pl-7"><h3 className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/40">{t.decision}</h3><p className="mt-3 text-pretty text-sm leading-7 text-[#B7B7BC]">{section.decision[language]}<SourceMarks sourceIds={section.sourceIds} label={t.evidence} /></p></div>
              </div>

              <div className="pt-7"><h3 className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/40">{t.limits}</h3><p className="mt-3 max-w-[68ch] text-pretty text-sm leading-7 text-[#A5A5AC]">{section.limits[language]}<SourceMarks sourceIds={section.sourceIds} label={t.evidence} /></p></div>

              <div className="mt-8 border border-white/[0.14] bg-white/[0.025] p-5 sm:p-6"><h3 className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-white/45"><CheckCircle2 size={15} aria-hidden="true" />{t.sequence}</h3><p className="mt-3 text-pretty text-sm leading-7 text-[#D0D0D3]">{section.sequence[language]}<SourceMarks sourceIds={section.sourceIds} label={t.evidence} /></p></div>

              <div className="mt-7"><h3 className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/40">{t.evidence}</h3><ul className="mt-3 space-y-2">{section.sourceIds.map((sourceId) => { const source = evergreenSourceById.get(sourceId); return source ? <li key={sourceId}><a href={source.url} target="_blank" rel="noreferrer" className="group inline-flex items-start gap-2 text-sm leading-6 text-[#A9A9AF] underline decoration-white/20 underline-offset-4 hover:text-white"><span>{source.title} · {source.publisher}</span><ExternalLink size={13} className="mt-1.5 shrink-0 opacity-50 group-hover:opacity-100" /></a></li> : null; })}</ul></div>
            </div>
          </div>
        </section>)}
      </div>

      <aside className="space-y-7 lg:sticky lg:top-28">
        <nav aria-label={t.sections} className="border-l border-white/[0.14] pl-5"><p className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/40">{t.sections}</p><ol className="mt-4 space-y-3">{guide.sections.map((section, index) => <li key={section.id}><a href={`#${section.id}`} className="grid grid-cols-[1.5rem_1fr] gap-2 text-sm leading-5 text-[#8F8F97] hover:text-white"><span className="font-mono text-[10px] text-white/30">{String(index + 1).padStart(2, "0")}</span><span>{section.title[language]}</span></a></li>)}</ol></nav>
        <div className="border-t border-white/[0.12] pt-6"><p className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/40">{t.related}</p><div className="mt-3 space-y-4">{companions.map((companion) => <Link key={companion.slug} href={evergreenGuidePath(companion.slug)} className="block text-base font-medium leading-6 text-white hover:text-[#CFCFD3]">{companion.title[language]}</Link>)}</div></div>
      </aside>
    </div>

    {liveTrends.length > 0 && <section className="mt-20 border-y border-white/[0.12] py-10" aria-labelledby="live-guide-trends">
      <div className="grid gap-6 sm:grid-cols-[minmax(0,0.7fr)_minmax(0,1.3fr)] sm:gap-12">
        <div><p className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/40">{t.current}</p><h2 id="live-guide-trends" className="mt-3 text-balance text-3xl font-medium tracking-[-0.04em] text-white">{t.current}</h2><p className="mt-4 max-w-[42ch] text-sm leading-6 text-[#8F8F97]">{t.currentBody}</p></div>
        <ol className="divide-y divide-white/[0.1] border-y border-white/[0.1]">{liveTrends.map((trend, index) => <li key={trend.slug}><Link href={`/trend/${trend.slug}`} className="group grid gap-2 py-5 sm:grid-cols-[2rem_minmax(0,1fr)_auto] sm:items-start"><span className="font-mono text-[10px] text-white/30">{String(index + 1).padStart(2, "0")}</span><span className="text-base font-medium leading-6 text-white group-hover:text-[#D4D4D7]">{trend.title}</span><time dateTime={trend.lastSeenAt} className="font-mono text-[9px] uppercase tracking-[0.1em] text-white/35">{t.updated} {formatDate(trend.lastSeenAt, language)}</time></Link></li>)}</ol>
      </div>
    </section>}

    <section className="mt-16" aria-labelledby="guide-source-record">
      <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/40">{t.sourceDesk}</p>
      <h2 id="guide-source-record" className="mt-3 text-3xl font-medium tracking-[-0.04em] text-white">{audit.sourceCount} {t.sources}</h2>
      <ol className="mt-7 divide-y divide-white/[0.1] border-y border-white/[0.1]">{audit.sources.map((source, index) => <li key={source.id}><a href={source.url} target="_blank" rel="noreferrer" className="group grid gap-3 py-5 sm:grid-cols-[2rem_1fr_auto]"><span className="font-mono text-[10px] text-white/30">{String(index + 1).padStart(2, "0")}</span><span><span className="block text-sm font-medium text-white">{source.title}</span><span className="mt-1 block text-xs text-white/40">{source.publisher}</span></span><ExternalLink size={15} className="mt-1 text-white/35 group-hover:text-white" /></a></li>)}</ol>
    </section>
  </article>;
}
