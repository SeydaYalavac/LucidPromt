import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Check } from "lucide-react";
import { Footer } from "@/components/Footer";
import { GlobalNavbar } from "@/components/GlobalNavbar";

export const metadata: Metadata = {
  title: "Pricing | What's Happening",
  description:
    "What's Happening is free during early access, with no trial clock or credit card required.",
};

const includedFeatures = [
  "Global trend and country views",
  "Source-level evidence for each signal",
  "Why-it's-moving explanations",
  "Trend-specific developer chat",
];

const limits = [
  {
    number: "01",
    title: "No trial clock",
    copy: "Early access does not expire after a set number of days.",
  },
  {
    number: "02",
    title: "No published usage cap",
    copy: "There is no fixed feature or usage allowance while the product is in early access.",
  },
  {
    number: "03",
    title: "Live service is still connecting",
    copy: "Live data and account creation depend on the production data connection. Until it is ready, those surfaces fail closed instead of showing demo data.",
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-[#050505] text-[#F5F5F5] selection:bg-white/10">
      <GlobalNavbar showPrimaryAuthAction={false} />

      <main className="mx-auto w-full max-w-7xl px-6 pb-24 pt-36 sm:pt-44">
        <section className="grid items-end gap-10 border-b border-white/[0.08] pb-16 lg:grid-cols-[1.35fr_0.65fr] lg:gap-20 lg:pb-20">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.22em] text-[#8B8B93]">
              Pricing / early access
            </p>
            <h1 className="mt-6 max-w-4xl text-balance text-[clamp(3.3rem,8vw,7.4rem)] font-semibold leading-[0.88] tracking-[-0.07em] text-white">
              Full signal.
              <br />
              No subscription.
            </h1>
          </div>
          <p className="max-w-[34rem] text-pretty text-lg leading-8 text-[#A1A1AA] lg:pb-2">
            Use What&apos;s Happening for <span className="font-medium text-white">$0</span> during early access. There is no paid plan, trial clock, or checkout yet.
          </p>
        </section>

        <section className="grid gap-6 py-16 lg:grid-cols-[1.2fr_0.8fr] lg:py-24">
          <article className="relative overflow-hidden rounded-[2rem] border border-white/[0.12] bg-[#0B0B0D] p-7 sm:p-10 lg:p-12">
            <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-cyan-400/[0.07] blur-3xl" />
            <div className="relative">
              <div className="flex flex-col gap-6 border-b border-white/[0.08] pb-10 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-sm font-medium text-[#A1A1AA]">Early access</p>
                  <p className="mt-3 font-mono text-xs uppercase tracking-[0.18em] text-[#67E8F9]">
                    Open now
                  </p>
                </div>
                <div className="sm:text-right">
                  <div className="flex items-end gap-2 sm:justify-end">
                    <span className="text-7xl font-semibold tracking-[-0.07em] text-white sm:text-8xl">$0</span>
                    <span className="pb-3 text-sm text-[#8B8B93]">USD</span>
                  </div>
                  <p className="mt-2 text-sm text-[#8B8B93]">No credit card. No trial expiry.</p>
                </div>
              </div>

              <div className="grid gap-10 pt-10 sm:grid-cols-[1fr_auto] sm:items-end">
                <div>
                  <p className="font-mono text-xs uppercase tracking-[0.18em] text-[#8B8B93]">Included today</p>
                  <ul className="mt-6 grid gap-4 sm:grid-cols-2">
                    {includedFeatures.map((feature) => (
                      <li key={feature} className="flex items-start gap-3 text-sm leading-6 text-[#D4D4D8]">
                        <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-cyan-300/25 bg-cyan-300/[0.08] text-[#67E8F9]">
                          <Check size={12} strokeWidth={2.25} aria-hidden="true" />
                        </span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                <Link
                  href="/auth?mode=signup"
                  className="group flex min-h-12 items-center justify-center gap-3 rounded-full bg-white px-7 text-sm font-semibold text-black transition-[background-color,transform] duration-150 ease-out hover:bg-[#E8E8EA] active:translate-y-px focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
                >
                  Start free
                  <ArrowUpRight size={16} className="transition-transform duration-150 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
                </Link>
              </div>
            </div>
          </article>

          <aside className="rounded-[2rem] border border-white/[0.08] bg-[#080809] p-7 sm:p-10 lg:p-12">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#8B8B93]">The honest limits</p>
            <div className="mt-8 divide-y divide-white/[0.08]">
              {limits.map((limit) => (
                <div key={limit.number} className="grid grid-cols-[2.5rem_1fr] gap-3 py-7 first:pt-0 last:pb-0">
                  <span className="font-mono text-xs text-[#52525B]">{limit.number}</span>
                  <div>
                    <h2 className="text-base font-medium text-white">{limit.title}</h2>
                    <p className="mt-2 max-w-[34rem] text-pretty text-sm leading-6 text-[#8B8B93]">{limit.copy}</p>
                  </div>
                </div>
              ))}
            </div>
          </aside>
        </section>

        <section className="flex flex-col gap-5 border-t border-white/[0.08] pt-10 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-medium tracking-[-0.02em] text-white">Why free now?</h2>
            <p className="mt-2 max-w-2xl text-pretty text-sm leading-6 text-[#8B8B93]">
              The product is still proving its live data infrastructure. A paid tier will only be defined when the service and its operating costs are real.
            </p>
          </div>
          <Link href="/" className="shrink-0 text-sm text-[#D4D4D8] underline decoration-white/20 underline-offset-4 transition-colors hover:text-white">
            See the live product
          </Link>
        </section>
      </main>

      <Footer />
    </div>
  );
}
