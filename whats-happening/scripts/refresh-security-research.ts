import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { securityDossiers, securitySources } from "../src/content/security-research";
import { getAffectedDossierIds } from "../src/lib/security-research";

type SourceState = { fingerprint: string; checkedAt: string; etag?: string; lastModified?: string };
type DossierState = {
  version: number;
  lastVerified: string;
  evidenceCheckedAt: string;
  reviewStatus: "verified" | "review-required";
  changeSummary: { en: string; tr: string };
};
type ResearchState = {
  schemaVersion: number;
  checkedAt: string;
  sources: Record<string, SourceState>;
  dossiers: Record<string, DossierState>;
};

const statePath = resolve(process.cwd(), "src/content/security-research-state.json");
const today = new Date().toISOString().slice(0, 10);
const baseline = process.argv.includes("--baseline");

function digest(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

async function fingerprintSource(url: string) {
  const response = await fetch(url, {
    redirect: "follow",
    headers: { "User-Agent": "WhatsHappeningAI-DefensiveResearchMonitor/1.0 (+https://www.whatshappeninginai.com/security-research)" },
    signal: AbortSignal.timeout(30_000),
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const etag = response.headers.get("etag") ?? undefined;
  const lastModified = response.headers.get("last-modified") ?? undefined;
  const contentLength = response.headers.get("content-length") ?? "";
  const stableHeaders = [etag, lastModified, contentLength].filter(Boolean).join("|");
  const body = stableHeaders ? "" : (await response.text()).replace(/<script[\s\S]*?<\/script>/gi, "").replace(/\s+/g, " ").trim();
  return { fingerprint: digest(`${response.url}|${stableHeaders || body}`), etag, lastModified };
}

async function main() {
  const previous = JSON.parse(await readFile(statePath, "utf8")) as ResearchState;
  const sources = { ...previous.sources };
  const changedSourceIds: string[] = [];
  const failures: string[] = [];
  const checkedSourceIds = new Set<string>();

  for (const source of securitySources) {
    try {
      const next = await fingerprintSource(source.url);
      const prior = previous.sources[source.id];
      sources[source.id] = { ...next, checkedAt: today };
      checkedSourceIds.add(source.id);
      if (!baseline && prior && prior.fingerprint !== next.fingerprint) changedSourceIds.push(source.id);
    } catch (error) {
      failures.push(`${source.id}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  const affected = new Set(getAffectedDossierIds(changedSourceIds));
  const dossiers = Object.fromEntries(securityDossiers.map((dossier) => {
    const prior = previous.dossiers[dossier.id];
    const initial: DossierState = prior ?? {
      version: 1,
      lastVerified: today,
      evidenceCheckedAt: today,
      reviewStatus: "verified",
      changeSummary: { en: "Initial defensive research review.", tr: "İlk savunma araştırması incelemesi." },
    };
    const evidenceCheckedAt = dossier.sourceIds.every((sourceId) => checkedSourceIds.has(sourceId))
      ? today
      : initial.evidenceCheckedAt;
    if (!affected.has(dossier.id)) return [dossier.id, { ...initial, evidenceCheckedAt }];
    return [dossier.id, {
      ...initial,
      version: initial.version + 1,
      evidenceCheckedAt,
      reviewStatus: "review-required" as const,
      changeSummary: {
        en: "Linked official evidence changed; dossier review is required.",
        tr: "Bağlı resmî kanıt değişti; dosya incelemesi gerekiyor.",
      },
    }];
  }));

  const checkedAt = failures.length === 0 ? today : previous.checkedAt;
  const next: ResearchState = { schemaVersion: 1, checkedAt, sources, dossiers };
  await writeFile(statePath, `${JSON.stringify(next, null, 2)}\n`, "utf8");
  console.log(JSON.stringify({ checked: Object.keys(sources).length, changedSourceIds, affectedDossiers: [...affected], failures }, null, 2));
  if (failures.length === securitySources.length) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
