import type { Metadata } from "next";
import { PageShell } from "@/components/PageShell";
import { ExploreView } from "@/components/ExploreView";

export const metadata: Metadata = { title: "Explore | What's Happening", description: "Browse scored, source-linked trend evidence by category." };
export default function ExplorePage() { return <PageShell><ExploreView /></PageShell>; }
