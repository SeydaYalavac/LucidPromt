import { describe, expect, it } from "vitest";
import { isMarkedProductionTestSession } from "./analytics-test-session";

class MemorySessionStorage {
  private readonly values = new Map<string, string>();

  getItem(key: string) {
    return this.values.get(key) ?? null;
  }

  setItem(key: string, value: string) {
    this.values.set(key, value);
  }
}

describe("production test session marker", () => {
  it("marks only the current session when tin_test=1 is present", () => {
    const currentSession = new MemorySessionStorage();

    expect(
      isMarkedProductionTestSession(
        "https://www.whatshappeninginai.com/?tin_test=1",
        currentSession,
      ),
    ).toBe(true);
    expect(
      isMarkedProductionTestSession(
        "https://www.whatshappeninginai.com/trending",
        currentSession,
      ),
    ).toBe(true);
  });

  it("does not carry the marker into a new browser session", () => {
    expect(
      isMarkedProductionTestSession(
        "https://www.whatshappeninginai.com/trending",
        new MemorySessionStorage(),
      ),
    ).toBe(false);
  });

  it("still excludes a marked entry when session storage is unavailable", () => {
    const unavailableStorage = {
      getItem: () => {
        throw new Error("blocked");
      },
      setItem: () => {
        throw new Error("blocked");
      },
    };

    expect(
      isMarkedProductionTestSession(
        "https://www.whatshappeninginai.com/?tin_test=1",
        unavailableStorage,
      ),
    ).toBe(true);
  });
});
