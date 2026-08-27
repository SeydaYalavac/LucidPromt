import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  CircleCheck,
  CircleDashed,
  GitFork,
  Globe2,
  Radio,
  SearchCheck,
} from "lucide-react";
import { Footer } from "@/components/Footer";
import { GlobalNavbar } from "@/components/GlobalNavbar";

export const metadata: Metadata = {
  title: "How the signal engine works | What's Happening",
  description:
    "See how What's Happening turns official source observations into scored trends, country context, and early breakout watch signals.",
  alternates: {
    canonical: "https://www.whatshappeninginai.com/how-it-works",
  },
  openGraph: {
    title: "How the signal engine works | What's Happening",
    description:
      "From source observation to scored trend: a plain-language guide to the What's Happening signal engine.",
    url: "https://www.whatshappeninginai.com/how-it-works",
    type: "website",
  },
};

const questions = [
  {
    question: "What is a signal?",
    answer:
      "A signal is one normalized observation from one source, such as a Hacker News story, a public GitHub repository, or a Google Trends query. It is not a unique person, impression, or verified fact on its own.",
  },
  {
    question: "What did the old 24,832 signals number mean?",
    answer:
      "The prototype displayed 24,832 as a fixed sample count. It was not a verified production total. The production interface shows only records returned by the connected data service and shows an unavailable state when that service is not configured.",
  },
  {
    question: "How is a country attached to a trend?",
    answer:
      "Country context comes from the earliest signal in a cluster that carries usable geographic metadata. It describes where evidence first appeared in the system, not who invented a topic or what caused it.",
  },
  {
    question: "What is a breakout watch signal?",
    answer:
      "It is an early trend candidate with rising engagement, useful source reach, and strong novelty that has not crossed the Global Pulse score threshold. It is a watch signal, not a guarantee.",
  },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: questions.map(({ question, answer }) => ({
    "@type": "Question",
    name: question,
    acceptedAnswer: {
      "@type": "Answer",
      text: answer,
    },
  })),
};

const sourceRows = [
  {
    name: "Hacker News",
    access: "Official Firebase API",
    stores: "Story title, link, score, comments, and time",
  },
  {
    name: "GitHub",
    access: "Official REST Search API",
    stores: "Repository details, link, stars, forks, and time",
  },
  {
    name: "Google Trends",
    access: "Official trending RSS",
    stores: "Query, approximate traffic, feed country, and time",
  },
];

const scoreParts = [
  {
    label: "Velocity",
    value: "45%",
    width: "45%",
    copy: "How quickly engagement is arriving, with recent observations weighted into the score.",
  },
  {
    label: "Reach",
    value: "35%",
    width: "35%",
    copy: "Total engagement, estimated audience where available, and the number of distinct sources.",
  },
  {
    label: "Novelty",
    value: "20%",
    width: "20%",
    copy: "How varied the topic language is and whether the evidence spans more than one source.",
  },
];

