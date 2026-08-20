import { GlobalNavbar } from "@/components/GlobalNavbar";
import { HeroSection } from "@/components/HeroSection";
import { GlobalPulse } from "@/components/GlobalPulse";
import { NextBigThing } from "@/components/NextBigThing";
import { LiveFeed } from "@/components/LiveFeed";
import { HomepageFaq } from "@/components/HomepageFaq";
import { Footer } from "@/components/Footer";
import { homepageFaqs } from "@/content/homepage-faq";

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: homepageFaqs.map(({ question, answer }) => ({
    "@type": "Question",
    name: question,
    acceptedAnswer: {
      "@type": "Answer",
      text: answer,
    },
  })),
};

export default function Home() {
  return (
    <div className="relative min-h-screen bg-[#050505] selection:bg-white/10 overflow-x-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqJsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <GlobalNavbar />
      
      <main>
        <HeroSection />
        <GlobalPulse />
        <NextBigThing />
        <LiveFeed />
        <HomepageFaq />
      </main>

      <Footer />
    </div>
  );
}
