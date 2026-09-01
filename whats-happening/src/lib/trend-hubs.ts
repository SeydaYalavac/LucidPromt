import type { Trend } from "@/types/trends";

export const RETAINED_HUB_PAGE_SIZE = 30;
export const MIN_RETAINED_HUB_ARTICLES = 10;

export type RetainedHubDefinition = {
  slug: string;
  label: string;
  categories: readonly string[];
};

export const retainedCategoryHubs: readonly RetainedHubDefinition[] = [
  {
    slug: "artificial-intelligence",
    label: "Artificial Intelligence",
    categories: ["Artificial Intelligence", "Climate & Energy", "Health", "Space"],
  },
  { slug: "developer-tools", label: "Developer Tools", categories: ["Developer Tools"] },
  { slug: "sports", label: "Sports", categories: ["Sports"] },
  { slug: "world", label: "World", categories: ["World"] },
] as const;

export function retainedHubForSlug(slug: string) {
  return retainedCategoryHubs.find((hub) => hub.slug === slug) || null;
}

export function retainedHubForCategory(category: string) {
  const normalized = category.trim().toLocaleLowerCase("en-US");
  return retainedCategoryHubs.find((hub) =>
    hub.categories.some((candidate) => candidate.toLocaleLowerCase("en-US") === normalized),
  ) || retainedCategoryHubs[0];
}

export function retainedHubPath(hub: RetainedHubDefinition, page = 1) {
  const path = `/category/${hub.slug}`;
  return page > 1 ? `${path}?page=${page}` : path;
}

export function retainedHubPathForTrend(trend: Pick<Trend, "category">) {
  return retainedHubPath(retainedHubForCategory(trend.category));
}

export function retainedHubPage(value: string | string[] | undefined) {
  const raw = Array.isArray(value) ? value[0] : value;
  const parsed = Number(raw);
  if (!Number.isInteger(parsed) || parsed < 1) return 1;
  return Math.min(parsed, 10_000);
}

export function retainedHubPageCount(total: number) {
  return Math.max(1, Math.ceil(Math.max(0, total) / RETAINED_HUB_PAGE_SIZE));
}

export function retainedHubRanges(total: number) {
  return Array.from({ length: retainedHubPageCount(total) }, (_, index) => {
    const page = index + 1;
    const first = index * RETAINED_HUB_PAGE_SIZE + 1;
    const last = Math.min(total, page * RETAINED_HUB_PAGE_SIZE);
    return { page, first, last };
  });
}
