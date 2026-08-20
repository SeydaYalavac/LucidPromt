import type { Metadata } from "next";
import { AuthScreen } from "@/components/AuthScreen";
import { getSafeRedirect } from "@/lib/auth-redirect";

export const metadata: Metadata = {
  title: "Sign in | What's Happening",
  description: "Check the availability of account access.",
  robots: { index: false, follow: false },
};
export default async function SigninPage({ searchParams }: { searchParams: Promise<{ next?: string; error?: string }> }) { const query = await searchParams; return <AuthScreen mode="signin" next={getSafeRedirect(query.next || null)} initialError={query.error?.slice(0, 240)} />; }
