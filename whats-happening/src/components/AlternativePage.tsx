import Link from "next/link";
import {
  ArrowRight,
  CircleAlert,
  ExternalLink,
  FileSearch,
  GitFork,
  Globe2,
  Radio,
  Search,
} from "lucide-react";
import { Footer } from "@/components/Footer";
import { GlobalNavbar } from "@/components/GlobalNavbar";
import {
  buildAlternativeJsonLd,
  type AlternativePageData,
} from "@/content/alternative-pages";

export function AlternativePage({ data }: { data: AlternativePageData }) {
  const jsonLd = buildAlternativeJsonLd(data);

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#050505] text-[#F5F5F5] selection:bg-white/10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <GlobalNavbar />

      <main>
        <section className="mx-auto grid w-full max-w-7xl gap-14 px-6 pb-24 pt-36 sm:pt-44 lg:grid-cols-[1.06fr_0.94fr] lg:items-end lg:gap-20 lg:pb-32">
          <div>
            <nav
              aria-label="Breadcrumb"
              className="flex flex-wrap items-center gap-2 font-mono text-xs uppercase tracking-[0.18em] text-[#71717A]"
            >
              <Link href="/how-it-works" className="transition-colors hover:text-white">
                Methodology
              </Link>
              <span aria-hidden="true">/</span>
              <span className="text-[#A1A1AA]">{data.eyebrow}</span>
            </nav>

            <h1 className="mt-7 max-w-4xl text-balance text-[clamp(3rem,6.6vw,6.25rem)] font-semibold leading-[0.91] tracking-[-0.07em] text-white">
              {data.heading}
            </h1>
            <p className="mt-8 max-w-[43rem] text-pretty text-lg leading-8 text-[#A1A1AA] sm:text-xl">
              {data.lead}
            </p>
            <Link
              href="/how-it-works"
              className="group mt-9 inline-flex min-h-12 items-center gap-3 rounded-full bg-white px-7 text-sm font-semibold text-black transition-[background-color,transform] duration-150 ease-out hover:bg-[#E8E8EA] active:translate-y-px focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
            >
              Inspect our scoring method
              <ArrowRight
                size={16}
                className="transition-transform duration-150 group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </Link>
          </div>

          <aside
            className="relative overflow-hidden rounded-2xl border border-white/[0.1] bg-[#0B0B0D] p-6 sm:p-8"
            aria-label="Research path"
          >
            <div className="relative flex items-center justify-between gap-4 border-b border-white/[0.08] pb-5">
              <div>
                <p className="font-mono text-[0.68rem] uppercase tracking-[0.2em] text-[#D8D4CA]">
                  Research fork
                </p>
                <p className="mt-2 text-sm text-[#A1A1AA]">Start with the evidence you need</p>
              </div>
              <FileSearch size={18} className="text-[#52525B]" aria-hidden="true" />
            </div>

            <div className="relative mt-7 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
              <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5">
                <Search size={17} className="text-[#8B8B93]" aria-hidden="true" />
                <p className="mt-5 text-sm font-medium text-white">{data.competitor}</p>
                <p className="mt-1 text-xs leading-5 text-[#71717A]">Its established research model</p>
              </div>
              <GitFork size={17} className="rotate-90 text-[#3F3F46]" aria-hidden="true" />
              <div className="rounded-2xl border border-stone-300/20 bg-stone-300/[0.045] p-5">
                <Radio size={17} className="text-[#D8D4CA]" aria-hidden="true" />
                <p className="mt-5 text-sm font-medium text-white">What&apos;s Happening</p>
                <p className="mt-1 text-xs leading-5 text-[#8B8B93]">Source-linked technology signals</p>
              </div>
            </div>

            <div className="relative mt-5 grid grid-cols-3 gap-2 border-t border-white/[0.08] pt-5 text-center">
              {[
                ["45%", "Velocity"],
                ["35%", "Reach"],
                ["20%", "Novelty"],
              ].map(([value, label]) => (
                <div key={label}>
                  <p className="font-mono text-sm tabular-nums text-white">{value}</p>
                  <p className="mt-1 text-[0.68rem] text-[#71717A]">{label}</p>
                </div>
              ))}
            </div>
          </aside>
        </section>

        <section className="border-y border-white/[0.08] bg-[#080809]">
          <div className="mx-auto grid w-full max-w-7xl gap-12 px-6 py-20 lg:grid-cols-[0.72fr_1.28fr] lg:gap-24 lg:py-28">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#D8D4CA]">Quick answer</p>
              <h2 className="mt-5 text-balance text-3xl font-medium tracking-[-0.04em] text-white sm:text-4xl">
                Pick the evidence model before the tool.
              </h2>
            </div>
            <div>
              <p className="max-w-[58rem] text-pretty text-xl leading-9 text-[#D4D4D8]">
                {data.quickAnswer}
              </p>
              <p className="mt-6 font-mono text-xs uppercase tracking-[0.16em] text-[#52525B]">
                Reviewed against first-party product sources on 21 August 2026
              </p>
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-7xl px-6 py-24 lg:py-32">
          <div className="grid gap-12 lg:grid-cols-[0.78fr_1.22fr] lg:gap-24">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#71717A]">At a glance</p>
              <h2 className="mt-5 text-balance text-3xl font-medium tracking-[-0.04em] text-white sm:text-4xl">
                Two different research jobs.
              </h2>
              <p className="mt-6 max-w-[34rem] text-pretty text-base leading-7 text-[#8B8B93]">
                This page compares the workflow each product is built around. It does not claim feature parity.
              </p>
            </div>
            <div className="divide-y divide-white/[0.08] border-y border-white/[0.08]">
              {[
                [data.competitor, data.competitorSummary, false],
                [
                  "What's Happening",
                  "An early-access approach designed to cluster official Hacker News, GitHub, and Google Trends RSS observations, expose the source trail, and publish its 45/35/20 scoring method.",
                  true,
                ],
              ].map(([name, summary, active]) => (
                <article key={name as string} className="grid gap-4 py-8 sm:grid-cols-[0.42fr_1fr] sm:gap-8">
                  <div className="flex items-center gap-3">
                    <span
                      className={`h-2 w-2 rounded-full ${active ? "bg-[#D8D4CA]" : "bg-white/20"}`}
                      aria-hidden="true"
                    />
                    <h3 className="text-sm font-medium text-white">{name as string}</h3>
                  </div>
                  <p className="text-sm leading-7 text-[#A1A1AA]">{summary as string}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="border-y border-white/[0.08] bg-[#0B0B0D]">
          <div className="mx-auto w-full max-w-7xl px-6 py-24 lg:py-32">
            <div className="max-w-3xl">
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#D8D4CA]">Decision table</p>
              <h2 className="mt-5 text-balance text-3xl font-medium tracking-[-0.04em] text-white sm:text-4xl">
                Six differences that change the choice.
              </h2>
              <p className="mt-6 text-pretty text-base leading-7 text-[#8B8B93]">
                Competitor claims come from first-party sources. What&apos;s Happening claims reflect its verified production state.
              </p>
            </div>

            <div className="mt-12 overflow-x-auto rounded-2xl border border-white/[0.1]">
              <table className="w-full min-w-[980px] border-collapse text-left">
                <thead className="bg-white/[0.03]">
                  <tr>
                    <th className="w-[16%] px-6 py-5 font-mono text-[0.68rem] uppercase tracking-[0.16em] text-[#71717A]">Axis</th>
                    <th className="w-[25%] px-6 py-5 text-sm font-medium text-white">{data.competitor}</th>
                    <th className="w-[29%] bg-stone-300/[0.035] px-6 py-5 text-sm font-medium text-[#B9F5FC]">What&apos;s Happening</th>
                    <th className="w-[30%] px-6 py-5 text-sm font-medium text-white">What it means</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.08]">
                  {data.axes.map((row) => (
                    <tr key={row.axis} className="align-top">
                      <th scope="row" className="px-6 py-6 text-sm font-medium text-white">{row.axis}</th>
                      <td className="px-6 py-6 text-sm leading-7 text-[#A1A1AA]">{row.competitor}</td>
                      <td className="bg-stone-300/[0.025] px-6 py-6 text-sm leading-7 text-[#B8B8C0]">{row.whatsHappening}</td>
                      <td className="px-6 py-6 text-sm leading-7 text-[#8B8B93]">{row.decision}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-4 text-xs leading-5 text-[#52525B] sm:hidden">
              Swipe horizontally to inspect every column.
            </p>
          </div>
        </section>

        <section className="mx-auto w-full max-w-7xl px-6 py-24 lg:py-32">
          <div className="grid gap-14 lg:grid-cols-[0.86fr_1.14fr] lg:items-start lg:gap-24">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#D8D4CA]">Our difference</p>
              <h2 className="mt-5 text-balance text-3xl font-medium tracking-[-0.04em] text-white sm:text-4xl">
                The score keeps its receipts.
              </h2>
              <p className="mt-6 max-w-[36rem] text-pretty text-base leading-7 text-[#A1A1AA]">
                What&apos;s Happening is designed so a trend is not just a line moving up. The cluster retains the observations used to score it, the earliest usable country tag, and a short explanation of what changed.
              </p>
              <p className="mt-5 max-w-[36rem] text-pretty text-sm leading-7 text-[#71717A]">
                That evidence path does not make the product a forecasting service, and it does not prove where an idea originated.
              </p>
            </div>

            <div className="rounded-2xl border border-white/[0.1] bg-[#0B0B0D] p-6 sm:p-8">
              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  [FileSearch, "Hacker News", "official API"],
                  [GitFork, "GitHub", "official search API"],
                  [Globe2, "Google Trends", "official RSS"],
                ].map(([Icon, label, source]) => {
                  const SourceIcon = Icon as typeof FileSearch;
                  return (
                    <div key={label as string} className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-4">
                      <SourceIcon size={17} className="text-[#D8D4CA]" aria-hidden="true" />
                      <p className="mt-4 text-sm font-medium text-white">{label as string}</p>
                      <p className="mt-1 font-mono text-[0.62rem] uppercase tracking-[0.13em] text-[#52525B]">{source as string}</p>
                    </div>
                  );
                })}
              </div>
              <div className="my-4 flex justify-center" aria-hidden="true">
                <span className="h-9 w-px bg-stone-300/25" />
              </div>
              <div className="rounded-2xl border border-stone-300/15 bg-stone-300/[0.035] p-5">
                <p className="font-mono text-[0.68rem] uppercase tracking-[0.16em] text-[#D8D4CA]">Inspect the chain</p>
                <p className="mt-3 text-sm leading-7 text-[#A1A1AA]">
                  Observation links → earliest country-tagged evidence → 45/35/20 score → concise Why Layer
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="border-y border-amber-200/[0.12] bg-amber-100/[0.035]">
          <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-6 py-16 sm:flex-row sm:items-start sm:gap-8">
            <CircleAlert size={22} className="mt-1 shrink-0 text-amber-100/80" aria-hidden="true" />
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.18em] text-amber-100/70">Current production limit</p>
              <h2 className="mt-4 text-balance text-2xl font-medium tracking-[-0.03em] text-white">
                The public interface is available. The live trend journey is not.
              </h2>
              <p className="mt-4 max-w-[62rem] text-pretty text-sm leading-7 text-[#A1A1AA]">
                Production has no connected trend data service or authentication configuration. Trend results, source trails, accounts, and chat therefore cannot complete their real loop. The product reports that state directly instead of presenting fixtures as live activity.
              </p>
              <div className="mt-5 flex flex-wrap gap-x-6 gap-y-3 text-sm">
                <Link href="/explore" className="text-white underline decoration-white/20 underline-offset-4 hover:decoration-white/60">
                  See the public explore state
                </Link>
                <Link href="/pricing" className="text-[#A1A1AA] underline decoration-white/15 underline-offset-4 hover:text-white">
                  Check current access
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-7xl px-6 py-24 lg:py-32">
          <div className="max-w-3xl">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#D8D4CA]">Best fit</p>
            <h2 className="mt-5 text-balance text-3xl font-medium tracking-[-0.04em] text-white sm:text-4xl">
              Choose by the decision in front of you.
            </h2>
          </div>
          <div className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-white/[0.1] bg-white/[0.1] lg:grid-cols-2">
            {[
              [data.competitor, data.bestFit.competitor, false],
              ["What's Happening", data.bestFit.whatsHappening, true],
            ].map(([name, copy, active]) => (
              <article key={name as string} className={`p-7 sm:p-9 ${active ? "bg-[#101518]" : "bg-[#0B0B0D]"}`}>
                <p className={`font-mono text-xs uppercase tracking-[0.16em] ${active ? "text-[#D8D4CA]" : "text-[#71717A]"}`}>
                  {name as string}
                </p>
                <p className="mt-6 text-pretty text-base leading-8 text-[#C4C4CA]">{copy as string}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="faq" className="border-y border-white/[0.08] bg-[#080809] scroll-mt-28">
          <div className="mx-auto grid w-full max-w-7xl gap-12 px-6 py-24 lg:grid-cols-[0.72fr_1.28fr] lg:gap-24 lg:py-32">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#D8D4CA]">FAQ</p>
              <h2 className="mt-5 text-balance text-3xl font-medium tracking-[-0.04em] text-white sm:text-4xl">
                The practical questions.
              </h2>
            </div>
            <div className="divide-y divide-white/[0.08] border-y border-white/[0.08]">
              {data.faq.map((item) => (
                <article key={item.question} className="py-7">
                  <h3 className="text-balance text-lg font-medium text-white">{item.question}</h3>
                  <p className="mt-3 max-w-[58rem] text-pretty text-sm leading-7 text-[#A1A1AA]">{item.answer}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-7xl px-6 py-20 lg:py-24">
          <div className="grid gap-12 lg:grid-cols-[0.72fr_1.28fr] lg:gap-24">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#71717A]">Sources</p>
              <h2 className="mt-5 text-balance text-2xl font-medium tracking-[-0.03em] text-white">
                First-party product evidence.
              </h2>
              <p className="mt-4 max-w-sm text-sm leading-6 text-[#71717A]">
                Product surfaces change. Re-check these links before making a high-stakes tooling decision.
              </p>
            </div>
            <ol className="divide-y divide-white/[0.08] border-y border-white/[0.08]">
              {data.sources.map((source, index) => {
                const external = source.url.startsWith("http") && !source.url.includes("whatshappeninginai.com");
                return (
                  <li key={source.url} className="grid gap-3 py-5 sm:grid-cols-[2rem_0.72fr_1.28fr] sm:items-start sm:gap-5">
                    <span className="font-mono text-xs tabular-nums text-[#52525B]">{String(index + 1).padStart(2, "0")}</span>
                    <a
                      href={source.url}
                      target={external ? "_blank" : undefined}
                      rel={external ? "noreferrer" : undefined}
                      className="inline-flex items-center gap-2 text-sm font-medium text-white hover:text-[#D8D4CA]"
                    >
                      {source.label}
                      {external && <ExternalLink size={13} aria-hidden="true" />}
                    </a>
                    <p className="text-sm leading-6 text-[#71717A]">{source.note}</p>
                  </li>
                );
              })}
            </ol>
          </div>
        </section>

        <section className="mx-auto w-full max-w-7xl px-6 pb-24 lg:pb-32">
          <div className="rounded-2xl border border-white/[0.1] bg-[#0B0B0D] p-8 sm:p-10">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#D8D4CA]">Continue the research</p>
            <div className="mt-7 grid gap-px overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.08] sm:grid-cols-2 lg:grid-cols-3">
              {data.related.map((item) => (
                <Link key={item.href} href={item.href} className="group bg-[#0B0B0D] p-5 transition-colors hover:bg-[#111114]">
                  <span className="flex items-center justify-between gap-3 text-sm font-medium text-white">
                    {item.label}
                    <ArrowRight size={14} className="shrink-0 text-[#52525B] transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                  </span>
                  <span className="mt-2 block text-xs leading-5 text-[#71717A]">{item.note}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
