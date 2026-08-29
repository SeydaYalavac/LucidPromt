import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { evergreenGuides, evergreenGuideSources, type EvergreenGuideSlug } from "../src/content/evergreen-guides";
import { fingerprintSourceBody } from "../src/lib/security-source-fingerprint";

type SourceState = { fingerprint: string; checkedAt: string };
type GuideState = {
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
  guides: Partial<Record<EvergreenGuideSlug, GuideState>>;
};

const statePath = resolve(process.cwd(), "src/content/evergreen-guide-state.json");
const today = new Date().toISOString().slice(0, 10);
const baseline = process.argv.includes("--baseline");
const fingerprintSchemaVersion = 4;

async function fingerprintSource(url: string) {
  const response = await fetch(url, {
    redirect: "follow",
    headers: { "User-Agent": "WhatsHappeningAI-EvidenceGuideMonitor/1.0 (+https://www.whatshappeninginai.com)" },
    signal: AbortSignal.timeout(30_000),
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const contentType = response.headers.get("content-type") ?? "application/octet-stream";
  const body = new Uint8Array(await response.arrayBuffer());
  return { fingerprint: fingerprintSourceBody(response.url, contentType, body) };
}

async function main() {
  const previous = JSON.parse(await readFile(statePath, "utf8")) as ResearchState;
  const migratingFingerprintFormat = previous.schemaVersion < fingerprintSchemaVersion;
  const sources = { ...previous.sources };
  const changedSourceIds: string[] = [];
  const failedSourceIds: string[] = [];
  const failures: string[] = [];
  const checkedSourceIds = new Set<string>();

  for (const source of evergreenGuideSources) {
    try {
      const next = await fingerprintSource(source.monitorUrl ?? source.url);
      const prior = previous.sources[source.id];
      sources[source.id] = { ...next, checkedAt: today };
      checkedSourceIds.add(source.id);
      if (!baseline && !migratingFingerprintFormat && prior && prior.fingerprint !== next.fingerprint) changedSourceIds.push(source.id);
    } catch (error) {
      failedSourceIds.push(source.id);
      failures.push(`${source.id}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  const flaggedSourceIds = new Set([...changedSourceIds, ...failedSourceIds]);
  const guides = Object.fromEntries((Object.values(evergreenGuides)).map((guide) => {
    const prior = previous.guides[guide.slug];
    const initial: GuideState = prior ?? {
      version: 1,
      lastVerified: today,
      evidenceCheckedAt: today,
      reviewStatus: "verified",
      changeSummary: { en: "Initial editorial and evidence review.", tr: "İlk editoryal ve kanıt incelemesi." },
    };
    const allChecked = guide.sourceIds.every((sourceId) => checkedSourceIds.has(sourceId));
    const affected = guide.sourceIds.some((sourceId) => flaggedSourceIds.has(sourceId));
    if (baseline || migratingFingerprintFormat) return [guide.slug, {
      ...initial,
      version: 1,
      lastVerified: today,
      evidenceCheckedAt: allChecked ? today : initial.evidenceCheckedAt,
      reviewStatus: allChecked ? "verified" as const : "review-required" as const,
      changeSummary: allChecked
        ? { en: "Initial editorial and evidence review.", tr: "İlk editoryal ve kanıt incelemesi." }
        : { en: "An official source could not be verified; this guide is unavailable.", tr: "Resmî kaynak doğrulanamadı; bu rehber kullanılamıyor." },
    }];
    if (!affected) return [guide.slug, { ...initial, evidenceCheckedAt: allChecked ? today : initial.evidenceCheckedAt }];
    return [guide.slug, {
      ...initial,
      version: initial.version + 1,
      evidenceCheckedAt: allChecked ? today : initial.evidenceCheckedAt,
      reviewStatus: "review-required" as const,
      changeSummary: failedSourceIds.some((sourceId) => guide.sourceIds.includes(sourceId))
        ? { en: "An official source could not be verified; this guide is unavailable.", tr: "Resmî kaynak doğrulanamadı; bu rehber kullanılamıyor." }
        : { en: "Linked official evidence changed; editorial review is required.", tr: "Bağlı resmî kanıt değişti; editoryal inceleme gerekiyor." },
    }];
  })) as Record<EvergreenGuideSlug, GuideState>;

  const checkedAt = failures.length === 0 ? today : previous.checkedAt;
  const next: ResearchState = { schemaVersion: fingerprintSchemaVersion, checkedAt, sources, guides };
  await writeFile(statePath, `${JSON.stringify(next, null, 2)}\n`, "utf8");
  console.log(JSON.stringify({ checked: checkedSourceIds.size, changedSourceIds, failedSourceIds, failures }, null, 2));
  if (failures.length === evergreenGuideSources.length) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
