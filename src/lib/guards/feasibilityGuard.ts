export type GuardSeverity = "safe" | "warning" | "block";

export type GuardFinding = {
  id: string;
  severity: GuardSeverity;
  title: string;
  description: string;
  suggestion: string;
};

export type PromptMetric = {
  label: string;
  score: number;
  status: "weak" | "fair" | "strong";
  detail: string;
};

export type PromptAnalysis = {
  score: number;
  summary: string;
  metrics: PromptMetric[];
  findings: GuardFinding[];
  blocked: boolean;
  safeRewrite: string;
};

type GuardRule = {
  id: string;
  severity: Exclude<GuardSeverity, "safe">;
  title: string;
  description: string;
  suggestion: string;
  pattern: RegExp;
};

const guardRules: GuardRule[] = [
  {
    id: "financial-prediction",
    severity: "block",
    title: "Finansal tahmin isteği",
    description:
      "Modelden gelecekteki piyasa hareketlerini kesin biçimde tahmin etmesi isteniyor.",
    suggestion:
      "Tahmin yerine senaryo analizi, risk faktörleri ve geçmiş verilere dayalı kıyaslama iste.",
    pattern:
      /\b(borsa|hisse|bitcoin|kripto|altın|dolar|kur)\b[\s\S]{0,40}\b(tahmin|yarın|gelecek hafta|kesin|garanti|ne olur)\b/i,
  },
  {
    id: "medical-legal-decision",
    severity: "block",
    title: "Bağlayıcı tıbbi veya hukuki karar",
    description:
      "İstek, profesyonel uzman kararı yerine geçecek şekilde yönlendirme talep ediyor.",
    suggestion:
      "Bilgilendirici özet, soru listesi veya profesyonele giderken kullanılacak hazırlık notu iste.",
    pattern:
      /\b(doktor|tedavi|ilaç|mahkeme|avukat|hukuki|sözleşme|tanı)\b[\s\S]{0,50}\b(ne yapmalıyım|kesin|karar ver|uygun mu|reçete)\b/i,
  },
  {
    id: "deterministic-math",
    severity: "warning",
    title: "Ağır deterministik hesaplama",
    description:
      "İstek, modelin hataya açık olduğu çok adımlı kesin hesaplama veya ispat beklentisi taşıyor.",
    suggestion:
      "Modelden çözüm yaklaşımı, formül seçimi ve kontrol adımlarını iste; sonucu ayrıca doğrula.",
    pattern:
      /\b(ispatla|kanıtla|integral|türev|determinant|lineer cebir|olasılık|kombinasyon|hesapla)\b/i,
  },
  {
    id: "private-data",
    severity: "block",
    title: "Özel veya kapalı veri talebi",
    description:
      "İstek, erişilemeyen kişisel, kurumsal veya gizli bilgileri çıkarmaya çalışıyor.",
    suggestion:
      "Kamuya açık kaynaklardan nasıl araştırma yapılacağını veya hangi verilerin gerektiğini sor.",
    pattern:
      /\b(şifre|parola|gizli|özel veri|müşteri verisi|iç yazışma|private key|token)\b/i,
  },
  {
    id: "future-events",
    severity: "warning",
    title: "Gelecek olay bilgisi beklentisi",
    description:
      "Modelden henüz gerçekleşmemiş bir olayın sonucunu biliyormuş gibi davranması isteniyor.",
    suggestion:
      "Tahmin yerine olası senaryoları, etkileyen değişkenleri ve takip edilmesi gereken sinyalleri sor.",
    pattern:
      /\b(kim kazanır|sonuç ne olur|yarın ne olacak|gelecekte ne olur|maç sonucu)\b/i,
  },
];

const safeFallbackPrompt = `Rol: Dikkatli bir analiz asistanı.
Görev: İstenen konuda kesin tahmin veya bağlayıcı karar vermeden, doğrulanabilir bilgilerle yardımcı ol.
Çıktı:
1. İsteğin riskli kısmını kısa açıkla.
2. Güvenli ve uygulanabilir alternatif yaklaşım öner.
3. Gerekirse kullanıcıya sorulacak netleştirici soruları listele.
Sınırlar: Tahmin uydurma, gizli veri varsayma, hukuki/tıbbi kesin hüküm verme.`;

function getMetricStatus(score: number): PromptMetric["status"] {
  if (score >= 80) return "strong";
  if (score >= 55) return "fair";
  return "weak";
}

function normalizeScore(score: number) {
  return Math.max(0, Math.min(100, Math.round(score)));
}

function analyzeContext(prompt: string): PromptMetric {
  const hasRole = /\b(rol|gibi davran|act as|sen .* olarak|uzman|mühendis|yazar)\b/i.test(
    prompt,
  );
  const hasAudience = /\b(için|hedef kitle|junior|öğrenci|müşteri|ekip)\b/i.test(prompt);
  const score = (hasRole ? 55 : 20) + (hasAudience ? 35 : 10);

  return {
    label: "Bağlam",
    score: normalizeScore(score),
    status: getMetricStatus(score),
    detail: hasRole
      ? "Rol tanımı mevcut ve hedef kitle kısmen belirgin."
      : "Rol veya hedef kitle eksik; modelin duruşu netleşmeli.",
  };
}

