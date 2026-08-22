import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GlobalNavbar } from "@/components/GlobalNavbar";
import { Footer } from "@/components/Footer";
import { CountryEvidenceView } from "@/components/CountryEvidenceView";
import { StructuredData } from "@/components/StructuredData";
import { readMapActivity } from "@/lib/server/trend-data";
import { countryPath, countryStructuredData } from "@/lib/trend-page-graph";

export const dynamic = "force-dynamic";

async function loadCountry(slug: string) {
  const payload = await readMapActivity();
  return payload.activities.find((activity) => activity.country.slug === slug) || null;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const activity = await loadCountry(slug);
  if (!activity) return { robots: { index: false, follow: false } };
  const description = `Current AI trends with source evidence explicitly attributed to ${activity.country.name}. Geography is observed evidence, not event origin.`;
  return {
    title: `AI trends observed in ${activity.country.name} | What's Happening`,
    description,
    alternates: { canonical: countryPath(activity.country.slug) },
    openGraph: { title: `AI trends observed in ${activity.country.name}`, description, url: countryPath(activity.country.slug) },
  };
}

export default async function CountryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const activity = await loadCountry(slug);
  if (!activity) notFound();
  const schema = countryStructuredData(activity);
  if (!schema) notFound();
  
  return (
    <div className="relative min-h-screen bg-[#050505] selection:bg-white/10">
      <StructuredData data={schema} />
      <GlobalNavbar />
      
      <main className="mx-auto max-w-4xl px-6 pt-32 pb-24">
        <CountryEvidenceView activity={activity} />
      </main>

      <Footer />
    </div>
  );
}
