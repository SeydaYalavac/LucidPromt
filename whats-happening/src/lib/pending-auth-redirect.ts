import { getSafeRedirect } from "@/lib/auth-redirect";

export const PENDING_AUTH_REDIRECT_KEY = "pending_auth_redirect";
export const PENDING_AUTH_REDIRECT_MAX_AGE_MS = 24 * 60 * 60 * 1_000;

type PendingAuthRedirect = {
  path: string;
  createdAt: number;
};

export function createPendingAuthRedirect(
  path: string,
  now = Date.now(),
): PendingAuthRedirect {
  return {
    path: getSafeRedirect(path),
    createdAt: now,
  };
}

export function readPendingAuthRedirect(
  value: unknown,
  now = Date.now(),
): string | null {
  if (!value || typeof value !== "object") return null;

  const path = "path" in value ? value.path : null;
  const createdAt = "createdAt" in value ? value.createdAt : null;
  if (typeof path !== "string" || typeof createdAt !== "number") return null;
  if (createdAt > now || now - createdAt > PENDING_AUTH_REDIRECT_MAX_AGE_MS) return null;

  const safePath = getSafeRedirect(path, "");
  return safePath || null;
}
