import type { Metadata } from "next";
import { PageShell } from "@/components/PageShell";
import { SecurityResearchHub } from "@/components/SecurityResearchHub";

export const metadata: Metadata = {
  title: "Defensive AI Security Research Hub | What's Happening",
  description: "Search source-linked defensive dossiers for prompt injection, poisoning, leakage, excessive agency, model attacks and hallucination controls.",
  alternates: { canonical: "https://www.whatshappeninginai.com/security-research" },
  openGraph: {
    title: "Defensive AI Security Research Hub | What's Happening",
    description: "Twenty-one bilingual, source-linked defensive dossiers for safer AI systems.",
    url: "https://www.whatshappeninginai.com/security-research",
    type: "website",
  },
};

export default function SecurityResearchPage() {
  return <PageShell><SecurityResearchHub /></PageShell>;
}
