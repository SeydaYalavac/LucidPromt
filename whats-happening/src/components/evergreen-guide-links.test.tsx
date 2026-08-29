import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { LocaleProvider } from "@/i18n/locale";
import { EvergreenGuidePage } from "./EvergreenGuidePage";

describe("evergreen guide discovery links", () => {
  it.each(["ai-agents", "ai-chips-infrastructure", "ai-governance"] as const)("publishes verified links for %s", (slug) => {
    const markup = renderToStaticMarkup(<LocaleProvider><EvergreenGuidePage slug={slug} liveTrends={[{ slug: "exact-live-trend", title: "AI agents enter production", category: "Artificial Intelligence", lastSeenAt: "2026-08-29T00:00:00Z" }]} /></LocaleProvider>);
    expect(markup).toContain('href="/category/artificial-intelligence"');
    expect(markup).toContain('href="/trend/exact-live-trend"');
    expect(markup).toContain("Evidence checked");
    expect(markup).not.toContain("guide is unavailable");
  });

  it.each([
    ["ai-agents", true],
    ["ai-chips-infrastructure", false],
    ["ai-governance", true],
  ] as const)("adds only relevant contextual security links to %s", (slug, linksHallucinationGuide) => {
    const markup = renderToStaticMarkup(<LocaleProvider><EvergreenGuidePage slug={slug} liveTrends={[]} /></LocaleProvider>);

    expect(markup).toContain('href="/guides/ai-security-vulnerabilities"');
    expect(markup).toContain("how to reduce AI security vulnerabilities");
    expect(markup.includes('href="/guides/hallucination-detection"')).toBe(linksHallucinationGuide);
    expect(markup.includes("how to detect AI hallucinations")).toBe(linksHallucinationGuide);
  });
});
