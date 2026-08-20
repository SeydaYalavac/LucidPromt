import { describe, expect, it } from "vitest";
import { getNextVisibleCount, isRouteActive, matchesTrend } from "./discovery";
import type { Trend } from "@/types/trends";

const trend = {
  title: "Open source agents accelerate",
  summary: "New developer tools are gaining attention",
  category: "AI",
  country: { name: "Japan" },
} as Trend;

describe("discovery navigation", () => {
  it("marks nested routes active without matching siblings", () => {
    expect(isRouteActive("/trending/ai", "/trending")).toBe(true);
    expect(isRouteActive("/world", "/map")).toBe(false);
  });

  it("searches title, summary, category and country", () => {
    expect(matchesTrend(trend, "developer", "All")).toBe(true);
    expect(matchesTrend(trend, "japan", "AI")).toBe(true);
    expect(matchesTrend(trend, "agents", "Science")).toBe(false);
  });

  it("caps infinite reveal at the available result count", () => {
    expect(getNextVisibleCount(8, 22)).toBe(16);
    expect(getNextVisibleCount(16, 22)).toBe(22);
  });
});
