"use client";

import Link from "next/link";
import { AuthContext, AuthPanel, type AuthMode } from "./AuthPanel";
import { LocaleSelector } from "./LocaleSelector";
import { randomizeAiOption } from "@/lib/signup-attribution";
import { useLocale } from "@/i18n/locale";

export function AuthScreen({ mode, next, initialError }: { mode: AuthMode; next: string; initialError?: string }) {
  const { locale } = useLocale();
  const l = (english: string, turkish: string) => locale === "tr" ? turkish : english;
  return <main className="relative min-h-screen overflow-hidden bg-[#050505] px-5 py-6 sm:px-8 lg:px-12">
    <div className="pointer-events-none absolute inset-0" aria-hidden="true"><div className="absolute inset-y-0 left-0 w-full bg-[radial-gradient(circle_at_22%_48%,rgba(6,182,212,0.12),transparent_32%)] lg:w-1/2" /><div className="absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(255,255,255,.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.035)_1px,transparent_1px)] [background-size:48px_48px]" /></div>
    <div className="relative mx-auto flex min-h-[calc(100vh-3rem)] max-w-7xl flex-col"><header className="flex items-center justify-between gap-4"><Link href="/" className="text-xs font-semibold tracking-[0.2em] text-white sm:text-sm">WHAT&apos;S HAPPENING</Link><div className="flex items-center gap-4"><LocaleSelector compact /><Link href="/world" className="text-xs font-medium uppercase tracking-[0.14em] text-[#92929B] hover:text-white">{l("Back to public feed", "Açık akışa dön")}</Link></div></header><div className="grid flex-1 items-center gap-14 py-14 lg:grid-cols-[1fr_470px] lg:py-10"><div className="hidden lg:block"><AuthContext /></div><AuthPanel mode={mode} next={next} initialError={initialError} signupSourceOptions={mode === "signup" ? randomizeAiOption() : undefined} /></div><footer className="flex flex-wrap items-center justify-between gap-4 border-t border-white/[0.06] pt-5 text-xs text-white/35"><span>{l("Authentication is currently unavailable", "Kimlik doğrulama şu anda kullanılamıyor")}</span><nav className="flex flex-wrap items-center gap-4" aria-label={l("Account help and legal", "Hesap yardımı ve yasal bilgiler")}><Link href="/privacy" className="hover:text-white">{l("Privacy", "Gizlilik")}</Link><Link href="/terms" className="hover:text-white">{l("Terms", "Koşullar")}</Link><a href="mailto:whatshappeninginai@mail.tin.computer" className="hover:text-white">{l("Support", "Destek")}</a></nav></footer></div>
  </main>;
}
