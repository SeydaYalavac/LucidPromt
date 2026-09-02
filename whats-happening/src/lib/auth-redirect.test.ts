import { describe, expect, it } from "vitest";
import { getSafeRedirect, getSignupHref } from "./auth-redirect";

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

describe("getSignupHref", () => {
  it("preserves the current trend as the post-signup destination", () => {
    expect(getSignupHref("/trend/roblox")).toBe(
      "/signup?next=%2Ftrend%2Froblox",
    );
  });

  it("falls back to the homepage for an unsafe destination", () => {
    expect(getSignupHref("https://evil.example/phish")).toBe(
      "/signup?next=%2F",
    );
  });
});
