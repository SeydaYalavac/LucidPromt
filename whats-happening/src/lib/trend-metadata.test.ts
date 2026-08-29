import { describe, expect, it } from "vitest";
import { trendMetadataOverride } from "./trend-metadata";

describe("trend metadata overrides", () => {
  it("uses query-aligned metadata for the two first-page trend routes", () => {
    expect(trendMetadataOverride("squall01337-mixamo-llm-mocap")).toEqual({
      title: "Mixamo LLM Mocap by squall01337: Video-to-Animation",
      description: "Mixamo LLM Mocap turns video into Mixamo-rig animation with GVHMR, spec-driven retargeting, and Blender MCP. See the GitHub evidence and limits.",
    });
    expect(trendMetadataOverride("nateherkai-scroll-craft")).toEqual({
      title: "Scroll Craft by nateherkai: Claude Code Skill for Websites",
      description: "Scroll Craft is a JavaScript Claude Code skill for building scroll-driven websites. See its GitHub signal, source evidence, and current limits.",
    });
  });

  it("leaves every other trend on the existing generated metadata", () => {
    expect(trendMetadataOverride("another-live-trend")).toBeNull();
  });
});
