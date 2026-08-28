import { securityDossiers, sourceById, type LocalizedText, type SecurityDossier } from "./security-research";
import researchState from "./security-research-state.json";

export type SecurityGuideSlug = "ai-security-vulnerabilities" | "hallucination-detection";

export type SecurityGuide = {
  slug: SecurityGuideSlug;
  title: LocalizedText;
  kicker: LocalizedText;
  description: LocalizedText;
  promise: LocalizedText;
  audience: LocalizedText;
  answerQuestion: LocalizedText;
  directAnswer: LocalizedText;
  answerSourceIds: string[];
  dossierIds: string[];
};

export type DossierAuditState = {
  version: number;
  lastVerified: string;
  evidenceCheckedAt: string;
  reviewStatus: "verified" | "review-required";
  changeSummary: LocalizedText;
};

export const securityGuides: Record<SecurityGuideSlug, SecurityGuide> = {
  "ai-security-vulnerabilities": {
    slug: "ai-security-vulnerabilities",
    kicker: { en: "Defensive field guide", tr: "Savunma saha rehberi" },
    title: { en: "How to reduce AI security vulnerabilities", tr: "Yapay zeka güvenlik açıkları nasıl azaltılır" },
    description: {
      en: "A source-linked operating guide to seven high-impact failure paths in AI applications, from prompt injection and poisoned data to excessive agency.",
      tr: "Prompt enjeksiyonu ve zehirlenmiş veriden aşırı özerkliğe kadar yapay zeka uygulamalarındaki yedi yüksek etkili hata yolu için kaynak bağlantılı işletim rehberi.",
    },
    promise: {
      en: "Treat model input, retrieved context and generated output as untrusted. Keep permissions, secrets and irreversible actions in deterministic controls outside the model.",
      tr: "Model girdisini, getirilen bağlamı ve üretilen çıktıyı güvenilmeyen veri kabul edin. Yetkileri, sırları ve geri döndürülemez eylemleri model dışındaki belirlenebilir kontrollerde tutun.",
    },
    audience: {
      en: "For teams designing, reviewing or operating AI applications with retrieval, tools or sensitive data.",
      tr: "Bilgi getirme, araçlar veya hassas veriler kullanan yapay zeka uygulamalarını tasarlayan, inceleyen ya da işleten ekipler için.",
    },
    answerQuestion: {
      en: "What is the best way to reduce AI security vulnerabilities?",
      tr: "Yapay zeka güvenlik açıklarını azaltmanın en iyi yolu nedir?",
    },
    directAnswer: {
      en: "Use layered controls outside the model. Treat prompts, retrieved content and model output as untrusted. Enforce least-privilege permissions in deterministic code. Validate every tool call and output. Require approval for high-impact actions. Test each trust boundary before release.",
      tr: "Model dışında katmanlı kontroller kullanın. Promptları, getirilen içeriği ve model çıktısını güvenilmeyen veri sayın. En az ayrıcalık ilkesini deterministik kodda uygulayın. Her araç çağrısını ve çıktıyı doğrulayın. Yüksek etkili eylemler için onay isteyin. Yayın öncesinde her güven sınırını test edin.",
    },
    answerSourceIds: ["owasp-prompt", "owasp-output", "owasp-agency", "nist-genai"],
    dossierIds: [
      "prompt-injection",
      "model-supply-chain",
      "training-data-poisoning",
      "improper-output-handling",
      "excessive-agency",
      "system-prompt-secrets",
      "unbounded-consumption",
    ],
  },
  "hallucination-detection": {
    slug: "hallucination-detection",
    kicker: { en: "Evaluation field guide", tr: "Değerlendirme saha rehberi" },
    title: { en: "How to detect AI hallucinations", tr: "Yapay zeka halüsinasyonları nasıl tespit edilir" },
    description: {
      en: "A source-linked detection stack that combines retrieval evidence, atomic claims, entailment checks, uncertainty, evaluation sets and human review.",
      tr: "Bilgi getirme kanıtını, atomik iddiaları, çıkarım denetimini, belirsizliği, değerlendirme setlerini ve insan incelemesini birleştiren kaynak bağlantılı tespit yığını.",
    },
    promise: {
      en: "No single score proves an answer is factual. Detection works as a layered decision path that can cite, verify, abstain and escalate.",
      tr: "Tek bir puan bir yanıtın olgusal olduğunu kanıtlamaz. Tespit; kaynak gösterebilen, doğrulayabilen, yanıt vermeyebilen ve incelemeye aktarabilen katmanlı bir karar yolu olarak çalışır.",
    },
    audience: {
      en: "For teams evaluating factual answers, long-form generation or retrieval-augmented systems.",
      tr: "Olgusal yanıtları, uzun metin üretimini veya bilgi getirme destekli sistemleri değerlendiren ekipler için.",
    },
    answerQuestion: {
      en: "What is the best way to detect AI hallucinations?",
      tr: "Yapay zeka halüsinasyonlarını tespit etmenin en iyi yolu nedir?",
    },
    directAnswer: {
      en: "Use a layered verification process. Split output into atomic claims. Check each claim against approved evidence. Measure uncertainty across independent responses. Send unsupported or high-impact claims to human review. No single score proves factual accuracy.",
      tr: "Katmanlı bir doğrulama süreci kullanın. Çıktıyı atomik iddialara ayırın. Her iddiayı onaylı kanıtlarla karşılaştırın. Bağımsız yanıtlar arasındaki belirsizliği ölçün. Desteklenmeyen ya da yüksek etkili iddiaları insan incelemesine gönderin. Tek bir puan olgusal doğruluğu kanıtlamaz.",
    },
    answerSourceIds: ["factscore", "semantic-entropy", "nist-genai"],
    dossierIds: [
      "hallucination-risk-model",
      "retrieval-grounding",
      "atomic-claim-verification",
      "nli-entailment-checking",
      "self-consistency-uncertainty",
      "hallucination-evaluation-sets",
      "human-review-calibrated-abstention",
    ],
  },
};

