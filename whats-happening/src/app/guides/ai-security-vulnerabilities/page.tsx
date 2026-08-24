import type { Metadata } from "next";
import { PageShell } from "@/components/PageShell";
import { SecurityGuidePage } from "@/components/SecurityGuidePage";
import { getGuideAudit, securityGuides } from "@/content/security-guides";
import { SITE_URL } from "@/lib/site";

const guide = securityGuides["ai-security-vulnerabilities"];
const audit = getGuideAudit(guide);
const url = `${SITE_URL}/guides/ai-security-vulnerabilities`;

export const metadata: Metadata = {
  title: "AI Security Vulnerabilities: A Defensive Guide | What's Happening",
  description: guide.description.en,
  alternates: { canonical: url },
  openGraph: { title: guide.title.en, description: guide.description.en, url, type: "article" },
};

export default function AiSecurityVulnerabilitiesGuide() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: guide.title.en,
    description: guide.description.en,
    url,
    inLanguage: ["en", "tr"],
    dateModified: audit.checkedAt,
    isPartOf: { "@type": "CollectionPage", name: "Defensive AI Security Research Hub", url: `${SITE_URL}/security-research` },
    citation: audit.sources.map((source) => source.url),
  };
  return <PageShell><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }} /><SecurityGuidePage slug="ai-security-vulnerabilities" /></PageShell>;
}
