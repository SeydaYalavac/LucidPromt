import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GlobalNavbar } from "@/components/GlobalNavbar";
import { Footer } from "@/components/Footer";
import { CountryEvidenceView } from "@/components/CountryEvidenceView";
import { StructuredData } from "@/components/StructuredData";
import { readRetainedCountryPage } from "@/lib/server/trend-data";
import { categoryStructuredData } from "@/lib/trend-page-graph";
import { retainedHubPage } from "@/lib/trend-hubs";

export const dynamic = "force-dynamic";

async function loadCountry(slug: string, page: number) {
  return readRetainedCountryPage(slug, page);
}

export async function generateMetadata({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ page?: string | string[] }> }): Promise<Metadata> {
  const { slug } = await params;
  const page = retainedHubPage((await searchParams).page);
  const data = await loadCountry(slug, page);
  if (!data) return { robots: { index: false, follow: false } };
  const description = `Retained AI trends with source evidence explicitly attributed to ${data.country.name}. Geography is observed evidence, not event origin.`;
  const canonical = page > 1 ? `/country/${slug}?page=${page}` : `/country/${slug}`;
  return {
    title: `AI trends observed in ${data.country.name}, page ${page} | What's Happening`,
    description,
    alternates: { canonical },
    openGraph: { title: `AI trends observed in ${data.country.name}`, description, url: canonical },
  };
}

export default async function CountryPage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ page?: string | string[] }> }) {
  const { slug } = await params;
  const page = retainedHubPage((await searchParams).page);
  const data = await loadCountry(slug, page);
  if (!data) notFound();
  const path = page > 1 ? `/country/${slug}?page=${page}` : `/country/${slug}`;
  const schema = categoryStructuredData(`AI trends observed in ${data.country.name}`, data.trends, {
    path,
    positionOffset: (page - 1) * data.pagination.page_size,
    total: data.pagination.total,
  });
  
  return (
    <div className="relative min-h-screen bg-[#050505] selection:bg-white/10">
      {schema && <StructuredData data={schema} />}
      <GlobalNavbar />
      
      <main className="mx-auto max-w-4xl px-6 pt-32 pb-24">
        <CountryEvidenceView data={data} />
      </main>

      <Footer />
    </div>
  );
}
