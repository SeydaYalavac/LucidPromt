import { describe, expect, it } from "vitest";
import sitemap from "../app/sitemap";
import {
  privacyNotice,
  supportAddress,
  termsNotice,
} from "./legal-notices";

function noticeText(notice: typeof privacyNotice) {
  return [
    notice.title,
    notice.description,
    notice.currentPractice,
    ...notice.atAGlance,
    ...notice.sections.flatMap((section) => [
      section.title,
      ...section.paragraphs,
      ...(section.bullets || []),
    ]),
  ].join("\n");
}

describe("legal notices", () => {
  it("publishes current-practice privacy and terms notices with support routing", () => {
    const privacy = noticeText(privacyNotice);
    const terms = noticeText(termsNotice);

    expect(privacy).toContain("current product behavior");
    expect(privacy).toContain("There is no self-serve account deletion control");
    expect(privacy).toContain(supportAddress);
    expect(terms).toContain("describe the product as it works today");
    expect(terms).toContain("There is no paid plan, checkout, trial clock, billing path");
    expect(terms).toContain(supportAddress);
  });

  it("lists both notices in the production sitemap", () => {
    const urls = sitemap().map((entry) => entry.url);

    expect(urls).toContain("https://www.whatshappeninginai.com/privacy");
    expect(urls).toContain("https://www.whatshappeninginai.com/terms");
  });
});
