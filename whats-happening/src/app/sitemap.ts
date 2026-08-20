import type { MetadataRoute } from "next";

const baseUrl = "https://www.whatshappeninginai.com";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: baseUrl,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/how-it-works`,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/pricing`,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    ...["world", "trending", "explore", "map", "signin", "signup"].map((path) => ({
      url: `${baseUrl}/${path}`,
      changeFrequency: "daily" as const,
      priority: 0.7,
    })),
  ];
}
