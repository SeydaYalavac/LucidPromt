import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, GitFork, Globe2, Link2, Newspaper, Radar } from "lucide-react";
import { Footer } from "@/components/Footer";
import { GlobalNavbar } from "@/components/GlobalNavbar";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: `About ${SITE_NAME} | AI Trend Intelligence`,
  description: SITE_DESCRIPTION,
  alternates: { canonical: `${SITE_URL}/about` },
  openGraph: {
    title: `About ${SITE_NAME} | AI Trend Intelligence`,
    description: SITE_DESCRIPTION,
    url: `${SITE_URL}/about`,
    type: "website",
  },
};

const sources = [
  {
    name: "GitHub",
    label: "Repository movement",
    icon: GitFork,
    copy: "Public repository activity provides a direct view of what builders are starting and supporting.",
  },
  {
    name: "Hacker News",
    label: "Technical attention",
    icon: Newspaper,
    copy: "Stories and discussion scores show where technical communities are putting attention now.",
  },
  {
    name: "Google Trends",
    label: "Search movement",
    icon: Globe2,
    copy: "Trending RSS adds search context and a country tag when the source makes one available.",
  },
];

const aboutJsonLd = {
  "@context": "https://schema.org",
  "@type": "AboutPage",
  "@id": `${SITE_URL}/about/#page`,
  url: `${SITE_URL}/about`,
  name: `About ${SITE_NAME}`,
  description: SITE_DESCRIPTION,
  about: { "@id": `${SITE_URL}/#software` },
};

export default function AboutPage() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-[#050505] text-[#F5F5F5] selection:bg-white/10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutJsonLd).replace(/</g, "\\u003c") }}
      />
      <GlobalNavbar />

      <main>
        <section className="mx-auto grid w-full max-w-7xl gap-14 px-6 pb-24 pt-36 sm:pt-44 lg:grid-cols-[1.05fr_0.95fr] lg:items-end lg:gap-20 lg:pb-32">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.22em] text-[#D8D4CA]">
              AI trend intelligence / source-linked
            </p>
            <h1 className="mt-7 max-w-4xl text-balance text-[clamp(3.2rem,7vw,6.8rem)] font-semibold leading-[0.9] tracking-[-0.07em] text-white">
              See the signal. Keep the source.
            </h1>
            <p className="mt-8 max-w-[40rem] text-pretty text-lg leading-8 text-[#A1A1AA] sm:text-xl">
              {SITE_DESCRIPTION}
            </p>
            <Link
              href="/#trending"
              className="group mt-9 inline-flex min-h-12 items-center gap-3 rounded-full bg-white px-7 text-sm font-semibold text-black transition-[background-color,transform] duration-150 ease-out hover:bg-[#E8E8EA] active:translate-y-px focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
            >
              Inspect the public feed
              <ArrowRight size={16} className="transition-transform duration-150 group-hover:translate-x-0.5" aria-hidden="true" />
            </Link>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-white/[0.1] bg-[#0B0B0D] p-7 sm:p-9">
            <div className="relative flex items-center justify-between border-b border-white/[0.08] pb-6">
              <div>
                <p className="font-mono text-[0.68rem] uppercase tracking-[0.2em] text-[#D8D4CA]">Evidence path</p>
                <p className="mt-2 text-sm text-[#A1A1AA]">Three inputs, one inspectable trail</p>
              </div>
              <Radar size={22} className="text-[#D8D4CA]" aria-hidden="true" />
            </div>
            <div className="relative mt-2 divide-y divide-white/[0.08]">
              {sources.map(({ name, label, icon: Icon }) => (
                <div key={name} className="grid grid-cols-[2rem_1fr_auto] items-center gap-4 py-5">
                  <Icon size={17} className="text-[#D8D4CA]" aria-hidden="true" />
                  <p className="text-sm font-medium text-white">{name}</p>
                  <p className="font-mono text-[0.62rem] uppercase tracking-[0.14em] text-[#71717A]">{label}</p>
                </div>
              ))}
            </div>
            <p className="relative flex items-start gap-3 border-t border-white/[0.08] pt-6 text-sm leading-6 text-[#71717A]">
              <Link2 size={16} className="mt-1 shrink-0 text-[#D8D4CA]" aria-hidden="true" />
              Each signal keeps a route back to the public source record that informed it.
            </p>
          </div>
        </section>

        <section className="border-y border-white/[0.08] bg-[#080809]">
          <div className="mx-auto w-full max-w-7xl px-6 py-20 lg:py-28">
            <div className="grid gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:gap-24">
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#8B8B93]">What it is</p>
                <h2 className="mt-5 text-balance text-3xl font-medium tracking-[-0.04em] text-white sm:text-4xl">
                  A research surface, not a prediction engine.
                </h2>
              </div>
              <p className="max-w-3xl text-pretty text-lg leading-8 text-[#A1A1AA]">
                What&apos;s Happening clusters related observations and scores them by velocity, reach, and novelty. The score helps founders and analysts decide what to inspect next. It does not guarantee that a topic will grow, identify who invented it, or replace source-level judgment.
              </p>
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-7xl px-6 py-24 lg:py-32">
          <div className="grid gap-12 lg:grid-cols-[0.72fr_1.28fr] lg:gap-24">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#8B8B93]">Default sources</p>
              <h2 className="mt-5 text-balance text-3xl font-medium tracking-[-0.04em] text-white sm:text-4xl">
                Built around public evidence you can open.
              </h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {sources.map(({ name, copy, icon: Icon }) => (
                <article key={name} className="rounded-[1.75rem] border border-white/[0.1] bg-[#0B0B0D] p-6">
                  <Icon size={19} className="text-[#D8D4CA]" aria-hidden="true" />
                  <h3 className="mt-8 text-lg font-medium text-white">{name}</h3>
                  <p className="mt-3 text-sm leading-6 text-[#8B8B93]">{copy}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
