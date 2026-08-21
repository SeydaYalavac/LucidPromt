"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Provider } from "@supabase/supabase-js";
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
import { emailSchema, passwordSchema, signinSchema, signupSchema } from "@/lib/auth-validation";
import { captureProductEvent, captureProductEventOnce } from "@/lib/analytics";

export type AuthMode = "signin" | "signup" | "forgot" | "update";
type SocialProvider = Extract<Provider, "google" | "github" | "apple">;

const socialProviders: Array<{ id: SocialProvider; label: string }> = [
  { id: "google", label: "Google" },
  { id: "github", label: "GitHub" },
  { id: "apple", label: "Apple" },
];

function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" aria-hidden="true">
      <path fill="#4285F4" d="M21.6 12.23c0-.71-.06-1.4-.18-2.06H12v3.9h5.38a4.6 4.6 0 0 1-2 3.02v2.53h3.24c1.9-1.75 2.98-4.33 2.98-7.39Z" />
      <path fill="#34A853" d="M12 22c2.7 0 4.98-.9 6.63-2.42l-3.24-2.52c-.9.6-2.05.96-3.39.96-2.61 0-4.82-1.76-5.61-4.13H3.04v2.6A10 10 0 0 0 12 22Z" />
      <path fill="#FBBC05" d="M6.39 13.89A6 6 0 0 1 6.08 12c0-.66.11-1.3.31-1.89v-2.6H3.04A10 10 0 0 0 2 12c0 1.61.38 3.14 1.04 4.49l3.35-2.6Z" />
      <path fill="#EA4335" d="M12 5.98c1.47 0 2.79.5 3.83 1.5l2.87-2.87A9.64 9.64 0 0 0 12 2 10 10 0 0 0 3.04 7.51l3.35 2.6C7.18 7.74 9.39 5.98 12 5.98Z" />
    </svg>
  );
}

function GitHubMark() {
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" aria-hidden="true" fill="currentColor">
      <path d="M12 .7a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2.23c-3.22.7-3.9-1.37-3.9-1.37-.52-1.34-1.28-1.7-1.28-1.7-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.57-.29-5.27-1.28-5.27-5.69 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.16 1.18A11 11 0 0 1 12 6.11c.98 0 1.95.13 2.87.39 2.2-1.49 3.16-1.18 3.16-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.83 1.19 3.09 0 4.42-2.71 5.39-5.29 5.68.42.36.79 1.06.79 2.14v3.27c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .7Z" />
    </svg>
  );
}

function AppleMark() {
  return (
    <svg viewBox="0 0 24 24" className="h-[19px] w-[19px]" aria-hidden="true" fill="currentColor">
      <path d="M17.05 12.54c-.02-2.21 1.8-3.28 1.88-3.33a4.05 4.05 0 0 0-3.2-1.73c-1.35-.14-2.66.81-3.35.81-.7 0-1.76-.8-2.9-.78a4.24 4.24 0 0 0-3.56 2.17c-1.54 2.66-.39 6.57 1.08 8.72.74 1.05 1.6 2.22 2.74 2.18 1.11-.05 1.53-.7 2.87-.7 1.34 0 1.72.7 2.88.67 1.2-.02 1.95-1.06 2.66-2.12a8.72 8.72 0 0 0 1.22-2.48 3.8 3.8 0 0 1-2.32-3.41ZM14.85 6.05a3.87 3.87 0 0 0 .9-2.78 3.95 3.95 0 0 0-2.56 1.32 3.7 3.7 0 0 0-.92 2.67 3.26 3.26 0 0 0 2.58-1.21Z" />
    </svg>
  );
}

function ProviderMark({ provider }: { provider: SocialProvider }) {
  if (provider === "google") return <GoogleMark />;
  if (provider === "apple") return <AppleMark />;
  return <GitHubMark />;
}

