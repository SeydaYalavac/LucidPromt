import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AlternativePage } from "@/components/AlternativePage";
import {
  alternativePages,
  getAlternativePage,
} from "@/content/alternative-pages";
import { SITE_URL } from "@/lib/site";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export const dynamicParams = false;

export function generateStaticParams() {
  return alternativePages.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = getAlternativePage(slug);

  if (!data) return {};

  const canonical = `${SITE_URL}/alternatives/${data.slug}`;

  return {
    title: data.title,
    description: data.description,
    alternates: { canonical },
    openGraph: {
      title: data.title,
      description: data.description,
      url: canonical,
      type: "article",
    },
  };
}

export default async function AlternativeRoute({ params }: PageProps) {
  const { slug } = await params;
  const data = getAlternativePage(slug);

  if (!data) notFound();

  return <AlternativePage data={data} />;
}
