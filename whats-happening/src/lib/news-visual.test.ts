import { describe, expect, it } from "vitest";
import { sanitizeNewsVisual } from "./news-visual";

const licensedVisual = {
  image_url: "https://upload.wikimedia.org/example.jpg",
  title: "AI research lab",
  alt_text: "A researcher working beside a computer.",
  source_name: "Wikimedia Commons",
  source_url: "https://commons.wikimedia.org/wiki/File:Example.jpg",
  creator_name: "Example Photographer",
  license_name: "CC BY 4.0",
  license_url: "https://creativecommons.org/licenses/by/4.0/",
  rights_basis: "open_license",
  usage_notes: "Credit the creator and link the license.",
  width: 1600,
  height: 900,
};

describe("sanitizeNewsVisual", () => {
  it("accepts a complete open-license record", () => {
    expect(sanitizeNewsVisual(licensedVisual)).toEqual(licensedVisual);
  });

  it("rejects a public image without affirmative rights metadata", () => {
    expect(sanitizeNewsVisual({ image_url: licensedVisual.image_url, alt_text: licensedVisual.alt_text })).toBeNull();
  });

  it("rejects an unrecognized open-license URL", () => {
    expect(sanitizeNewsVisual({ ...licensedVisual, license_url: "https://publisher.example/terms" })).toBeNull();
  });

  it("rejects insecure image and attribution URLs", () => {
    expect(sanitizeNewsVisual({ ...licensedVisual, image_url: "http://upload.wikimedia.org/example.jpg" })).toBeNull();
    expect(sanitizeNewsVisual({ ...licensedVisual, source_url: "javascript:alert(1)" })).toBeNull();
  });

  it("accepts a documented permissioned record", () => {
    expect(sanitizeNewsVisual({
      ...licensedVisual,
      rights_basis: "permissioned",
      license_name: "Used with permission",
      license_url: "https://publisher.example/media-terms",
    })?.rights_basis).toBe("permissioned");
  });
});
