"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { Session } from "@supabase/supabase-js";

import { ByokModal } from "./ByokModal";

import { forumThreads } from "@/lib/forum/seedData";
import {
  analyzePrompt,
  type GuardFinding,
  type PromptMetric,
} from "@/lib/guards/feasibilityGuard";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import { hasSupabaseEnv } from "@/lib/supabase/config";

const starterPrompt = `Sen deneyimli bir teknik yazar olarak davran. Aşağıdaki API entegrasyon akışını junior geliştiriciler için adım adım açıkla. Çıktıyı markdown başlıkları ve 5 maddelik kontrol listesiyle ver. Sadece verilen bağlama dayan.`;

const supabaseReady = hasSupabaseEnv();

const metricLabelMap: Record<PromptMetric["status"], string> = {
  weak: "Zayıf",
  fair: "Orta",
  strong: "İyi",
};

const findingStyles: Record<
  GuardFinding["severity"],
  {
    badge: string;
    panel: string;
    label: string;
  }
> = {
  safe: {
    badge: "border-emerald-400/30 bg-emerald-400/10 text-emerald-200",
    panel: "border-emerald-400/20 bg-emerald-400/10",
    label: "Güvenli",
  },
  warning: {
    badge: "border-amber-300/30 bg-amber-300/10 text-amber-100",
    panel: "border-amber-300/20 bg-amber-300/10",
    label: "Sarı Bayrak",
  },
  block: {
    badge: "border-rose-400/30 bg-rose-400/10 text-rose-100",
    panel: "border-rose-400/20 bg-rose-400/10",
    label: "Kırmızı Bayrak",
  },
};

function ScoreRing({ score }: { score: number }) {
  const degrees = `${Math.round((score / 100) * 360)}deg`;

  return (
    <div
      className="grid h-24 w-24 place-items-center rounded-full"
      style={{
        background: `conic-gradient(#7dd3fc 0deg ${degrees}, rgba(125, 211, 252, 0.14) ${degrees} 360deg)`,
      }}
    >
      <div className="grid h-[4.5rem] w-[4.5rem] place-items-center rounded-full bg-slate-950 text-xl font-semibold text-white">
        {score}
      </div>
    </div>
  );
}

