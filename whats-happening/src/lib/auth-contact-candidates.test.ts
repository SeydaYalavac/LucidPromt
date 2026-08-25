import { readFileSync } from "node:fs";
import { describe, expect, it, vi } from "vitest";
import {
  isMarkedTestIdentity,
  readAuthContactCandidates,
  type AuthUserRecord,
} from "./auth-contact-candidates";

const cutoff = new Date("2026-08-24T00:00:00.000Z");

function sourceFor(pages: AuthUserRecord[][]) {
  const listUsers = vi.fn(async ({ page }: { page: number; perPage: number }) => ({
    data: { users: pages[page - 1] || [] },
    error: null,
  }));

  return {
    source: { auth: { admin: { listUsers } } },
    listUsers,
  };
}

describe("auth contact candidates", () => {
  it("returns only the three approved contact fields for verified recent users", async () => {
    const { source } = sourceFor([[{
      email: "  Person@Example.dev ",
      email_confirmed_at: "2026-08-24T12:00:00.000Z",
      created_at: "2026-08-24T11:00:00.000Z",
      user_metadata: { full_name: "Private Name", phone: "+10000000000" },
    }]]);

    const result = await readAuthContactCandidates(source, cutoff);

    expect(result.candidates).toEqual([{
      email: "person@example.dev",
      created_at: "2026-08-24T11:00:00.000Z",
      eligible_for_contact: true,
    }]);
    expect(Object.keys(result.candidates[0])).toEqual([
      "email",
      "created_at",
      "eligible_for_contact",
    ]);
    expect(JSON.stringify(result)).not.toContain("Private Name");
    expect(JSON.stringify(result)).not.toContain("+10000000000");
  });

  it("excludes unverified, old, reserved-domain, marked and internal test identities", async () => {
    const users: AuthUserRecord[] = [
      { email: "unverified@company.dev", created_at: "2026-08-25T01:00:00Z" },
      { email: "old@company.dev", email_confirmed_at: "2026-08-20T01:00:00Z", created_at: "2026-08-20T01:00:00Z" },
      { email: "person@example.com", email_confirmed_at: "2026-08-25T01:00:00Z", created_at: "2026-08-25T01:00:00Z" },
      { email: "person+tin-test@company.dev", email_confirmed_at: "2026-08-25T01:00:00Z", created_at: "2026-08-25T01:00:00Z" },
      { email: "agent@tin.computer", email_confirmed_at: "2026-08-25T01:00:00Z", created_at: "2026-08-25T01:00:00Z" },
      { email: "marked@company.dev", email_confirmed_at: "2026-08-25T01:00:00Z", created_at: "2026-08-25T01:00:00Z", app_metadata: { tin_test: true } },
      { email: "staging@company.dev", email_confirmed_at: "2026-08-25T01:00:00Z", created_at: "2026-08-25T01:00:00Z", user_metadata: { environment: "staging" } },
    ];
    const { source } = sourceFor([users]);

    const result = await readAuthContactCandidates(source, cutoff);

    expect(result.candidates).toEqual([]);
    expect(result.summary).toEqual({
      scanned: 7,
      verified_in_window: 5,
      excluded_test: 5,
      eligible: 0,
    });
  });

  it("paginates without exposing source errors or fetching beyond the last page", async () => {
    const firstPage = Array.from({ length: 1_000 }, (_, index) => ({
      email: `person-${index}@company.dev`,
      email_confirmed_at: "2026-08-25T01:00:00Z",
      created_at: "2026-08-25T01:00:00Z",
    }));
    const { source, listUsers } = sourceFor([firstPage, []]);

    const result = await readAuthContactCandidates(source, cutoff);

    expect(result.summary.eligible).toBe(1_000);
    expect(listUsers).toHaveBeenCalledTimes(2);
    expect(listUsers).toHaveBeenNthCalledWith(1, { page: 1, perPage: 1_000 });
    expect(listUsers).toHaveBeenNthCalledWith(2, { page: 2, perPage: 1_000 });
  });

  it("recognizes every supported explicit test marker", () => {
    expect(isMarkedTestIdentity({ user_metadata: { is_test: "true" } })).toBe(true);
    expect(isMarkedTestIdentity({ app_metadata: { test_user: 1 } })).toBe(true);
    expect(isMarkedTestIdentity({ user_metadata: { synthetic: "1" } })).toBe(true);
    expect(isMarkedTestIdentity({ email: "contest@company.dev" })).toBe(false);
  });

  it("fails closed with a stable error that cannot carry provider details", async () => {
    const source = {
      auth: {
        admin: {
          listUsers: vi.fn(async () => ({
            data: { users: [] },
            error: { message: "secret and private@example.dev" },
          })),
        },
      },
    };

    await expect(readAuthContactCandidates(source, cutoff)).rejects.toThrow(
      "AUTH_CONTACT_READ_SOURCE_FAILED",
    );
  });

  it("keeps the live reader manual, read-only, ephemeral and artifact-free", () => {
    const workflow = readFileSync(
      new URL("../../../.github/workflows/read-auth-contact-candidates.yml", import.meta.url),
      "utf8",
    );

    expect(workflow).toContain("workflow_dispatch:");
    expect(workflow).toContain("permissions:\n  contents: read");
    expect(workflow).toContain("mktemp -d");
    expect(workflow).toContain("if: always()");
    expect(workflow).toContain("shred -u");
    expect(workflow).toContain("rmdir");
    expect(workflow).not.toContain("upload-artifact");
    expect(workflow).not.toMatch(/https?:\/\//);
  });
});
