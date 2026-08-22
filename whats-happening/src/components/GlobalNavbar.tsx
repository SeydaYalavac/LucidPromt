"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, LogOut, Menu, Search, User, X } from "lucide-react";
import { motion, useMotionValueEvent, useScroll } from "framer-motion";
import { cn } from "@/lib/utils";
import { isRouteActive, primaryNavigation } from "@/lib/discovery";
import { useAuthSession } from "@/hooks/useAuthSession";
import { captureProductEvent } from "@/lib/analytics";
import { SearchOverlay } from "./SearchOverlay";
import { LocaleSelector } from "./LocaleSelector";
import { useLocale, type TranslationKey } from "@/i18n/locale";

type GlobalNavbarProps = { showPrimaryAuthAction?: boolean };

export function GlobalNavbar({ showPrimaryAuthAction = true }: GlobalNavbarProps) {
  const pathname = usePathname();
  const { scrollY } = useScroll();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { supabase, session, isLoading } = useAuthSession();
  const { t } = useLocale();

  const navigationLabels: Record<string, TranslationKey> = {
    "/world": "nav.world", "/trending": "nav.trending", "/explore": "nav.explore", "/map": "nav.map", "/security-research": "nav.security", "/pricing": "nav.pricing",
  };

  useMotionValueEvent(scrollY, "change", (latest) => setIsScrolled(latest > 32));
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  async function signOut() {
    if (!supabase) return;
    await supabase.auth.signOut();
    setAccountOpen(false);
  }

  const displayName = session?.user.user_metadata?.display_name || session?.user.user_metadata?.name || session?.user.email?.split("@")[0] || "Developer";

  return (
    <>
      <motion.header initial={{ y: -80 }} animate={{ y: 0 }} transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }} className={cn("fixed inset-x-0 top-0 z-50 border-b px-4 py-3 transition-colors sm:px-6", isScrolled || mobileOpen ? "border-white/[0.1] bg-[#070706]/96 backdrop-blur-xl" : "border-transparent bg-[#070706]/72 backdrop-blur-md")}>
        <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-5">
          <div className="flex items-center gap-8 xl:gap-12">
            <Link href="/" className="relative z-10 text-xs font-semibold tracking-[0.2em] text-white sm:text-sm">WHAT&apos;S HAPPENING</Link>
            <nav className="hidden items-center gap-6 lg:flex xl:gap-8" aria-label={t("nav.primary")}>
              {primaryNavigation.map((item) => {
                const active = isRouteActive(pathname, item.href);
                return <Link key={item.href} href={item.href} aria-current={active ? "page" : undefined} className={cn("relative py-3 text-[11px] font-medium uppercase tracking-[0.16em] transition-colors hover:text-white", active ? "text-white" : "text-[#92929B]")}><span>{t(navigationLabels[item.href])}</span><span className={cn("absolute inset-x-0 -bottom-0.5 h-px origin-left bg-white/70 transition-transform", active ? "scale-x-100" : "scale-x-0")} /></Link>;
              })}
              <Link href="/how-it-works" className={cn("relative py-3 text-[11px] font-medium uppercase tracking-[0.16em] transition-colors hover:text-white", isRouteActive(pathname, "/how-it-works") ? "text-white" : "text-[#92929B]")}>{t("nav.how")}</Link>
            </nav>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <button type="button" onClick={() => setSearchOpen(true)} className="flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-lg text-[#A1A1AA] hover:bg-white/[0.05] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white" aria-label={t("nav.openSearch")}><Search size={17} /><span className="hidden text-[11px] uppercase tracking-widest xl:inline">{t("nav.search")}</span></button>
            <LocaleSelector compact />
            {!isLoading && !session && <>
              <Link href="/signin" className="hidden text-[11px] uppercase tracking-widest text-[#A1A1AA] hover:text-white sm:block">{t("nav.signIn")}</Link>
              {showPrimaryAuthAction && <Link href="/signup" onClick={() => captureProductEvent("signup_cta_clicked", { source: "global_nav" })} className="primary-action hidden text-[11px] uppercase tracking-[0.12em] sm:flex">{t("nav.signUp")}</Link>}
            </>}
            {!isLoading && session && <div className="relative hidden sm:block"><button type="button" onClick={() => setAccountOpen((value) => !value)} aria-expanded={accountOpen} aria-label={t("nav.openAccount")} className="flex min-h-11 items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-3 text-white"><span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-white"><User size={13} /></span><span className="max-w-24 truncate text-xs">{displayName}</span><ChevronDown size={13} className="text-white/45" /></button>{accountOpen && <div className="absolute right-0 top-13 w-64 rounded-2xl border border-white/10 bg-[#111114] p-2 shadow-2xl"><p className="truncate border-b border-white/[0.06] px-3 py-3 text-xs text-[#A1A1AA]">{session.user.email}</p><button type="button" onClick={signOut} className="mt-2 flex min-h-11 w-full items-center gap-2 rounded-xl px-3 text-sm text-[#C4C4CA] hover:bg-white/[0.06] hover:text-white"><LogOut size={15} /> {t("nav.signOut")}</button></div>}</div>}
            <button type="button" onClick={() => setMobileOpen((value) => !value)} className="flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-white/10 text-white lg:hidden" aria-label={mobileOpen ? t("nav.close") : t("nav.open")} aria-expanded={mobileOpen}>{mobileOpen ? <X size={19} /> : <Menu size={19} />}</button>
          </div>
        </div>
      </motion.header>

      {mobileOpen && <div className="fixed inset-0 z-40 flex flex-col overflow-hidden bg-[#070706] px-5 pb-8 pt-24 lg:hidden" role="dialog" aria-modal="true" aria-label={t("nav.mobile")}><nav className="min-h-0 flex-1 overflow-y-auto overscroll-contain" aria-label={t("nav.mobile")}><div className="flex min-h-full flex-col justify-center">{[...primaryNavigation, { label: "How it works", href: "/how-it-works" }].map((item) => <Link key={item.href} href={item.href} className="group border-b border-white/[0.09] py-5 text-4xl font-medium tracking-[-0.04em] text-white"><span>{item.href === "/how-it-works" ? t("nav.how") : t(navigationLabels[item.href])}</span></Link>)}</div></nav><div className="grid shrink-0 grid-cols-2 gap-3 pt-8"><Link href="/signin" className="secondary-action">{t("nav.signIn")}</Link><Link href="/signup" onClick={() => captureProductEvent("signup_cta_clicked", { source: "mobile_nav" })} className="primary-action">{t("nav.signUp")}</Link></div></div>}
      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
