type TrendMetadataOverride = {
  title: string;
  description: string;
};

const TREND_METADATA_OVERRIDES: Readonly<Record<string, TrendMetadataOverride>> = {
  "squall01337-mixamo-llm-mocap": {
    title: "Mixamo LLM Mocap by squall01337: Video-to-Animation",
    description: "Mixamo LLM Mocap turns video into Mixamo-rig animation with GVHMR, spec-driven retargeting, and Blender MCP. See the GitHub evidence and limits.",
  },
  "nateherkai-scroll-craft": {
    title: "Scroll Craft by nateherkai: Claude Code Skill for Websites",
    description: "Scroll Craft is a JavaScript Claude Code skill for building scroll-driven websites. See its GitHub signal, source evidence, and current limits.",
  },
};

export function trendMetadataOverride(slug: string) {
  return TREND_METADATA_OVERRIDES[slug] ?? null;
}
