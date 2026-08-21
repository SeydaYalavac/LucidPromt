"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  CornerUpLeft,
  LoaderCircle,
  MessageSquareText,
  Send,
  ShieldCheck,
  X,
} from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useMessages } from "@/hooks/useTrendData";
import { useAuthSession } from "@/hooks/useAuthSession";
import type { ChatMessage } from "@/types/trends";
import { captureProductEvent } from "@/lib/analytics";
import { normalizeChatMessage } from "@/lib/chat-messages";

interface ConversationEvidence {
  label: string;
  title: string;
  url: string;
}

interface TrendChatProps {
  trendId: string;
  slug: string;
  mode: "live" | "demo";
  trendTitle: string;
  evidence: ConversationEvidence[];
}

type PendingMessage = ChatMessage & { client_status: "sending" };

function initials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function formattedTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Time unavailable";
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function authorName(session: ReturnType<typeof useAuthSession>["session"]) {
  if (!session) return "You";
  return String(
    session.user.user_metadata?.display_name ||
      session.user.user_metadata?.name ||
      session.user.email?.split("@")[0] ||
      "You",
  ).slice(0, 60);
}

export function TrendChat({ trendId, slug, mode, trendTitle, evidence }: TrendChatProps) {
  const { data, error: loadError, isLoading, mutate } = useMessages(slug);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [pendingMessage, setPendingMessage] = useState<PendingMessage | null>(null);
  const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { supabase, session, isConfigured } = useAuthSession();
  const prefersReducedMotion = useReducedMotion();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messageListRef = useRef<HTMLDivElement>(null);
  const messages = useMemo(() => data?.messages || [], [data?.messages]);
  const visibleMessages = pendingMessage ? [...messages, pendingMessage] : messages;
  const messagesById = useMemo(
    () => new Map(messages.map((message) => [message.id, message])),
    [messages],
  );

  useEffect(() => {
    if (!supabase || mode !== "live") return;
    const channel = supabase
      .channel(`trend-chat:${trendId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "chat_messages", filter: `trend_id=eq.${trendId}` },
        (payload) => {
          const incoming = normalizeChatMessage(payload.new as ChatMessage);
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

  useEffect(() => {
    const list = messageListRef.current;
    if (!list) return;
    window.requestAnimationFrame(() => {
      list.scrollTop = list.scrollHeight;
    });
  }, [visibleMessages.length]);

  function startReply(message: ChatMessage) {
    setReplyingTo(message);
    setError(null);
    window.requestAnimationFrame(() => textareaRef.current?.focus());
  }

  async function sendMessage(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const body = input.trim();
    if (!body || !session || sending) return;

    const draftReply = replyingTo;
    const optimistic: PendingMessage = {
      id: `pending-${Date.now()}`,
      trend_id: trendId,
      author_id: session.user.id,
      author_display_name: authorName(session),
      body,
      reply_to_id: draftReply?.id || null,
      moderation_provider: "local",
      moderation_labels: [],
      status: "visible",
      created_at: new Date().toISOString(),
      client_status: "sending",
    };

    setSending(true);
    setError(null);
    setPendingMessage(optimistic);
    setInput("");

    try {
      const response = await fetch(`/api/trends/${slug}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ body, reply_to_id: draftReply?.id || null }),
      });
      const payload = await response.json().catch(() => ({ error: "The server returned an unreadable response." }));
      if (!response.ok) {
        setInput(body);
        setError(payload.error || "Your note could not be posted. Try again.");
        captureProductEvent("developer_chat_message_failed", { trend_slug: slug, status_code: response.status });
        return;
      }

      setReplyingTo(null);
      captureProductEvent("developer_chat_message_sent", { trend_slug: slug });
      await mutate((current) => {
        if (!current || current.messages.some((item) => item.id === payload.message.id)) return current;
        return { ...current, messages: [...current.messages, payload.message] };
      }, false);
    } catch {
      setInput(body);
      setError("Your note could not reach the server. Check your connection and try again.");
      captureProductEvent("developer_chat_message_failed", { trend_slug: slug, status_code: 0 });
    } finally {
      setPendingMessage(null);
      setSending(false);
    }
  }

  return (
    <section id="discussion" aria-labelledby="discussion-heading" className="scroll-mt-28">
      <header className="border-b border-white/[0.1] pb-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/50">Discussion</p>
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-white/50">
            {messages.length} {messages.length === 1 ? "contribution" : "contributions"}
          </p>
        </div>
        <h2 id="discussion-heading" className="mt-3 text-3xl font-medium tracking-[-0.035em] text-white">
          Community notes
        </h2>
        <p className="mt-4 max-w-[62ch] text-pretty text-sm leading-6 text-[#A8A8AF]">
          Compare interpretations, ask technical questions, and keep factual claims tied to the source trail.
        </p>

        <div className="mt-6 grid gap-4 border-y border-white/[0.08] py-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
          <div className="min-w-0">
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-white/50">Conversation context</p>
            <p className="mt-1 truncate text-sm font-medium text-white">{trendTitle}</p>
          </div>
          {evidence.length > 0 && (
            <div className="flex flex-wrap gap-x-4 gap-y-2">
              {evidence.slice(0, 2).map((item) => (
                <a
                  key={item.url}
                  href={item.url}
                  target="_blank"
                  rel="noreferrer"
                  title={item.title}
                  className="inline-flex min-h-11 items-center text-xs font-medium text-white/55 underline decoration-white/20 underline-offset-4 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                >
                  {item.label} source
                </a>
              ))}
            </div>
          )}
        </div>
      </header>

      <div
        ref={messageListRef}
        className="max-h-[34rem] min-h-64 overflow-y-auto overscroll-contain py-3 sm:py-5"
        aria-live="polite"
        aria-busy={isLoading || sending}
        aria-label={`Messages about ${trendTitle}`}
      >
        {isLoading && (
          <div className="flex min-h-64 items-center justify-center gap-2 text-sm text-white/50" role="status">
            <LoaderCircle size={16} className="animate-spin" /> Loading discussion
          </div>
        )}
        {loadError && !isLoading && (
          <div className="flex min-h-64 items-center justify-center px-6 text-center text-sm text-red-200" role="alert">
            This discussion could not be loaded. Refresh the page to try again.
          </div>
        )}
        {!isLoading && !loadError && visibleMessages.length === 0 && (
          <div className="flex min-h-64 items-center justify-center px-6 text-center">
            <div>
              <MessageSquareText size={22} className="mx-auto text-white/30" />
              <p className="mt-4 text-sm font-medium text-white">No community notes yet</p>
              <p className="mt-2 max-w-sm text-sm leading-6 text-white/50">
                Add the first source-aware question or observation about this trend.
              </p>
            </div>
          </div>
        )}

        <div className="divide-y divide-white/[0.07]">
          <AnimatePresence initial={false}>
            {visibleMessages.map((message) => {
              const replyParent = message.reply_to_id ? messagesById.get(message.reply_to_id) : null;
              const isPending = "client_status" in message;
              return (
                <motion.article
                  id={`message-${message.id}`}
                  key={message.id}
                  initial={prefersReducedMotion ? false : { opacity: 0, y: 6 }}
                  animate={{ opacity: isPending ? 0.62 : 1, y: 0 }}
                  transition={{ duration: 0.16, ease: "easeOut" }}
                  className={message.reply_to_id ? "ml-5 border-l border-white/10 py-5 pl-4 sm:ml-10" : "py-5"}
                >
                  {message.reply_to_id && (
                    <a
                      href={replyParent ? `#message-${replyParent.id}` : undefined}
                      className="mb-3 block max-w-xl truncate text-xs text-white/50 hover:text-white/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                    >
                      Replying to {replyParent ? `@${replyParent.author_display_name}: ${replyParent.body}` : "an earlier note"}
                    </a>
                  )}
                  <div className="flex gap-3 sm:gap-4">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/[0.1] bg-white/[0.04] font-mono text-[10px] font-semibold text-white/55" aria-hidden="true">
                      {initials(message.author_display_name)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                        <p className="text-sm font-semibold text-white">{message.author_display_name}</p>
                        <time dateTime={message.created_at} suppressHydrationWarning className="font-mono text-[10px] uppercase tracking-[0.08em] text-white/50">
                          {formattedTime(message.created_at)}
                        </time>
                        {isPending && <span className="text-xs text-white/50">Sending…</span>}
                      </div>
                      <p className="mt-2 max-w-[68ch] whitespace-pre-wrap break-words text-sm leading-6 text-[#C7C7CC]">{message.body}</p>
                      {!isPending && session && (
                        <button
                          type="button"
                          onClick={() => startReply(message)}
                          className="-ml-2 mt-2 inline-flex min-h-11 items-center gap-1.5 px-2 text-xs font-medium text-white/50 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                        >
                          <CornerUpLeft size={13} /> Reply
                        </button>
                      )}
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      <div className="border-t border-white/[0.1] pt-6">
        {mode === "demo" ? (
          <div className="rounded-2xl border border-amber-300/20 bg-amber-300/[0.04] px-5 py-4 text-sm leading-6 text-amber-100/80">
            Discussion is read-only in demo mode. Live posts require the production data connection.
          </div>
        ) : session ? (
          <form onSubmit={sendMessage} aria-label="Post a community note">
            {replyingTo && (
              <div className="mb-3 flex items-start justify-between gap-4 border-l border-white/15 pl-4 text-sm">
                <p className="min-w-0 truncate text-white/55">
                  Replying to <span className="font-medium text-white">{replyingTo.author_display_name}</span>: {replyingTo.body}
                </p>
                <button
                  type="button"
                  onClick={() => setReplyingTo(null)}
                  className="flex min-h-11 min-w-11 shrink-0 items-center justify-center text-white/50 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                  aria-label="Cancel reply"
                >
                  <X size={16} />
                </button>
              </div>
            )}
            <label htmlFor="discussion-note" className="sr-only">Write a community note</label>
            <textarea
              ref={textareaRef}
              id="discussion-note"
              value={input}
              onChange={(event) => {
                setInput(event.target.value);
                if (error) setError(null);
              }}
              onKeyDown={(event) => {
                if (event.key !== "Enter" || event.shiftKey || event.nativeEvent.isComposing) return;
                event.preventDefault();
                if (input.trim() && !sending) event.currentTarget.form?.requestSubmit();
              }}
              maxLength={1000}
              rows={3}
              required
              disabled={sending}
              aria-describedby="discussion-note-help discussion-note-status"
              placeholder="Add a source, technical question, or useful interpretation…"
              className="w-full resize-none rounded-2xl border border-white/[0.12] bg-[#0B0B0D] px-4 py-3 text-sm leading-6 text-white placeholder:text-white/30 focus:border-white/35 focus:outline-none disabled:opacity-60"
            />
            <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div id="discussion-note-help" className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[10px] uppercase tracking-[0.08em] text-white/50">
                <span>Enter to post · Shift + Enter for a new line</span>
                <span className={input.length > 900 ? "text-amber-200" : undefined}>{input.length}/1000</span>
              </div>
              <button
                type="submit"
                disabled={!input.trim() || sending}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-white px-5 text-sm font-semibold text-black hover:bg-[#E7E7E9] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:cursor-not-allowed disabled:opacity-35"
              >
                {sending ? <LoaderCircle size={15} className="animate-spin" /> : <Send size={15} />}
                {sending ? "Posting" : replyingTo ? "Post reply" : "Post note"}
              </button>
            </div>
            <div id="discussion-note-status" className="mt-3 min-h-6" aria-live="assertive">
              {error ? <p className="text-sm text-red-200" role="alert">{error}</p> : sending ? <p className="text-sm text-white/50">Your note is being moderated and posted.</p> : null}
            </div>
          </form>
        ) : !isConfigured ? (
          <div className="rounded-2xl border border-amber-300/20 bg-amber-300/[0.04] px-5 py-4">
            <p className="text-sm leading-6 text-amber-100/80">Account access is being configured. Public discussion remains readable.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-white">Join the discussion</p>
              <p className="mt-1 text-sm text-white/50">A verified account keeps every public note attributable.</p>
            </div>
            <Link
              href={`/auth?mode=signin&next=${encodeURIComponent(`/trend/${slug}#discussion`)}`}
              className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-full bg-white px-5 text-sm font-semibold text-black hover:bg-[#E7E7E9] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              Sign in to contribute
            </Link>
          </div>
        )}

        <p className="mt-5 flex items-center gap-2 text-xs leading-5 text-white/50">
          <ShieldCheck size={14} aria-hidden="true" /> Public, moderated, and limited to eight posts per minute. Don’t share private information.
        </p>
      </div>
    </section>
  );
}
