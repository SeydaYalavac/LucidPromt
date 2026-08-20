import { GlobalNavbar } from "@/components/GlobalNavbar";
import { Footer } from "@/components/Footer";
import { TrendDetail } from "@/components/TrendDetail";

export default async function TrendPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  return (
    <div className="relative min-h-screen bg-[#050505] selection:bg-white/10">
      <GlobalNavbar />
      <TrendDetail slug={slug} />
      <Footer />
    </div>
  );
}
