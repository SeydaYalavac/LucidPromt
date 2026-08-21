import { describe, expect, it } from "vitest";
import {
  isChatRateLimitError,
  isMissingReplyColumnError,
  labelsWithReplyFallback,
  normalizeChatMessage,
} from "./chat-messages";

const message = {
  id: "message-1",
  trend_id: "trend-1",
  author_id: "author-1",
  author_display_name: "Ada",
  body: "Check the repository release notes.",
  moderation_provider: "local" as const,
  moderation_labels: [] as string[],
  status: "visible" as const,
  created_at: "2026-08-21T18:00:00.000Z",
};

describe("chat message reply compatibility", () => {
  it("keeps reply relationships in moderation labels until the schema migration lands", () => {
    const labels = labelsWithReplyFallback(["safe"], "parent-1");
    const normalized = normalizeChatMessage({ ...message, moderation_labels: labels });

    expect(normalized.reply_to_id).toBe("parent-1");
    expect(normalized.moderation_labels).toEqual(["safe"]);
  });

  it("prefers the migrated reply column over the compatibility label", () => {
    const normalized = normalizeChatMessage({
      ...message,
      reply_to_id: "column-parent",
      moderation_labels: ["reply:fallback-parent"],
    });

    expect(normalized.reply_to_id).toBe("column-parent");
  });

  it("recognizes schema-cache and database missing-column errors", () => {
    expect(isMissingReplyColumnError({ code: "PGRST204" })).toBe(true);
    expect(isMissingReplyColumnError({ code: "42703" })).toBe(true);
    expect(isMissingReplyColumnError({ message: "reply_to_id is missing" })).toBe(true);
  });

  it("recognizes the database rate-limit exception", () => {
    expect(isChatRateLimitError({ message: "chat_rate_limit_exceeded" })).toBe(true);
    expect(isChatRateLimitError(new Error("other failure"))).toBe(false);
  });
});
