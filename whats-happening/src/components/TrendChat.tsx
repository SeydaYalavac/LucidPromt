"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Send, ShieldCheck, User, Code2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useMessages } from "@/hooks/useTrendData";
import { useAuthSession } from "@/hooks/useAuthSession";
import type { ChatMessage } from "@/types/trends";
import { captureProductEvent } from "@/lib/analytics";

export function TrendChat({ trendId, slug, mode }: { trendId: string; slug: string; mode: "live" | "demo" }) {
  const { data, mutate } = useMessages(slug);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { supabase, session, isConfigured } = useAuthSession();
  const messages = data?.messages || [];

  useEffect(() => {
    if (!supabase || mode !== "live") return;
    const channel = supabase
      .channel(`trend-chat:${trendId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "chat_messages", filter: `trend_id=eq.${trendId}` },
        (payload) => {
          const incoming = payload.new as ChatMessage;
          if (incoming.status !== "visible") return;
          void mutate((current) => {
            if (!current || current.messages.some((item) => item.id === incoming.id)) return current;
            return { ...current, messages: [...current.messages, incoming] };
          }, false);
        },
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [mode, mutate, supabase, trendId]);

  async function sendMessage(event: React.FormEvent) {
    event.preventDefault();
    const body = input.trim();
    if (!body || !session) return;
    setSending(true);
    setError(null);
    const response = await fetch(`/api/trends/${slug}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
      body: JSON.stringify({ body }),
    });
    const payload = await response.json();
    if (!response.ok) {
      setError(payload.error || "Message could not be sent");
      captureProductEvent("developer_chat_message_failed", { trend_slug: slug, status_code: response.status });
    } else {
      setInput("");
      captureProductEvent("developer_chat_message_sent", { trend_slug: slug });
      await mutate((current) => {
        if (!current || current.messages.some((item) => item.id === payload.message.id)) return current;
        return { ...current, messages: [...current.messages, payload.message] };
      }, false);
    }
    setSending(false);
  }

  return (
    <section className="mt-16 overflow-hidden rounded-3xl border border-white/10 bg-[#0B0B0D]">
      <div className="flex items-center justify-between border-b border-white/5 bg-[#111114] px-6 py-5">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-bold text-white">
            Developer terminal
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-50" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>
          </h2>
          <p className="mt-1 flex items-center gap-1.5 text-xs text-[#8B8B93]">
            <ShieldCheck size={14} className="text-emerald-400" /> Server moderated · 8 messages per minute
          </p>
        </div>
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#8B8B93]">Realtime room</span>
      </div>

      <div className="h-[330px] space-y-5 overflow-y-auto p-6" aria-live="polite">
        <AnimatePresence initial={false}>
          {messages.map((message) => (
            <motion.div key={message.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex gap-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/5 text-[#8B8B93]">
                <User size={15} />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 font-mono text-[11px]">
                  <span className="font-bold text-[#06b6d4]">{message.author_display_name}</span>
                  <time className="text-[#5f5f66]">{new Date(message.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</time>
                </div>
                <p className="mt-1 break-words text-sm leading-relaxed text-white/90">{message.body}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {!messages.length && (
          <div className="flex h-full items-center justify-center text-center text-sm text-[#8B8B93]">
            <p>Quiet room. Start the first technical thread about this signal.</p>
          </div>
        )}
      </div>

      <div className="border-t border-white/5 bg-[#111114] p-4">
        {mode === "demo" ? (
          <p className="rounded-xl border border-amber-300/20 bg-amber-300/5 px-4 py-3 text-sm text-amber-100/80">
            Chat writes stay off in demo mode. Connect Supabase to enable authenticated rooms.
          </p>
        ) : session ? (
          <form onSubmit={sendMessage} className="relative flex items-center">
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              maxLength={1000}
              placeholder="Ask about the API, benchmark, or implementation…"
              className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-4 pr-12 text-sm text-white placeholder:text-white/30 focus:border-[#06b6d4]/60 focus:outline-none"
            />
            <button type="submit" disabled={!input.trim() || sending} aria-label="Send message" className="absolute right-2 flex h-8 w-8 items-center justify-center rounded-lg bg-[#06b6d4] text-black disabled:opacity-40">
              <Send size={16} />
            </button>
          </form>
        ) : !isConfigured ? (
          <Link
            href={`/auth?mode=signin&next=${encodeURIComponent(`/trend/${slug}`)}`}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-amber-300/20 bg-amber-300/[0.06] px-4 py-3 text-sm font-semibold text-amber-100/80 hover:bg-amber-300/10"
          >
            <Code2 size={16} /> Sign-in setup is in progress
          </Link>
        ) : (
          <Link
            href={`/auth?mode=signin&next=${encodeURIComponent(`/trend/${slug}`)}`}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-white py-3 text-sm font-bold text-black hover:bg-white/90"
          >
            <Code2 size={16} /> Sign in to write
          </Link>
        )}
        {error && <p className="mt-3 text-sm text-red-300">{error}</p>}
      </div>
    </section>
  );
}
