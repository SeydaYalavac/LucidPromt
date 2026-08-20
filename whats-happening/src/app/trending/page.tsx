import type { Metadata } from "next";
import { PageShell } from "@/components/PageShell";
import { TrendingView } from "@/components/TrendingView";

export const metadata: Metadata = { title: "Trending | What's Happening", description: "Filter and follow live technology trends as attention changes." };

export default async function TrendingPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const query = await searchParams;
  return <PageShell><TrendingView initialQuery={query.q || ""} /></PageShell>;
}
