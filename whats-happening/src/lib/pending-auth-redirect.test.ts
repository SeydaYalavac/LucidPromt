import { describe, expect, it } from "vitest";
import {
  createPendingAuthRedirect,
  PENDING_AUTH_REDIRECT_MAX_AGE_MS,
  readPendingAuthRedirect,
} from "./pending-auth-redirect";

describe("pending auth redirect", () => {
  const now = Date.UTC(2026, 8, 2, 12);

  it("keeps a safe route with its discussion fragment", () => {
    const pending = createPendingAuthRedirect("/trend/model#discussion", now);

    expect(readPendingAuthRedirect(pending, now + 1_000)).toBe(
      "/trend/model#discussion",
    );
  });

  it("rejects an unsafe route", () => {
    expect(
      readPendingAuthRedirect(
        { path: "https://evil.example/phish", createdAt: now },
        now,
      ),
    ).toBeNull();
  });

  it("rejects expired and future redirects", () => {
    const pending = createPendingAuthRedirect("/trend/model", now);

    expect(
      readPendingAuthRedirect(
        pending,
        now + PENDING_AUTH_REDIRECT_MAX_AGE_MS + 1,
      ),
    ).toBeNull();
    expect(readPendingAuthRedirect(pending, now - 1)).toBeNull();
  });

  it("rejects malformed metadata", () => {
    expect(readPendingAuthRedirect(null, now)).toBeNull();
    expect(readPendingAuthRedirect({ path: "/trend/model" }, now)).toBeNull();
  });
});
