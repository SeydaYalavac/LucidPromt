import type { Metadata } from "next";
import { GlobalNavbar } from "@/components/GlobalNavbar";
import { HeroSection } from "@/components/HeroSection";
import { GlobalPulse } from "@/components/GlobalPulse";
import { NextBigThing } from "@/components/NextBigThing";
import { LiveFeed } from "@/components/LiveFeed";
import { HomepageFaq } from "@/components/HomepageFaq";
import { RetainedHubDirectory } from "@/components/RetainedHubDirectory";
import { Footer } from "@/components/Footer";
import { homepageFaqs } from "@/content/homepage-faq";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";
import { readRetainedHubDirectory } from "@/lib/server/trend-data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

const pageJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: SITE_NAME,
      url: SITE_URL,
    },
    {
      "@type": "SoftwareApplication",
      "@id": `${SITE_URL}/#software`,
      name: SITE_NAME,
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      url: SITE_URL,
      description: SITE_DESCRIPTION,
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
        url: `${SITE_URL}/pricing`,
      },
      publisher: { "@id": `${SITE_URL}/#organization` },
    },
    {
      "@type": "FAQPage",
      "@id": `${SITE_URL}/#faq`,
      mainEntity: homepageFaqs.map(({ question, answer }) => ({
        "@type": "Question",
        name: question,
        acceptedAnswer: {
          "@type": "Answer",
          text: answer,
        },
      })),
    },
  ],
};

export default async function Home() {
  const retainedHubs = await readRetainedHubDirectory();
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-background selection:bg-white/10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(pageJsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <GlobalNavbar />
      
      <main>
        <HeroSection />
        <GlobalPulse />
        <NextBigThing />
        <LiveFeed />
        <RetainedHubDirectory hubs={retainedHubs} />
        <HomepageFaq />
      </main>

      <Footer />
    </div>
  );
}