function analyzeConstraints(prompt: string): PromptMetric {
  const hasFormat = /\b(json|markdown|tablo|madde|liste|başlık|format)\b/i.test(prompt);
  const hasLimits =
    /\b(kısa|uzun|maksimum|en fazla|adım adım|3 madde|5 madde|kelime)\b/i.test(prompt);
  const hasGrounding = /\b(sadece|yalnızca|kaynağa göre|referans|alıntı|kanıt)\b/i.test(prompt);
  const score = (hasFormat ? 30 : 10) + (hasLimits ? 30 : 10) + (hasGrounding ? 30 : 8);

  return {
    label: "Kısıtlar",
    score: normalizeScore(score),
    status: getMetricStatus(score),
    detail:
      hasFormat || hasLimits || hasGrounding
        ? "Çıktı biçimi ve sınırlar tanımlanmış; biraz daha sıkılaştırılabilir."
        : "Biçim, kapsam ve doğrulama sınırları zayıf görünüyor.",
  };
}

function analyzeClarity(prompt: string): PromptMetric {
  const lengthScore = prompt.trim().length > 120 ? 35 : prompt.trim().length > 40 ? 22 : 8;
  const hasGoal = /\b(açıkla|özetle|karşılaştır|iyileştir|çıkar|tasarla|oluştur)\b/i.test(prompt);
  const hasAmbiguity = /\b(bir şeyler|falan|gibi işte|vs\.?|her şeyi)\b/i.test(prompt);
  const score = lengthScore + (hasGoal ? 35 : 12) + (hasAmbiguity ? 0 : 20);

  return {
    label: "Netlik",
    score: normalizeScore(score),
    status: getMetricStatus(score),
    detail: hasAmbiguity
      ? "Amaç var ama bazı muğlak ifadeler temizlenmeli."
      : "İstek yeterince net; hedef fiil ve kapsam anlaşılabiliyor.",
  };
}

function buildSummary(score: number, findings: GuardFinding[]) {
  if (findings.some((finding) => finding.severity === "block")) {
    return "İstekte engellenmesi gereken riskli bir bölüm bulundu. AI çağrısı yerine güvenli yeniden yazım öneriliyor.";
  }

  if (findings.some((finding) => finding.severity === "warning")) {
    return score >= 70
      ? "Prompt genel olarak güçlü, ancak doğruluk riski taşıyan bir alan var."
      : "Prompt geliştirilebilir ve bazı doğruluk riskleri dikkat istiyor.";
  }

  if (score >= 80) {
    return "Prompt yapısı güçlü; bağlam ve kısıtlar dengeli görünüyor.";
  }

  if (score >= 60) {
    return "Prompt iyi bir başlangıç yapıyor, fakat kısıtlar ve doğrulama netleştirilebilir.";
  }

  return "Prompt temel niyeti taşıyor ama rol, kısıt ve çıktı beklentisi belirginleşmeli.";
}

export function analyzePrompt(prompt: string): PromptAnalysis {
  const trimmed = prompt.trim();

  if (!trimmed) {
    return {
      score: 0,
      summary: "Analiz başlatmak için prompt gir.",
      metrics: [
        {
          label: "Bağlam",
          score: 0,
          status: "weak",
          detail: "Henüz analiz edilecek içerik yok.",
        },
        {
          label: "Kısıtlar",
          score: 0,
          status: "weak",
          detail: "Henüz analiz edilecek içerik yok.",
        },
        {
          label: "Netlik",
          score: 0,
          status: "weak",
          detail: "Henüz analiz edilecek içerik yok.",
        },
      ],
      findings: [],
      blocked: false,
      safeRewrite: safeFallbackPrompt,
    };
  }

  const findings = guardRules
    .filter((rule) => rule.pattern.test(trimmed))
    .map<GuardFinding>(({ id, severity, title, description, suggestion }) => ({
      id,
      severity,
      title,
      description,
      suggestion,
    }));

  const metrics = [
    analyzeContext(trimmed),
    analyzeConstraints(trimmed),
    analyzeClarity(trimmed),
  ];

  let score =
    metrics.reduce((total, metric) => total + metric.score, 0) / Math.max(metrics.length, 1);

  if (findings.some((finding) => finding.severity === "warning")) {
    score -= 12;
  }

  if (findings.some((finding) => finding.severity === "block")) {
    score -= 28;
  }

  const normalizedScore = normalizeScore(score);
  const blocked = findings.some((finding) => finding.severity === "block");

  return {
    score: normalizedScore,
    summary: buildSummary(normalizedScore, findings),
    metrics,
    findings,
    blocked,
    safeRewrite: blocked
      ? `${safeFallbackPrompt}\n\nKullanıcının isteği:\n${trimmed}`
      : trimmed,
  };
}