function QuestionLabel({ number, children }: { number: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-4">
      <span className="font-mono text-xs tabular-nums text-[#52525B]">{number}</span>
      <h2 className="text-balance text-3xl font-medium tracking-[-0.035em] text-white sm:text-4xl">
        {children}
      </h2>
    </div>
  );
}

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-[#050505] text-[#F5F5F5] selection:bg-white/10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqJsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <GlobalNavbar />

      <main>
        <section className="mx-auto grid w-full max-w-7xl gap-14 px-6 pb-24 pt-36 sm:pt-44 lg:grid-cols-[1.05fr_0.95fr] lg:items-end lg:gap-20 lg:pb-32">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.22em] text-[#8B8B93]">
              How it works / signal engine
            </p>
            <h1 className="mt-7 max-w-4xl text-balance text-[clamp(3.2rem,7vw,6.8rem)] font-semibold leading-[0.9] tracking-[-0.07em] text-white">
              From raw signal to a trend you can inspect.
            </h1>
            <p className="mt-8 max-w-[38rem] text-pretty text-lg leading-8 text-[#A1A1AA] sm:text-xl">
              What&apos;s Happening groups related source observations, scores the movement, and keeps the evidence trail attached. You can see what changed without taking a black box on trust.
            </p>
            <Link
              href="/#trending"
              className="group mt-9 inline-flex min-h-12 items-center gap-3 rounded-full bg-white px-7 text-sm font-semibold text-black transition-[background-color,transform] duration-150 ease-out hover:bg-[#E8E8EA] active:translate-y-px focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
            >
              Inspect the public feed
              <ArrowRight size={16} className="transition-transform duration-150 group-hover:translate-x-0.5" aria-hidden="true" />
            </Link>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-white/[0.1] bg-[#0B0B0D] p-6 sm:p-8">
            <div className="relative flex items-center justify-between border-b border-white/[0.08] pb-5">
              <div>
                <p className="font-mono text-[0.68rem] uppercase tracking-[0.2em] text-[#D8D4CA]">Signal path</p>
                <p className="mt-2 text-sm text-[#A1A1AA]">Designed for a 10-minute ingestion cycle</p>
              </div>
              <span className="flex items-center gap-2 font-mono text-[0.68rem] uppercase tracking-[0.16em] text-[#71717A]">
                <Radio size={13} aria-hidden="true" /> source-linked
              </span>
            </div>

            <div className="relative mt-7 grid gap-3 sm:grid-cols-3">
              {[
                { icon: SearchCheck, label: "Hacker News" },
                { icon: GitFork, label: "GitHub" },
                { icon: Globe2, label: "Google Trends" },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-4">
                  <Icon size={17} className="text-[#D8D4CA]" aria-hidden="true" />
                  <p className="mt-4 text-sm font-medium text-white">{label}</p>
                  <p className="mt-1 font-mono text-[0.65rem] uppercase tracking-[0.14em] text-[#52525B]">official feed</p>
                </div>
              ))}
            </div>

            <div className="relative my-3 flex justify-center">
              <span className="h-8 w-px bg-white/20" />
            </div>

            <div className="relative grid gap-3 sm:grid-cols-3">
              {[
                ["01", "Normalize", "Common fields"],
                ["02", "Cluster", "Related topics"],
                ["03", "Score", "0–100"],
              ].map(([number, label, copy]) => (
                <div key={number} className="flex items-center gap-3 rounded-2xl border border-white/[0.08] bg-[#111114] p-4">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-stone-300/20 bg-stone-300/[0.06] font-mono text-[0.65rem] text-[#D8D4CA]">
                    {number}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-white">{label}</p>
                    <p className="mt-0.5 text-xs text-[#71717A]">{copy}</p>
                  </div>
                </div>
              ))}
            </div>

            <p className="relative mt-6 flex items-start gap-2 border-t border-white/[0.08] pt-5 text-xs leading-5 text-[#71717A]">
              <CircleDashed size={15} className="mt-0.5 shrink-0" aria-hidden="true" />
              If the production data service is not connected, the feed says so. It does not swap in demo figures and call them live.
            </p>
          </div>
        </section>

        <section className="border-y border-white/[0.08] bg-[#080809]">
          <div className="mx-auto grid w-full max-w-7xl gap-12 px-6 py-20 lg:grid-cols-[0.82fr_1.18fr] lg:gap-24 lg:py-28">
            <div>
              <QuestionLabel number="01">What counts as a signal?</QuestionLabel>
              <p className="mt-7 max-w-[34rem] text-pretty text-base leading-7 text-[#A1A1AA]">
                One signal is one normalized observation from one source. A Hacker News story, a public repository, or a trending search query can each become a signal. It is not a unique person, impression, or verified fact on its own.
              </p>
            </div>

            <div className="rounded-2xl border border-white/[0.1] bg-[#0B0B0D] p-7 sm:p-9">
              <p className="font-mono text-xs uppercase tracking-[0.18em] text-[#D8D4CA]">About 24,832</p>
              <h3 className="mt-5 text-balance text-2xl font-medium tracking-[-0.03em] text-white">
                The prototype number was a fixture, not a live production total.
              </h3>
              <p className="mt-4 max-w-[52rem] text-pretty text-sm leading-7 text-[#A1A1AA]">
                The early interface displayed 24,832 as a fixed sample count. The current product only shows records returned by its connected data service. When that service is unavailable, the interface shows an unavailable state instead of presenting the fixture as current activity.
              </p>
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-7xl px-6 py-24 lg:py-32">
          <div className="grid gap-12 lg:grid-cols-[0.82fr_1.18fr] lg:gap-24">
            <div>
              <QuestionLabel number="02">Where does the feed look?</QuestionLabel>
              <p className="mt-7 max-w-[34rem] text-pretty text-base leading-7 text-[#A1A1AA]">
                The default ingestion uses official, credential-free endpoints. Optional Reddit, X, Tavily, and Exa adapters stay off unless their provider credentials are configured.
              </p>
            </div>

            <div className="divide-y divide-white/[0.08] border-y border-white/[0.08]">
              {sourceRows.map((source) => (
                <div key={source.name} className="grid gap-3 py-6 sm:grid-cols-[0.75fr_1fr_1.45fr] sm:items-start sm:gap-6">
                  <p className="text-sm font-medium text-white">{source.name}</p>
                  <p className="text-sm leading-6 text-[#A1A1AA]">{source.access}</p>
                  <p className="text-sm leading-6 text-[#71717A]">{source.stores}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-[#0B0B0D]">
          <div className="mx-auto grid w-full max-w-7xl gap-12 px-6 py-24 lg:grid-cols-[0.82fr_1.18fr] lg:gap-24 lg:py-32">
            <div>
              <QuestionLabel number="03">How is country context assigned?</QuestionLabel>
              <p className="mt-7 max-w-[34rem] text-pretty text-base leading-7 text-[#A1A1AA]">
                Country context is assigned only when one source-attributed market has a unique earliest observation in the cluster. If markets tie at the earliest timestamp, the field stays blank. This describes where evidence was observed, not where a topic began.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <article className="rounded-2xl border border-stone-300/15 bg-stone-300/[0.035] p-7 sm:p-8">
                <CircleCheck size={20} className="text-[#D8D4CA]" aria-hidden="true" />
                <h3 className="mt-8 text-xl font-medium text-white">What it can say</h3>
                <p className="mt-3 text-sm leading-7 text-[#A1A1AA]">
                  &quot;The earliest country-attributed evidence in this cluster appeared in the United States feed.&quot;
                </p>
              </article>
              <article className="rounded-2xl border border-white/[0.08] bg-[#111114] p-7 sm:p-8">
                <CircleDashed size={20} className="text-[#71717A]" aria-hidden="true" />
                <h3 className="mt-8 text-xl font-medium text-white">What it cannot say</h3>
                <p className="mt-3 text-sm leading-7 text-[#A1A1AA]">
                  It does not prove who invented a topic, where an event truly began, or which country caused attention to move.
                </p>
              </article>
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-7xl px-6 py-24 lg:py-32">
          <div className="grid gap-12 lg:grid-cols-[0.82fr_1.18fr] lg:gap-24">
            <div>
              <QuestionLabel number="04">What makes a breakout candidate?</QuestionLabel>
              <p className="mt-7 max-w-[34rem] text-pretty text-base leading-7 text-[#A1A1AA]">
                Related signals receive a score from 0 to 100. Candidates below the Global Pulse threshold stay on the watchlist. A score above 80 moves a trend into Global Pulse.
              </p>
              <p className="mt-5 max-w-[34rem] text-pretty text-sm leading-6 text-[#71717A]">
                This is ranking logic, not a forecast of future popularity. A strong candidate can still fade as quickly as it appeared.
              </p>
            </div>

            <div className="space-y-8 rounded-2xl border border-white/[0.1] bg-[#0B0B0D] p-7 sm:p-10">
              {scoreParts.map((part) => (
                <div key={part.label}>
                  <div className="flex items-end justify-between gap-4">
                    <div>
                      <p className="text-base font-medium text-white">{part.label}</p>
                      <p className="mt-1 max-w-[38rem] text-sm leading-6 text-[#8B8B93]">{part.copy}</p>
                    </div>
                    <span className="font-mono text-sm tabular-nums text-[#D8D4CA]">{part.value}</span>
                  </div>
                  <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                    <div className="h-full rounded-full bg-[#D8D4CA]" style={{ width: part.width }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-white/[0.08] bg-[#0B0B0D]">
          <div className="mx-auto grid w-full max-w-7xl gap-10 px-6 py-20 lg:grid-cols-[0.72fr_1.28fr] lg:gap-24 lg:py-24">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#D8D4CA]">Compare the method</p>
              <h2 className="mt-5 text-balance text-3xl font-medium tracking-[-0.04em] text-white">
                Start with the research job.
              </h2>
            </div>
            <div className="grid gap-px overflow-hidden rounded-2xl border border-white/[0.1] bg-white/[0.1] sm:grid-cols-3">
              <Link href="/alternatives/google-trends" className="group bg-[#0B0B0D] p-7 transition-colors hover:bg-[#111114]">
                <p className="text-sm font-medium text-white">Google Trends alternatives</p>
                <p className="mt-3 text-sm leading-6 text-[#71717A]">Known search demand versus source-linked technology evidence.</p>
                <ArrowRight size={15} className="mt-6 text-[#D8D4CA] transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
              </Link>
              <Link href="/alternatives/exploding-topics" className="group bg-[#0B0B0D] p-7 transition-colors hover:bg-[#111114]">
                <p className="text-sm font-medium text-white">Exploding Topics alternatives</p>
                <p className="mt-3 text-sm leading-6 text-[#71717A]">Curated discovery versus an inspectable score and source trail.</p>
                <ArrowRight size={15} className="mt-6 text-[#D8D4CA] transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
              </Link>
              <Link href="/compare/trend-analysis-tools" className="group bg-[#0B0B0D] p-7 transition-colors hover:bg-[#111114]">
                <p className="text-sm font-medium text-white">Trend analysis tool comparison</p>
                <p className="mt-3 text-sm leading-6 text-[#71717A]">Search demand, monitoring, and source-linked AI evidence.</p>
                <ArrowRight size={15} className="mt-6 text-[#D8D4CA] transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </section>

        <section className="border-t border-white/[0.08] bg-[#080809]">
          <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-20 sm:flex-row sm:items-end sm:justify-between lg:py-24">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#8B8B93]">The useful boundary</p>
              <h2 className="mt-5 max-w-3xl text-balance text-3xl font-medium tracking-[-0.04em] text-white sm:text-4xl">
                Use the score to decide where to look. Use the linked sources to decide what to believe.
              </h2>
            </div>
            <Link
              href="/#trending"
              className="group flex shrink-0 items-center gap-2 text-sm text-[#D4D4D8] underline decoration-white/20 underline-offset-4 transition-colors hover:text-white"
            >
              Return to the source-linked feed
              <ArrowRight size={15} className="transition-transform duration-150 group-hover:translate-x-0.5" aria-hidden="true" />
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
