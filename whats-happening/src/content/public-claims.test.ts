import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { homepageFaqs } from "./homepage-faq";

const sourceFiles = [
  "src/app/layout.tsx",
  "src/app/trending/page.tsx",
  "src/app/explore/page.tsx",
  "src/app/pricing/page.tsx",
  "src/app/how-it-works/page.tsx",
  "src/components/HeroSection.tsx",
  "src/components/GlobalPulse.tsx",
  "src/components/LiveFeed.tsx",
  "src/components/WorldView.tsx",
  "src/components/TrendingView.tsx",
  "src/components/ExploreView.tsx",
  "src/components/Footer.tsx",
  "src/components/AuthPanel.tsx",
  "src/components/AuthScreen.tsx",
  "src/lib/auth-copy.ts",
  "src/components/SearchOverlay.tsx",
  "src/components/TrendDetail.tsx",
  "src/components/TrendCollection.tsx",
  "src/components/TrendStates.tsx",
  "src/i18n/locale.tsx",
  "src/app/signup/page.tsx",
  "src/app/signin/page.tsx",
  "src/app/auth/page.tsx",
  "src/app/country/[slug]/page.tsx",
];

const publicCopy = sourceFiles
  .map((file) => readFileSync(resolve(process.cwd(), file), "utf8"))
  .join("\n");

describe("public capability claims", () => {
  it("does not restore unsupported live, prediction, or origin promises", () => {
    for (const unsupportedClaim of [
      "REAL-TIME TREND",
      "find where each trend started",
      "Live World",
      "updating now",
      "shaping the world right now",
      "Discover the world in real time",
      "live attention",
      "The largest current story",
      "Trending now",
      "Browse live trend evidence",
      "Read the live global feed",
      "Current full access",
      "See the live pulse",
      "Return to the live pulse",
      "How is an origin assigned?",
      "What is a predicted breakout topic?",
      "Search the live signal map",
      "Where it started?",
      "One account for every breaking signal.",
      "Live developer identity",
      "Get started free",
      '|| "Worldwide"',
      "Right Now",
      "Secure sessions powered by Supabase",
    ]) {
      expect(publicCopy).not.toContain(unsupportedClaim);
    }
  });

  it("keeps the evidence limits and current offer explicit", () => {
    expect(publicCopy).toContain("SOURCE-LINKED TREND");
    expect(publicCopy).toContain("earliest available country-tagged evidence");
    expect(publicCopy).toContain("This is ranking logic, not a forecast of future popularity.");
    expect(publicCopy).toContain("Still $0.");
    expect(publicCopy).toContain("Account access unavailable");
    expect(publicCopy).toContain("mailto:whatshappeninginai@mail.tin.computer");

    const faqCopy = homepageFaqs.map(({ question, answer }) => `${question} ${answer}`).join(" ");
    expect(faqCopy).toContain("earliest country-tagged evidence");
    expect(faqCopy).toContain("does not predict future popularity");
  });
});
