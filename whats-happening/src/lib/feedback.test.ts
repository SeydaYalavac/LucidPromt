import { describe, expect, it } from "vitest";
import { demandFeedbackCategories } from "./feedback";

describe("demand feedback categories", () => {
  it("keeps the survey bounded to stable category ids", () => {
    expect(demandFeedbackCategories).toHaveLength(6);
    expect(demandFeedbackCategories.map(({ id }) => id)).toEqual([
      "ai",
      "technology",
      "science",
      "business",
      "sports",
      "entertainment",
    ]);
    expect(demandFeedbackCategories.every(({ id, label }) => id && label)).toBe(true);
  });
});
