import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { demoMessages, demoTrends } from "@/lib/demo-data";
import { isDemoMode } from "@/lib/env";
import { moderateChatMessage } from "@/lib/moderation";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { dataReadFailure } from "@/lib/api";
import { isAiTrend, isEligibleEvidenceSignal, sanitizeSignal } from "@/lib/trend-content";
import {
  isChatRateLimitError,
  isMissingReplyColumnError,
  labelsWithReplyFallback,
  normalizeChatMessage,
} from "@/lib/chat-messages";

const messageSchema = z.object({
  body: z.string().trim().min(1).max(1000),
  reply_to_id: z.string().uuid().nullable().optional(),
});

async function trendHasAiEvidence(supabase: ReturnType<typeof getSupabaseAdmin>, trendId: string) {
  const { data, error } = await supabase
    .from("signals")
    .select("source,external_id,title,excerpt,source_url")
    .eq("trend_id", trendId)
    .order("observed_at", { ascending: false })
    .limit(100);
  if (error) throw error;
  return (data || []).map(sanitizeSignal).some(isEligibleEvidenceSignal);
}

export async function GET(_request: Request, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params;
  if (isDemoMode()) {
    const trend = demoTrends.find((item) => item.slug === slug && isAiTrend(item));
    if (!trend) return NextResponse.json({ error: "Trend not found" }, { status: 404 });
    return NextResponse.json({ messages: demoMessages.filter((item) => item.trend_id === trend.id), mode: "demo" });
  }
  try {
    const supabase = getSupabaseAdmin();
    const { data: trend, error: trendError } = await supabase.from("trends").select("id").eq("slug", slug).single();
    if (trendError?.code === "PGRST116") return NextResponse.json({ error: "Trend not found" }, { status: 404 });
    if (trendError) throw trendError;
    if (!await trendHasAiEvidence(supabase, trend.id)) return NextResponse.json({ error: "Trend not found" }, { status: 404 });
    const { data, error } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("trend_id", trend.id)
      .eq("status", "visible")
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) throw error;
    return NextResponse.json({
      messages: (data || []).reverse().map((message) => normalizeChatMessage(message)),
      mode: "live",
    });
  } catch (error) {
    return dataReadFailure(error);
  }
}

export async function POST(request: NextRequest, context: { params: Promise<{ slug: string }> }) {
  if (isDemoMode()) {
    return NextResponse.json({ error: "Chat writes are disabled for labeled demo data" }, { status: 409 });
  }

  const parsed = messageSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Message must be 1–1000 characters" }, { status: 400 });

  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) return NextResponse.json({ error: "Sign in to write in developer chat" }, { status: 401 });

  try {
    const supabase = getSupabaseAdmin();
    const { data: auth, error: authError } = await supabase.auth.getUser(token);
    if (authError || !auth.user) return NextResponse.json({ error: "Your session has expired" }, { status: 401 });

    const { slug } = await context.params;
    const { data: trend, error: trendError } = await supabase.from("trends").select("id").eq("slug", slug).single();
    if (trendError?.code === "PGRST116") return NextResponse.json({ error: "Trend not found" }, { status: 404 });
    if (trendError) throw trendError;
    if (!await trendHasAiEvidence(supabase, trend.id)) return NextResponse.json({ error: "Trend not found" }, { status: 404 });

    const replyToId = parsed.data.reply_to_id || null;
    if (replyToId) {
      const { data: replyTarget, error: replyError } = await supabase
        .from("chat_messages")
        .select("id")
        .eq("id", replyToId)
        .eq("trend_id", trend.id)
        .eq("status", "visible")
        .maybeSingle();
      if (replyError) throw replyError;
      if (!replyTarget) {
        return NextResponse.json(
          { error: "The message you replied to is no longer available", code: "REPLY_TARGET_UNAVAILABLE" },
          { status: 409 },
        );
      }
    }

    const moderation = await moderateChatMessage(parsed.data.body);
    if (!moderation.allowed) {
      return NextResponse.json({ error: "This message does not meet the community guidelines" }, { status: 422 });
    }

    const displayName = String(
      auth.user.user_metadata?.display_name || auth.user.user_metadata?.name || auth.user.email?.split("@")[0] || "developer",
    ).slice(0, 60);
    const insertPayload = {
      trend_id: trend.id,
      author_id: auth.user.id,
      author_display_name: displayName,
      body: parsed.data.body,
      moderation_provider: moderation.provider,
      moderation_labels: moderation.labels,
    };
    const insertWithReply = replyToId
      ? { ...insertPayload, reply_to_id: replyToId }
      : insertPayload;
    let { data, error } = await supabase
      .from("chat_messages")
      .insert(insertWithReply)
      .select("*")
      .single();

    // Production schema migrations can lag an app deploy. Keep replies working
    // without shortening the 1,000-character body, then prefer the real column
    // as soon as the migration is available.
    if (error && isMissingReplyColumnError(error)) {
      const fallback = await supabase
        .from("chat_messages")
        .insert({
          trend_id: trend.id,
          author_id: auth.user.id,
          author_display_name: displayName,
          body: parsed.data.body,
          moderation_provider: moderation.provider,
          moderation_labels: labelsWithReplyFallback(moderation.labels, replyToId),
        })
        .select("*")
        .single();
      data = fallback.data;
      error = fallback.error;
    }
    if (error) throw error;
    return NextResponse.json({ message: normalizeChatMessage(data) }, { status: 201 });
  } catch (error) {
    if (isChatRateLimitError(error)) {
      return NextResponse.json(
        { error: "You have reached the posting limit. Try again in one minute.", code: "CHAT_RATE_LIMIT" },
        { status: 429, headers: { "Retry-After": "60" } },
      );
    }
    return dataReadFailure(error);
  }
}
