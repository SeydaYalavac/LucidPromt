import { describe, expect, it } from "vitest";
import {
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
});
