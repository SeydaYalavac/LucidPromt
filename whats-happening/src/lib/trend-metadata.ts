import { sourceLabel } from "@/lib/trend-content";
import type { Signal, Trend } from "@/types/trends";

type TrendMetadata = {
  title: string;
  description: string;
};

type TrendMetadataInput = {
  trend: Pick<Trend, "slug" | "title" | "summary_source">;
  signals: Array<Pick<Signal, "source" | "source_url" | "title">>;
};

const TREND_METADATA_OVERRIDES: Readonly<Record<string, TrendMetadata>> = {
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

function cleanMetadataText(value: string) {
  return value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function boundedDescription(value: string, maxLength = 160) {
  const clean = cleanMetadataText(value);
  if (clean.length <= maxLength) return clean;
  const contentLength = maxLength - 3;
  const clipped = clean.slice(0, contentLength + 1);
  const boundary = clipped.lastIndexOf(" ");
  return `${clipped.slice(0, boundary > contentLength * 0.7 ? boundary : contentLength).replace(/[,:;\s]+$/, "")}...`;
}

export function buildTrendSearchMetadata({ trend, signals }: TrendMetadataInput): TrendMetadata {
  const override = trendMetadataOverride(trend.slug);
  if (override) return override;

  const topic = cleanMetadataText(trend.title);
  const summarySource = trend.summary_source;
  const matchedSignal = summarySource
    ? signals.find((signal) => signal.source === summarySource.source && signal.source_url === summarySource.source_url)
    : signals[0];
  const provider = summarySource?.source || matchedSignal?.source;
  const providerLabel = provider ? sourceLabel(provider) : "public-source";
  const sourceTitle = cleanMetadataText(summarySource?.source_title || matchedSignal?.title || topic);
  const sourceDetail = sourceTitle.toLocaleLowerCase() === topic.toLocaleLowerCase()
    ? ""
    : ` Signal: ${sourceTitle}.`;

  return {
    title: `${topic} | AI Trend Evidence`,
    description: boundedDescription(
      `Source-backed ${providerLabel} evidence for ${topic}.${sourceDetail} Read the context, timing, and evidence limits.`,
    ),
  };
}
