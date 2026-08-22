import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GlobalNavbar } from "@/components/GlobalNavbar";
import { Footer } from "@/components/Footer";
import { StructuredData } from "@/components/StructuredData";
import { TrendDetail } from "@/components/TrendDetail";
import { readTrendDetail } from "@/lib/server/trend-data";
import { trendPath, trendStructuredData } from "@/lib/trend-page-graph";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const payload = await readTrendDetail(slug);
  if (!payload) return { robots: { index: false, follow: false } };
  const topic = payload.trend.title;
  const description = payload.trend.brief?.what_it_is || payload.trend.summary || `Read the source-linked AI trend article for ${topic}.`;

  return {
    title: `${topic} trend article | What's Happening`,
    description,
    alternates: { canonical: trendPath(slug) },
    openGraph: {
      title: `${topic} trend article`,
      description,
      type: "article",
      url: trendPath(slug),
    },
  };
}

export default async function TrendPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const payload = await readTrendDetail(slug);
  if (!payload) notFound();
  
  return (
    <div className="relative min-h-screen bg-[#050505] selection:bg-white/10">
      <StructuredData data={trendStructuredData(payload.trend, payload.signals)} />
      <GlobalNavbar />
      <TrendDetail slug={slug} initialData={payload} />
      <Footer />
    </div>
  );
}
