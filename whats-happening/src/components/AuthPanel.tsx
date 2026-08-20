"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  CheckCircle2,
  LoaderCircle,
  LockKeyhole,
  Mail,
  Radio,
  ShieldCheck,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import { useAuthSession } from "@/hooks/useAuthSession";

export type AuthMode = "signin" | "signup" | "forgot" | "update";

function GitHubMark() {
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" aria-hidden="true" fill="currentColor">
      <path d="M12 .7a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2.23c-3.22.7-3.9-1.37-3.9-1.37-.52-1.34-1.28-1.7-1.28-1.7-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.57-.29-5.27-1.28-5.27-5.69 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.16 1.18A11 11 0 0 1 12 6.11c.98 0 1.95.13 2.87.39 2.2-1.49 3.16-1.18 3.16-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.83 1.19 3.09 0 4.42-2.71 5.39-5.29 5.68.42.36.79 1.06.79 2.14v3.27c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .7Z" />
    </svg>
  );
}

const modeCopy: Record<AuthMode, { title: string; description: string }> = {
  signin: {
    title: "Welcome back",
    description: "Sign in to join technical conversations as signals break.",
  },
  signup: {
    title: "Create your account",
    description: "Save your identity across every live developer room.",
  },
  forgot: {
    title: "Reset your password",
    description: "We’ll email a secure recovery link to your account address.",
  },
  update: {
    title: "Choose a new password",
    description: "Use at least eight characters you don’t use anywhere else.",
  },
};

function InputField({
  label,
  icon: Icon,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  icon: LucideIcon;
}) {
  return (
    <label className="block text-sm font-medium text-white/85">
      {label}
      <span className="relative mt-2 block">
        <Icon
          size={17}
          aria-hidden="true"
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#777780]"
        />
        <input
          {...props}
          className="h-12 w-full rounded-xl border border-white/10 bg-white/[0.045] pl-11 pr-4 text-[15px] text-white outline-none transition-colors placeholder:text-white/25 focus:border-[#06b6d4]/70 focus:bg-white/[0.065] disabled:cursor-not-allowed disabled:opacity-45"
        />
      </span>
    </label>
  );
}

