import { describe, expect, it, vi } from "vitest";
import type { AuthContactCandidate } from "./auth-contact-candidates";
import { APPROVED_WARM_NOTE_SUBJECT } from "./auth-contact-handoff";
import {
  APPROVED_WARM_NOTE_BODY,
  dedupeAndMaybeSendCandidate,
} from "./auth-contact-mailbox";

const candidate: AuthContactCandidate = {
  email: "ada@company.dev",
  first_name: "Ada",
  created_at: "2026-08-27T08:00:00.000Z",
  eligible_for_contact: true,
};

const config = {
  apiBase: "https://mailbox.invalid",
  projectId: "project-id",
  token: "secret-token",
  sendApprovedNote: false,
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

describe("Auth contact mailbox consumption", () => {
  it("deduplicates only an exact recipient and exact subject pair", async () => {
    const fetchImpl = vi.fn(async () => jsonResponse({
      threads: [
        { counterparty: "ada@company.dev", subject: "A different subject" },
        { counterparty: "other@company.dev", subject: APPROVED_WARM_NOTE_SUBJECT },
        { counterparty: "Ada <ada@company.dev>", subject: APPROVED_WARM_NOTE_SUBJECT },
      ],
    }));

    await expect(dedupeAndMaybeSendCandidate(
      candidate,
      APPROVED_WARM_NOTE_SUBJECT,
      { ...config, fetchImpl },
    )).resolves.toEqual({ duplicate: true, sent: false });
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it("keeps sending off by default after a clean exact deduplication", async () => {
    const fetchImpl = vi.fn(async () => jsonResponse({ threads: [] }));

    await expect(dedupeAndMaybeSendCandidate(
      candidate,
      APPROVED_WARM_NOTE_SUBJECT,
      { ...config, fetchImpl },
    )).resolves.toEqual({ duplicate: false, sent: false });
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it("checks every mailbox result page before declaring the candidate ready", async () => {
    const firstPage = Array.from({ length: 500 }, (_, index) => ({
      counterparty: `other-${index}@company.dev`,
      subject: APPROVED_WARM_NOTE_SUBJECT,
    }));
    const fetchImpl = vi.fn()
      .mockResolvedValueOnce(jsonResponse({ threads: firstPage, total: 501 }))
      .mockResolvedValueOnce(jsonResponse({
        threads: [{ counterparty: candidate.email, subject: APPROVED_WARM_NOTE_SUBJECT }],
        total: 501,
      }));

    await expect(dedupeAndMaybeSendCandidate(
      candidate,
      APPROVED_WARM_NOTE_SUBJECT,
      { ...config, fetchImpl },
    )).resolves.toEqual({ duplicate: true, sent: false });
    expect(fetchImpl).toHaveBeenCalledTimes(2);
    expect(String(fetchImpl.mock.calls[1][0])).toContain("offset=500");
  });

  it("uses only the approved subject and body when explicitly enabled", async () => {
    const fetchImpl = vi.fn()
      .mockResolvedValueOnce(jsonResponse({ threads: [] }))
      .mockResolvedValueOnce(jsonResponse({ message: { id: "hidden" } }));

    await expect(dedupeAndMaybeSendCandidate(
      candidate,
      APPROVED_WARM_NOTE_SUBJECT,
      { ...config, sendApprovedNote: true, fetchImpl },
    )).resolves.toEqual({ duplicate: false, sent: true });
    const [, request] = fetchImpl.mock.calls[1];
    expect(JSON.parse(String(request?.body))).toEqual({
      to: candidate.email,
      subject: APPROVED_WARM_NOTE_SUBJECT,
      body: APPROVED_WARM_NOTE_BODY(candidate.first_name),
    });
  });

  it("redacts provider errors from thrown messages", async () => {
    const fetchImpl = vi.fn(async () =>
      new Response("private ada@company.dev Ada secret-token", { status: 500 }));

    await expect(dedupeAndMaybeSendCandidate(
      candidate,
      APPROVED_WARM_NOTE_SUBJECT,
      { ...config, fetchImpl },
    )).rejects.toThrow("AUTH_CONTACT_MAILBOX_FAILED");
    await expect(dedupeAndMaybeSendCandidate(
      candidate,
      APPROVED_WARM_NOTE_SUBJECT,
      { ...config, fetchImpl },
    )).rejects.not.toThrow(/ada@|Ada|secret-token/u);
  });
});
