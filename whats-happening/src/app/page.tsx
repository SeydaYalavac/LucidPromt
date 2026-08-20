import { GlobalNavbar } from "@/components/GlobalNavbar";
import { HeroSection } from "@/components/HeroSection";
import { GlobalPulse } from "@/components/GlobalPulse";
import { NextBigThing } from "@/components/NextBigThing";
import { LiveFeed } from "@/components/LiveFeed";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <div className="relative min-h-screen bg-[#050505] selection:bg-white/10 overflow-x-hidden">
      <GlobalNavbar />
      
      <main>
        <HeroSection />
        <GlobalPulse />
        <NextBigThing />
        <LiveFeed />
      </main>

      <Footer />
    </div>
  );
}
