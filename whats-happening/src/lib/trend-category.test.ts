import { describe, expect, it } from "vitest";
import { categoryForSignals, isAiSportsSignal } from "./trend-category";

describe("AI sports classification", () => {
  it.each([
    "AI-powered player performance analytics for football clubs",
    "Machine learning helps athletes prevent hamstring injuries",
    "Computer vision assists tennis officiating and line calls",
    "AI camera system automates basketball broadcasting",
    "Generative AI audio description makes football broadcasts accessible",
    "Deep learning supports sports science recovery research",
  ])("recognizes a sourced AI sports use case: %s", (title) => {
    expect(isAiSportsSignal({ title })).toBe(true);
    expect(categoryForSignals([{ title }])).toBe("Sports");
  });

  it.each([
    "Football transfer news and league fixtures",
    "AI agent benchmark for software teams",
    "Machine learning improves injury prevention in hospital wards",
    "AI game engine rendering performance",
  ])("rejects non-AI sports or non-sports AI records: %s", (title) => {
    expect(isAiSportsSignal({ title })).toBe(false);
  });

  it("uses supporting evidence across a source cluster without trusting a stored label", () => {
    expect(categoryForSignals([
      { title: "New computer vision system" },
      { title: "AI replay review", excerpt: "The system assists football referees during officiating decisions." },
    ])).toBe("Sports");
  });
});
