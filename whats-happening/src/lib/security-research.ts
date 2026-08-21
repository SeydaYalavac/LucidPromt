import { securityDossiers, sourceById, type SecurityDossier } from "../content/security-research";

export type SecurityCategory = SecurityDossier["category"] | "All";

export function getAffectedDossierIds(changedSourceIds: string[]) {
  const changed = new Set(changedSourceIds);
  return securityDossiers
    .filter((dossier) => dossier.sourceIds.some((sourceId) => changed.has(sourceId)))
    .map((dossier) => dossier.id);
}

export function searchSecurityDossiers(query: string, category: SecurityCategory, locale: "en" | "tr") {
  const normalized = query.trim().toLocaleLowerCase(locale);
  return securityDossiers.filter((dossier) => {
    if (category !== "All" && dossier.category !== category) return false;
    if (!normalized) return true;
    const sources = dossier.sourceIds.map((sourceId) => sourceById.get(sourceId)?.title ?? "");
    const methods = dossier.methodComparison?.flatMap((method) => [
      method.name[locale], method.detects[locale], method.failureCondition[locale], method.operationalUse[locale],
    ]) ?? [];
    return [
      dossier.title[locale],
      dossier.summary[locale],
      dossier.riskModel[locale],
      dossier.prevention[locale],
      dossier.detection[locale],
      ...sources,
      ...methods,
    ].some((value) => value.toLocaleLowerCase(locale).includes(normalized));
  });
}
