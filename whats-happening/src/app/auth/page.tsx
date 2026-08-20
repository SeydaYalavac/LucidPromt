import type { Metadata } from "next";
import Link from "next/link";
import { AuthContext, AuthPanel, type AuthMode } from "@/components/AuthPanel";
import { getSafeRedirect } from "@/lib/auth-redirect";

export const metadata: Metadata = {
  title: "Sign in | What's Happening",
  description: "Sign in or create an account to join live developer trend rooms.",
};

const authModes: AuthMode[] = ["signin", "signup", "forgot", "update"];

export default async function AuthPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = await searchParams;
  const rawMode = typeof query.mode === "string" ? query.mode : "signin";
  const mode = authModes.includes(rawMode as AuthMode) ? (rawMode as AuthMode) : "signin";
  const next = getSafeRedirect(typeof query.next === "string" ? query.next : null);
  const initialError = typeof query.error === "string" ? query.error.slice(0, 240) : undefined;

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050505] px-6 py-8 sm:px-8 lg:px-12">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_45%,rgba(6,182,212,0.10),transparent_30%)]" />
        <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(255,255,255,.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.035)_1px,transparent_1px)] [background-size:48px_48px]" />
      </div>

      <div className="relative mx-auto flex min-h-[calc(100vh-4rem)] max-w-7xl flex-col">
        <header className="flex items-center justify-between">
          <Link href="/" className="text-sm font-semibold uppercase tracking-[0.2em] text-white">
            What&apos;s Happening
          </Link>
          <Link href="/" className="text-xs font-medium uppercase tracking-[0.14em] text-[#92929b] hover:text-white">
            Back to live feed
          </Link>
        </header>

        <div className="grid flex-1 items-center gap-16 py-16 lg:grid-cols-[1fr_470px] lg:py-10">
          <div className="hidden lg:block">
            <AuthContext />
          </div>
          <AuthPanel mode={mode} next={next} initialError={initialError} />
        </div>

        <footer className="flex items-center justify-between border-t border-white/[0.06] pt-5 text-xs text-white/35">
          <span>Secure sessions powered by Supabase</span>
          <span>OAuth · Email · Recovery</span>
        </footer>
      </div>
    </main>
  );
}

