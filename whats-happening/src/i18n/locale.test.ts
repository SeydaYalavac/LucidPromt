import { describe, expect, it } from "vitest";
import { interpolate, localeCategoryLabel, normalizeLocale } from "./locale";

describe("locale helpers", () => {
  it("defaults unsupported and missing locale values to English", () => {
    expect(normalizeLocale(null)).toBe("en");
    expect(normalizeLocale("de")).toBe("en");
    expect(normalizeLocale("tr")).toBe("tr");
  });

  it("interpolates translated values without removing unknown placeholders", () => {
    expect(interpolate("{count} trend, {missing}", { count: 4 })).toBe("4 trend, {missing}");
  });

  it("translates known categories and preserves unknown category names", () => {
    expect(localeCategoryLabel("Technology", "tr")).toBe("Teknoloji");
    expect(localeCategoryLabel("Artificial Intelligence", "tr")).toBe("Yapay zeka");
    expect(localeCategoryLabel(" Developer   Tools ", "tr")).toBe("Geliştirici araçları");
    expect(localeCategoryLabel("World", "tr")).toBe("Dünya");
    expect(localeCategoryLabel("Space", "tr")).toBe("Uzay");
    expect(localeCategoryLabel("Robotics", "tr")).toBe("Robotics");
    expect(localeCategoryLabel("Technology", "en")).toBe("Technology");
  });
});
