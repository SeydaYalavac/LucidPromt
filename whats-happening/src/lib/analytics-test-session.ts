const PRODUCTION_TEST_QUERY_PARAM = "tin_test";
const PRODUCTION_TEST_SESSION_KEY = "tin_test_session";

type SessionStorage = Pick<Storage, "getItem" | "setItem">;

export function isMarkedProductionTestSession(
  href: string,
  sessionStorage: SessionStorage,
) {
  let markedFromEntry = false;

  try {
    markedFromEntry =
      new URL(href).searchParams.get(PRODUCTION_TEST_QUERY_PARAM) === "1";
  } catch {
    // An invalid URL cannot opt a session out of measurement.
  }

  if (markedFromEntry) {
    try {
      sessionStorage.setItem(PRODUCTION_TEST_SESSION_KEY, "1");
    } catch {
      // The entry marker still applies when storage is unavailable.
    }
    return true;
  }

  try {
    return sessionStorage.getItem(PRODUCTION_TEST_SESSION_KEY) === "1";
  } catch {
    return false;
  }
}

export function isCurrentSessionMarkedForProductionTest() {
  if (typeof window === "undefined") return false;
  return isMarkedProductionTestSession(window.location.href, window.sessionStorage);
}
