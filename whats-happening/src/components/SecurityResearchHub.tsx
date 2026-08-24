"use client";

import { useMemo, useState } from "react";
import { ChevronDown, ExternalLink, Search, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { guidePath, securityGuides, type SecurityGuideSlug } from "@/content/security-guides";
import { securityDossiers, sourceById, type LocalizedText } from "@/content/security-research";
import researchState from "@/content/security-research-state.json";
import { useLocale } from "@/i18n/locale";
import { searchSecurityDossiers, type SecurityCategory } from "@/lib/security-research";

const categories: SecurityCategory[] = ["All", "Application", "Data", "Model", "Agent", "Hallucination"];

const copy = {
  en: {
    kicker: "Defensive AI security desk",
    title: "Research the failure mode before it reaches production.",
    intro: "Searchable, source-linked dossiers for building safer AI systems. Each record separates prevention, detection, validation and known limits; no exploit payloads or universal-safety claims.",
    search: "Search risks, controls or sources",
    all: "All",
    dossier: "dossiers",
    sources: "primary and official sources",
    checked: "evidence checked",
    results: "matching dossiers",
    none: "No dossier matches this search.",
    riskModel: "Risk model",
    prevention: "Prevention",
    detection: "Detection",
    validation: "Validation",
    limitations: "Limitations",
    workflow: "Defensive workflow",
    evidence: "Evidence",
    version: "Version",
    verified: "last verified",
    reviewRequired: "evidence review required",
    methods: "Hallucination-control comparison",
    guides: "Evergreen field guides",
    guidesIntro: "Start with a structured operating guide, then use the dossiers below for individual failure modes and source records.",
    readGuide: "Read guide",
    detects: "What it detects",
    failure: "Failure condition",
    operations: "Operational use",
  },
  tr: {
    kicker: "Savunma odaklı yapay zeka güvenlik masası",
    title: "Hata biçimini üretime ulaşmadan araştırın.",
    intro: "Daha güvenli yapay zeka sistemleri kurmak için aranabilir, kaynak bağlantılı dosyalar. Her kayıt önleme, tespit, doğrulama ve bilinen sınırları ayırır; istismar yükü veya evrensel güvenlik iddiası içermez.",
    search: "Risk, kontrol veya kaynak ara",
    all: "Tümü",
    dossier: "dosya",
    sources: "birincil ve resmî kaynak",
    checked: "kanıt denetimi",
    results: "eşleşen dosya",
    none: "Bu aramayla eşleşen dosya yok.",
    riskModel: "Risk modeli",
    prevention: "Önleme",
    detection: "Tespit",
    validation: "Doğrulama",
    limitations: "Sınırlar",
    workflow: "Savunma iş akışı",
    evidence: "Kanıt",
    version: "Sürüm",
    verified: "son doğrulama",
    reviewRequired: "kanıt incelemesi gerekiyor",
    methods: "Halüsinasyon kontrolü karşılaştırması",
    guides: "Kalıcı saha rehberleri",
    guidesIntro: "Yapılandırılmış bir işletim rehberiyle başlayın; ardından hata biçimleri ve kaynak kayıtları için aşağıdaki dosyaları kullanın.",
    readGuide: "Rehberi oku",
    detects: "Neyi tespit eder",
    failure: "Başarısızlık koşulu",
    operations: "Operasyonel kullanım",
  },
};

const categoryLabels: Record<SecurityCategory, LocalizedText> = {
  All: { en: "All", tr: "Tümü" },
  Application: { en: "Application", tr: "Uygulama" },
  Data: { en: "Data", tr: "Veri" },
  Model: { en: "Model", tr: "Model" },
  Agent: { en: "Agent", tr: "Ajan" },
  Hallucination: { en: "Hallucination", tr: "Halüsinasyon" },
};

type DossierState = {
  version: number;
  lastVerified: string;
  evidenceCheckedAt: string;
  reviewStatus: "verified" | "review-required";
  changeSummary: LocalizedText;
};

function formatDate(value: string, locale: "en" | "tr") {
  return new Intl.DateTimeFormat(locale === "tr" ? "tr-TR" : "en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(`${value}T00:00:00Z`));
}

export function SecurityResearchHub() {
  const { locale } = useLocale();
  const language = locale === "tr" ? "tr" : "en";
  const t = copy[language];
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<SecurityCategory>("All");
  const results = useMemo(() => searchSecurityDossiers(query, category, language), [query, category, language]);
  const states = researchState.dossiers as Record<string, DossierState>;
  const guides = Object.values(securityGuides) as (typeof securityGuides)[SecurityGuideSlug][];

  return (
    <div className="mx-auto max-w-[1440px] px-5 pb-24 pt-32 sm:px-8 lg:px-12 lg:pt-40">
      <section className="grid border-b border-white/[0.12] pb-12 lg:grid-cols-[minmax(0,1.2fr)_minmax(20rem,0.8fr)] lg:items-end lg:gap-16 lg:pb-16">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#A5A5AC]">{t.kicker}</p>
          <h1 className="mt-5 max-w-4xl text-4xl font-medium leading-[0.98] tracking-[-0.055em] text-[#F3F3F1] sm:text-6xl lg:text-7xl">{t.title}</h1>
          <p className="mt-7 max-w-2xl text-base leading-7 text-[#A9A9AF] sm:text-lg">{t.intro}</p>
        </div>
        <label className="mt-10 block lg:mt-0">
          <span className="sr-only">{t.search}</span>
          <span className="flex min-h-16 items-center gap-4 border border-white/[0.18] bg-[#0D0D0E] px-5 transition-colors focus-within:border-white/50">
            <Search size={19} className="shrink-0 text-[#A5A5AC]" aria-hidden="true" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t.search} className="w-full bg-transparent text-base text-white outline-none placeholder:text-[#77777F]" />
            <kbd className="hidden border border-white/[0.12] px-2 py-1 font-mono text-[10px] text-[#77777F] sm:block">/</kbd>
          </span>
        </label>
      </section>

      <section className="grid border-b border-white/[0.12] text-sm text-[#A5A5AC] sm:grid-cols-3" aria-label="Research status">
        <p className="border-b border-white/[0.12] py-4 sm:border-b-0 sm:border-r sm:pr-5"><strong className="mr-2 font-mono text-white">{securityDossiers.length}</strong>{t.dossier}</p>
        <p className="border-b border-white/[0.12] py-4 sm:border-b-0 sm:border-r sm:px-5"><strong className="mr-2 font-mono text-white">{Object.keys(researchState.sources).length}</strong>{t.sources}</p>
        <p className="py-4 sm:pl-5"><strong className="mr-2 font-mono text-white">{formatDate(researchState.checkedAt, language)}</strong>{t.checked}</p>
      </section>

      <section className="grid gap-8 border-b border-white/[0.12] py-10 lg:grid-cols-[minmax(15rem,0.55fr)_minmax(0,1.45fr)] lg:items-start lg:py-12" aria-labelledby="security-guides-heading">
        <div>
          <h2 id="security-guides-heading" className="text-2xl font-medium tracking-[-0.03em] text-white">{t.guides}</h2>
          <p className="mt-3 max-w-[42ch] text-sm leading-6 text-[#92929A]">{t.guidesIntro}</p>
        </div>
        <div className="grid gap-px border border-white/[0.12] bg-white/[0.12] sm:grid-cols-2">
          {guides.map((guide) => <Link key={guide.slug} href={guidePath(guide.slug)} className="group flex min-h-52 flex-col justify-between bg-[#09090A] p-6 transition-colors hover:bg-[#0F0F10] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
            <div><p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#77777F]">{guide.kicker[language]}</p><h3 className="mt-4 text-2xl font-medium tracking-[-0.035em] text-[#EEEEEC]">{guide.title[language]}</h3><p className="mt-3 text-sm leading-6 text-[#92929A]">{guide.description[language]}</p></div>
            <span className="mt-7 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-white">{t.readGuide}<span aria-hidden="true">→</span></span>
          </Link>)}
        </div>
      </section>

      <section className="pt-10">
        <div className="flex flex-col gap-6 border-b border-white/[0.12] pb-7 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex flex-wrap gap-x-6 gap-y-3" aria-label="Dossier categories">
            {categories.map((item) => <button key={item} type="button" onClick={() => setCategory(item)} aria-pressed={category === item} className={`min-h-11 border-b text-xs font-medium uppercase tracking-[0.14em] transition-colors ${category === item ? "border-white text-white" : "border-transparent text-[#85858D] hover:text-white"}`}>{categoryLabels[item][language]}</button>)}
          </div>
          <p className="font-mono text-xs text-[#85858D]">{String(results.length).padStart(2, "0")} {t.results}</p>
        </div>

        <div aria-live="polite">
          {results.length === 0 && <p className="border-b border-white/[0.12] py-16 text-center text-[#92929B]">{t.none}</p>}
          {results.map((dossier, index) => {
            const state = states[dossier.id];
            return (
              <details key={dossier.id} className="group border-b border-white/[0.12] open:bg-white/[0.018]">
                <summary className="grid cursor-pointer list-none gap-4 py-7 marker:content-none sm:grid-cols-[3rem_9rem_minmax(0,1fr)_auto] sm:items-start sm:gap-6">
                  <span className="font-mono text-xs text-[#66666E]">{String(index + 1).padStart(2, "0")}</span>
                  <span className="w-fit border border-white/[0.14] px-2 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-[#A5A5AC]">{categoryLabels[dossier.category][language]}</span>
                  <span>
                    <span className="block text-xl font-medium tracking-[-0.02em] text-[#EEEEEC] sm:text-2xl">{dossier.title[language]}</span>
                    <span className="mt-2 block max-w-3xl text-sm leading-6 text-[#96969E]">{dossier.summary[language]}</span>
                    {state && <span className="mt-3 block font-mono text-[10px] uppercase tracking-[0.1em] text-[#67676F]">v{state.version} · {t.verified} {formatDate(state.lastVerified, language)}{state.reviewStatus === "review-required" ? ` · ${t.reviewRequired}` : ""}</span>}
                  </span>
                  <ChevronDown size={18} className="mt-1 text-[#77777F] transition-transform group-open:rotate-180" aria-hidden="true" />
                </summary>

                <div className="pb-10 sm:pl-[14rem] sm:pr-14">
                  <div className="grid gap-px border border-white/[0.12] bg-white/[0.12] md:grid-cols-2 xl:grid-cols-3">
                    {([
                      [t.riskModel, dossier.riskModel], [t.prevention, dossier.prevention], [t.detection, dossier.detection],
                      [t.validation, dossier.validation], [t.limitations, dossier.limitations], [t.workflow, dossier.workflow],
                    ] as [string, LocalizedText][]).map(([label, value]) => <article key={label} className="bg-[#09090A] p-5 sm:p-6"><h2 className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#77777F]">{label}</h2><p className="mt-3 text-sm leading-6 text-[#C2C2C5]">{value[language]}</p></article>)}
                  </div>

                  {dossier.methodComparison && <section className="mt-8"><h2 className="font-mono text-[11px] uppercase tracking-[0.16em] text-[#A5A5AC]">{t.methods}</h2><div className="mt-4 overflow-x-auto border border-white/[0.12]"><table className="min-w-[900px] border-collapse text-left text-sm"><thead className="bg-white/[0.04] font-mono text-[10px] uppercase tracking-[0.12em] text-[#85858D]"><tr><th className="p-4 font-medium">Method</th><th className="p-4 font-medium">{t.detects}</th><th className="p-4 font-medium">{t.failure}</th><th className="p-4 font-medium">{t.operations}</th></tr></thead><tbody>{dossier.methodComparison.map((method) => <tr key={method.name.en} className="border-t border-white/[0.1] align-top"><th className="p-4 font-medium text-white">{method.name[language]}</th><td className="p-4 leading-6 text-[#A9A9AF]">{method.detects[language]}</td><td className="p-4 leading-6 text-[#A9A9AF]">{method.failureCondition[language]}</td><td className="p-4 leading-6 text-[#A9A9AF]">{method.operationalUse[language]}</td></tr>)}</tbody></table></div></section>}

                  <section className="mt-8 grid gap-6 border-t border-white/[0.12] pt-6 lg:grid-cols-[1fr_auto]">
                    <div><h2 className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em] text-[#A5A5AC]"><ShieldCheck size={15} />{t.evidence}</h2><ul className="mt-4 space-y-3">{dossier.sourceIds.map((sourceId) => { const source = sourceById.get(sourceId); return source ? <li key={sourceId}><a href={source.url} target="_blank" rel="noreferrer" className="group/link inline-flex items-start gap-2 text-sm leading-6 text-[#B9B9BE] underline decoration-white/20 underline-offset-4 hover:text-white"><span>{source.title} · {source.publisher}</span><ExternalLink size={13} className="mt-1.5 shrink-0 opacity-50 group-hover/link:opacity-100" /></a></li> : null; })}</ul></div>
                    {state && <dl className="grid content-start gap-2 font-mono text-[10px] uppercase tracking-[0.1em] text-[#77777F] lg:text-right"><div>{t.version} <strong className="font-medium text-[#B8B8BD]">{state.version}</strong></div><div>{t.verified} <strong className="font-medium text-[#B8B8BD]">{formatDate(state.lastVerified, language)}</strong></div><div className="max-w-xs normal-case tracking-normal text-[#85858D]">{state.changeSummary[language]}</div></dl>}
                  </section>
                </div>
              </details>
            );
          })}
        </div>
      </section>
    </div>
  );
}
