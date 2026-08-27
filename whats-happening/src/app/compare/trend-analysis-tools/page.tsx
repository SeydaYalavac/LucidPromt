import type { Metadata } from "next";
import { ComparisonPage } from "@/components/ComparisonPage";
import { trendAnalysisToolsComparison } from "@/content/comparison-pages";
import { SITE_URL } from "@/lib/site";

const canonical = `${SITE_URL}/compare/${trendAnalysisToolsComparison.slug}`;

export const metadata: Metadata = {
  title: trendAnalysisToolsComparison.title,
  description: trendAnalysisToolsComparison.description,
  alternates: { canonical },
  openGraph: {
    title: trendAnalysisToolsComparison.title,
    description: trendAnalysisToolsComparison.description,
    url: canonical,
    type: "article",
  },
};

export default function TrendAnalysisToolsPage() {
  return <ComparisonPage data={trendAnalysisToolsComparison} />;
}
