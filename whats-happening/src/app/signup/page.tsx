import type { Metadata } from "next";
import { AuthScreen } from "@/components/AuthScreen";
import { getSafeRedirect } from "@/lib/auth-redirect";

export const metadata: Metadata = {
  title: "Create account | What's Happening",
  description: "Check the availability of early-access account creation.",
  robots: { index: false, follow: false },
};
export default async function SignupPage({ searchParams }: { searchParams: Promise<{ next?: string; error?: string }> }) { const query = await searchParams; return <AuthScreen mode="signup" next={getSafeRedirect(query.next || null)} initialError={query.error?.slice(0, 240)} />; }
