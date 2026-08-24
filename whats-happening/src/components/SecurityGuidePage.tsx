"use client";

import { ArrowRight, CheckCircle2, ExternalLink, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { getGuideAudit, getVerifiedGuideDossiers, guidePath, securityGuides, type SecurityGuideSlug } from "@/content/security-guides";
import { sourceById } from "@/content/security-research";
import { useLocale } from "@/i18n/locale";

const copy = {
  en: {
    breadcrumb: "AI security research",
    evidenceChecked: "Evidence checked",
    contentReviewed: "Content reviewed",
    verified: "Verified",
    reviewRequired: "Review required",
    auditUnavailable: "This guide is unavailable because its complete source and audit record could not be verified.",
    auditWarning: "A linked source changed after the last content review. The existing defensive guidance remains visible with this review flag; no new claim is published automatically.",
    chapters: "defensive checkpoints",
    sources: "authoritative sources",
    threat: "Failure path",
    prevent: "Prevent",
    detect: "Detect",
    validate: "Validate",
    limits: "Known limits",
    workflow: "Operational sequence",
    evidence: "Evidence for this checkpoint",
    next: "Continue the research",
    nextBody: "Search all 21 defensive dossiers, compare hallucination-control methods and inspect every source record.",
    nextAction: "Open the full research desk",
    related: "Related guide",
    otherGuide: "Read the companion guide",
  },
  tr: {
    breadcrumb: "Yapay zeka güvenlik araştırması",
    evidenceChecked: "Kanıt denetimi",
    contentReviewed: "İçerik incelemesi",
    verified: "Doğrulandı",
    reviewRequired: "İnceleme gerekiyor",
    auditUnavailable: "Eksiksiz kaynak ve denetim kaydı doğrulanamadığı için bu rehber kullanılamıyor.",
    auditWarning: "Bağlı bir kaynak son içerik incelemesinden sonra değişti. Mevcut savunma rehberliği bu inceleme işaretiyle görünür kalır; yeni iddia otomatik yayınlanmaz.",
    chapters: "savunma kontrol noktası",
    sources: "yetkili kaynak",
    threat: "Hata yolu",
    prevent: "Önle",
    detect: "Tespit et",
    validate: "Doğrula",
    limits: "Bilinen sınırlar",
    workflow: "Operasyon sırası",
    evidence: "Bu kontrol noktasının kanıtı",
    next: "Araştırmaya devam edin",
    nextBody: "21 savunma dosyasının tamamında arama yapın, halüsinasyon kontrol yöntemlerini karşılaştırın ve her kaynak kaydını inceleyin.",
    nextAction: "Tam araştırma masasını aç",
    related: "İlgili rehber",
    otherGuide: "Tamamlayıcı rehberi oku",
  },
};

function formatDate(value: string, locale: "en" | "tr") {
  return new Intl.DateTimeFormat(locale === "tr" ? "tr-TR" : "en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00Z`));
}

function SourceMarks({ sourceIds, label }: { sourceIds: string[]; label: string }) {
  return <span className="ml-2 inline-flex flex-wrap gap-1 align-baseline" aria-label={label}>
    {sourceIds.map((sourceId, index) => {
      const source = sourceById.get(sourceId);
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

export function SecurityGuidePage({ slug }: { slug: SecurityGuideSlug }) {
  const { locale } = useLocale();
  const language = locale === "tr" ? "tr" : "en";
  const t = copy[language];
  const guide = securityGuides[slug];
  const dossiers = getVerifiedGuideDossiers(guide);
  const audit = getGuideAudit(guide);
  const companionSlug: SecurityGuideSlug = slug === "ai-security-vulnerabilities" ? "hallucination-detection" : "ai-security-vulnerabilities";
  const companion = securityGuides[companionSlug];

  if (!audit.complete) {
    return <div className="mx-auto min-h-[70vh] max-w-3xl px-5 pb-24 pt-40 sm:px-8">
      <ShieldAlert className="text-white/60" aria-hidden="true" />
      <h1 className="mt-6 text-4xl font-medium tracking-[-0.04em] text-white">{t.auditUnavailable}</h1>
      <Link href="/security-research" className="mt-8 inline-flex min-h-11 items-center gap-2 rounded-lg border border-white/15 px-5 text-sm font-semibold text-white hover:bg-white/[0.06]">{t.nextAction}<ArrowRight size={16} /></Link>
    </div>;
  }

  return <article className="mx-auto max-w-[1280px] px-5 pb-24 pt-32 sm:px-8 lg:px-12 lg:pt-40">
    <header className="border-b border-white/[0.12] pb-12 lg:pb-16">
      <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-white/45">
        <Link href="/security-research" className="hover:text-white">{t.breadcrumb}</Link><span aria-hidden="true">/</span><span aria-current="page">{guide.kicker[language]}</span>
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
          <Link href="/security-research" className="primary-action mt-6 gap-2">{t.nextAction}<ArrowRight size={15} /></Link>
        </div>
      </div>
    </header>

    <section className="grid border-b border-white/[0.12] text-sm text-[#A5A5AC] sm:grid-cols-4" aria-label="Guide audit status">
      <p className="border-b border-white/[0.12] py-4 sm:border-b-0 sm:border-r sm:pr-5"><strong className="mr-2 font-mono text-white">{audit.dossierCount}</strong>{t.chapters}</p>
      <p className="border-b border-white/[0.12] py-4 sm:border-b-0 sm:border-r sm:px-5"><strong className="mr-2 font-mono text-white">{audit.sourceCount}</strong>{t.sources}</p>
      <p className="border-b border-white/[0.12] py-4 sm:border-b-0 sm:border-r sm:px-5"><strong className="mr-2 font-mono text-white">{formatDate(audit.checkedAt, language)}</strong>{t.evidenceChecked}</p>
      <p className="py-4 sm:pl-5"><strong className="mr-2 font-mono text-white">{formatDate(audit.lastVerified, language)}</strong>{t.contentReviewed}</p>
    </section>

    {audit.reviewRequired && <aside className="mt-10 flex items-start gap-3 border border-amber-200/25 bg-amber-200/[0.05] p-5 text-sm leading-6 text-amber-100"><ShieldAlert className="mt-0.5 shrink-0" size={18} aria-hidden="true" /><p><strong>{t.reviewRequired}.</strong> {t.auditWarning}</p></aside>}

    <div className="mt-14 grid items-start gap-14 lg:grid-cols-[minmax(0,1fr)_17rem]">
      <div className="divide-y divide-white/[0.12] border-y border-white/[0.12]">
        {dossiers.map((dossier, index) => <section key={dossier.id} id={dossier.id} className="scroll-mt-28 py-12 sm:py-16">
          <div className="grid gap-6 sm:grid-cols-[4rem_minmax(0,1fr)]">
            <p className="font-mono text-sm tabular-nums text-white/30">{String(index + 1).padStart(2, "0")}</p>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/40">{dossier.category}</p>
              <h2 className="mt-3 text-balance text-3xl font-medium tracking-[-0.04em] text-white sm:text-4xl">{dossier.title[language]}</h2>
              <p className="mt-5 max-w-[68ch] text-pretty text-base leading-8 text-[#BDBDC2]">{dossier.summary[language]}<SourceMarks sourceIds={dossier.sourceIds} label={t.evidence} /></p>

              <div className="mt-9 border-y border-white/[0.1] py-6">
                <h3 className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/40">{t.threat}</h3>
                <p className="mt-3 max-w-[68ch] text-pretty text-base leading-8 text-[#D0D0D3]">{dossier.riskModel[language]}<SourceMarks sourceIds={dossier.sourceIds} label={t.evidence} /></p>
              </div>

              <div className="grid gap-px border-b border-white/[0.1] bg-white/[0.1] md:grid-cols-2">
                <div className="bg-[#070706] py-7 pr-0 md:pr-7"><h3 className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/40">{t.prevent}</h3><p className="mt-3 text-pretty text-sm leading-7 text-[#B7B7BC]">{dossier.prevention[language]}<SourceMarks sourceIds={dossier.sourceIds} label={t.evidence} /></p></div>
                <div className="bg-[#070706] py-7 md:pl-7"><h3 className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/40">{t.detect}</h3><p className="mt-3 text-pretty text-sm leading-7 text-[#B7B7BC]">{dossier.detection[language]}<SourceMarks sourceIds={dossier.sourceIds} label={t.evidence} /></p></div>
              </div>

              <div className="grid gap-8 pt-7 md:grid-cols-2">
                <div><h3 className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/40">{t.validate}</h3><p className="mt-3 text-pretty text-sm leading-7 text-[#A5A5AC]">{dossier.validation[language]}<SourceMarks sourceIds={dossier.sourceIds} label={t.evidence} /></p></div>
                <div><h3 className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/40">{t.limits}</h3><p className="mt-3 text-pretty text-sm leading-7 text-[#A5A5AC]">{dossier.limitations[language]}<SourceMarks sourceIds={dossier.sourceIds} label={t.evidence} /></p></div>
              </div>

              <div className="mt-8 border border-white/[0.14] bg-white/[0.025] p-5 sm:p-6"><h3 className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-white/45"><CheckCircle2 size={15} aria-hidden="true" />{t.workflow}</h3><p className="mt-3 text-pretty text-sm leading-7 text-[#D0D0D3]">{dossier.workflow[language]}<SourceMarks sourceIds={dossier.sourceIds} label={t.evidence} /></p></div>

              <div className="mt-7"><h3 className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/40">{t.evidence}</h3><ul className="mt-3 space-y-2">{dossier.sourceIds.map((sourceId) => { const source = sourceById.get(sourceId); return source ? <li key={sourceId}><a href={source.url} target="_blank" rel="noreferrer" className="group inline-flex items-start gap-2 text-sm leading-6 text-[#A9A9AF] underline decoration-white/20 underline-offset-4 hover:text-white"><span>{source.title} · {source.publisher}</span><ExternalLink size={13} className="mt-1.5 shrink-0 opacity-50 group-hover:opacity-100" /></a></li> : null; })}</ul></div>
            </div>
          </div>
        </section>)}
      </div>

      <aside className="space-y-7 lg:sticky lg:top-28">
        <nav aria-label={t.chapters} className="border-l border-white/[0.14] pl-5"><p className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/40">{t.chapters}</p><ol className="mt-4 space-y-3">{dossiers.map((dossier, index) => <li key={dossier.id}><a href={`#${dossier.id}`} className="grid grid-cols-[1.5rem_1fr] gap-2 text-sm leading-5 text-[#8F8F97] hover:text-white"><span className="font-mono text-[10px] text-white/30">{String(index + 1).padStart(2, "0")}</span><span>{dossier.title[language]}</span></a></li>)}</ol></nav>
        <div className="border-t border-white/[0.12] pt-6"><p className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/40">{t.related}</p><Link href={guidePath(companionSlug)} className="mt-3 block text-lg font-medium leading-6 text-white hover:text-[#CFCFD3]">{companion.title[language]}</Link><p className="mt-2 text-xs text-white/40">{t.otherGuide}</p></div>
      </aside>
    </div>

    <section className="mt-20 grid gap-8 border-y border-white/[0.12] py-10 sm:grid-cols-[1fr_auto] sm:items-center">
      <div><p className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/40">{t.next}</p><p className="mt-3 max-w-[62ch] text-base leading-7 text-[#A9A9AF]">{t.nextBody}</p></div>
      <Link href="/security-research" className="secondary-action gap-2">{t.nextAction}<ArrowRight size={15} /></Link>
    </section>
  </article>;
}
