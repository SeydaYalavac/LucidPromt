import OpenAI from "openai";

const blockedPatterns = [
  /\b(?:doxx|swat(?:ting)?|kill yourself)\b/i,
  /\b(?:buy followers|free crypto|visit my channel)\b/i,
];

export interface ModerationResult {
  allowed: boolean;
  provider: "openai" | "local";
  labels: string[];
}

export async function moderateChatMessage(input: string): Promise<ModerationResult> {
  if (process.env.OPENAI_API_KEY) {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const result = await openai.moderations.create({
      model: "omni-moderation-latest",
      input,
    });
    const item = result.results[0];
    const labels = Object.entries(item.categories)
      .filter(([, flagged]) => flagged)
      .map(([label]) => label);
    return { allowed: !item.flagged, provider: "openai", labels };
  }

  const labels = blockedPatterns.filter((pattern) => pattern.test(input)).map(() => "local_blocklist");
  return { allowed: labels.length === 0, provider: "local", labels };
}
