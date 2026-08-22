import { describe, expect, it } from "vitest";
import { canonicalCategoryQuery, getNextVisibleCount, isRouteActive, matchesTrend, visibleDiscoveryCategories } from "./discovery";
import type { Trend } from "@/types/trends";

const trend = {
  title: "Open source agents accelerate",
  summary: "New developer tools are gaining attention",
  category: "Artificial Intelligence",
  country: { name: "Japan" },
} as Trend;

describe("discovery navigation", () => {
  it("marks nested routes active without matching siblings", () => {
    expect(isRouteActive("/trending/ai", "/trending")).toBe(true);
    expect(isRouteActive("/world", "/map")).toBe(false);
  });

  it("searches title, summary, category and country", () => {
    expect(matchesTrend(trend, "developer", "All")).toBe(true);
    expect(matchesTrend(trend, "japan", "Artificial Intelligence")).toBe(true);
    expect(matchesTrend(trend, "yapay zeka", "Artificial Intelligence", "Yapay zeka")).toBe(true);
    expect(matchesTrend(trend, "agents", "Science")).toBe(false);
  });

  it("caps infinite reveal at the available result count", () => {
    expect(getNextVisibleCount(8, 22)).toBe(16);
    expect(getNextVisibleCount(16, 22)).toBe(22);
  });

  it("keeps existing English and Turkish category links compatible", () => {
    expect(canonicalCategoryQuery("ai")).toBe("Artificial Intelligence");
    expect(canonicalCategoryQuery("artificial-intelligence")).toBe("Artificial Intelligence");
    expect(canonicalCategoryQuery("yapay-zeka")).toBe("Artificial Intelligence");
    expect(canonicalCategoryQuery("geli%C5%9Ftirici-ara%C3%A7lar%C4%B1")).toBe("Developer Tools");
  });

  it("shows only categories backed by the current trend inventory", () => {
    const categories = visibleDiscoveryCategories([
      trend,
      { ...trend, category: "Sports" },
      { ...trend, category: "Developer Tools" },
      { ...trend, category: "  sports  " },
      { ...trend, category: "" },
    ]);

    expect(categories).toEqual(["All", "Artificial Intelligence", "Developer Tools", "Sports"]);
    expect(categories).not.toContain("Technology");
    expect(categories).not.toContain("Science");
  });

  it("keeps unrecognized live categories available after the preferred categories", () => {
    expect(visibleDiscoveryCategories([{ ...trend, category: "Robotics" }, { ...trend, category: "Space" }]))
      .toEqual(["All", "Space", "Robotics"]);
  });
});
