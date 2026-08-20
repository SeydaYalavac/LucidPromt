import { HomeClient } from "@/components/home/HomeClient";

type HomePageProps = {
  searchParams?: Promise<{
    fork?: string;
  }>;
};

export default async function HomePage({ searchParams }: HomePageProps) {
  const resolvedSearchParams = await searchParams;

  return (
    <HomeClient
      key={resolvedSearchParams?.fork ?? "default"}
      forkSlug={resolvedSearchParams?.fork}
    />
  );
}
