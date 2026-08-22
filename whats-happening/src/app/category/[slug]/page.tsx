import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { GlobalNavbar } from "@/components/GlobalNavbar";
import { Footer } from "@/components/Footer";
import { CategoryView } from "@/components/CategoryView";
import { StructuredData } from "@/components/StructuredData";
import { readTrendList } from "@/lib/server/trend-data";
import { categoryPath, categorySlug, categoryStructuredData } from "@/lib/trend-page-graph";

export const dynamic = "force-dynamic";

async function loadCategory(slug: string) {
  const payload = await readTrendList({ category: slug, limit: 200, offset: 0, mode: "live" });
  if (!payload.trends.length) return null;
  return { payload, category: payload.trends[0].category };
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const result = await loadCategory(slug);
  if (!result) return { robots: { index: false, follow: false } };
  const description = `Current source-linked ${result.category} trends with evidence trails and scored attention signals.`;
  return {
    title: `${result.category} AI trends | What's Happening`,
    description,
    alternates: { canonical: categoryPath(result.category) },
    openGraph: { title: `${result.category} AI trends`, description, url: categoryPath(result.category) },
  };
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const result = await loadCategory(slug);
  if (!result) notFound();
  const canonicalSlug = categorySlug(result.category);
  if (slug !== canonicalSlug) permanentRedirect(`/category/${canonicalSlug}`);
  const schema = categoryStructuredData(result.category, result.payload.trends);
  
  return (
    <div className="relative min-h-screen bg-[#050505] selection:bg-white/10">
      {schema && <StructuredData data={schema} />}
      <GlobalNavbar />
      
      <main className="mx-auto max-w-4xl px-6 pt-32 pb-24">
        <CategoryView slug={slug} initialData={result.payload} />
      </main>

      <Footer />
    </div>
  );
}
