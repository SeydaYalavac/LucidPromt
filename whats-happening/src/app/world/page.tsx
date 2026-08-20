import type { Metadata } from "next";
import { PageShell } from "@/components/PageShell";
import { WorldView } from "@/components/WorldView";

export const metadata: Metadata = {
  title: "World | What's Happening",
  description: "The strongest global technology signal and its supporting evidence.",
  alternates: { canonical: "/world" },
};

export default function WorldPage() { return <PageShell><WorldView /></PageShell>; }
