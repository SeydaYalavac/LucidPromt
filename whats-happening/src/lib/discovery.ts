import type { Trend } from "@/types/trends";

export const primaryNavigation = [
  { label: "World", href: "/world" },
  { label: "Trending", href: "/trending" },
  { label: "Explore", href: "/explore" },
  { label: "Map", href: "/map" },
  { label: "Pricing", href: "/pricing" },
] as const;

export type DiscoveryCategory = "All" | "AI" | "Science" | "Technology" | "Business" | "Sports" | "Entertainment";

export const discoveryCategories: DiscoveryCategory[] = [
  "All",
  "AI",
  "Science",
  "Technology",
  "Business",
  "Sports",
  "Entertainment",
];

export function isRouteActive(pathname: string, href: string) {
  return pathname === href || (href !== "/" && pathname.startsWith(`${href}/`));
}

export function matchesTrend(trend: Trend, query: string, category: string = "All") {
  const normalizedQuery = query.trim().toLocaleLowerCase();
  const categoryMatches = category === "All" || trend.category.toLocaleLowerCase() === category.toLocaleLowerCase();
  if (!categoryMatches) return false;
  if (!normalizedQuery) return true;
  return [trend.title, trend.summary, trend.category, trend.country?.name]
    .filter(Boolean)
    .some((value) => value!.toLocaleLowerCase().includes(normalizedQuery));
}

export function getNextVisibleCount(current: number, total: number, pageSize = 8) {
  return Math.min(current + pageSize, total);
}