const modeCopy: Record<AuthMode, { title: string; description: string }> = {
  signin: {
    title: "Welcome back",
    description: "Account access will resume after the production data connection is configured.",
  },
  signup: {
    title: "Create your account",
    description: "Account creation is not available on this deployment yet.",
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
  const [activeProvider, setActiveProvider] = useState<SocialProvider | null>(null);
  const [error, setError] = useState<string | null>(initialError || null);
  const [notice, setNotice] = useState<string | null>(null);
  const copy = modeCopy[mode];
  const authHref = (nextMode: AuthMode) => nextMode === "signin" || nextMode === "signup"
    ? `/${nextMode}?next=${encodeURIComponent(next)}`
    : `/auth?mode=${nextMode}&next=${encodeURIComponent(next)}`;

  async function handleEmailAuth(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setActiveProvider(null);
    setError(null);
    setNotice(null);
    captureProductEvent("auth_attempted", { mode, provider: "email" });

    if (!supabase) {
      setError("Authentication isn’t available until Supabase is connected.");
      captureProductEvent("auth_completed", { mode, provider: "email", success: false, failure_type: "not_configured" });
      return;
    }
    const validation = mode === "signup"
      ? signupSchema.safeParse({ email, password, confirmPassword, displayName })
      : mode === "signin"
        ? signinSchema.safeParse({ email, password })
        : mode === "forgot"
          ? emailSchema.safeParse(email)
          : passwordSchema.safeParse(password);
    if (!validation.success) {
      setError(validation.error.issues[0]?.message || "Check the form and try again.");
      captureProductEvent("auth_completed", { mode, provider: "email", success: false, failure_type: "validation" });
      return;
    }
    if (mode === "update" && password !== confirmPassword) {
      setError("The passwords don’t match.");
      captureProductEvent("auth_completed", { mode, provider: "email", success: false, failure_type: "password_mismatch" });
      return;
    }

    setBusy(true);
    try {
      if (mode === "signin") {
        const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
        if (authError) throw authError;
        captureProductEvent("auth_completed", { mode, provider: "email", success: true });
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
        captureProductEvent("auth_completed", { mode, provider: "email", success: true, requires_email_verification: !data.session });
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
        captureProductEvent("auth_completed", { mode, provider: "email", success: true });
        setNotice("If an account exists for that address, a recovery link is on its way.");
        return;
      }

      if (!session) {
        setError("This recovery session is missing or expired. Request a new password link.");
        captureProductEvent("auth_completed", { mode, provider: "email", success: false, failure_type: "missing_session" });
        return;
      }
      const { error: authError } = await supabase.auth.updateUser({ password });
      if (authError) throw authError;
      captureProductEvent("auth_completed", { mode, provider: "email", success: true });
      setNotice("Your password is updated. You can continue to the public feed.");
    } catch (authError) {
      setError(authError instanceof Error ? authError.message : "Authentication failed. Try again.");
      captureProductEvent("auth_completed", { mode, provider: "email", success: false, failure_type: "provider_error" });
    } finally {
      setBusy(false);
    }
  }

  async function signInWithProvider(provider: SocialProvider) {
    setError(null);
    setNotice(null);
    captureProductEvent("auth_attempted", { mode, provider });
    if (!supabase) {
      setError("Authentication isn’t available until Supabase is connected.");
      captureProductEvent("auth_completed", { mode, provider, success: false, failure_type: "not_configured" });
      return;
    }
    setBusy(true);
    setActiveProvider(provider);
    const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;
    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo },
    });
    if (authError) {
      setError(authError.message);
      captureProductEvent("auth_completed", { mode, provider, success: false, failure_type: "provider_error" });
      setBusy(false);
      setActiveProvider(null);
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

  useEffect(() => {
    if (isConfigured) return;
    captureProductEventOnce(
      `authentication_unavailable:${mode}`,
      "authentication_unavailable",
      { mode },
    );
  }, [isConfigured, mode]);

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
          <div className="grid grid-cols-3 gap-2.5" aria-label="Social sign-in options">
            {socialProviders.map((provider) => (
              <button
                key={provider.id}
                type="button"
                onClick={() => signInWithProvider(provider.id)}
                disabled={busy || !isConfigured}
                aria-label={`Continue with ${provider.label}`}
                className="flex h-12 items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/[0.045] px-2 text-xs font-semibold text-white transition-colors hover:border-white/25 hover:bg-white/[0.08] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                {activeProvider === provider.id ? (
                  <LoaderCircle size={17} className="animate-spin" aria-hidden="true" />
                ) : (
                  <ProviderMark provider={provider.id} />
                )}
                <span>{provider.label}</span>
              </button>
            ))}
          </div>
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
          {busy && !activeProvider && <LoaderCircle size={17} className="animate-spin" />}
          {mode === "signin" && "Sign in"}
          {mode === "signup" && "Create account"}
          {mode === "forgot" && "Send recovery link"}
          {mode === "update" && "Update password"}
          {!busy && <ArrowRight size={16} aria-hidden="true" />}
        </button>
        {mode === "signup" && (
          <p className="px-2 text-center text-xs leading-5 text-white/40">
            By creating an account, you agree to the{" "}
            <Link href="/terms" className="text-white/65 underline decoration-white/20 underline-offset-4 hover:text-white">
              Terms
            </Link>{" "}
            and acknowledge the{" "}
            <Link href="/privacy" className="text-white/65 underline decoration-white/20 underline-offset-4 hover:text-white">
              Privacy notice
            </Link>
            .
          </p>
        )}
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
            <Link href={authHref("signup")} onClick={() => captureProductEvent("signup_cta_clicked", { source: "auth_panel" })} className="font-semibold text-white hover:text-[#67e8f9]">
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
        <Radio size={14} aria-hidden="true" /> Account access
      </p>
      <h2 className="mt-6 text-balance text-4xl font-semibold leading-[1.08] tracking-[-0.045em] text-white lg:text-6xl">
        Identity for source-linked discussion.
      </h2>
      <p className="mt-6 max-w-[46ch] text-pretty text-base leading-7 text-[#92929b]">
        Account identity and trend discussion are designed, but unavailable until the production
        data and authentication services are connected.
      </p>
      <div className="mt-10 rounded-2xl border border-amber-300/15 bg-amber-300/[0.045] p-5 text-sm leading-6 text-amber-100/75">
        Production status: account access unavailable. No credentials entered on this page are submitted.
      </div>
    </div>
  );
}
