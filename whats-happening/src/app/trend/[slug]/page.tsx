import type { Metadata } from "next";
import { GlobalNavbar } from "@/components/GlobalNavbar";
import { Footer } from "@/components/Footer";
import { TrendDetail } from "@/components/TrendDetail";

function titleFromSlug(slug: string) {
  return slug
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ") || "Trend";
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const topic = titleFromSlug(slug);
  const description = `Read the source-linked AI trend article for ${topic}, including why attention moved, practical uses, validation limits, and primary evidence.`;

  return {
    title: `${topic} trend article | What's Happening`,
    description,
    alternates: { canonical: `/trend/${slug}` },
    openGraph: {
      title: `${topic} trend article`,
      description,
      type: "article",
      url: `/trend/${slug}`,
    },
  };
}

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
