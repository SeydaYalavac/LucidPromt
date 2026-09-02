import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GlobalNavbar } from "@/components/GlobalNavbar";
import { Footer } from "@/components/Footer";
import { StructuredData } from "@/components/StructuredData";
import { TrendDetail } from "@/components/TrendDetail";
import { readTrendDetail } from "@/lib/server/trend-data";
import { buildTrendSearchMetadata } from "@/lib/trend-metadata";
import { trendPath, trendStructuredData } from "@/lib/trend-page-graph";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const payload = await readTrendDetail(slug);
  if (!payload) return { robots: { index: false, follow: false } };
  const searchMetadata = buildTrendSearchMetadata(payload);

  return {
    title: searchMetadata.title,
    description: searchMetadata.description,
    alternates: { canonical: trendPath(slug) },
    openGraph: {
      title: searchMetadata.title,
      description: searchMetadata.description,
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
