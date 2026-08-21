import type { Metadata } from "next";
import { ComparisonPage } from "@/components/ComparisonPage";
import { googleTrendsComparison } from "@/content/comparison-pages";
import { SITE_URL } from "@/lib/site";

const canonical = `${SITE_URL}/compare/${googleTrendsComparison.slug}`;

export const metadata: Metadata = {
  title: googleTrendsComparison.title,
  description: googleTrendsComparison.description,
  alternates: { canonical },
  openGraph: {
    title: googleTrendsComparison.title,
    description: googleTrendsComparison.description,
    url: canonical,
    type: "article",
  },
};

export default function ExplodingTopicsVsGoogleTrendsPage() {
  return <ComparisonPage data={googleTrendsComparison} />;
}
