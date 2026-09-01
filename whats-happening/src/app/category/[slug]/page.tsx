import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GlobalNavbar } from "@/components/GlobalNavbar";
import { Footer } from "@/components/Footer";
import { CategoryView } from "@/components/CategoryView";
import { StructuredData } from "@/components/StructuredData";
import { readRetainedCategoryPage } from "@/lib/server/trend-data";
import { categoryStructuredData } from "@/lib/trend-page-graph";
import { retainedHubPage, retainedHubPath } from "@/lib/trend-hubs";

export const dynamic = "force-dynamic";

async function loadCategory(slug: string, page: number) {
  return readRetainedCategoryPage(slug, page);
}

export async function generateMetadata({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ page?: string | string[] }> }): Promise<Metadata> {
  const { slug } = await params;
  const page = retainedHubPage((await searchParams).page);
  const result = await loadCategory(slug, page);
  if (!result) return { robots: { index: false, follow: false } };
  const description = `Retained source-linked ${result.collection.label} trends with evidence trails, page ${page} of ${result.pagination.page_count}.`;
  const canonical = retainedHubPath({ slug, label: result.collection.label, categories: [] }, page);
  return {
    title: `${result.collection.label} AI trends, page ${page} | What's Happening`,
    description,
    alternates: { canonical },
    openGraph: { title: `${result.collection.label} AI trends`, description, url: canonical },
  };
}

export default async function CategoryPage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ page?: string | string[] }> }) {
  const { slug } = await params;
  const page = retainedHubPage((await searchParams).page);
  const result = await loadCategory(slug, page);
  if (!result) notFound();
  const schema = categoryStructuredData(result.collection.label, result.trends, {
    path: retainedHubPath({ slug, label: result.collection.label, categories: [] }, page),
    positionOffset: (page - 1) * result.pagination.page_size,
    total: result.pagination.total,
  });
  
  return (
    <div className="relative min-h-screen bg-[#050505] selection:bg-white/10">
      {schema && <StructuredData data={schema} />}
      <GlobalNavbar />
      
      <main className="mx-auto max-w-4xl px-6 pt-32 pb-24">
        <CategoryView data={result} />
      </main>

      <Footer />
    </div>
  );
}
