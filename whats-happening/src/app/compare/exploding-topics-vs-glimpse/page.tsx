import type { Metadata } from "next";
import { ComparisonPage } from "@/components/ComparisonPage";
import { glimpseComparison } from "@/content/comparison-pages";
import { SITE_URL } from "@/lib/site";

const canonical = `${SITE_URL}/compare/${glimpseComparison.slug}`;

export const metadata: Metadata = {
  title: glimpseComparison.title,
  description: glimpseComparison.description,
  alternates: { canonical },
  openGraph: {
    title: glimpseComparison.title,
    description: glimpseComparison.description,
    url: canonical,
    type: "article",
  },
};

export default function ExplodingTopicsVsGlimpsePage() {
  return <ComparisonPage data={glimpseComparison} />;
}
