"use client";

import Link from "next/link";
import { useLocale, type TranslationKey } from "@/i18n/locale";

export function Footer() {
  const { t } = useLocale();
  const links: { label: TranslationKey; href: string }[] = [
    { label: "nav.explore", href: "/explore" }, { label: "nav.trending", href: "/trending" },
    { label: "footer.countries", href: "/world" }, { label: "nav.map", href: "/map" },
    { label: "footer.about", href: "/about" }, { label: "nav.how", href: "/how-it-works" },
    { label: "nav.pricing", href: "/pricing" }, { label: "footer.privacy", href: "/privacy" },
    { label: "footer.terms", href: "/terms" }, { label: "footer.support", href: "mailto:whatshappeninginai@mail.tin.computer" },
  ];
  return (
    <footer className="w-full border-t border-white/5 py-12">
      <div className="mx-auto max-w-7xl px-6 flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <h2 className="text-sm font-semibold tracking-[0.2em] text-white uppercase">WHAT&apos;S HAPPENING</h2>
          <p className="mt-2 text-sm text-[#8B8B93]">{t("footer.description")}</p>
          <a href="https://tin.computer" className="mt-2 inline-flex items-center gap-1.5 text-xs text-[#8B8B93] hover:text-white">
            <svg viewBox="0 0 32 32" className="h-[1em] w-[1em]" aria-hidden="true"><rect width="32" height="32" fill="#66DC9D" /></svg>
            Growth by Tin
          </a>
        </div>
        <div className="flex flex-wrap items-center gap-6 text-sm text-[#8B8B93]">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-white transition-colors">
              {t(link.label)}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
