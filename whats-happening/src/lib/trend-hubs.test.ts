import { describe, expect, it } from "vitest";
import {
  RETAINED_ARCHIVE_ELIGIBILITY_COLUMN,
  applyRetainedArchiveEligibility,
  retainedHubForCategory,
  retainedHubPageCount,
  retainedHubPath,
  retainedHubRanges,
} from "./trend-hubs";

describe("retained trend hubs", () => {
  it("folds rare AI-adjacent labels into the substantial AI archive", () => {
    expect(retainedHubForCategory("Space").slug).toBe("artificial-intelligence");
    expect(retainedHubForCategory("Health").slug).toBe("artificial-intelligence");
    expect(retainedHubForCategory("Unknown future label").slug).toBe("artificial-intelligence");
  });

  it("caps archive ranges at 30 and keeps canonical page one clean", () => {
    expect(retainedHubPageCount(31)).toBe(2);
    expect(retainedHubRanges(31)).toEqual([
      { page: 1, first: 1, last: 30 },
      { page: 2, first: 31, last: 31 },
    ]);
    const hub = retainedHubForCategory("Sports");
    expect(retainedHubPath(hub, 1)).toBe("/category/sports");
    expect(retainedHubPath(hub, 2)).toBe("/category/sports?page=2");
  });

  it("binds count and card queries to the same durable eligibility field", () => {
    const calls: Array<[string, boolean]> = [];
    const query = {
      eq(column: typeof RETAINED_ARCHIVE_ELIGIBILITY_COLUMN, value: true) {
        calls.push([column, value]);
        return this;
      },
    };

    expect(applyRetainedArchiveEligibility(query)).toBe(query);
    expect(calls).toEqual([["archive_eligible", true]]);
  });

  it("keeps every valid final page nonempty and rejects overflow pages", () => {
    for (const total of [1, 30, 31, 60, 61, 1_845]) {
      const ranges = retainedHubRanges(total);
      const last = ranges.at(-1);
      expect(last).toBeDefined();
      expect(last!.last - last!.first + 1).toBeGreaterThan(0);
      expect(last!.last - last!.first + 1).toBeLessThanOrEqual(30);
      expect(last!.page).toBe(retainedHubPageCount(total));
      expect(ranges[last!.page]).toBeUndefined();
    }
  });
});
