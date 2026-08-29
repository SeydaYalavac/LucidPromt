import type { Metadata } from "next";
import { PageShell } from "@/components/PageShell";
import { EvergreenGuidePage } from "@/components/EvergreenGuidePage";
import { evergreenGuides, getEvergreenGuideAudit } from "@/content/evergreen-guides";
import { readEvergreenGuideTrends } from "@/lib/server/evergreen-guide-data";
import { SITE_URL } from "@/lib/site";

export const dynamic = "force-dynamic";

const guide = evergreenGuides["ai-agents"];
const audit = getEvergreenGuideAudit(guide);
const url = `${SITE_URL}/guides/ai-agents`;

export const metadata: Metadata = {
  title: "AI Agents: Architecture, Controls and Evaluation | What's Happening",
  description: guide.description.en,
  alternates: { canonical: url },
  openGraph: { title: guide.title.en, description: guide.description.en, url, type: "article" },
};

export default async function AiAgentsGuide() {
  const liveTrends = await readEvergreenGuideTrends(guide.slug);
  const schema = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: guide.title.en,
    description: guide.description.en,
    url,
    inLanguage: ["en", "tr"],
    dateModified: audit.checkedAt,
    isPartOf: { "@type": "CollectionPage", name: "Artificial Intelligence", url: `${SITE_URL}/category/artificial-intelligence` },
    citation: audit.sources.map((source) => source.url),
  };
  return <PageShell><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }} /><EvergreenGuidePage slug={guide.slug} liveTrends={liveTrends} /></PageShell>;
}
