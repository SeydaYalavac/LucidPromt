import type { Metadata } from "next";
import { PageShell } from "@/components/PageShell";
import { SignalMap } from "@/components/SignalMap";

export const metadata: Metadata = {
  title: "Global AI activity map | What's Happening",
  description: "Explore current source-attributed AI activity by market, rising topic, evidence count, and freshness.",
  alternates: { canonical: "/map" },
};
export default function MapPage() { return <PageShell><SignalMap /></PageShell>; }
