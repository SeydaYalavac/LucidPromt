import OpenAI from "openai";
import type { Signal } from "@/types/trends";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

const whySchema = {
  type: "object",
  properties: {
    what_happened: { type: "string" },
    why_now: { type: "string" },
    where_started: { type: "string" },
  },
  required: ["what_happened", "why_now", "where_started"],
  additionalProperties: false,
} as const;

export async function generateWhyLayer(trendId: string, title: string, signals: Signal[]) {
  const supabase = getSupabaseAdmin();
  const { data: claimed, error: claimError } = await supabase.rpc("claim_why_generation", {
    p_trend_id: trendId,
  });
  if (claimError) throw claimError;
  if (!claimed) return { skipped: true };

  const model = process.env.OPENAI_WHY_MODEL || "gpt-5-mini";
  try {
    if (!process.env.OPENAI_API_KEY) {
      await supabase.from("trends").update({ why_status: "skipped" }).eq("id", trendId);
      return { skipped: true };
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const evidence = signals.slice(0, 12).map((signal) => ({
      source: signal.source,
      title: signal.title,
      excerpt: signal.excerpt?.slice(0, 500),
      published_at: signal.published_at,
    }));
    const response = await openai.responses.create({
      model,
      instructions:
        "You are an evidence-constrained trend analyst. Use only the supplied signals. Write concise factual English. The where_started field must describe only the earliest dated source observation in the supplied evidence and must not claim geographic or causal origin. If no earliest observation can be established, say so. Never invent people, dates, causal claims, or quotes.",
      input: JSON.stringify({ trend: title, signals: evidence }),
      text: {
        format: {
          type: "json_schema",
          name: "why_layer",
          strict: true,
          schema: whySchema,
        },
      },
    });
    const story = JSON.parse(response.output_text) as {
      what_happened: string;
      why_now: string;
      where_started: string;
    };

    const { error } = await supabase
      .from("trends")
      .update({
        ...story,
        why_status: "complete",
        why_generated_at: new Date().toISOString(),
        why_model: model,
      })
      .eq("id", trendId);
    if (error) throw error;
    return { skipped: false };
  } catch (error) {
    await supabase.from("trends").update({ why_status: "failed" }).eq("id", trendId);
    throw error;
  }
}
