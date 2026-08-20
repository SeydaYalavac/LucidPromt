import { describe, expect, it } from "vitest";
import { clampMapScale } from "./map";

describe("signal map controls", () => {
  it("keeps zoom inside the supported interaction range", () => {
    expect(clampMapScale(0.1)).toBe(1);
    expect(clampMapScale(2.5)).toBe(2.5);
    expect(clampMapScale(7)).toBe(4);
  });
});
