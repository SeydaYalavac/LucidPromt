import Link from "next/link";
import { ArrowRight, FileCheck2, Mail } from "lucide-react";
import { Footer } from "@/components/Footer";
import { GlobalNavbar } from "@/components/GlobalNavbar";
import {
  noticeDate,
  supportAddress,
  type LegalNotice,
} from "@/content/legal-notices";

export function LegalNoticePage({ notice }: { notice: LegalNotice }) {
  return (
    <div className="min-h-screen overflow-x-hidden bg-[#050505] text-[#F5F5F5] selection:bg-stone-300/20">
      <GlobalNavbar />
      <main>
        <section className="relative mx-auto w-full max-w-7xl px-6 pb-20 pt-36 sm:pt-44 lg:pb-28">
          <div className="relative max-w-4xl">
            <p className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-[#D8D4CA]">
              <FileCheck2 size={14} aria-hidden="true" /> Current practice / {noticeDate}
            </p>
            <h1 className="mt-7 text-balance text-[clamp(3.4rem,8vw,7rem)] font-semibold leading-[0.88] tracking-[-0.07em] text-white">
              {notice.title}
            </h1>
            <p className="mt-8 max-w-[58ch] text-pretty text-lg leading-8 text-[#A1A1AA] sm:text-xl">
              {notice.description}
            </p>
          </div>

          <div className="relative mt-12 max-w-4xl rounded-[1.75rem] border border-stone-300/20 bg-stone-300/[0.055] p-6 sm:p-8">
            <p className="font-mono text-[0.68rem] uppercase tracking-[0.2em] text-[#D8D4CA]">
              Status note
            </p>
            <p className="mt-4 max-w-[68ch] text-pretty text-base leading-7 text-[#D4D4D8]">
              {notice.currentPractice}
            </p>
          </div>
        </section>

        <section className="mx-auto grid w-full max-w-7xl gap-14 px-6 pb-28 lg:grid-cols-[18rem_minmax(0,1fr)] lg:gap-20 lg:pb-36">
          <aside className="lg:sticky lg:top-28 lg:self-start">
            <p className="font-mono text-[0.68rem] uppercase tracking-[0.2em] text-[#71717A]">
              At a glance
            </p>
            <ul className="mt-5 space-y-5">
              {notice.atAGlance.map((item, index) => (
                <li key={item} className="grid grid-cols-[1.5rem_1fr] gap-3 text-sm leading-6 text-[#A1A1AA]">
                  <span className="font-mono text-[0.68rem] tabular-nums text-[#D8D4CA]">
                    0{index + 1}
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <a
              href={`mailto:${supportAddress}`}
              className="group mt-8 inline-flex min-h-12 items-center gap-3 rounded-full bg-white px-6 text-sm font-semibold text-black transition-[background-color,transform] duration-150 ease-out hover:bg-[#E8E8EA] active:translate-y-px focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
            >
              <Mail size={16} aria-hidden="true" /> Contact support
            </a>
            <Link
              href={notice.counterpart.href}
              className="mt-6 flex items-center gap-2 text-sm font-medium text-[#A1A1AA] hover:text-white"
            >
              {notice.counterpart.label} <ArrowRight size={14} aria-hidden="true" />
            </Link>
          </aside>

          <article className="min-w-0 max-w-[48rem]">
            {notice.sections.map((section, index) => (
              <section
                id={section.id}
                key={section.id}
                className="scroll-mt-28 border-t border-white/[0.09] py-10 first:pt-10 sm:py-12"
              >
                <div className="grid gap-5 sm:grid-cols-[2.5rem_1fr] sm:gap-6">
                  <span className="pt-2 font-mono text-xs tabular-nums text-[#52525B]">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h2 className="text-balance text-2xl font-medium tracking-[-0.03em] text-white sm:text-3xl">
                      {section.title}
                    </h2>
                    <div className="mt-6 space-y-5 text-pretty text-base leading-7 text-[#A1A1AA]">
                      {section.paragraphs.map((paragraph) => (
                        <p key={paragraph}>{paragraph}</p>
                      ))}
                    </div>
                    {section.bullets && (
                      <ul className="mt-7 space-y-4">
                        {section.bullets.map((item) => (
                          <li key={item} className="grid grid-cols-[0.5rem_1fr] gap-4 text-pretty text-base leading-7 text-[#A1A1AA]">
                            <span className="mt-[0.7rem] h-1.5 w-1.5 rounded-full bg-[#D8D4CA]" aria-hidden="true" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </section>
            ))}
          </article>
        </section>
      </main>
      <Footer />
    </div>
  );
}
