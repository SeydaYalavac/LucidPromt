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
});
