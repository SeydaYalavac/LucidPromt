import { constants } from "node:fs";
import { chmod, lstat, open, rm, writeFile } from "node:fs/promises";
import type { AuthContactCandidate } from "./auth-contact-candidates";

export const APPROVED_WARM_NOTE_SUBJECT = "What were you hoping to track?";

export type AuthContactHandoff = {
  version: 1;
  generated_at: string;
  created_since: string;
  subject: typeof APPROVED_WARM_NOTE_SUBJECT;
  candidate: AuthContactCandidate | null;
};

export type AuthContactConsumption = {
  consumed: 0 | 1;
  duplicate: 0 | 1;
  ready: 0 | 1;
  sent: 0 | 1;
};

type CandidateConsumer = (
  candidate: AuthContactCandidate,
  subject: typeof APPROVED_WARM_NOTE_SUBJECT,
) => Promise<{ duplicate: boolean; sent: boolean }>;

function isCandidate(value: unknown): value is AuthContactCandidate {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.email === "string"
    && candidate.email.length > 3
    && candidate.email === candidate.email.trim().toLowerCase()
    && typeof candidate.first_name === "string"
    && candidate.first_name.length > 0
    && typeof candidate.created_at === "string"
    && Number.isFinite(new Date(candidate.created_at).getTime())
    && candidate.eligible_for_contact === true
    && Object.keys(candidate).sort().join(",")
      === "created_at,eligible_for_contact,email,first_name"
  );
}

function parseHandoff(raw: string): AuthContactHandoff {
  let value: unknown;
  try {
    value = JSON.parse(raw);
  } catch {
    throw new Error("AUTH_CONTACT_HANDOFF_INVALID");
  }

  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("AUTH_CONTACT_HANDOFF_INVALID");
  }
  const handoff = value as Record<string, unknown>;
  const valid = (
    handoff.version === 1
    && typeof handoff.generated_at === "string"
    && Number.isFinite(new Date(handoff.generated_at).getTime())
    && typeof handoff.created_since === "string"
    && Number.isFinite(new Date(handoff.created_since).getTime())
    && handoff.subject === APPROVED_WARM_NOTE_SUBJECT
    && (handoff.candidate === null || isCandidate(handoff.candidate))
    && Object.keys(handoff).sort().join(",")
      === "candidate,created_since,generated_at,subject,version"
  );
  if (!valid) throw new Error("AUTH_CONTACT_HANDOFF_INVALID");
  return handoff as AuthContactHandoff;
}

export async function writeAuthContactHandoff(
  output: string,
  handoff: AuthContactHandoff,
): Promise<void> {
  await writeFile(output, `${JSON.stringify(handoff)}\n`, {
    encoding: "utf8",
    mode: 0o600,
    flag: "wx",
  });
  await chmod(output, 0o600);
}

export async function consumeAuthContactHandoff(
  input: string,
  consumer: CandidateConsumer,
): Promise<AuthContactConsumption> {
  try {
    const metadata = await lstat(input);
    if (!metadata.isFile() || metadata.isSymbolicLink() || (metadata.mode & 0o777) !== 0o600) {
      throw new Error("AUTH_CONTACT_HANDOFF_UNSAFE_FILE");
    }

    const handle = await open(input, constants.O_RDONLY | constants.O_NOFOLLOW);
    let raw: string;
    try {
      const opened = await handle.stat();
      if (!opened.isFile() || (opened.mode & 0o777) !== 0o600) {
        throw new Error("AUTH_CONTACT_HANDOFF_UNSAFE_FILE");
      }
      raw = await handle.readFile({ encoding: "utf8" });
    } finally {
      await handle.close();
    }

    const handoff = parseHandoff(raw);
    if (!handoff.candidate) {
      return { consumed: 0, duplicate: 0, ready: 0, sent: 0 };
    }

    const result = await consumer(handoff.candidate, handoff.subject);
    return {
      consumed: 1,
      duplicate: result.duplicate ? 1 : 0,
      ready: result.duplicate || result.sent ? 0 : 1,
      sent: result.sent ? 1 : 0,
    };
  } finally {
    await rm(input, { force: true });
  }
}
