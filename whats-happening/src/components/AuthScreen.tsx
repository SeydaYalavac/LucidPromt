"use client";

import Link from "next/link";
import { AuthContext, AuthPanel, type AuthMode } from "./AuthPanel";
import { LocaleSelector } from "./LocaleSelector";
import { randomizeAiOption } from "@/lib/signup-attribution";
import { useLocale } from "@/i18n/locale";
import { getAuthAvailabilityCopy } from "@/lib/auth-copy";
import { getBrowserSupabase } from "@/lib/supabase/browser";

export function AuthScreen({ mode, next, initialError }: { mode: AuthMode; next: string; initialError?: string }) {
  const { locale } = useLocale();
  const l = (english: string, turkish: string) => locale === "tr" ? turkish : english;
  const isConfigured = Boolean(getBrowserSupabase());
  const availabilityCopy = getAuthAvailabilityCopy(locale, isConfigured);
  return <main className="relative min-h-screen overflow-hidden bg-[#070706] px-5 py-6 sm:px-8 lg:px-12">
    <div className="pointer-events-none absolute inset-y-0 left-[7vw] hidden w-px bg-white/[0.06] lg:block" aria-hidden="true" />
    <div className="relative mx-auto flex min-h-[calc(100vh-3rem)] max-w-7xl flex-col"><header className="flex items-center justify-between gap-4 border-b border-white/[0.09] pb-5"><Link href="/" className="text-xs font-semibold tracking-[0.2em] text-white sm:text-sm">WHAT&apos;S HAPPENING</Link><div className="flex items-center gap-4"><LocaleSelector compact /><Link href="/world" className="text-xs font-medium uppercase tracking-[0.14em] text-[#92929B] hover:text-white">{l("Back to public feed", "Açık akışa dön")}</Link></div></header><div className="grid flex-1 items-center gap-14 py-14 lg:grid-cols-[1fr_470px] lg:py-10"><div className="hidden lg:block"><AuthContext isConfigured={isConfigured} /></div><AuthPanel mode={mode} next={next} initialError={initialError} signupSourceOptions={mode === "signup" ? randomizeAiOption() : undefined} /></div><footer className="flex flex-wrap items-center justify-between gap-4 border-t border-white/[0.09] pt-5 text-xs text-white/35"><span>{availabilityCopy.footer}</span><nav className="flex flex-wrap items-center gap-4" aria-label={l("Account help and legal", "Hesap yardımı ve yasal bilgiler")}><Link href="/privacy" className="hover:text-white">{l("Privacy", "Gizlilik")}</Link><Link href="/terms" className="hover:text-white">{l("Terms", "Koşullar")}</Link><a href="mailto:whatshappeninginai@mail.tin.computer" className="hover:text-white">{l("Support", "Destek")}</a></nav></footer></div>
  </main>;
}
