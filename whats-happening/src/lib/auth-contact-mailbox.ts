import type { AuthContactCandidate } from "./auth-contact-candidates";
import { APPROVED_WARM_NOTE_SUBJECT } from "./auth-contact-handoff";

export const APPROVED_WARM_NOTE_BODY = (firstName: string) => `Hi ${firstName},

Thanks for trying What's Happening. What were you hoping it would help you track or understand?

A one-line reply is perfect. I'm using the first answers to decide what the product should make easier next.

What's Happening`;

type MailboxConfig = {
  apiBase: string;
  projectId: string;
  token: string;
  sendApprovedNote: boolean;
  fetchImpl?: typeof fetch;
};

function stableApiError(): never {
  throw new Error("AUTH_CONTACT_MAILBOX_FAILED");
}

function addresses(value: unknown): string[] {
  if (Array.isArray(value)) return value.flatMap(addresses);
  if (typeof value !== "string") return [];
  return Array.from(value.matchAll(/[A-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Z0-9.-]+/giu))
    .map((match) => match[0].toLowerCase());
}

function exactThreadMatch(thread: unknown, email: string, subject: string): boolean {
  if (!thread || typeof thread !== "object" || Array.isArray(thread)) return false;
  const item = thread as Record<string, unknown>;
  if (item.subject !== subject) return false;

  return [item.counterparty, item.from, item.to, item.recipient, item.recipients]
    .flatMap(addresses)
    .some((address) => address === email);
}

async function mailboxRequest(
  config: MailboxConfig,
  path: string,
  options?: RequestInit,
): Promise<Record<string, unknown>> {
  const fetchImpl = config.fetchImpl || fetch;
  let response: Response;
  try {
    response = await fetchImpl(`${config.apiBase}${path}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${config.token}`,
        ...(options?.body ? { "Content-Type": "application/json" } : {}),
      },
      cache: "no-store",
    });
  } catch {
    return stableApiError();
  }
  if (!response.ok) return stableApiError();

  try {
    const body = await response.json();
    if (!body || typeof body !== "object" || Array.isArray(body)) return stableApiError();
    return body as Record<string, unknown>;
  } catch {
    return stableApiError();
  }
}

export async function dedupeAndMaybeSendCandidate(
  candidate: AuthContactCandidate,
  subject: typeof APPROVED_WARM_NOTE_SUBJECT,
  config: MailboxConfig,
): Promise<{ duplicate: boolean; sent: boolean }> {
  let duplicate = false;
  const pageSize = 500;

  for (let offset = 0; offset < 10_000; offset += pageSize) {
    const params = new URLSearchParams({
      state: "all",
      max: String(pageSize),
      offset: String(offset),
      search: candidate.email,
    });
    const result = await mailboxRequest(
      config,
      `/projects/${encodeURIComponent(config.projectId)}/support-mailbox/threads?${params}`,
    );
    const threads = Array.isArray(result.threads) ? result.threads : [];
    duplicate = threads.some((thread) => exactThreadMatch(thread, candidate.email, subject));
    if (duplicate) break;

    const total = typeof result.total === "number" ? result.total : null;
    if (threads.length < pageSize || (total !== null && offset + threads.length >= total)) break;
    if (offset + pageSize >= 10_000) return stableApiError();
  }

  if (duplicate || !config.sendApprovedNote) return { duplicate, sent: false };

  await mailboxRequest(
    config,
    `/projects/${encodeURIComponent(config.projectId)}/support-mailbox/send`,
    {
      method: "POST",
      body: JSON.stringify({
        to: candidate.email,
        subject,
        body: APPROVED_WARM_NOTE_BODY(candidate.first_name),
      }),
    },
  );
  return { duplicate: false, sent: true };
}
