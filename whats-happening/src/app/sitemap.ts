import type { MetadataRoute } from "next";
import { SITE_URL } from "../lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: SITE_URL,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${SITE_URL}/about`,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/how-it-works`,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/pricing`,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/security-research`,
      changeFrequency: "daily",
      priority: 0.8,
    },
    ...[
      "compare/exploding-topics-vs-google-trends",
      "compare/exploding-topics-vs-glimpse",
      "alternatives/google-trends",
      "alternatives/exploding-topics",
      "alternatives/glimpse",
      "alternatives/trends-co",
    ].map((path) => ({
      url: `${SITE_URL}/${path}`,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...["privacy", "terms"].map((path) => ({
      url: `${SITE_URL}/${path}`,
      changeFrequency: "monthly" as const,
      priority: 0.4,
    })),
    ...["world", "trending", "explore", "map"].map((path) => ({
      url: `${SITE_URL}/${path}`,
      changeFrequency: "daily" as const,
      priority: 0.7,
    })),
  ];
}
