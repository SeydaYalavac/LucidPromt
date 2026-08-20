import { describe, expect, it } from "vitest";
import { getSafeRedirect } from "./auth-redirect";

describe("getSafeRedirect", () => {
  it("keeps local paths, queries, and fragments", () => {
    expect(getSafeRedirect("/trend/new-model?tab=chat#latest")).toBe(
      "/trend/new-model?tab=chat#latest",
    );
  });

  it.each([
    "https://evil.example/phish",
    "//evil.example/phish",
    "/\\evil.example/phish",
    "javascript:alert(1)",
  ])("rejects unsafe redirect %s", (value) => {
    expect(getSafeRedirect(value)).toBe("/");
  });

  it("uses a caller-provided fallback", () => {
    expect(getSafeRedirect(null, "/auth")).toBe("/auth");
  });
});

