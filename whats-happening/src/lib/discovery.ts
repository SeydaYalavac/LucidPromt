import type { Trend } from "@/types/trends";

export const primaryNavigation = [
  { label: "World", href: "/world" },
  { label: "Trending", href: "/trending" },
  { label: "Explore", href: "/explore" },
  { label: "Map", href: "/map" },
  { label: "AI Security", href: "/security-research" },
  { label: "Pricing", href: "/pricing" },
] as const;

const preferredCategoryOrder = [
  "Artificial Intelligence",
  "Developer Tools",
  "Technology",
  "Science",
  "Business",
  "Sports",
  "Entertainment",
  "World",
  "Space",
] as const;

function normalizeCategory(value: string) {
  return value.trim().replace(/\s+/g, " ").toLowerCase();
}

const categoryAliases = new Map([
  ["ai", "Artificial Intelligence"],
  ["artificial intelligence", "Artificial Intelligence"],
  ["yapay zeka", "Artificial Intelligence"],
  ["developer tools", "Developer Tools"],
  ["geliştirici araçları", "Developer Tools"],
  ["sports", "Sports"],
  ["spor", "Sports"],
  ["world", "World"],
  ["dünya", "World"],
  ["space", "Space"],
  ["uzay", "Space"],
]);

export function canonicalCategoryQuery(value: string) {
  let decoded = value;
  try {
    decoded = decodeURIComponent(value);
  } catch {
    // URLSearchParams normally decodes this before it reaches us. Keep a malformed
    // direct value harmless instead of turning a filter request into a server error.
  }
  const normalized = normalizeCategory(decoded.replace(/-/g, " "));
  return categoryAliases.get(normalized) || normalized;
}

export function visibleDiscoveryCategories(trends: Array<Pick<Trend, "category">>) {
  const currentCategories = new Map<string, string>();
  for (const trend of trends) {
    const displayCategory = trend.category.trim().replace(/\s+/g, " ");
    if (!displayCategory) continue;
    const normalized = normalizeCategory(displayCategory);
    if (!currentCategories.has(normalized)) currentCategories.set(normalized, displayCategory);
  }

  const preferredOrder = new Map(preferredCategoryOrder.map((category, index) => [normalizeCategory(category), index]));
  const categories = [...currentCategories.entries()].sort(([leftKey, leftLabel], [rightKey, rightLabel]) => {
    const leftIndex = preferredOrder.get(leftKey) ?? Number.MAX_SAFE_INTEGER;
    const rightIndex = preferredOrder.get(rightKey) ?? Number.MAX_SAFE_INTEGER;
    return leftIndex - rightIndex || leftLabel.localeCompare(rightLabel, "en");
  });

  return ["All", ...categories.map(([, label]) => label)];
}

export function isRouteActive(pathname: string, href: string) {
  return pathname === href || (href !== "/" && pathname.startsWith(`${href}/`));
}

export function matchesTrend(trend: Trend, query: string, category: string = "All", localizedCategory = trend.category) {
  const normalizedQuery = query.trim().toLocaleLowerCase();
  const categoryMatches = category === "All" || normalizeCategory(trend.category) === normalizeCategory(canonicalCategoryQuery(category));
  if (!categoryMatches) return false;
  if (!normalizedQuery) return true;
  return [trend.title, trend.summary, trend.category, localizedCategory, trend.country?.name]
    .filter(Boolean)
    .some((value) => value!.toLocaleLowerCase().includes(normalizedQuery));
}

export function getNextVisibleCount(current: number, total: number, pageSize = 8) {
  return Math.min(current + pageSize, total);
}
