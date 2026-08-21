import type { ChatMessage } from "@/types/trends";

const replyLabelPrefix = "reply:";

type ChatMessageRecord = Omit<ChatMessage, "reply_to_id"> & {
  reply_to_id?: string | null;
};

export function replyLabel(replyToId: string) {
  return `${replyLabelPrefix}${replyToId}`;
}

export function labelsWithReplyFallback(labels: string[], replyToId?: string | null) {
  return replyToId ? [...labels, replyLabel(replyToId)] : labels;
}

export function normalizeChatMessage(message: ChatMessageRecord): ChatMessage {
  const fallbackReply = message.moderation_labels
    .find((label) => label.startsWith(replyLabelPrefix))
    ?.slice(replyLabelPrefix.length);

  return {
    ...message,
    reply_to_id: message.reply_to_id || fallbackReply || null,
    moderation_labels: message.moderation_labels.filter(
      (label) => !label.startsWith(replyLabelPrefix),
    ),
  };
}

export function isMissingReplyColumnError(error: unknown) {
  if (!error || typeof error !== "object") return false;
  const candidate = error as { code?: string; message?: string };
  return (
    candidate.code === "42703" ||
    candidate.code === "PGRST204" ||
    candidate.message?.includes("reply_to_id") === true
  );
}

export function isChatRateLimitError(error: unknown) {
  if (!error) return false;
  const message = error instanceof Error
    ? error.message
    : typeof error === "object" && "message" in error
      ? String((error as { message?: unknown }).message)
      : String(error);
  return message.includes("chat_rate_limit_exceeded");
}
