import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check, Minus } from "lucide-react";
import { PageShell } from "@/components/PageShell";

export const metadata: Metadata = {
  title: "Pricing | What's Happening",
  description: "Public access costs $0. Account access and paid plans are not available today.",
  alternates: { canonical: "/pricing" },
};

const publicFeatures = [
  "World and trending views",
  "Country signal map",
  "Source-level evidence",
];

const unavailablePlans = [
  {
    name: "Early access",
    price: "$0",
    description: "Account identity and trend discussion are designed, but production account creation is not available yet.",
    features: ["Trend-specific discussion", "Saved identity", "No published usage cap"],
  },
  {
    name: "Teams",
    price: "—",
    description: "There is no team plan, paid promise, or checkout today. Real terms will be published before an offer exists.",
    features: ["No payment collected", "No invented seat limits", "No hidden checkout"],
  },
] as const;

export default function PricingPage() {
  return (
    <PageShell>
      <div className="mx-auto min-h-screen max-w-[1440px] px-5 pb-28 pt-32 sm:px-8 sm:pt-40">
        <header className="grid items-end gap-10 border-b border-white/[0.1] pb-12 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <p className="eyebrow">Pricing / availability</p>
            <h1 className="mt-5 max-w-5xl text-balance text-[clamp(3.5rem,9vw,8rem)] font-medium leading-[0.86] tracking-[-0.065em] text-white">
              Public access.<br />Still $0.
            </h1>
          </div>
          <p className="max-w-[35rem] text-pretty text-lg leading-8 text-[#A9A49A] lg:pb-2">
            Public browsing costs $0. Account access and team plans are not available today. Working access stays visually separate from future plans.
          </p>
        </header>

        <section className="grid gap-5 py-14 lg:grid-cols-12 lg:py-20" aria-label="Pricing plans">
          <article className="relative flex min-h-[590px] flex-col overflow-hidden rounded-2xl border border-white/[0.14] bg-[#11110f] p-7 sm:p-10 lg:col-span-7">
            <div className="flex items-start justify-between gap-6 border-b border-white/[0.1] pb-8">
              <div>
                <p className="eyebrow">Available now</p>
                <h2 className="mt-5 text-4xl font-medium tracking-[-0.045em] text-white sm:text-5xl">Public signal</h2>
              </div>
              <div className="text-right">
                <span className="text-6xl font-medium tracking-[-0.06em] text-white sm:text-7xl">$0</span>
                <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.16em] text-white/40">USD</p>
              </div>
            </div>

            <p className="mt-9 max-w-[48ch] text-base leading-7 text-[#A9A49A]">
              Browse the live signal views and open the source trail behind every available record. No account is required.
            </p>
            <ul className="mt-10 grid gap-4 sm:grid-cols-3">
              {publicFeatures.map((feature) => (
                <li key={feature} className="border-t border-white/[0.12] pt-4 text-sm leading-6 text-[#D8D4CA]">
                  <Check size={15} className="mb-3 text-white" aria-hidden="true" />
                  {feature}
                </li>
              ))}
            </ul>
            <div className="mt-auto pt-12">
              <Link href="/world" className="primary-action w-full sm:w-fit">
                Browse the feed <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </div>
          </article>

          <div className="grid gap-5 lg:col-span-5">
            {unavailablePlans.map((plan) => (
              <article key={plan.name} className="flex flex-col rounded-2xl border border-white/[0.08] bg-[#0D0D0C] p-7 sm:p-8">
                <div className="flex items-start justify-between gap-6">
                  <div>
                    <p className="eyebrow">Not available</p>
                    <h2 className="mt-4 text-3xl font-medium tracking-[-0.035em] text-white">{plan.name}</h2>
                  </div>
                  <span className="text-4xl font-medium tracking-[-0.05em] text-white/55">{plan.price}</span>
                </div>
                <p className="mt-5 max-w-[44ch] text-sm leading-6 text-[#8F8B83]">{plan.description}</p>
                <ul className="mt-7 space-y-3 border-t border-white/[0.08] pt-6">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3 text-sm text-white/55">
                      <Minus size={14} aria-hidden="true" /> {feature}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        <section className="grid gap-6 border-t border-white/[0.1] pt-10 sm:grid-cols-3">
          {[
            ["Account access unavailable", "Creation and sign-in are unavailable."],
            ["Usage", "No published cap today."],
            ["Billing", "No checkout or paid plan exists."],
          ].map(([label, text]) => (
            <div key={label}>
              <p className="font-mono text-xs uppercase tracking-widest text-white/35">{label}</p>
              <p className="mt-2 text-sm text-[#A9A49A]">{text}</p>
            </div>
          ))}
        </section>
      </div>
    </PageShell>
  );
}
