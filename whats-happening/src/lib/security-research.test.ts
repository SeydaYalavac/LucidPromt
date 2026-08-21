import { describe, expect, it } from "vitest";
import { securityDossiers, securitySources } from "../content/security-research";
import { getAffectedDossierIds, searchSecurityDossiers } from "./security-research";

describe("AI security research corpus", () => {
  it("contains at least 20 complete bilingual defensive dossiers", () => {
    expect(securityDossiers.length).toBeGreaterThanOrEqual(20);
    const fields = ["title", "summary", "riskModel", "prevention", "detection", "validation", "limitations", "workflow"] as const;
    for (const dossier of securityDossiers) {
      expect(dossier.sourceIds.length).toBeGreaterThan(0);
      for (const field of fields) {
        const minimum = field === "title" ? 10 : 20;
        expect(dossier[field].en.trim().length).toBeGreaterThan(minimum);
        expect(dossier[field].tr.trim().length).toBeGreaterThan(minimum);
      }
    }
  });

  it("resolves every citation to an authoritative source", () => {
    const ids = new Set(securitySources.map((source) => source.id));
    for (const dossier of securityDossiers) {
      expect(dossier.sourceIds.every((sourceId) => ids.has(sourceId))).toBe(true);
    }
  });

  it("compares at least five hallucination methods with explicit failure conditions", () => {
    const comparison = securityDossiers.find((dossier) => dossier.id === "hallucination-risk-model")?.methodComparison;
    expect(comparison?.length).toBeGreaterThanOrEqual(5);
    for (const method of comparison ?? []) {
      expect(method.failureCondition.en.length).toBeGreaterThan(30);
      expect(method.failureCondition.tr.length).toBeGreaterThan(30);
    }
  });

  it("updates only dossiers linked to changed evidence", () => {
    const affected = getAffectedDossierIds(["model-stealing"]);
    expect(affected).toContain("model-extraction");
    expect(affected).not.toContain("prompt-injection");
  });

  it("searches the localized dossier body", () => {
    expect(searchSecurityDossiers("anlamsal entropi", "All", "tr").map((item) => item.id)).toContain("self-consistency-uncertainty");
    expect(searchSecurityDossiers("model extraction", "Model", "en").map((item) => item.id)).toContain("model-extraction");
  });
});
