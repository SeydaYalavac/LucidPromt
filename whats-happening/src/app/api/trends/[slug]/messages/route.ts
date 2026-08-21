import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { demoMessages, demoTrends } from "@/lib/demo-data";
import { isDemoMode } from "@/lib/env";
import { moderateChatMessage } from "@/lib/moderation";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { unavailable } from "@/lib/api";
import { isAiTrend, isEligibleEvidenceSignal, sanitizeSignal } from "@/lib/trend-content";

const messageSchema = z.object({ body: z.string().trim().min(1).max(1000) });

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
      .order("created_at", { ascending: true })
      .limit(100);
    if (error) throw error;
    return NextResponse.json({ messages: data, mode: "live" });
  } catch (error) {
    return unavailable(error);
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

    const moderation = await moderateChatMessage(parsed.data.body);
    if (!moderation.allowed) {
      return NextResponse.json({ error: "This message does not meet the community guidelines" }, { status: 422 });
    }

    const displayName = String(
      auth.user.user_metadata?.display_name || auth.user.user_metadata?.name || auth.user.email?.split("@")[0] || "developer",
    ).slice(0, 60);
    const { data, error } = await supabase
      .from("chat_messages")
      .insert({
        trend_id: trend.id,
        author_id: auth.user.id,
        author_display_name: displayName,
        body: parsed.data.body,
        moderation_provider: moderation.provider,
        moderation_labels: moderation.labels,
      })
      .select("*")
      .single();
    if (error) throw error;
    return NextResponse.json({ message: data }, { status: 201 });
  } catch (error) {
    return unavailable(error);
  }
}
