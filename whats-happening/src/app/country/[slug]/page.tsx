import { GlobalNavbar } from "@/components/GlobalNavbar";
import { Footer } from "@/components/Footer";
import { TrendCollection } from "@/components/TrendCollection";

export default async function CountryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  return (
    <div className="relative min-h-screen bg-[#050505] selection:bg-white/10">
      <GlobalNavbar />
      
      <main className="mx-auto max-w-4xl px-6 pt-32 pb-24">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#8B8B93]">Country Insights</p>
        <h1 className="mt-4 text-5xl font-bold tracking-tighter text-white capitalize">
          {slug.replace(/-/g, " ")} Right Now
        </h1>
        
        <TrendCollection filter="country" value={slug} />
      </main>

      <Footer />
    </div>
  );
}
