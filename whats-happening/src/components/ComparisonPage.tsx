import Link from "next/link";
import {
  ArrowRight,
  CircleAlert,
  ExternalLink,
  GitCompareArrows,
  GitFork,
  Globe2,
  Radio,
  SearchCheck,
} from "lucide-react";
import { Footer } from "@/components/Footer";
import { GlobalNavbar } from "@/components/GlobalNavbar";
import {
  buildComparisonJsonLd,
  type ComparisonPageData,
} from "@/content/comparison-pages";

function ToolMark({ name, active = false }: { name: string; active?: boolean }) {
  return (
    <div
      className={`flex min-h-14 items-center justify-between gap-4 rounded-2xl border px-5 ${
        active
          ? "border-cyan-300/25 bg-cyan-300/[0.055]"
          : "border-white/[0.08] bg-white/[0.025]"
      }`}
    >
      <span className={`text-sm font-medium ${active ? "text-white" : "text-[#C4C4CA]"}`}>
        {name}
      </span>
      <span
        className={`h-2 w-2 rounded-full ${active ? "bg-[#67E8F9]" : "bg-white/20"}`}
        aria-hidden="true"
      />
    </div>
  );
}

export function ComparisonPage({ data }: { data: ComparisonPageData }) {
  const jsonLd = buildComparisonJsonLd(data);

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
        <section className="mx-auto grid w-full max-w-7xl gap-14 px-6 pb-24 pt-36 sm:pt-44 lg:grid-cols-[1.04fr_0.96fr] lg:items-end lg:gap-20 lg:pb-32">
          <div>
            <nav
              aria-label="Breadcrumb"
              className="flex flex-wrap items-center gap-2 font-mono text-xs uppercase tracking-[0.18em] text-[#71717A]"
            >
              <Link href="/how-it-works" className="transition-colors hover:text-white">
                Methodology
              </Link>
              <span aria-hidden="true">/</span>
              <span className="text-[#A1A1AA]">Comparison</span>
            </nav>

            <h1 className="mt-7 max-w-4xl text-balance text-[clamp(3.1rem,7vw,6.6rem)] font-semibold leading-[0.9] tracking-[-0.07em] text-white">
              {data.heading}
            </h1>
            <p className="mt-8 max-w-[42rem] text-pretty text-lg leading-8 text-[#A1A1AA] sm:text-xl">
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
            <p className="mt-5 text-sm text-[#71717A]">
              Also compare{" "}
              <Link href={data.sibling.href} className="text-[#A1A1AA] underline decoration-white/20 underline-offset-4 hover:text-white">
                {data.sibling.label}
              </Link>
              .
            </p>
          </div>

          <aside className="relative overflow-hidden rounded-[2rem] border border-white/[0.1] bg-[#0B0B0D] p-6 sm:p-8" aria-label="Comparison orientation">
            <div className="flex items-center justify-between gap-4 border-b border-white/[0.08] pb-5">
              <div>
                <p className="font-mono text-[0.68rem] uppercase tracking-[0.2em] text-[#67E8F9]">
                  Decision lens
                </p>
                <p className="mt-2 text-sm text-[#A1A1AA]">Three different research jobs</p>
              </div>
              <GitCompareArrows size={18} className="text-[#52525B]" aria-hidden="true" />
            </div>

            <div className="mt-7 space-y-3">
              <ToolMark name={data.competitor} />
              <ToolMark name={data.alternative} />
              <ToolMark name="What's Happening" active />
            </div>

            <div className="mt-7 grid grid-cols-3 gap-2 border-t border-white/[0.08] pt-6 text-center">
              {[
                ["Discover", "prepared topics"],
                ["Validate", "known demand"],
                ["Inspect", "source trail"],
              ].map(([label, copy]) => (
                <div key={label}>
                  <p className="text-xs font-medium text-white">{label}</p>
                  <p className="mt-1 text-[0.68rem] leading-4 text-[#71717A]">{copy}</p>
                </div>
              ))}
            </div>
          </aside>
        </section>

        <section className="border-y border-white/[0.08] bg-[#080809]">
          <div className="mx-auto grid w-full max-w-7xl gap-12 px-6 py-20 lg:grid-cols-[0.72fr_1.28fr] lg:gap-24 lg:py-28">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#67E8F9]">Quick answer</p>
              <h2 className="mt-5 text-balance text-3xl font-medium tracking-[-0.04em] text-white sm:text-4xl">
                Pick the workflow, not the longest feature list.
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
                What each product is built to do.
              </h2>
              <p className="mt-6 max-w-[34rem] text-pretty text-base leading-7 text-[#8B8B93]">
                This is a job-to-be-done comparison, not a claim that one product contains every feature of another.
              </p>
            </div>

            <div className="divide-y divide-white/[0.08] border-y border-white/[0.08]">
              {[
                [data.competitor, data.competitorSummary],
                [data.alternative, data.alternativeSummary],
                ["What's Happening", data.whatsHappeningSummary],
              ].map(([name, summary], index) => (
                <article key={name} className="grid gap-4 py-7 sm:grid-cols-[0.42fr_1fr] sm:gap-8">
                  <div className="flex items-center gap-3">
                    <span
                      className={`h-2 w-2 rounded-full ${index === 2 ? "bg-[#67E8F9]" : "bg-white/20"}`}
                      aria-hidden="true"
                    />
                    <h3 className="text-sm font-medium text-white">{name}</h3>
                  </div>
                  <p className="text-sm leading-7 text-[#A1A1AA]">{summary}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="border-y border-white/[0.08] bg-[#0B0B0D]">
          <div className="mx-auto w-full max-w-7xl px-6 py-24 lg:py-32">
            <div className="max-w-3xl">
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#67E8F9]">Feature comparison</p>
              <h2 className="mt-5 text-balance text-3xl font-medium tracking-[-0.04em] text-white sm:text-4xl">
                Six axes that change the research decision.
              </h2>
              <p className="mt-6 text-pretty text-base leading-7 text-[#8B8B93]">
                Claims below are limited to first-party descriptions and the verified production state of What&apos;s Happening.
              </p>
            </div>

            <div className="mt-12 overflow-x-auto rounded-[2rem] border border-white/[0.1]">
              <table className="w-full min-w-[940px] border-collapse text-left">
                <thead className="bg-white/[0.03]">
                  <tr>
                    <th className="w-[17%] px-6 py-5 font-mono text-[0.68rem] uppercase tracking-[0.16em] text-[#71717A]">Axis</th>
                    <th className="w-[27.6%] px-6 py-5 text-sm font-medium text-white">{data.competitor}</th>
                    <th className="w-[27.6%] px-6 py-5 text-sm font-medium text-white">{data.alternative}</th>
                    <th className="w-[27.8%] bg-cyan-300/[0.035] px-6 py-5 text-sm font-medium text-[#B9F5FC]">What&apos;s Happening</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.08]">
                  {data.axes.map((row) => (
                    <tr key={row.axis} className="align-top">
                      <th scope="row" className="px-6 py-6 text-sm font-medium text-white">{row.axis}</th>
                      <td className="px-6 py-6 text-sm leading-7 text-[#A1A1AA]">{row.competitor}</td>
                      <td className="px-6 py-6 text-sm leading-7 text-[#A1A1AA]">{row.alternative}</td>
                      <td className="bg-cyan-300/[0.025] px-6 py-6 text-sm leading-7 text-[#B8B8C0]">{row.whatsHappening}</td>
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
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#67E8F9]">Our difference</p>
              <h2 className="mt-5 text-balance text-3xl font-medium tracking-[-0.04em] text-white sm:text-4xl">
                The score keeps its receipts.
              </h2>
              <p className="mt-6 max-w-[36rem] text-pretty text-base leading-7 text-[#A1A1AA]">
                What&apos;s Happening is designed so a trend is not just a line moving up. The cluster retains the observations used to score it, the earliest usable country tag, and a short explanation of what changed.
              </p>
              <p className="mt-5 max-w-[36rem] text-pretty text-sm leading-7 text-[#71717A]">
                That narrower evidence path is useful for technology research. It does not make the product a forecasting service, and it does not prove where an idea originated.
              </p>
            </div>

            <div className="rounded-[2rem] border border-white/[0.1] bg-[#0B0B0D] p-6 sm:p-8">
              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  [SearchCheck, "Hacker News", "official API"],
                  [GitFork, "GitHub", "official search API"],
                  [Globe2, "Google Trends", "official RSS"],
                ].map(([Icon, label, source]) => {
                  const SourceIcon = Icon as typeof SearchCheck;
                  return (
                    <div key={label as string} className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-4">
                      <SourceIcon size={17} className="text-[#67E8F9]" aria-hidden="true" />
                      <p className="mt-4 text-sm font-medium text-white">{label as string}</p>
                      <p className="mt-1 font-mono text-[0.62rem] uppercase tracking-[0.13em] text-[#52525B]">{source as string}</p>
                    </div>
                  );
                })}
              </div>

              <div className="my-4 flex justify-center" aria-hidden="true">
                <span className="h-9 w-px bg-cyan-300/25" />
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  ["45%", "Velocity"],
                  ["35%", "Reach"],
                  ["20%", "Novelty"],
                ].map(([value, label]) => (
                  <div key={label} className="rounded-2xl border border-white/[0.08] bg-[#111114] p-4 text-center">
                    <p className="font-mono text-lg tabular-nums text-white">{value}</p>
                    <p className="mt-1 text-xs text-[#71717A]">{label}</p>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex items-start gap-3 rounded-2xl border border-cyan-300/15 bg-cyan-300/[0.035] p-5">
                <Radio size={17} className="mt-0.5 shrink-0 text-[#67E8F9]" aria-hidden="true" />
                <p className="text-sm leading-6 text-[#A1A1AA]">
                  Source links + earliest country-tagged evidence + Why Layer
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
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#67E8F9]">Best fit</p>
            <h2 className="mt-5 text-balance text-3xl font-medium tracking-[-0.04em] text-white sm:text-4xl">
              Choose by the decision in front of you.
            </h2>
          </div>

          <div className="mt-12 grid gap-px overflow-hidden rounded-[2rem] border border-white/[0.1] bg-white/[0.1] lg:grid-cols-3">
            {[
              [data.competitor, data.choiceGuidance.competitor],
              [data.alternative, data.choiceGuidance.alternative],
              ["What's Happening", data.choiceGuidance.whatsHappening],
            ].map(([name, copy], index) => (
              <article key={name} className={`p-7 sm:p-9 ${index === 2 ? "bg-[#101518]" : "bg-[#0B0B0D]"}`}>
                <p className={`font-mono text-xs uppercase tracking-[0.16em] ${index === 2 ? "text-[#67E8F9]" : "text-[#71717A]"}`}>
                  {name}
                </p>
                <p className="mt-6 text-pretty text-base leading-8 text-[#C4C4CA]">{copy}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="faq" className="border-y border-white/[0.08] bg-[#080809] scroll-mt-28">
          <div className="mx-auto grid w-full max-w-7xl gap-12 px-6 py-24 lg:grid-cols-[0.72fr_1.28fr] lg:gap-24 lg:py-32">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#67E8F9]">FAQ</p>
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
                      className="inline-flex items-center gap-2 text-sm font-medium text-white hover:text-[#67E8F9]"
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
          <div className="flex flex-col items-start justify-between gap-8 rounded-[2rem] border border-white/[0.1] bg-[#0B0B0D] p-8 sm:p-10 lg:flex-row lg:items-center">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#67E8F9]">Next comparison</p>
              <h2 className="mt-4 text-balance text-2xl font-medium tracking-[-0.03em] text-white sm:text-3xl">
                {data.sibling.label}
              </h2>
            </div>
            <Link href={data.sibling.href} className="group inline-flex items-center gap-3 text-sm font-medium text-white">
              Read the comparison
              <ArrowRight size={16} className="transition-transform duration-150 group-hover:translate-x-0.5" aria-hidden="true" />
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
