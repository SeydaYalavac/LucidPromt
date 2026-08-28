export type AuthUserRecord = {
  email?: string | null;
  email_confirmed_at?: string | null;
  created_at?: string | null;
  app_metadata?: Record<string, unknown> | null;
  user_metadata?: Record<string, unknown> | null;
};

export type AuthContactCandidate = {
  email: string;
  first_name: string;
  created_at: string;
  eligible_for_contact: true;
};

type AuthAdminUserSource = {
  auth: {
    admin: {
      listUsers: (params: { page: number; perPage: number }) => Promise<{
        data: { users: AuthUserRecord[] };
        error: { message?: string } | null;
      }>;
    };
  };
};

type AuthContactRead = {
  candidates: AuthContactCandidate[];
  summary: {
    scanned: number;
    verified_in_window: number;
    excluded_test: number;
    eligible: number;
  };
};

const RESERVED_TEST_DOMAINS = new Set([
  "example.com",
  "example.net",
  "example.org",
  "example.test",
  "invalid",
  "localhost",
  "mail.tin.computer",
  "tin.computer",
]);

const TEST_LOCAL_PART = /(^|[+._-])(demo|e2e|qa|synthetic|test|testing|tin-test)([+._-]|$)/i;
const TEST_ENVIRONMENT = /^(demo|development|e2e|qa|staging|synthetic|test)$/i;
const TRUSTED_NAME_KEYS = ["given_name", "first_name", "full_name", "name", "display_name"] as const;
const SAFE_FIRST_NAME = /^[\p{L}\p{M}][\p{L}\p{M}'’.-]{0,49}$/u;

function isTruthyTestMarker(value: unknown): boolean {
  return value === true || value === 1 || value === "1" || value === "true";
}

function metadataMarksTest(metadata: Record<string, unknown> | null | undefined): boolean {
  if (!metadata) return false;

  return ["tin_test", "is_test", "test_user", "synthetic"].some((key) =>
    isTruthyTestMarker(metadata[key]),
  ) || (
    typeof metadata.environment === "string"
    && TEST_ENVIRONMENT.test(metadata.environment.trim())
  );
}

export function isMarkedTestIdentity(user: AuthUserRecord): boolean {
  if (metadataMarksTest(user.app_metadata) || metadataMarksTest(user.user_metadata)) {
    return true;
  }

  const email = user.email?.trim().toLowerCase();
  if (!email) return false;
  const separator = email.lastIndexOf("@");
  if (separator <= 0) return true;

  const localPart = email.slice(0, separator);
  const domain = email.slice(separator + 1);
  return RESERVED_TEST_DOMAINS.has(domain) || TEST_LOCAL_PART.test(localPart);
}

export function trustedFirstName(user: AuthUserRecord, email: string): string | null {
  const localPart = email.slice(0, email.lastIndexOf("@")).normalize("NFKC").toLocaleLowerCase();

  for (const key of TRUSTED_NAME_KEYS) {
    const value = user.user_metadata?.[key];
    if (typeof value !== "string") continue;

    const normalized = value.normalize("NFKC").trim();
    if (!normalized || normalized.length > 80 || /[@\u0000-\u001f\u007f]/u.test(normalized)) continue;

    const firstName = normalized.split(/\s+/u)[0];
    if (!SAFE_FIRST_NAME.test(firstName)) continue;
    if (normalized.toLocaleLowerCase() === localPart) continue;
    return firstName;
  }

  return null;
}

function verifiedCandidate(
  user: AuthUserRecord,
  createdSince: Date,
): AuthContactCandidate | null {
  const email = user.email?.trim().toLowerCase();
  if (!email || !user.email_confirmed_at || !user.created_at) return null;

  const createdAt = new Date(user.created_at);
  if (!Number.isFinite(createdAt.getTime()) || createdAt < createdSince) return null;
  if (isMarkedTestIdentity(user)) return null;
  const firstName = trustedFirstName(user, email);
  if (!firstName) return null;

  return {
    email,
    first_name: firstName,
    created_at: createdAt.toISOString(),
    eligible_for_contact: true,
  };
}

export async function readAuthContactCandidates(
  source: AuthAdminUserSource,
  createdSince: Date,
): Promise<AuthContactRead> {
  if (!Number.isFinite(createdSince.getTime())) {
    throw new Error("AUTH_CONTACT_READ_INVALID_CUTOFF");
  }

  const candidates: AuthContactCandidate[] = [];
  let scanned = 0;
  let verifiedInWindow = 0;
  let excludedTest = 0;
  const perPage = 1_000;

  for (let page = 1; page <= 100; page += 1) {
    const { data, error } = await source.auth.admin.listUsers({ page, perPage });
    if (error) throw new Error("AUTH_CONTACT_READ_SOURCE_FAILED");

    const users = data.users || [];
    scanned += users.length;

    for (const user of users) {
      const createdAt = user.created_at ? new Date(user.created_at) : null;
      const inWindow = Boolean(
        user.email
        && user.email_confirmed_at
        && createdAt
        && Number.isFinite(createdAt.getTime())
        && createdAt >= createdSince,
      );
      if (!inWindow) continue;
      verifiedInWindow += 1;

      if (isMarkedTestIdentity(user)) {
        excludedTest += 1;
        continue;
      }

      const candidate = verifiedCandidate(user, createdSince);
      if (candidate) candidates.push(candidate);
    }

    if (users.length < perPage) {
      return {
        candidates: candidates.sort((a, b) => a.created_at.localeCompare(b.created_at)),
        summary: {
          scanned,
          verified_in_window: verifiedInWindow,
          excluded_test: excludedTest,
          eligible: candidates.length,
        },
      };
    }
  }

  throw new Error("AUTH_CONTACT_READ_PAGE_LIMIT_EXCEEDED");
}
