import { describe, expect, it } from "vitest";
import type { Trend } from "@/types/trends";
import {
  evergreenGuideEnglishWordCount,
  evergreenGuideSlugsForText,
  evergreenGuides,
  evergreenGuideSources,
  getEvergreenGuideAudit,
  liveTrendsForEvergreenGuide,
} from "./evergreen-guides";

describe("evergreen evidence guides", () => {
  it("publishes three complete bilingual long-form guides", () => {
    expect(Object.keys(evergreenGuides)).toEqual(["ai-agents", "ai-chips-infrastructure", "ai-governance"]);
    for (const guide of Object.values(evergreenGuides)) {
      expect(guide.sections).toHaveLength(6);
      expect(evergreenGuideEnglishWordCount(guide)).toBeGreaterThanOrEqual(1_200);
      expect(evergreenGuideEnglishWordCount(guide)).toBeLessThanOrEqual(1_500);
      expect(guide.title.tr).not.toBe(guide.title.en);
      for (const section of guide.sections) {
        expect(section.title.tr.length).toBeGreaterThan(10);
        expect(section.summary.tr.length).toBeGreaterThan(40);
        expect(section.sourceIds.length).toBeGreaterThan(0);
      }
    }
  });

  it("uses only explicit official or primary evidence records", () => {
    const allowedHosts = /(^|\.)(anthropic\.com|nist\.gov|modelcontextprotocol\.io|owasp\.org|cloud\.google\.com|nvidia\.com|energy\.gov|bis\.gov|europa\.eu|oecd\.ai)$/;
    for (const source of evergreenGuideSources) {
      const url = new URL(source.url);
      expect(url.protocol).toBe("https:");
      expect(url.hostname).toMatch(allowedHosts);
    }
  });

  it("publishes only fully verified guide records", () => {
    for (const guide of Object.values(evergreenGuides)) {
      const audit = getEvergreenGuideAudit(guide);
      expect(audit.complete).toBe(true);
      expect(audit.reviewRequired).toBe(false);
      expect(audit.sourceCount).toBe(guide.sourceIds.length);
    }
  });

  it("matches exact topic language and rejects generic AI copy", () => {
    expect(evergreenGuideSlugsForText("NVIDIA presents a new AI chip system")).toEqual(["ai-chips-infrastructure"]);
    expect(evergreenGuideSlugsForText("The EU AI Act enters a new phase")).toEqual(["ai-governance"]);
    expect(evergreenGuideSlugsForText("A coding agent uses an MCP server")).toEqual(["ai-agents"]);
    expect(evergreenGuideSlugsForText("Upcoming changes to GitHub Copilot policies and billing")).toEqual([]);
    expect(evergreenGuideSlugsForText("NVIDIA insists it can keep printing money")).toEqual([]);
    expect(evergreenGuideSlugsForText("A company published an AI update")).toEqual([]);
  });

  it("links only trends with an exact title match", () => {
    const trends = [
      { slug: "nvidia-system", title: "NVIDIA presents a new AI infrastructure system", category: "Artificial Intelligence", last_seen_at: "2026-08-29T00:00:00Z" },
      { slug: "general-ai", title: "A company publishes an AI update", category: "Artificial Intelligence", last_seen_at: "2026-08-29T00:00:00Z" },
    ] as Trend[];
    expect(liveTrendsForEvergreenGuide(trends, "ai-chips-infrastructure").map((trend) => trend.slug)).toEqual(["nvidia-system"]);
  });
});
