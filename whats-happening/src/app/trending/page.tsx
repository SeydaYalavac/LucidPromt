import type { Metadata } from "next";
import { PageShell } from "@/components/PageShell";
import { TrendingView } from "@/components/TrendingView";

export const metadata: Metadata = {
  title: "Trending | What's Happening",
  description: "Filter scored technology signals and inspect their linked evidence.",
  alternates: { canonical: "/trending" },
};

export default async function TrendingPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const query = await searchParams;
  return <PageShell><TrendingView initialQuery={query.q || ""} /></PageShell>;
}
