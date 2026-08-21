"use client";

import { homepageFaqs, homepageFaqsTr } from "@/content/homepage-faq";
import { useLocale } from "@/i18n/locale";

export function HomepageFaq() {
  const { locale, t } = useLocale();
  const faqs = locale === "tr" ? homepageFaqsTr : homepageFaqs;
  return (
    <section
      id="faq"
      aria-labelledby="faq-heading"
      className="w-full border-t border-white/[0.06] bg-[#0B0B0D] py-24 sm:py-32"
    >
      <div className="mx-auto grid max-w-7xl gap-14 px-6 lg:grid-cols-[minmax(0,0.72fr)_minmax(0,1.28fr)] lg:gap-24">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.22em] text-[#67e8f9]">
            {t("faq.kicker")}
          </p>
          <h2
            id="faq-heading"
            className="mt-5 max-w-xl text-balance text-[clamp(42px,5vw,72px)] font-bold leading-[0.94] tracking-[-0.045em] text-white"
          >
            {t("faq.title").split("\n").map((line, index) => <span key={line}>{line}{index === 0 && <br />}</span>)}
          </h2>
          <p className="mt-7 max-w-md text-pretty text-lg leading-8 text-[#A3A3AA]">
            {t("faq.description")}
          </p>
        </div>

        <div className="border-t border-white/10">
          {faqs.map((item, index) => (
            <article
              key={item.question}
              className="grid gap-5 border-b border-white/10 py-8 sm:grid-cols-[3rem_minmax(0,1fr)] sm:gap-7 sm:py-10"
            >
              <span
                aria-hidden="true"
                className="font-mono text-xs font-medium tabular-nums text-[#67e8f9]"
              >
                {String(index + 1).padStart(2, "0")}
              </span>
              <div>
                <h3 className="text-balance text-xl font-semibold leading-snug tracking-[-0.015em] text-white sm:text-2xl">
                  {item.question}
                </h3>
                <p className="mt-4 max-w-[64ch] text-pretty text-base leading-7 text-[#A3A3AA]">
                  {item.answer}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
