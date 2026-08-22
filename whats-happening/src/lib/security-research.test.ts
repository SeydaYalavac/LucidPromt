import { describe, expect, it } from "vitest";
import { securityDossiers, securitySources } from "../content/security-research";
import { getAffectedDossierIds, searchSecurityDossiers } from "./security-research";
import { fingerprintSourceBody, normalizeHtmlForFingerprint } from "./security-source-fingerprint";

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

  it("fingerprints meaningful source content instead of volatile response metadata", () => {
    const first = `<!doctype html><html><head><script>window.requestId = "one"</script></head><body><main><h1>Prompt injection</h1><p>Keep permissions in code.</p></main></body></html>`;
    const second = `<!doctype html><html><head><script>window.requestId = "two"</script></head><body><main>\n<h1>Prompt injection</h1> <p>Keep permissions in code.</p></main></body></html>`;
    const changed = second.replace("Keep permissions in code.", "Keep permissions in deterministic code.");

    expect(normalizeHtmlForFingerprint(first)).toBe("Prompt injection Keep permissions in code.");
    expect(fingerprintSourceBody("https://example.com/source", "text/html", Buffer.from(first)))
      .toBe(fingerprintSourceBody("https://example.com/source", "text/html", Buffer.from(second)));
    expect(fingerprintSourceBody("https://example.com/source", "text/html", Buffer.from(first)))
      .not.toBe(fingerprintSourceBody("https://example.com/source", "text/html", Buffer.from(changed)));
  });

  it("rejects access challenges instead of treating them as source changes", () => {
    const challenge = `<html><body><main><h1>Client Challenge</h1><p>A required part of this site couldn't load.</p></main></body></html>`;

    expect(() => fingerprintSourceBody("https://example.com/source", "text/html", Buffer.from(challenge)))
      .toThrow("Source returned a client challenge");
  });
});