const dossierById = new Map(securityDossiers.map((dossier) => [dossier.id, dossier]));
const dossierStates = researchState.dossiers as Record<string, DossierAuditState>;

export function getSecurityGuide(slug: SecurityGuideSlug) {
  return securityGuides[slug];
}

export function getVerifiedGuideDossiers(guide: SecurityGuide): SecurityDossier[] {
  return guide.dossierIds.flatMap((id) => {
    const dossier = dossierById.get(id);
    const state = dossierStates[id];
    if (!dossier || !state || !dossier.sourceIds.length) return [];
    if (!dossier.sourceIds.every((sourceId) => sourceById.has(sourceId))) return [];
    return [dossier];
  });
}

export function getGuideAudit(guide: SecurityGuide) {
  const dossiers = getVerifiedGuideDossiers(guide);
  const states = dossiers.map((dossier) => dossierStates[dossier.id]);
  const sourceIds = [...new Set(dossiers.flatMap((dossier) => dossier.sourceIds))];
  return {
    checkedAt: researchState.checkedAt,
    lastVerified: states.map((state) => state.lastVerified).sort().at(0) ?? researchState.checkedAt,
    reviewRequired: states.some((state) => state.reviewStatus === "review-required"),
    complete: dossiers.length === guide.dossierIds.length && sourceIds.length > 0,
    dossierCount: dossiers.length,
    sourceCount: sourceIds.length,
    sources: sourceIds.flatMap((sourceId) => {
      const source = sourceById.get(sourceId);
      return source ? [source] : [];
    }),
  };
}

export function guidePath(slug: SecurityGuideSlug) {
  return `/guides/${slug}`;
}

const vulnerabilityPattern = /\b(prompt injection|jailbreak|data poisoning|model poisoning|model extraction|model stealing|membership inference|adversarial|ai security|llm security|agent security|supply chain)\b/i;
const hallucinationPattern = /\b(hallucination|misinformation|factuality|fact[- ]checking|ground(?:ed|ing)|retrieval[- ]augmented|semantic entropy|truthfulqa|halueval|factscore)\b/i;

export function securityGuideSlugsForText(value: string): SecurityGuideSlug[] {
  const matches: SecurityGuideSlug[] = [];
  if (vulnerabilityPattern.test(value)) matches.push("ai-security-vulnerabilities");
  if (hallucinationPattern.test(value)) matches.push("hallucination-detection");
  return matches;
}
