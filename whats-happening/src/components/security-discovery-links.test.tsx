import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { LocaleProvider } from "@/i18n/locale";
import { SecurityGuidePage } from "./SecurityGuidePage";
import { SecurityResearchHub } from "./SecurityResearchHub";

function renderWithLocale(component: React.ReactNode) {
  return renderToStaticMarkup(<LocaleProvider>{component}</LocaleProvider>);
}

describe("security research discovery links", () => {
  it("links the research hub to both evergreen guides", () => {
    const markup = renderWithLocale(<SecurityResearchHub />);

    expect(markup).toContain('href="/guides/ai-security-vulnerabilities"');
    expect(markup).toContain('href="/guides/hallucination-detection"');
    expect(markup).toContain("How to reduce AI security vulnerabilities");
    expect(markup).toContain("How to detect AI hallucinations");
  });

  it.each([
    ["ai-security-vulnerabilities", "/guides/hallucination-detection"],
    ["hallucination-detection", "/guides/ai-security-vulnerabilities"],
  ] as const)("links %s to the research hub and companion guide", (slug, companionPath) => {
    const markup = renderWithLocale(<SecurityGuidePage slug={slug} />);

    expect(markup).toContain('href="/security-research"');
    expect(markup).toContain(`href="${companionPath}"`);
    expect(markup).toContain('href="/category/artificial-intelligence"');
  });
});
