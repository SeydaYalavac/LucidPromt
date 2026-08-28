import { mkdtemp, readFile, stat, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  APPROVED_WARM_NOTE_SUBJECT,
  consumeAuthContactHandoff,
  writeAuthContactHandoff,
  type AuthContactHandoff,
} from "./auth-contact-handoff";

const createdDirectories: string[] = [];

async function tempFile() {
  const directory = await mkdtemp(join(tmpdir(), "auth-contact-handoff-"));
  createdDirectories.push(directory);
  return join(directory, "candidate.json");
}

function handoff(): AuthContactHandoff {
  return {
    version: 1,
    generated_at: "2026-08-28T08:00:00.000Z",
    created_since: "2026-08-26T08:00:00.000Z",
    subject: APPROVED_WARM_NOTE_SUBJECT,
    candidate: {
      email: "ada@company.dev",
      first_name: "Ada",
      created_at: "2026-08-27T08:00:00.000Z",
      eligible_for_contact: true,
    },
  };
}

afterEach(async () => {
  const { rm } = await import("node:fs/promises");
  await Promise.all(createdDirectories.splice(0).map((directory) =>
    rm(directory, { recursive: true, force: true })));
});

describe("one-use Auth contact handoff", () => {
  it("creates an exclusive 0600 file and consumes it once", async () => {
    const file = await tempFile();
    await writeAuthContactHandoff(file, handoff());

    expect((await stat(file)).mode & 0o777).toBe(0o600);
    expect(await readFile(file, "utf8")).toContain("ada@company.dev");

    const consumer = vi.fn(async () => ({ duplicate: false, sent: false }));
    await expect(consumeAuthContactHandoff(file, consumer)).resolves.toEqual({
      consumed: 1,
      duplicate: 0,
      ready: 1,
      sent: 0,
    });
    expect(consumer).toHaveBeenCalledWith(
      handoff().candidate,
      APPROVED_WARM_NOTE_SUBJECT,
    );
    await expect(stat(file)).rejects.toMatchObject({ code: "ENOENT" });
  });

  it("deletes the handoff when the consumer fails", async () => {
    const file = await tempFile();
    await writeAuthContactHandoff(file, handoff());

    await expect(consumeAuthContactHandoff(file, async () => {
      throw new Error("provider leaked ada@company.dev and Ada");
    })).rejects.toThrow("provider leaked");
    await expect(stat(file)).rejects.toMatchObject({ code: "ENOENT" });
  });

  it("rejects unsafe permissions and still deletes the file", async () => {
    const file = await tempFile();
    await writeFile(file, JSON.stringify(handoff()), { mode: 0o644 });

    await expect(consumeAuthContactHandoff(file, vi.fn())).rejects.toThrow(
      "AUTH_CONTACT_HANDOFF_UNSAFE_FILE",
    );
    await expect(stat(file)).rejects.toMatchObject({ code: "ENOENT" });
  });

  it("does not call the mailbox consumer when no candidate exists", async () => {
    const file = await tempFile();
    await writeAuthContactHandoff(file, { ...handoff(), candidate: null });
    const consumer = vi.fn();

    await expect(consumeAuthContactHandoff(file, consumer)).resolves.toEqual({
      consumed: 0,
      duplicate: 0,
      ready: 0,
      sent: 0,
    });
    expect(consumer).not.toHaveBeenCalled();
    await expect(stat(file)).rejects.toMatchObject({ code: "ENOENT" });
  });
});
