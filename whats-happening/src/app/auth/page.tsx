import type { Metadata } from "next";
import { type AuthMode } from "@/components/AuthPanel";
import { AuthScreen } from "@/components/AuthScreen";
import { getSafeRedirect } from "@/lib/auth-redirect";

export const metadata: Metadata = {
  title: "Sign in | What's Happening",
  description: "Check the availability of account access and recovery.",
  robots: { index: false, follow: false },
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

  return <AuthScreen mode={mode} next={next} initialError={initialError} />;
}