function AuthPanel() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(supabaseReady);

  useEffect(() => {
    if (!supabaseReady) {
      return;
    }

    const supabase = getSupabaseBrowserClient();

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_, nextSession) => {
      setSession(nextSession);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function signIn(provider: "github" | "google") {
    if (!supabaseReady) {
      return;
    }

    const supabase = getSupabaseBrowserClient();

    await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/`,
      },
    });
  }

  async function signOut() {
    if (!supabaseReady) {
      return;
    }

    const supabase = getSupabaseBrowserClient();
    await supabase.auth.signOut();
  }

  return (
    <div className="rounded-[24px] border border-border bg-panel p-5">
      <p className="text-sm font-medium text-sky-200">Supabase auth</p>
      <h2 className="mt-2 text-2xl font-semibold text-white">
        Forum hesabı hazır
      </h2>
      <p className="mt-3 text-sm leading-6 text-slate-300">
        GitHub veya Google OAuth ile giriş yapıldığında `profiles`, `threads`,
        `replies`, `prompts` ve `votes` tabloları RLS altında kullanılabilir.
      </p>

      <div className="mt-4 rounded-2xl border border-border bg-slate-950/40 p-4">
        <p className="text-sm font-medium text-white">Bağlantı durumu</p>
        {!supabaseReady ? (
          <p className="mt-2 text-sm leading-6 text-amber-100">
            `.env.local` içinde `NEXT_PUBLIC_SUPABASE_URL` ve
            `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` henüz ayarlı değil.
          </p>
        ) : loading ? (
          <p className="mt-2 text-sm leading-6 text-slate-300">
            Oturum denetleniyor...
          </p>
        ) : session ? (
          <div className="mt-2 space-y-2 text-sm text-slate-300">
            <p>Aktif kullanıcı: {session.user.email ?? "email yok"}</p>
            <p>Provider: {session.user.app_metadata.provider ?? "bilinmiyor"}</p>
          </div>
        ) : (
          <p className="mt-2 text-sm leading-6 text-slate-300">
            Oturum açık değil. OAuth ile giriş yapıp forum yazma ve oy verme
            akışını etkinleştirebilirsin.
          </p>
        )}
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => signIn("github")}
          disabled={!supabaseReady}
          className="rounded-full border border-sky-400/30 bg-sky-400/10 px-4 py-2 text-sm font-medium text-sky-100 transition hover:bg-sky-400/20 disabled:cursor-not-allowed disabled:opacity-50"
        >
          GitHub ile giriş
        </button>
        <button
          type="button"
          onClick={() => signIn("google")}
          disabled={!supabaseReady}
          className="rounded-full border border-border bg-slate-950/50 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Google ile giriş
        </button>
        <button
          type="button"
          onClick={signOut}
          disabled={!supabaseReady || !session}
          className="rounded-full border border-border bg-transparent px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-slate-950/40 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Çıkış yap
        </button>
      </div>
    </div>
  );
}

type HomeClientProps = {
  forkSlug?: string;
};

export function HomeClient({ forkSlug }: HomeClientProps) {
  const [isByokOpen, setIsByokOpen] = useState(false);
  const selectedFork = forkSlug
    ? forumThreads.find((thread) => thread.slug === forkSlug) ?? null
    : null;
  const [prompt, setPrompt] = useState(selectedFork?.forkPrompt ?? starterPrompt);
  const analysis = useMemo(() => analyzePrompt(prompt), [prompt]);
  const primaryFinding = analysis.findings[0];
  const statusTone = primaryFinding?.severity ?? "safe";

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-6 sm:px-6 lg:px-8">
      <ByokModal isOpen={isByokOpen} onClose={() => setIsByokOpen(false)} />
      <section className="rounded-[28px] border border-border bg-panel-strong/90 p-4 shadow-2xl shadow-sky-950/30 backdrop-blur sm:p-6">
        <div className="mb-4 rounded-2xl border border-dashed border-sky-400/30 bg-sky-400/10 px-4 py-3 text-center text-sm text-sky-100">
          Reklam Slot: Header Banner 970x90
        </div>

        <header className="flex flex-col gap-6 border-b border-border pb-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="mb-3 inline-flex rounded-full border border-sky-400/30 bg-sky-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-sky-200">
              $0 maliyetli AI geliştirme platformu
            </p>
            <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              Prompt optimizasyonu, gerçeklik denetimi ve geliştirici forumu tek
              koyu arayüzde.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
              İstemci taraflı skor, feasibility guard ve Supabase tabanlı auth
              + topluluk veri katmanı birlikte hazır.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {[
              ["Modül A", "Prompt Optimizer", "Anlık skor ve guard katmanı"],
              ["Modül B", "Prompt Hub", "RLS ile korunan forum altyapısı"],
              ["Modül C", "İçerik + Ads", "MDX ve reklam yerleşim hazırlığı"],
            ].map(([eyebrow, title, copy]) => (
              <div
                key={title}
                className="rounded-2xl border border-border bg-slate-950/40 p-4"
              >
                <p className="text-xs uppercase tracking-[0.2em] text-sky-300">
                  {eyebrow}
                </p>
                <h2 className="mt-2 text-lg font-semibold text-white">{title}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-400">{copy}</p>
              </div>
            ))}
          </div>
        </header>

        <section className="mt-6 grid gap-6 xl:grid-cols-[1.15fr_0.85fr_320px]">
          <div className="rounded-[24px] border border-border bg-panel p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-sky-200">
                  Modül A Canlı Editör
                </p>
                <h2 className="text-2xl font-semibold text-white">
                  Ham prompt girişi
                </h2>
              </div>
              <span
                className={`rounded-full border px-3 py-1 text-xs font-medium ${findingStyles[statusTone].badge}`}
              >
                {analysis.blocked
                  ? "AI isteği bloklanır"
                  : primaryFinding
                    ? findingStyles[statusTone].label
                    : "Guard temiz"}
              </span>
            </div>

            {selectedFork ? (
              <div className="mb-4 rounded-2xl border border-sky-400/30 bg-sky-400/10 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-medium text-sky-100">
                      Fork kaynağı: {selectedFork.title}
                    </p>
                    <p className="mt-1 text-sm text-sky-50/80">
                      Topluluktaki prompt editöre taşındı. Buradan serbestçe
                      düzenleyebilirsin.
                    </p>
                  </div>
                  <Link
                    href={`/forum/${selectedFork.slug}`}
                    className="rounded-full border border-sky-300/30 px-3 py-1.5 text-xs font-medium text-sky-100 transition hover:bg-sky-400/10"
                  >
                    Thread&apos;e dön
                  </Link>
                </div>
              </div>
            ) : null}

            <div className="rounded-2xl border border-border bg-slate-950/60 p-4">
              <div className="mb-3 flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-slate-500">
                <span className="h-2 w-2 rounded-full bg-rose-400" />
                <span className="h-2 w-2 rounded-full bg-amber-400" />
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                Editor
              </div>
              <textarea
                className="min-h-80 w-full resize-none bg-transparent text-sm leading-7 text-slate-200 outline-none placeholder:text-slate-500"
                placeholder="Örnek: Sen deneyimli bir teknik yazar olarak davran. Bu API entegrasyon akışını junior geliştiriciler için adım adım açıkla..."
                value={prompt}
                onChange={(event) => setPrompt(event.target.value)}
              />
            </div>

            <div className="mt-4 rounded-2xl border border-border bg-slate-950/40 p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium text-white">Güvenli yeniden yazım</p>
                <button
                  type="button"
                  onClick={() => setPrompt(analysis.safeRewrite)}
                  className="rounded-full border border-sky-400/30 bg-sky-400/10 px-3 py-1 text-xs font-medium text-sky-100 transition hover:bg-sky-400/20"
                >
                  Editöre uygula
                </button>
              </div>
              <pre className="mt-3 overflow-x-auto whitespace-pre-wrap font-mono text-xs leading-6 text-slate-300">
                {analysis.safeRewrite}
              </pre>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-[24px] border border-border bg-panel p-5">
              <p className="text-sm font-medium text-sky-200">Anlık analiz paneli</p>
              <div className="mt-4 flex items-end justify-between gap-4">
                <div>
                  <p className="text-5xl font-semibold text-white">{analysis.score}</p>
                  <p className="mt-2 max-w-xs text-sm text-slate-400">
                    {analysis.summary}
                  </p>
                </div>
                <ScoreRing score={analysis.score} />
              </div>

              <div className="mt-6 space-y-3">
                {analysis.metrics.map((metric) => (
                  <div
                    key={metric.label}
                    className="rounded-2xl border border-border bg-slate-950/40 p-4"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <p className="font-medium text-white">{metric.label}</p>
                      <span className="text-xs text-sky-200">
                        {metricLabelMap[metric.status]} - {metric.score}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-slate-400">{metric.detail}</p>
                  </div>
                ))}
              </div>
            </div>

            <div
              className={`rounded-[24px] border p-5 ${findingStyles[statusTone].panel}`}
            >
              <p className="text-sm font-semibold text-white">
                Feasibility Guard yüzeyi
              </p>
              <div className="mt-3 space-y-3">
                {analysis.findings.length > 0 ? (
                  analysis.findings.map((finding) => (
                    <div
                      key={finding.id}
                      className="rounded-2xl border border-white/10 bg-slate-950/35 p-4"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-medium text-white">{finding.title}</p>
                        <span
                          className={`rounded-full border px-2.5 py-1 text-[11px] font-medium ${findingStyles[finding.severity].badge}`}
                        >
                          {findingStyles[finding.severity].label}
                        </span>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-slate-200">
                        {finding.description}
                      </p>
                      <p className="mt-2 text-sm leading-6 text-slate-300">
                        Öneri: {finding.suggestion}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm leading-6 text-slate-200">
                    Şu anda kırmızı veya sarı bayrak yok. Finansal tahmin ya da
                    bağlayıcı hukuki/tıbbi karar isteyen bir istem deneyip guard
                    tepkisini gözlemleyebilirsin.
                  </p>
                )}
              </div>
            </div>

            <AuthPanel />
          </div>

          <aside className="space-y-6">
            <div className="rounded-[24px] border border-border bg-panel p-5">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium text-sky-200">Sağ panel</p>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setIsByokOpen(true)}
                    className="rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-200 transition hover:bg-amber-500/20"
                  >
                    API Key (BYOK)
                  </button>
                  <Link
                    href="/blog"
                    className="text-sm font-medium text-sky-100 transition hover:text-sky-200"
                  >
                    Blog
                  </Link>
                  <Link
                    href="/forum"
                    className="text-sm font-medium text-sky-100 transition hover:text-sky-200"
                  >
                    Foruma git
                  </Link>
                </div>
              </div>
              <h2 className="mt-2 text-2xl font-semibold text-white">
                Forum ve içerik akışı
              </h2>
              <div className="mt-5 space-y-4">
                {[
                  "Prompt paylaş, topluluktan geri bildirim al.",
                  "Başarılı promptu tek tıkla fork edip editöre gönder.",
                  "MDX makaleler ve vaka incelemeleriyle oturum süresini artır.",
                ].map((item) => (
                  <div
                    key={item}
                    className="rounded-2xl border border-border bg-slate-950/40 p-4 text-sm leading-6 text-slate-300"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[24px] border border-dashed border-border bg-slate-950/40 p-5 text-center text-sm text-slate-400">
              Reklam Slot: Sidebar 300x600
            </div>
          </aside>
        </section>

        <section className="mt-6 rounded-[24px] border border-border bg-panel p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-sky-200">Forum önizlemesi</p>
              <h2 className="text-2xl font-semibold text-white">
                In-feed reklam aralığı hazır
              </h2>
            </div>
            <span className="rounded-full border border-border px-3 py-1 text-xs text-slate-400">
              Her 5 yorumda bir banner
            </span>
          </div>

          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            {forumThreads.map((thread) => (
              <article
                key={thread.id}
                className="rounded-2xl border border-border bg-slate-950/40 p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
                    {thread.modelTag}
                  </p>
                  <span className="text-xs text-sky-200">
                    {thread.votes} oy - {thread.replies.length} yanıt
                  </span>
                </div>
                <h3 className="mt-2 text-lg font-semibold text-white">
                  {thread.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  {thread.excerpt}
                </p>
                <div className="mt-4 flex items-center justify-between gap-3">
                  <Link
                    href={`/forum/${thread.slug}`}
                    className="text-sm font-medium text-sky-100 transition hover:text-sky-200"
                  >
                    Konuyu aç
                  </Link>
                  <Link
                    href={`/?fork=${thread.slug}`}
                    className="rounded-full border border-sky-400/30 bg-sky-400/10 px-3 py-1.5 text-xs font-medium text-sky-100 transition hover:bg-sky-400/20"
                  >
                    Fork
                  </Link>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-4 rounded-2xl border border-dashed border-sky-400/30 bg-sky-400/10 p-4 text-center text-sm text-sky-100">
            Reklam Slot: Forum In-Feed Banner
          </div>
        </section>
      </section>
    </main>
  );
}
