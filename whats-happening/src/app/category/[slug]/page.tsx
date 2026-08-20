import { GlobalNavbar } from "@/components/GlobalNavbar";
import { Footer } from "@/components/Footer";

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  return (
    <div className="relative min-h-screen bg-[#050505] selection:bg-white/10">
      <GlobalNavbar />
      
      <main className="mx-auto max-w-4xl px-6 pt-32 pb-24">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#8B8B93]">Category Explore</p>
        <h1 className="mt-4 text-5xl font-bold tracking-tighter text-white capitalize">
          {slug.replace(/-/g, " ")}
        </h1>
        
        <div className="mt-12 rounded-3xl border border-white/5 bg-[#111114] p-8">
          <h2 className="text-xl font-semibold text-white">Top Trends in {slug.replace(/-/g, " ")}</h2>
          <div className="mt-4 text-[#8B8B93]">
            Category specific feed and charts will appear here.
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
