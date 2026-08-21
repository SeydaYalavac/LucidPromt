import { GlobalNavbar } from "@/components/GlobalNavbar";
import { Footer } from "@/components/Footer";
import { TrendCollection } from "@/components/TrendCollection";
import { CollectionHeader } from "@/components/CollectionHeader";

export default async function CountryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  return (
    <div className="relative min-h-screen bg-[#050505] selection:bg-white/10">
      <GlobalNavbar />
      
      <main className="mx-auto max-w-4xl px-6 pt-32 pb-24">
        <CollectionHeader kind="country" value={slug} />
        
        <TrendCollection filter="country" value={slug} />
      </main>

      <Footer />
    </div>
  );
}