export function AuthPanel({
  mode,
  next,
  initialError,
}: {
  mode: AuthMode;
  next: string;
  initialError?: string;
}) {
  const router = useRouter();
  const { supabase, session, isLoading: sessionLoading, isConfigured } = useAuthSession();
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(initialError || null);
  const [notice, setNotice] = useState<string | null>(null);
  const copy = modeCopy[mode];
  const authHref = (nextMode: AuthMode) =>
    `/auth?mode=${nextMode}&next=${encodeURIComponent(next)}`;

  async function handleEmailAuth(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setNotice(null);

    if (!supabase) {
      setError("Authentication isn’t available until Supabase is connected.");
      return;
    }
    if ((mode === "signup" || mode === "update") && password !== confirmPassword) {
      setError("The passwords don’t match.");
      return;
    }

    setBusy(true);
    try {
      if (mode === "signin") {
        const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
        if (authError) throw authError;
        window.location.assign(next);
        return;
      }

      if (mode === "signup") {
        const emailRedirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;
        const { data, error: authError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo,
            data: { display_name: displayName.trim() || email.split("@")[0] },
          },
        });
        if (authError) throw authError;
        if (data.session) {
          window.location.assign(next);
          return;
        }
        setNotice("Check your inbox to verify your email. The link will finish signing you in.");
        return;
      }

      if (mode === "forgot") {
        const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent("/auth?mode=update")}`;
        const { error: authError } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
        if (authError) throw authError;
        setNotice("If an account exists for that address, a recovery link is on its way.");
        return;
      }

      if (!session) {
        setError("This recovery session is missing or expired. Request a new password link.");
        return;
      }
      const { error: authError } = await supabase.auth.updateUser({ password });
      if (authError) throw authError;
      setNotice("Your password is updated. You can continue to the live feed.");
    } catch (authError) {
      setError(authError instanceof Error ? authError.message : "Authentication failed. Try again.");
    } finally {
      setBusy(false);
    }
  }

  async function signInWithGithub() {
    setError(null);
    if (!supabase) {
      setError("Authentication isn’t available until Supabase is connected.");
      return;
    }
    setBusy(true);
    const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;
    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider: "github",
      options: { redirectTo },
    });
    if (authError) {
      setError(authError.message);
      setBusy(false);
    }
  }

  async function signOutAndContinue() {
    if (!supabase) return;
    setBusy(true);
    const { error: authError } = await supabase.auth.signOut();
    setBusy(false);
    if (authError) {
      setError(authError.message);
      return;
    }
    router.replace(authHref("signin"));
    router.refresh();
  }

  const formDisabled = busy || !isConfigured || (mode === "update" && (sessionLoading || !session));

  return (
    <div className="w-full max-w-[470px] rounded-[28px] border border-white/10 bg-[#0B0B0D] p-6 shadow-2xl shadow-black/40 sm:p-8">
      <div className="mb-8">
        <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl border border-[#06b6d4]/25 bg-[#06b6d4]/10 text-[#22d3ee]">
          <LockKeyhole size={20} aria-hidden="true" />
        </div>
        <h1 className="text-balance text-3xl font-semibold tracking-[-0.035em] text-white">
          {copy.title}
        </h1>
        <p className="mt-3 max-w-[42ch] text-pretty text-sm leading-6 text-[#92929b]">
          {copy.description}
        </p>
      </div>

      {!isConfigured && (
        <div className="mb-6 rounded-xl border border-amber-300/20 bg-amber-300/[0.06] px-4 py-3 text-sm leading-6 text-amber-100/85">
          Sign-in is safely paused while the production Supabase project is being connected. No
          account data will be submitted.
        </div>
      )}

      {session && mode !== "update" && (
        <div className="mb-6 rounded-xl border border-emerald-400/20 bg-emerald-400/[0.06] p-4">
          <p className="flex items-center gap-2 text-sm font-medium text-emerald-100">
            <CheckCircle2 size={16} aria-hidden="true" /> Already signed in
          </p>
          <p className="mt-2 truncate text-sm text-emerald-100/65">{session.user.email}</p>
          <div className="mt-4 flex items-center gap-4 text-sm">
            <Link href={next} className="font-semibold text-white hover:text-[#67e8f9]">
              Continue
            </Link>
            <button
              type="button"
              onClick={signOutAndContinue}
              className="text-white/55 hover:text-white"
            >
              Use another account
            </button>
          </div>
        </div>
      )}

      {mode === "update" && !sessionLoading && !session && (
        <div className="mb-6 rounded-xl border border-amber-300/20 bg-amber-300/[0.06] px-4 py-3 text-sm leading-6 text-amber-100/85">
          This recovery link is missing or expired. Request a new link before choosing a password.
        </div>
      )}

      {mode !== "forgot" && mode !== "update" && (
        <>
          <button
            type="button"
            onClick={signInWithGithub}
            disabled={busy || !isConfigured}
            className="flex h-12 w-full items-center justify-center gap-2.5 rounded-xl border border-white/15 bg-white/[0.045] text-sm font-semibold text-white transition-colors hover:bg-white/[0.08] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            {busy ? <LoaderCircle size={17} className="animate-spin" /> : <GitHubMark />}
            Continue with GitHub
          </button>
          <div className="my-6 flex items-center gap-3 text-[11px] font-medium uppercase tracking-[0.16em] text-white/30">
            <span className="h-px flex-1 bg-white/10" /> or use email <span className="h-px flex-1 bg-white/10" />
          </div>
        </>
      )}

      <form onSubmit={handleEmailAuth} className="space-y-4">
        {mode === "signup" && (
          <InputField
            label="Display name"
            icon={UserRound}
            name="name"
            autoComplete="name"
            placeholder="How developers will see you"
            value={displayName}
            onChange={(event) => setDisplayName(event.target.value)}
            disabled={formDisabled}
            maxLength={80}
          />
        )}
        {mode !== "update" && (
          <InputField
            label="Email"
            icon={Mail}
            type="email"
            name="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            disabled={formDisabled}
            required
          />
        )}
        {mode !== "forgot" && (
          <InputField
            label={mode === "update" ? "New password" : "Password"}
            icon={LockKeyhole}
            type="password"
            name="password"
            autoComplete={mode === "signin" ? "current-password" : "new-password"}
            placeholder="At least 8 characters"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            disabled={formDisabled}
            minLength={8}
            required
          />
        )}
        {(mode === "signup" || mode === "update") && (
          <InputField
            label="Confirm password"
            icon={ShieldCheck}
            type="password"
            name="confirmPassword"
            autoComplete="new-password"
            placeholder="Repeat your password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            disabled={formDisabled}
            minLength={8}
            required
          />
        )}

        {mode === "signin" && (
          <div className="flex justify-end">
            <Link href={authHref("forgot")} className="text-xs font-medium text-[#a6a6ae] hover:text-white">
              Forgot password?
            </Link>
          </div>
        )}

        <button
          type="submit"
          disabled={formDisabled}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#06b6d4] text-sm font-bold text-[#021013] transition-colors hover:bg-[#22d3ee] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#22d3ee] disabled:cursor-not-allowed disabled:opacity-40"
        >
          {busy && <LoaderCircle size={17} className="animate-spin" />}
          {mode === "signin" && "Sign in"}
          {mode === "signup" && "Create account"}
          {mode === "forgot" && "Send recovery link"}
          {mode === "update" && "Update password"}
          {!busy && <ArrowRight size={16} aria-hidden="true" />}
        </button>
      </form>

      <div aria-live="polite" className="mt-4">
        {notice && (
          <p className="rounded-xl border border-emerald-400/20 bg-emerald-400/[0.06] px-4 py-3 text-sm leading-6 text-emerald-100">
            {notice}
          </p>
        )}
        {error && (
          <p className="rounded-xl border border-red-400/20 bg-red-400/[0.06] px-4 py-3 text-sm leading-6 text-red-200">
            {error}
          </p>
        )}
      </div>

      <div className="mt-7 border-t border-white/10 pt-6 text-center text-sm text-[#8B8B93]">
        {mode === "signin" && (
          <p>
            New here?{" "}
            <Link href={authHref("signup")} className="font-semibold text-white hover:text-[#67e8f9]">
              Create an account
            </Link>
          </p>
        )}
        {mode === "signup" && (
          <p>
            Already have an account?{" "}
            <Link href={authHref("signin")} className="font-semibold text-white hover:text-[#67e8f9]">
              Sign in
            </Link>
          </p>
        )}
        {(mode === "forgot" || mode === "update") && (
          <Link href={authHref("signin")} className="font-semibold text-white hover:text-[#67e8f9]">
            Back to sign in
          </Link>
        )}
      </div>
    </div>
  );
}

export function AuthContext() {
  return (
    <div className="max-w-[480px]">
      <p className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.19em] text-[#67e8f9]">
        <Radio size={14} aria-hidden="true" /> Live developer identity
      </p>
      <h2 className="mt-6 text-balance text-4xl font-semibold leading-[1.08] tracking-[-0.045em] text-white lg:text-6xl">
        One account for every breaking signal.
      </h2>
      <p className="mt-6 max-w-[46ch] text-pretty text-base leading-7 text-[#92929b]">
        Join the technical room behind each trend, keep your display name, and continue the
        conversation as attention moves.
      </p>
      <div className="mt-10 grid grid-cols-3 gap-3" aria-hidden="true">
        {[82, 91, 76].map((score, index) => (
          <div
            key={score}
            className={`rounded-2xl border border-white/10 bg-white/[0.035] p-4 ${index === 1 ? "translate-y-4" : ""}`}
          >
            <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/35">
              Signal 0{index + 1}
            </div>
            <div className="mt-5 font-mono text-2xl font-semibold tabular-nums text-white">{score}</div>
            <div className="mt-3 h-1 overflow-hidden rounded-full bg-white/5">
              <div className="h-full rounded-full bg-[#06b6d4]" style={{ width: `${score}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
