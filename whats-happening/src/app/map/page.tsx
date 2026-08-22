import type { Metadata } from "next";
import { PageShell } from "@/components/PageShell";
import { SignalMap } from "@/components/SignalMap";

export const metadata: Metadata = {
  title: "Global AI activity map | What's Happening",
  description: "Select a lit place to open its current, source-attributed AI news and evidence.",
  alternates: { canonical: "/map" },
};
export default function MapPage() { return <PageShell><SignalMap /></PageShell>; }
