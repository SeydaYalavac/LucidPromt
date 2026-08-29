import guideState from "./evergreen-guide-state.json";
import type { Trend } from "@/types/trends";

export type GuideLocale = "en" | "tr";
export type GuideText = Record<GuideLocale, string>;
export type EvergreenGuideSlug = "ai-agents" | "ai-chips-infrastructure" | "ai-governance";

export type EvergreenGuideSource = {
  id: string;
  title: string;
  publisher: string;
  url: string;
  monitorUrl?: string;
};

export type EvergreenGuideSection = {
  id: string;
  category: GuideText;
  title: GuideText;
  summary: GuideText;
  mechanism: GuideText;
  evaluate: GuideText;
  decision: GuideText;
  limits: GuideText;
  sequence: GuideText;
  sourceIds: string[];
};

export type EvergreenGuide = {
  slug: EvergreenGuideSlug;
  title: GuideText;
  kicker: GuideText;
  description: GuideText;
  promise: GuideText;
  audience: GuideText;
  answerQuestion: GuideText;
  directAnswer: GuideText;
  disclaimer: GuideText;
  answerSourceIds: string[];
  sourceIds: string[];
  sections: EvergreenGuideSection[];
};

export const evergreenGuideSources: EvergreenGuideSource[] = [
  { id: "anthropic-agents", title: "Building effective agents", publisher: "Anthropic", url: "https://www.anthropic.com/engineering/building-effective-agents" },
  { id: "anthropic-trust", title: "Trustworthy agents in practice", publisher: "Anthropic", url: "https://www.anthropic.com/research/trustworthy-agents" },
  { id: "nist-agent-rfi", title: "Security considerations for AI agents: response summary", publisher: "NIST", url: "https://www.nist.gov/publications/summary-analysis-responses-request-information-regarding-security-considerations-ai" },
  { id: "mcp-architecture", title: "Model Context Protocol architecture", publisher: "Model Context Protocol", url: "https://modelcontextprotocol.io/specification/2025-06-18/architecture" },
  { id: "owasp-agency", title: "LLM06:2025 Excessive Agency", publisher: "OWASP Gen AI Security Project", url: "https://genai.owasp.org/llmrisk/llm062025-excessive-agency/" },
  { id: "nist-genai", title: "Generative AI Profile", publisher: "NIST", url: "https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.600-1.pdf" },
  { id: "google-tpu", title: "Cloud TPU system architecture", publisher: "Google Cloud", url: "https://docs.cloud.google.com/tpu/docs/system-architecture-tpu-vm?hl=en" },
  { id: "nvidia-dc", title: "Data center architecture", publisher: "NVIDIA", url: "https://docs.nvidia.com/dsx/ncp/software-reference-guide/data-center-architecture" },
  { id: "doe-data-centers", title: "2024 U.S. Data Center Energy Usage Report release", publisher: "U.S. Department of Energy", url: "https://www.energy.gov/articles/doe-releases-new-report-evaluating-increase-electricity-demand-data-centers" },
  { id: "doe-powering-ai", title: "Powering AI and Data Center Infrastructure", publisher: "U.S. Department of Energy", url: "https://www.energy.gov/sites/default/files/2024-08/Powering%20AI%20and%20Data%20Center%20Infrastructure%20Recommendations%20July%202024.pdf" },
  { id: "bis-chips", title: "AI chip counter-diversion guidance", publisher: "U.S. Bureau of Industry and Security", url: "https://www.bis.gov/media/documents/ai-counter-diversion-industry-guidance-may-13-2025.pdf" },
  { id: "eu-timeline", title: "EU AI Act implementation timeline", publisher: "European Commission AI Act Service Desk", url: "https://ai-act-service-desk.ec.europa.eu/en/ai-act/eu-ai-act-implementation-timeline" },
  { id: "eu-enforcement", title: "When does EU AI Act enforcement start?", publisher: "European Commission AI Act Service Desk", url: "https://ai-act-service-desk.ec.europa.eu/en/ai-act/faq/when-does-enforcement-start" },
  { id: "nist-rmf", title: "AI Risk Management Framework", publisher: "NIST", url: "https://www.nist.gov/itl/ai-risk-management-framework" },
  { id: "oecd-principles", title: "OECD AI Principles", publisher: "OECD.AI", url: "https://oecd.ai/en/ai-principles" },
];

export const evergreenSourceById = new Map(evergreenGuideSources.map((source) => [source.id, source]));

const agents: EvergreenGuide = {
  slug: "ai-agents",
  kicker: { en: "Systems field guide", tr: "Sistem saha rehberi" },
  title: { en: "AI agents: architecture, controls and evaluation", tr: "Yapay zeka ajanları: mimari, kontroller ve değerlendirme" },
  description: {
    en: "A source-linked guide to agent loops, tools, memory, permissions, evaluation and production controls.",
    tr: "Ajan döngüleri, araçlar, bellek, yetkiler, değerlendirme ve üretim kontrolleri için kaynak bağlantılı rehber.",
  },
  promise: {
    en: "Start with the smallest workflow that works. Add autonomy only when tests prove it improves the task.",
    tr: "İşe yarayan en küçük iş akışıyla başlayın. Özerkliği yalnızca testler görevi iyileştirdiğini kanıtladığında ekleyin.",
  },
  audience: {
    en: "For product, engineering and operations teams deciding when and how to deploy an AI agent.",
    tr: "Bir yapay zeka ajanını ne zaman ve nasıl devreye alacağına karar veren ürün, mühendislik ve operasyon ekipleri için.",
  },
  answerQuestion: { en: "What is an AI agent, and when should a team use one?", tr: "Yapay zeka ajanı nedir ve ekip ne zaman kullanmalıdır?" },
  directAnswer: {
    en: "An AI agent is a model-led system that selects actions, uses tools, observes results and continues until it reaches a stop condition. Use one when a task needs flexible multi-step decisions that fixed code cannot express well. Keep a deterministic workflow when the steps are known, repeatable and high risk. Give every agent narrow tools, scoped credentials, hard budgets, complete logs and a human approval gate for consequential actions.",
    tr: "Yapay zeka ajanı; eylem seçen, araç kullanan, sonucu gözleyen ve durma koşuluna kadar devam eden model yönlendirmeli bir sistemdir. Sabit kodun iyi ifade edemediği esnek, çok adımlı kararlar gerektiğinde kullanın. Adımlar biliniyor, tekrarlanıyor ve yüksek risk taşıyorsa deterministik iş akışını koruyun. Her ajana dar araçlar, kapsamlı kimlik bilgileri, kesin bütçeler, eksiksiz kayıtlar ve önemli eylemler için insan onayı verin.",
  },
  disclaimer: {
    en: "This guide explains system design. It does not prove that any model or agent is safe for a specific use.",
    tr: "Bu rehber sistem tasarımını açıklar. Herhangi bir modelin veya ajanın belirli bir kullanım için güvenli olduğunu kanıtlamaz.",
  },
  answerSourceIds: ["anthropic-agents", "nist-agent-rfi", "owasp-agency"],
  sourceIds: ["anthropic-agents", "anthropic-trust", "nist-agent-rfi", "mcp-architecture", "owasp-agency", "nist-genai"],
  sections: [
    {
      id: "workflow-or-agent", category: { en: "Decision", tr: "Karar" }, title: { en: "Choose a workflow before an agent", tr: "Ajandan önce iş akışını seçin" },
      summary: {
        en: "A workflow follows a defined code path. An agent lets a model choose the path and tools. That extra freedom can solve variable tasks, but it also adds cost, latency and failure modes.",
        tr: "İş akışı tanımlı bir kod yolunu izler. Ajan, yolu ve araçları modelin seçmesine izin verir. Bu ek özgürlük değişken görevleri çözebilir, fakat maliyet, gecikme ve hata yolları ekler.",
      },
      mechanism: {
        en: "Begin with one model call plus retrieval or a single tool. Add routing, parallel work or evaluator loops only when a measured error requires them. Move to open-ended planning only when fixed orchestration cannot handle the task variation.",
        tr: "Bir model çağrısı ile bilgi getirme veya tek araçla başlayın. Yönlendirme, paralel çalışma ya da değerlendirici döngülerini yalnızca ölçülen bir hata gerektirdiğinde ekleyin. Açık uçlu planlamaya ancak sabit orkestrasyon görev değişimini karşılayamadığında geçin.",
      },
      evaluate: {
        en: "Build a representative task set before increasing autonomy. Compare completion quality, tool errors, human corrections, time and cost against the simpler workflow. Include ambiguous requests, missing data and tool failures, not only ideal cases.",
        tr: "Özerkliği artırmadan önce temsili bir görev seti oluşturun. Tamamlama kalitesini, araç hatalarını, insan düzeltmelerini, süreyi ve maliyeti daha basit iş akışıyla karşılaştırın. Yalnızca ideal durumları değil, belirsiz istekleri, eksik veriyi ve araç hatalarını da ekleyin.",
      },
      decision: {
        en: "Use the least autonomous design that meets the success threshold. Reject an agent design when its extra steps do not create a repeatable gain. A fluent trace is not evidence; task outcomes are the evidence.",
        tr: "Başarı eşiğini karşılayan en az özerk tasarımı kullanın. Ek adımlar tekrarlanabilir bir kazanç yaratmıyorsa ajan tasarımını reddedin. Akıcı bir işlem kaydı kanıt değildir; görev sonuçları kanıttır.",
      },
      limits: {
        en: "Benchmarks can hide production complexity. Real users omit context, connected systems change, and long tasks accumulate small errors. Recheck the decision after tool, model or task-distribution changes.",
        tr: "Karşılaştırmalar üretim karmaşıklığını gizleyebilir. Gerçek kullanıcılar bağlamı atlar, bağlı sistemler değişir ve uzun görevler küçük hataları biriktirir. Araç, model veya görev dağılımı değişince kararı yeniden kontrol edin.",
      },
      sequence: {
        en: "Write the outcome and risk limits. Ship the simplest workflow. Measure failures. Add one capability. Rerun the same task set. Keep the change only if the gain survives review.",
        tr: "Sonucu ve risk sınırlarını yazın. En basit iş akışını yayınlayın. Hataları ölçün. Bir yetenek ekleyin. Aynı görev setini yeniden çalıştırın. Değişikliği yalnızca kazanç incelemeden geçerse koruyun.",
      }, sourceIds: ["anthropic-agents", "anthropic-trust"],
    },
    {
      id: "agent-loop", category: { en: "Architecture", tr: "Mimari" }, title: { en: "Make the agent loop explicit", tr: "Ajan döngüsünü açık hale getirin" },
      summary: {
        en: "An agent loop receives a goal, inspects context, proposes an action, calls a tool, observes the result and decides whether to continue. Production safety depends on the code around that loop.",
        tr: "Ajan döngüsü bir hedef alır, bağlamı inceler, eylem önerir, araç çağırır, sonucu gözler ve devam edip etmeyeceğine karar verir. Üretim güvenliği bu döngünün çevresindeki koda bağlıdır.",
      },
      mechanism: {
        en: "Keep planning, tool execution and stopping as separate interfaces. The model may propose the next action, but deterministic code should validate the schema, user scope, tool permission, resource target and remaining budget before execution.",
        tr: "Planlama, araç çalıştırma ve durmayı ayrı arayüzler olarak tutun. Model sonraki eylemi önerebilir, fakat deterministik kod çalıştırmadan önce şemayı, kullanıcı kapsamını, araç yetkisini, kaynak hedefini ve kalan bütçeyi doğrulamalıdır.",
      },
      evaluate: {
        en: "Record each observation, proposal, validation result, tool response and stop reason with stable identifiers. Test whether the loop stops on success, repeated failure, low confidence, missing access, user cancellation and exhausted limits.",
        tr: "Her gözlemi, öneriyi, doğrulama sonucunu, araç yanıtını ve durma nedenini sabit tanımlayıcılarla kaydedin. Döngünün başarıda, tekrarlanan hatada, düşük güvende, eksik erişimde, kullanıcı iptalinde ve tükenen sınırlarda durduğunu test edin.",
      },
      decision: {
        en: "Do not let natural-language instructions serve as the only stop condition. Use hard limits for steps, time, tokens, spend and retries. Return a partial result with a clear state when a limit ends the run.",
        tr: "Doğal dil talimatlarının tek durma koşulu olmasına izin vermeyin. Adım, süre, token, harcama ve yeniden deneme için kesin sınırlar kullanın. Bir sınır çalışmayı bitirdiğinde açık durum içeren kısmi sonuç döndürün.",
      },
      limits: {
        en: "A complete trace supports diagnosis, but it does not make a harmful action reversible. Place prevention before execution and use logs to improve tests, policy and recovery.",
        tr: "Eksiksiz işlem kaydı teşhisi destekler, fakat zararlı eylemi geri alınabilir yapmaz. Önlemeyi çalıştırmadan önce uygulayın ve kayıtları testleri, politikayı ve kurtarmayı iyileştirmek için kullanın.",
      },
      sequence: {
        en: "Parse the goal. Load only allowed context. Ask for one structured action. Validate it. Execute through a narrow adapter. Store the observation. Stop, continue or escalate by explicit rule.",
        tr: "Hedefi ayrıştırın. Yalnızca izin verilen bağlamı yükleyin. Tek bir yapılandırılmış eylem isteyin. Doğrulayın. Dar bir bağdaştırıcıyla çalıştırın. Gözlemi saklayın. Açık kuralla durun, devam edin veya aktarın.",
      }, sourceIds: ["anthropic-agents", "nist-agent-rfi", "owasp-agency"],
    },
    {
      id: "tools-and-context", category: { en: "Interfaces", tr: "Arayüzler" }, title: { en: "Treat tools and context as security boundaries", tr: "Araçları ve bağlamı güvenlik sınırı sayın" },
      summary: {
        en: "Tools turn model output into real effects. Context systems expose data and capabilities. A useful interface therefore needs clear ownership, narrow inputs, typed outputs and an authorization check outside the model.",
        tr: "Araçlar model çıktısını gerçek etkilere dönüştürür. Bağlam sistemleri veri ve yetenek sunar. Bu nedenle yararlı arayüz açık sahiplik, dar girdiler, türü belirli çıktılar ve model dışında yetki kontrolü gerektirir.",
      },
      mechanism: {
        en: "Model Context Protocol separates hosts, clients and servers, but protocol separation is not permission by itself. The host application must decide which server, data and operation a user may access for each request.",
        tr: "Model Context Protocol ana bilgisayarları, istemcileri ve sunucuları ayırır, fakat protokol ayrımı tek başına yetki değildir. Ana uygulama her istek için kullanıcının hangi sunucuya, veriye ve işleme erişebileceğine karar vermelidir.",
      },
      evaluate: {
        en: "Test tools with malformed fields, injected instructions, stale identifiers, cross-tenant targets, oversized results and delayed responses. Confirm that validation fails closed and that the model never receives secrets it does not need.",
        tr: "Araçları hatalı alanlar, enjekte edilmiş talimatlar, eski tanımlayıcılar, kiracılar arası hedefler, aşırı büyük sonuçlar ve geciken yanıtlarla test edin. Doğrulamanın kapalı hata verdiğini ve modelin gerekmeyen sırları almadığını doğrulayın.",
      },
      decision: {
        en: "Prefer small, purpose-built tools over broad shell, browser or database access. Give read and write operations separate tools. Require a fresh authorization decision for every write, even when an earlier read succeeded.",
        tr: "Geniş kabuk, tarayıcı veya veri tabanı erişimi yerine küçük, amaca özel araçları seçin. Okuma ve yazma işlemlerine ayrı araçlar verin. Önceki okuma başarılı olsa bile her yazma için yeni yetki kararı isteyin.",
      },
      limits: {
        en: "A correct schema cannot prove that an action is appropriate. Business rules, legal duties and user intent still need separate checks. Third-party servers can also change after integration.",
        tr: "Doğru şema bir eylemin uygun olduğunu kanıtlayamaz. İş kuralları, yasal görevler ve kullanıcı niyeti ayrı kontroller gerektirir. Üçüncü taraf sunucular entegrasyondan sonra da değişebilir.",
      },
      sequence: {
        en: "Inventory capabilities. Split read from write. Define schemas and size limits. Bind access to the current user and resource. Validate every call. Sanitize results. Revoke unused connections.",
        tr: "Yetenekleri envanterleyin. Okumayı yazmadan ayırın. Şemaları ve boyut sınırlarını tanımlayın. Erişimi mevcut kullanıcıya ve kaynağa bağlayın. Her çağrıyı doğrulayın. Sonuçları temizleyin. Kullanılmayan bağlantıları iptal edin.",
      }, sourceIds: ["mcp-architecture", "nist-agent-rfi", "owasp-agency"],
    },
    {
      id: "memory", category: { en: "State", tr: "Durum" }, title: { en: "Design memory as governed data", tr: "Belleği yönetilen veri olarak tasarlayın" },
      summary: {
        en: "Agent memory can include the current task, prior observations, user preferences and retrieved records. More memory can improve continuity, but irrelevant or unsafe memory can redirect later decisions.",
        tr: "Ajan belleği mevcut görevi, önceki gözlemleri, kullanıcı tercihlerini ve getirilen kayıtları içerebilir. Daha fazla bellek sürekliliği iyileştirebilir, fakat ilgisiz veya güvensiz bellek sonraki kararları yönlendirebilir.",
      },
      mechanism: {
        en: "Separate short-lived task state from durable user or organization memory. Store structured facts with source, owner, creation time, sensitivity and expiry. Let retrieval select a small relevant set instead of replaying every prior message.",
        tr: "Kısa ömürlü görev durumunu kalıcı kullanıcı veya kurum belleğinden ayırın. Yapılandırılmış gerçekleri kaynak, sahip, oluşturma zamanı, hassasiyet ve son kullanımla saklayın. Her önceki iletiyi yinelemek yerine bilgi getirmenin küçük, ilgili bir set seçmesini sağlayın.",
      },
      evaluate: {
        en: "Test whether one user can affect another user, whether deleted facts return, whether stale preferences override new instructions and whether untrusted retrieved text can become a durable instruction. Inspect both writes and reads.",
        tr: "Bir kullanıcının diğerini etkileyip etkilemediğini, silinen gerçeklerin dönüp dönmediğini, eski tercihlerin yeni talimatları geçersiz kılıp kılmadığını ve güvenilmeyen metnin kalıcı talimata dönüşüp dönüşmediğini test edin. Hem yazmaları hem okumaları inceleyin.",
      },
      decision: {
        en: "Store only information with a defined future use and retention rule. Require higher assurance before saving sensitive facts or instructions. Give users a way to inspect, correct and delete durable memory.",
        tr: "Yalnızca tanımlı gelecek kullanımı ve saklama kuralı olan bilgiyi depolayın. Hassas gerçekleri veya talimatları kaydetmeden önce daha yüksek güvence isteyin. Kullanıcılara kalıcı belleği inceleme, düzeltme ve silme yolu verin.",
      },
      limits: {
        en: "Retrieval quality and access control reduce risk, but neither guarantees relevance or truth. Memory should support a decision, not silently decide policy, identity or permission.",
        tr: "Bilgi getirme kalitesi ve erişim kontrolü riski azaltır, fakat hiçbiri ilgiyi veya doğruluğu garanti etmez. Bellek kararı desteklemeli; politikaya, kimliğe veya yetkiye sessizce karar vermemelidir.",
      },
      sequence: {
        en: "Classify the candidate fact. Check consent and purpose. Attach provenance and expiry. Store it in the correct scope. Filter retrieval by identity. Log use. Honor correction and deletion.",
        tr: "Aday gerçeği sınıflandırın. Onayı ve amacı kontrol edin. Köken ve son kullanım ekleyin. Doğru kapsamda saklayın. Bilgi getirmeyi kimliğe göre filtreleyin. Kullanımı kaydedin. Düzeltme ve silmeyi uygulayın.",
      }, sourceIds: ["nist-agent-rfi", "nist-genai", "anthropic-trust"],
    },
    {
      id: "permissions", category: { en: "Control", tr: "Kontrol" }, title: { en: "Bound permissions and consequential actions", tr: "Yetkileri ve önemli eylemleri sınırlayın" },
      summary: {
        en: "Excessive agency appears when a model can perform more actions than the task requires, with more permission or less supervision than the impact justifies. The control must sit outside the model.",
        tr: "Aşırı özerklik, model görevden daha fazla eylem yapabildiğinde, etkinin hak ettiğinden daha geniş yetki veya daha az denetim kullandığında ortaya çıkar. Kontrol model dışında olmalıdır.",
      },
      mechanism: {
        en: "Use short-lived credentials scoped to one user, tenant, tool and resource set. Separate proposal from execution. For high-impact actions, show the exact target and effect, then require a person or policy engine to approve.",
        tr: "Tek kullanıcı, kiracı, araç ve kaynak setiyle sınırlı kısa ömürlü kimlik bilgileri kullanın. Öneriyi çalıştırmadan ayırın. Yüksek etkili eylemlerde kesin hedefi ve etkiyi gösterin, sonra insan veya politika motoru onayı isteyin.",
      },
      evaluate: {
        en: "Try indirect prompt injection, confused-user requests, duplicate actions, changed targets and partial tool failures. Verify that the agent cannot expand its own role, reuse stale approval or hide a different action behind friendly wording.",
        tr: "Dolaylı prompt enjeksiyonunu, karışık kullanıcı isteklerini, yinelenen eylemleri, değişen hedefleri ve kısmi araç hatalarını deneyin. Ajanın kendi rolünü genişletemediğini, eski onayı kullanamadığını veya farklı eylemi dostça ifadeyle gizleyemediğini doğrulayın.",
      },
      decision: {
        en: "Require approval when an action is external, irreversible, costly, privacy-sensitive or difficult to verify. For lower-risk actions, use allowlists, transaction limits, idempotency keys and reversible staging before automatic execution.",
        tr: "Eylem harici, geri döndürülemez, maliyetli, gizlilik açısından hassas veya doğrulaması zorsa onay isteyin. Düşük riskli eylemlerde otomatik çalıştırmadan önce izin listeleri, işlem sınırları, tekillik anahtarları ve geri alınabilir hazırlık kullanın.",
      },
      limits: {
        en: "Human approval can become a ritual when reviewers lack context or face too many prompts. Approval screens must state the effect plainly and remain rare enough to receive attention.",
        tr: "İnceleyenler bağlamdan yoksunsa veya çok fazla istem alıyorsa insan onayı bir ritüele dönüşebilir. Onay ekranları etkiyi açıkça belirtmeli ve dikkat çekecek kadar seyrek kalmalıdır.",
      },
      sequence: {
        en: "Classify impact. Resolve current identity. Calculate allowed scope. Produce a preview. Ask for approval when required. Execute once. Confirm the result. Preserve a clear rollback or incident path.",
        tr: "Etkiyi sınıflandırın. Mevcut kimliği çözün. İzin verilen kapsamı hesaplayın. Önizleme üretin. Gerektiğinde onay isteyin. Bir kez çalıştırın. Sonucu doğrulayın. Açık geri alma veya olay yolu koruyun.",
      }, sourceIds: ["owasp-agency", "nist-agent-rfi", "anthropic-trust"],
    },
    {
      id: "evaluation", category: { en: "Operations", tr: "Operasyon" }, title: { en: "Evaluate outcomes, traces and recovery", tr: "Sonuçları, işlem kayıtlarını ve kurtarmayı değerlendirin" },
      summary: {
        en: "Agent evaluation must cover the final result and the path taken. A correct answer can still use a forbidden tool, leak data, waste resources or leave a system in an unsafe state.",
        tr: "Ajan değerlendirmesi son sonucu ve izlenen yolu kapsamalıdır. Doğru yanıt yine de yasak araç kullanabilir, veri sızdırabilir, kaynak harcayabilir veya sistemi güvensiz durumda bırakabilir.",
      },
      mechanism: {
        en: "Score task completion, evidence quality, policy compliance, tool accuracy, step count, latency, cost and recovery. Keep deterministic assertions for hard rules. Use human or model review only for qualities that cannot be checked directly.",
        tr: "Görev tamamlamayı, kanıt kalitesini, politika uyumunu, araç doğruluğunu, adım sayısını, gecikmeyi, maliyeti ve kurtarmayı puanlayın. Kesin kurallar için deterministik kontroller tutun. İnsan veya model incelemesini yalnızca doğrudan kontrol edilemeyen özelliklerde kullanın.",
      },
      evaluate: {
        en: "Run offline cases before release, then monitor sampled production traces and outcome metrics. Add every confirmed incident and difficult human correction to the regression set. Test model, prompt and tool changes against the same baseline.",
        tr: "Yayın öncesinde çevrimdışı vakaları çalıştırın, sonra örneklenen üretim kayıtlarını ve sonuç ölçülerini izleyin. Her doğrulanmış olayı ve zor insan düzeltmesini gerileme setine ekleyin. Model, prompt ve araç değişikliklerini aynı temel çizgiye karşı test edin.",
      },
      decision: {
        en: "Set release thresholds by impact. A low-risk research helper may tolerate recoverable misses. An agent that changes records or contacts people needs stricter policy, accuracy and recovery evidence before expansion.",
        tr: "Yayın eşiklerini etkiye göre belirleyin. Düşük riskli araştırma yardımcısı geri alınabilir hataları tolere edebilir. Kayıt değiştiren veya insanlarla iletişim kuran ajan genişlemeden önce daha sıkı politika, doğruluk ve kurtarma kanıtı gerektirir.",
      },
      limits: {
        en: "No finite test set proves universal reliability. Production distributions shift and evaluators have blind spots. Keep exposure bounded, monitor leading indicators and preserve a fast way to disable tools or the whole loop.",
        tr: "Hiçbir sonlu test seti evrensel güvenilirliği kanıtlamaz. Üretim dağılımları değişir ve değerlendiricilerin kör noktaları vardır. Maruziyeti sınırlayın, öncü göstergeleri izleyin ve araçları veya tüm döngüyü hızla kapatma yolu koruyun.",
      },
      sequence: {
        en: "Define success and forbidden outcomes. Build cases from real work. Add trace assertions. Run the baseline. Release to a small scope. Review failures. Expand only after stable results and tested recovery.",
        tr: "Başarıyı ve yasak sonuçları tanımlayın. Gerçek işten vakalar oluşturun. İşlem kaydı kontrolleri ekleyin. Temel testi çalıştırın. Küçük kapsamda yayınlayın. Hataları inceleyin. Yalnızca kararlı sonuçlar ve test edilmiş kurtarmadan sonra genişletin.",
      }, sourceIds: ["anthropic-trust", "nist-agent-rfi", "nist-genai"],
    },
  ],
};

const chips: EvergreenGuide = {
  slug: "ai-chips-infrastructure",
  kicker: { en: "Infrastructure field guide", tr: "Altyapı saha rehberi" },
  title: { en: "AI chips and infrastructure: a systems guide", tr: "Yapay zeka çipleri ve altyapısı: sistem rehberi" },
  description: {
    en: "A source-linked guide to accelerators, memory, networks, clusters, power, cooling, supply and procurement.",
    tr: "Hızlandırıcılar, bellek, ağlar, kümeler, enerji, soğutma, tedarik ve satın alma için kaynak bağlantılı rehber.",
  },
  promise: {
    en: "Evaluate the full workload path. A fast chip cannot compensate for weak memory, networking, power or software.",
    tr: "Tüm iş yükü yolunu değerlendirin. Hızlı çip; zayıf bellek, ağ, enerji veya yazılımı telafi edemez.",
  },
  audience: {
    en: "For teams comparing AI compute options, planning capacity or interpreting infrastructure news.",
    tr: "Yapay zeka işlem seçeneklerini karşılaştıran, kapasite planlayan veya altyapı haberlerini yorumlayan ekipler için.",
  },
  answerQuestion: { en: "What matters most when evaluating AI chips and infrastructure?", tr: "Yapay zeka çipleri ve altyapısını değerlendirirken en önemli unsurlar nelerdir?" },
  directAnswer: {
    en: "Start with the workload, not the chip name. Measure model size, precision, sequence length, batch pattern, latency target, throughput target and data movement. Then test the complete system: accelerator, high-bandwidth memory, host, network, storage, compiler, serving software, power and cooling. Compare delivered results per unit of time, cost and energy on your own workload. Include capacity, export limits, supply concentration and migration cost before a procurement decision.",
    tr: "Çip adıyla değil, iş yüküyle başlayın. Model boyutunu, hassasiyeti, dizi uzunluğunu, toplu iş modelini, gecikme hedefini, verim hedefini ve veri hareketini ölçün. Sonra hızlandırıcı, yüksek bant genişlikli bellek, ana bilgisayar, ağ, depolama, derleyici, sunum yazılımı, enerji ve soğutma dahil tüm sistemi test edin. Kendi iş yükünüzde süre, maliyet ve enerji başına teslim edilen sonucu karşılaştırın. Satın alma kararından önce kapasiteyi, ihracat sınırlarını, tedarik yoğunlaşmasını ve geçiş maliyetini ekleyin.",
  },
  disclaimer: {
    en: "Vendor documents explain vendor architectures. They are not independent proof of price, performance, availability or fitness for your workload.",
    tr: "Üretici belgeleri üretici mimarilerini açıklar. Fiyat, performans, bulunabilirlik veya iş yükünüze uygunluk için bağımsız kanıt değildir.",
  },
  answerSourceIds: ["google-tpu", "nvidia-dc", "doe-data-centers"],
  sourceIds: ["google-tpu", "nvidia-dc", "doe-data-centers", "doe-powering-ai", "bis-chips"],
  sections: [
    {
      id: "workload", category: { en: "Requirements", tr: "Gereksinimler" }, title: { en: "Translate the workload into system needs", tr: "İş yükünü sistem ihtiyaçlarına çevirin" },
      summary: {
        en: "Training, fine-tuning and inference stress different parts of a system. Even within inference, interactive requests and large offline batches can need different latency, memory and scheduling choices.",
        tr: "Eğitim, ince ayar ve çıkarım sistemin farklı bölümlerini zorlar. Çıkarım içinde bile etkileşimli istekler ve büyük çevrimdışı toplu işler farklı gecikme, bellek ve zamanlama seçenekleri gerektirebilir.",
      },
      mechanism: {
        en: "Write a workload profile before comparing hardware. Include model architecture and size, numeric precision, context and output lengths, batch shape, concurrency, arrival pattern, service-level target, uptime and data location.",
        tr: "Donanımı karşılaştırmadan önce iş yükü profili yazın. Model mimarisi ve boyutu, sayısal hassasiyet, bağlam ve çıktı uzunlukları, toplu iş şekli, eş zamanlılık, varış modeli, hizmet hedefi, çalışma süresi ve veri konumunu ekleyin.",
      },
      evaluate: {
        en: "Use representative prompts, model weights and serving settings. Measure time to first token, output rate, end-to-end throughput, memory headroom, queue time, error rate and utilization. Repeat long enough to include thermal and scheduling effects.",
        tr: "Temsili promptlar, model ağırlıkları ve sunum ayarları kullanın. İlk token süresini, çıktı hızını, uçtan uca verimi, bellek payını, sıra süresini, hata oranını ve kullanımı ölçün. Isı ve zamanlama etkilerini kapsayacak kadar uzun tekrarlayın.",
      },
      decision: {
        en: "Reject headline peak performance as a procurement metric. Select the system that meets the service target with acceptable cost, energy, availability and operational effort. Keep test settings and assumptions beside every result.",
        tr: "Başlıktaki en yüksek performansı satın alma ölçütü olarak reddedin. Hizmet hedefini kabul edilebilir maliyet, enerji, bulunabilirlik ve operasyon yüküyle karşılayan sistemi seçin. Test ayarlarını ve varsayımları her sonucun yanında tutun.",
      },
      limits: {
        en: "A benchmark can answer only the configuration it tests. Software versions, quantization, sequence mix and utilization can reverse a ranking. Re-run when the model or serving stack changes.",
        tr: "Bir karşılaştırma yalnızca test ettiği yapılandırmayı yanıtlayabilir. Yazılım sürümleri, nicemleme, dizi karışımı ve kullanım sıralamayı tersine çevirebilir. Model veya sunum yığını değişince yeniden çalıştırın.",
      },
      sequence: {
        en: "Define the service target. Capture real request shapes. Choose representative models. Fix test settings. Measure the complete path. Calculate delivered work per cost and energy. Record uncertainty.",
        tr: "Hizmet hedefini tanımlayın. Gerçek istek şekillerini yakalayın. Temsili modeller seçin. Test ayarlarını sabitleyin. Tüm yolu ölçün. Maliyet ve enerji başına teslim edilen işi hesaplayın. Belirsizliği kaydedin.",
      }, sourceIds: ["google-tpu", "nvidia-dc"],
    },
    {
      id: "accelerator-memory", category: { en: "Compute", tr: "İşlem" }, title: { en: "Read the accelerator and memory together", tr: "Hızlandırıcıyı ve belleği birlikte okuyun" },
      summary: {
        en: "AI accelerators contain specialized compute units, local memory and interconnects. Useful performance depends on how quickly the workload can feed those units with model weights, activations and intermediate results.",
        tr: "Yapay zeka hızlandırıcıları özel işlem birimleri, yerel bellek ve bağlantılar içerir. Yararlı performans, iş yükünün bu birimleri model ağırlıkları, etkinleştirmeler ve ara sonuçlarla ne kadar hızlı beslediğine bağlıdır.",
      },
      mechanism: {
        en: "Capacity determines what fits on one device. Bandwidth affects how fast local data moves. Inter-device links move tensors when a model or batch spans devices. Numeric formats change memory use, speed and sometimes output quality.",
        tr: "Kapasite tek cihaza neyin sığacağını belirler. Bant genişliği yerel verinin ne kadar hızlı hareket ettiğini etkiler. Cihazlar arası bağlantılar model veya toplu iş birden çok cihaza yayıldığında tensörleri taşır. Sayısal biçimler bellek kullanımını, hızı ve bazen çıktı kalitesini değiştirir.",
      },
      evaluate: {
        en: "Inspect memory capacity, sustained bandwidth, supported formats, compiler behavior and collective communication on the target model. Track out-of-memory failures, data-transfer stalls and how performance changes as device count grows.",
        tr: "Hedef modelde bellek kapasitesini, sürekli bant genişliğini, desteklenen biçimleri, derleyici davranışını ve toplu iletişimi inceleyin. Bellek yetersizliği hatalarını, veri aktarımı beklemelerini ve cihaz sayısı büyüdükçe performans değişimini izleyin.",
      },
      decision: {
        en: "Favor the smallest device set that fits the workload with safe headroom and meets the target. Additional devices add aggregate resources, but they can also add communication, scheduling and failure overhead.",
        tr: "İş yükünü güvenli payla barındıran ve hedefi karşılayan en küçük cihaz setini seçin. Ek cihazlar toplam kaynak ekler, fakat iletişim, zamanlama ve hata yükü de ekleyebilir.",
      },
      limits: {
        en: "Vendor diagrams describe intended architecture, not sustained production results. Published specifications can omit workload-specific bottlenecks. Confirm important claims with your own measurements and an explicit software version.",
        tr: "Üretici şemaları sürekli üretim sonuçlarını değil, amaçlanan mimariyi açıklar. Yayınlanan özellikler iş yüküne özgü darboğazları atlayabilir. Önemli iddiaları kendi ölçümleriniz ve açık yazılım sürümüyle doğrulayın.",
      },
      sequence: {
        en: "Estimate model and runtime memory. Select supported precision. Test one device. Add devices only when needed. Measure communication share. Check quality changes. Keep capacity and performance margins.",
        tr: "Model ve çalışma belleğini tahmin edin. Desteklenen hassasiyeti seçin. Bir cihazı test edin. Yalnızca gerektiğinde cihaz ekleyin. İletişim payını ölçün. Kalite değişimini kontrol edin. Kapasite ve performans paylarını koruyun.",
      }, sourceIds: ["google-tpu", "nvidia-dc"],
    },
    {
      id: "cluster", category: { en: "Scale", tr: "Ölçek" }, title: { en: "Treat the cluster as one machine", tr: "Kümeyi tek makine olarak ele alın" },
      summary: {
        en: "Large AI workloads span accelerators, hosts, switches and storage. The slowest repeated path can limit the whole job, while a small component failure can waste work across many devices.",
        tr: "Büyük yapay zeka iş yükleri hızlandırıcılara, ana bilgisayarlara, anahtarlara ve depolamaya yayılır. En yavaş tekrarlanan yol tüm işi sınırlayabilir, küçük bileşen hatası ise birçok cihazdaki işi boşa çıkarabilir.",
      },
      mechanism: {
        en: "Scale-up links connect nearby accelerators with high bandwidth. Scale-out networks connect hosts and racks. Storage and data pipelines must feed the cluster. Schedulers place jobs, reserve resources and recover from faults.",
        tr: "Dikey ölçek bağlantıları yakındaki hızlandırıcıları yüksek bant genişliğiyle bağlar. Yatay ölçek ağları ana bilgisayarları ve rafları bağlar. Depolama ve veri hatları kümeyi beslemelidir. Zamanlayıcılar işleri yerleştirir, kaynak ayırır ve hatalardan kurtarır.",
      },
      evaluate: {
        en: "Measure collective communication, congestion, storage throughput, checkpoint time, job-start delay, failed-device handling and effective utilization. Test under competing jobs, not only an empty cluster. Include recovery time in delivered throughput.",
        tr: "Toplu iletişimi, sıkışmayı, depolama verimini, kontrol noktası süresini, iş başlatma gecikmesini, hatalı cihaz yönetimini ve etkin kullanımı ölçün. Yalnızca boş kümede değil, yarışan işlerle test edin. Kurtarma süresini teslim edilen verime ekleyin.",
      },
      decision: {
        en: "Scale only after locating the current bottleneck. More accelerators do not help when data, network, scheduler or software limits the job. Use staged capacity steps and compare marginal delivered work.",
        tr: "Yalnızca mevcut darboğazı bulduktan sonra ölçekleyin. Veri, ağ, zamanlayıcı veya yazılım işi sınırladığında daha fazla hızlandırıcı yardım etmez. Aşamalı kapasite adımları kullanın ve marjinal teslim edilen işi karşılaştırın.",
      },
      limits: {
        en: "A cluster can show high device utilization while delivering poor user outcomes. Queue time, retries and failed jobs disappear from many device metrics, so connect infrastructure telemetry to workload completion.",
        tr: "Küme yüksek cihaz kullanımı gösterirken zayıf kullanıcı sonuçları verebilir. Sıra süresi, yeniden denemeler ve hatalı işler birçok cihaz ölçüsünde kaybolur. Altyapı telemetrisini iş yükü tamamlamaya bağlayın.",
      },
      sequence: {
        en: "Map the data path. Baseline one node. Scale to a small cluster. Profile communication and storage. Introduce contention and faults. Measure recovery. Expand only when efficiency remains acceptable.",
        tr: "Veri yolunu haritalayın. Bir düğümde temel çizgi oluşturun. Küçük kümeye ölçekleyin. İletişim ve depolamayı profilleyin. Çakışma ve hata ekleyin. Kurtarmayı ölçün. Yalnızca verim kabul edilebilir kaldığında genişletin.",
      }, sourceIds: ["google-tpu", "nvidia-dc"],
    },
    {
      id: "power-cooling", category: { en: "Facilities", tr: "Tesisler" }, title: { en: "Plan power and cooling as compute capacity", tr: "Enerji ve soğutmayı işlem kapasitesi olarak planlayın" },
      summary: {
        en: "Accelerators require electricity, power conversion, heat removal and facility headroom. A site can own available chips yet remain unable to run them at planned density or schedule.",
        tr: "Hızlandırıcılar elektrik, güç dönüşümü, ısı giderme ve tesis payı gerektirir. Bir tesis kullanılabilir çiplere sahip olsa da bunları planlanan yoğunlukta veya zamanda çalıştıramayabilir.",
      },
      mechanism: {
        en: "Facility capacity includes grid connection, substations, backup systems, distribution, racks and cooling. The U.S. Department of Energy reports rapid data-center electricity growth and a wide demand range because equipment shipments and operation vary.",
        tr: "Tesis kapasitesi şebeke bağlantısı, trafo merkezleri, yedek sistemler, dağıtım, raflar ve soğutmayı içerir. ABD Enerji Bakanlığı, ekipman teslimatları ve işletim değiştiği için hızlı veri merkezi elektrik artışı ve geniş talep aralığı bildirir.",
      },
      evaluate: {
        en: "Measure facility power, IT power, utilization, rack density, cooling conditions, water use where relevant and time to add capacity. Stress expected peaks and failures. Separate contracted power from power that can be delivered now.",
        tr: "Tesis gücünü, BT gücünü, kullanımı, raf yoğunluğunu, soğutma koşullarını, ilgiliyse su kullanımını ve kapasite ekleme süresini ölçün. Beklenen zirveleri ve hataları zorlayın. Sözleşmeli gücü bugün teslim edilebilen güçten ayırın.",
      },
      decision: {
        en: "Treat energy and cooling limits as scheduling inputs. Compare location, capacity lead time, reliability, operating cost and resource exposure. Reserve headroom for faults and growth instead of planning at nameplate limits.",
        tr: "Enerji ve soğutma sınırlarını zamanlama girdisi sayın. Konumu, kapasite teslim süresini, güvenilirliği, işletme maliyetini ve kaynak maruziyetini karşılaştırın. Etiket sınırlarında planlama yerine hata ve büyüme için pay ayırın.",
      },
      limits: {
        en: "National demand forecasts do not predict one facility. Local grid, climate, cooling design and utilization matter. Report scenarios as ranges and state which loads include AI versus other data-center work.",
        tr: "Ulusal talep tahminleri tek tesisi öngörmez. Yerel şebeke, iklim, soğutma tasarımı ve kullanım önemlidir. Senaryoları aralık olarak bildirin ve hangi yüklerin yapay zeka ile diğer veri merkezi işini içerdiğini belirtin.",
      },
      sequence: {
        en: "Forecast workload demand. Convert it to IT power ranges. Add facility overhead and resilience. Verify deliverable site capacity. Test thermal limits. Stage expansion. Track energy per completed workload.",
        tr: "İş yükü talebini tahmin edin. BT gücü aralıklarına dönüştürün. Tesis yükünü ve dayanıklılığı ekleyin. Teslim edilebilir tesis kapasitesini doğrulayın. Isı sınırlarını test edin. Genişlemeyi aşamalandırın. Tamamlanan iş yükü başına enerjiyi izleyin.",
      }, sourceIds: ["doe-data-centers", "doe-powering-ai"],
    },
    {
      id: "software", category: { en: "Software", tr: "Yazılım" }, title: { en: "Include the software stack in every comparison", tr: "Her karşılaştırmaya yazılım yığınını ekleyin" },
      summary: {
        en: "Compilers, kernels, collective libraries, model formats, schedulers and serving systems decide how much hardware capability reaches an application. Portability and operator skill can matter as much as a device specification.",
        tr: "Derleyiciler, çekirdekler, toplu kitaplıklar, model biçimleri, zamanlayıcılar ve sunum sistemleri donanım yeteneğinin ne kadarının uygulamaya ulaştığını belirler. Taşınabilirlik ve işletici becerisi cihaz özelliği kadar önemli olabilir.",
      },
      mechanism: {
        en: "A supported operator may run efficiently while an unsupported one falls back or fails. Quantization and compilation can change memory use and latency. Monitoring, debugging and deployment tools determine how quickly teams can recover.",
        tr: "Desteklenen işlem verimli çalışabilirken desteklenmeyen işlem geri dönüş yapabilir veya başarısız olabilir. Nicemleme ve derleme bellek kullanımıyla gecikmeyi değiştirebilir. İzleme, hata ayıklama ve dağıtım araçları ekiplerin ne kadar hızlı kurtaracağını belirler.",
      },
      evaluate: {
        en: "Test installation, model conversion, missing operators, compile time, cold start, observability, upgrades and rollback. Measure performance only after confirming output quality. Use the team that will operate production, not only vendor specialists.",
        tr: "Kurulumu, model dönüştürmeyi, eksik işlemleri, derleme süresini, soğuk başlatmayı, gözlenebilirliği, yükseltmeleri ve geri almayı test edin. Performansı yalnızca çıktı kalitesini doğruladıktan sonra ölçün. Yalnızca üretici uzmanlarını değil, üretimi işletecek ekibi kullanın.",
      },
      decision: {
        en: "Include engineering time, support, lock-in and migration in total cost. Prefer a stack the team can reproduce, monitor and recover. Keep a portable model and data path when dependency risk is material.",
        tr: "Toplam maliyete mühendislik süresini, desteği, bağımlılığı ve geçişi ekleyin. Ekibin yeniden üretebildiği, izleyebildiği ve kurtarabildiği yığını seçin. Bağımlılık riski önemliyse taşınabilir model ve veri yolu tutun.",
      },
      limits: {
        en: "Mature software does not erase hardware constraints, and portable frameworks do not guarantee equal behavior. Validate accuracy, performance and operations on every target before claiming equivalence.",
        tr: "Olgun yazılım donanım sınırlarını silmez ve taşınabilir çerçeveler eşit davranışı garanti etmez. Eşdeğerlik iddiasından önce her hedefte doğruluğu, performansı ve operasyonu doğrulayın.",
      },
      sequence: {
        en: "Choose a real model. Reproduce the environment. Convert and compile. Verify outputs. Load-test serving. Exercise monitoring and rollback. Price operator time. Document the route to another platform.",
        tr: "Gerçek bir model seçin. Ortamı yeniden üretin. Dönüştürün ve derleyin. Çıktıları doğrulayın. Sunumu yük testine alın. İzleme ve geri almayı çalıştırın. İşletici süresini fiyatlayın. Başka platforma geçiş yolunu belgeleyin.",
      }, sourceIds: ["google-tpu", "nvidia-dc"],
    },
    {
      id: "supply", category: { en: "Procurement", tr: "Satın alma" }, title: { en: "Model supply, policy and concentration risk", tr: "Tedarik, politika ve yoğunlaşma riskini modelleyin" },
      summary: {
        en: "AI infrastructure depends on chips, memory, networking, packaging, manufacturing, facilities and cloud capacity. Availability can change through demand, qualification delays, supplier concentration and public policy.",
        tr: "Yapay zeka altyapısı çiplere, belleğe, ağlara, paketlemeye, üretime, tesislere ve bulut kapasitesine bağlıdır. Bulunabilirlik talep, yeterlilik gecikmeleri, tedarikçi yoğunlaşması ve kamu politikasıyla değişebilir.",
      },
      mechanism: {
        en: "Export controls can restrict destinations, end users or transactions. U.S. Bureau of Industry and Security guidance also describes diversion warning signs and due-diligence expectations for advanced computing products.",
        tr: "İhracat kontrolleri hedefleri, son kullanıcıları veya işlemleri sınırlayabilir. ABD Sanayi ve Güvenlik Bürosu rehberliği, gelişmiş işlem ürünleri için saptırma uyarı işaretlerini ve özen beklentilerini de açıklar.",
      },
      evaluate: {
        en: "Map critical suppliers, manufacturing stages, contract terms, allocation rules, geographic exposure, replacement lead time and compliance duties. Confirm actual delivery and service commitments. Test a capacity loss or delayed expansion scenario.",
        tr: "Kritik tedarikçileri, üretim aşamalarını, sözleşme şartlarını, tahsis kurallarını, coğrafi maruziyeti, ikame süresini ve uyum görevlerini haritalayın. Gerçek teslimat ve hizmet taahhütlerini doğrulayın. Kapasite kaybı veya geciken genişleme senaryosunu test edin.",
      },
      decision: {
        en: "Avoid a plan that requires one unverified delivery date or one unavailable substitute. Use staged commitments, capacity options and tested workload portability where the cost of interruption justifies them.",
        tr: "Tek doğrulanmamış teslim tarihini veya bulunmayan ikameyi gerektiren plandan kaçının. Kesinti maliyeti haklı çıkarıyorsa aşamalı taahhütler, kapasite seçenekleri ve test edilmiş iş yükü taşınabilirliği kullanın.",
      },
      limits: {
        en: "Diversification has costs and may reduce efficiency. Policy changes quickly and differs by product, party and destination. Use current official rules and qualified advice for a real transaction.",
        tr: "Çeşitlendirme maliyetlidir ve verimi azaltabilir. Politika hızla değişir ve ürüne, tarafa, hedefe göre ayrılır. Gerçek işlem için güncel resmî kuralları ve nitelikli danışmanlığı kullanın.",
      },
      sequence: {
        en: "Map dependencies. Verify counterparties and destinations. Check current controls. Confirm capacity and lead times. Model interruption. Price alternatives. Stage commitments. Recheck before shipment, deployment or transfer.",
        tr: "Bağımlılıkları haritalayın. Tarafları ve hedefleri doğrulayın. Güncel kontrolleri kontrol edin. Kapasiteyi ve süreleri doğrulayın. Kesintiyi modelleyin. Alternatifleri fiyatlayın. Taahhütleri aşamalandırın. Sevkiyat, dağıtım veya aktarım öncesi yeniden kontrol edin.",
      }, sourceIds: ["bis-chips", "doe-powering-ai"],
    },
  ],
};

const governance: EvergreenGuide = {
  slug: "ai-governance",
  kicker: { en: "Governance field guide", tr: "Yönetişim saha rehberi" },
  title: { en: "AI governance: from principles to evidence", tr: "Yapay zeka yönetişimi: ilkelerden kanıta" },
  description: {
    en: "A source-linked operating guide to ownership, inventory, risk tiers, controls, evidence, incidents and changing rules.",
    tr: "Sahiplik, envanter, risk katmanları, kontroller, kanıt, olaylar ve değişen kurallar için kaynak bağlantılı işletim rehberi.",
  },
  promise: {
    en: "Govern decisions through the AI system lifecycle. Keep evidence that each required control actually works.",
    tr: "Kararları yapay zeka sistemi yaşam döngüsü boyunca yönetin. Gerekli her kontrolün gerçekten çalıştığına dair kanıt tutun.",
  },
  audience: {
    en: "For leaders, product teams, risk owners and operators building a practical AI governance program.",
    tr: "Pratik yapay zeka yönetişim programı kuran liderler, ürün ekipleri, risk sahipleri ve işletici ekipler için.",
  },
  answerQuestion: { en: "What does effective AI governance require?", tr: "Etkili yapay zeka yönetişimi ne gerektirir?" },
  directAnswer: {
    en: "Effective AI governance assigns owners, inventories systems and uses risk to set controls before release. It documents purpose, data, models, vendors, affected people, human oversight and acceptable limits. Teams test the system, retain evidence, monitor real use, handle incidents and review changes. Principles guide the program, but they do not replace applicable law, contracts or sector rules. Recheck official requirements by jurisdiction and implementation date.",
    tr: "Etkili yapay zeka yönetişimi sahipleri atar, sistemleri envanterler ve yayın öncesi kontrolleri belirlemek için risk kullanır. Amaç, veri, modeller, üreticiler, etkilenen insanlar, insan gözetimi ve kabul edilebilir sınırlar belgelenir. Ekipler sistemi test eder, kanıt saklar, gerçek kullanımı izler, olayları yönetir ve değişiklikleri inceler. İlkeler programa yön verir, fakat geçerli hukuk, sözleşme veya sektör kurallarının yerini almaz. Resmî gereksinimleri yargı alanına ve uygulama tarihine göre yeniden kontrol edin.",
  },
  disclaimer: {
    en: "This guide is educational and not legal advice. Duties differ by jurisdiction, sector, role and use. Check current official text and qualified counsel.",
    tr: "Bu rehber eğitim amaçlıdır ve hukuki tavsiye değildir. Görevler yargı alanı, sektör, rol ve kullanıma göre değişir. Güncel resmî metni ve nitelikli hukuk danışmanını kontrol edin.",
  },
  answerSourceIds: ["nist-rmf", "oecd-principles", "eu-timeline"],
  sourceIds: ["nist-rmf", "nist-genai", "oecd-principles", "eu-timeline", "eu-enforcement"],
  sections: [
    {
      id: "mandate", category: { en: "Foundation", tr: "Temel" }, title: { en: "Set mandate, scope and accountable owners", tr: "Yetkiyi, kapsamı ve sorumlu sahipleri belirleyin" },
      summary: {
        en: "Governance begins with authority to make and enforce decisions. A policy without named owners, decision rights, resources and escalation paths can describe good intent without changing system behavior.",
        tr: "Yönetişim karar alma ve uygulama yetkisiyle başlar. Adlandırılmış sahipleri, karar hakları, kaynakları ve aktarım yolları olmayan politika iyi niyeti açıklayabilir, fakat sistem davranışını değiştiremez.",
      },
      mechanism: {
        en: "Define which AI systems, teams, vendors and uses the program covers. Assign an executive sponsor, system owner, risk owner, data owner and control operators. Separate approval from the team rewarded for shipping.",
        tr: "Programın hangi yapay zeka sistemlerini, ekiplerini, üreticilerini ve kullanımlarını kapsadığını tanımlayın. Yönetici sponsor, sistem sahibi, risk sahibi, veri sahibi ve kontrol işleticileri atayın. Onayı yayın için ödüllendirilen ekipten ayırın.",
      },
      evaluate: {
        en: "Trace one real system from proposal to retirement. Ask who may accept risk, block release, approve an exception, stop production and notify affected parties. Missing or conflicting answers reveal an operating gap.",
        tr: "Bir gerçek sistemi öneriden emekliliğe kadar izleyin. Kimin riski kabul edebildiğini, yayını engelleyebildiğini, istisna onaylayabildiğini, üretimi durdurabildiğini ve etkilenen tarafları bilgilendirebildiğini sorun. Eksik veya çelişkili yanıtlar işletim açığını gösterir.",
      },
      decision: {
        en: "Match review depth to impact, but keep minimum duties for every system. No team should deploy an unknown AI use because it falls outside an organizational chart or arrives through a vendor feature.",
        tr: "İnceleme derinliğini etkiye göre ayarlayın, fakat her sistem için asgari görevleri koruyun. Hiçbir ekip, kurum şemasının dışında kaldığı veya üretici özelliğiyle geldiği için bilinmeyen yapay zeka kullanımını yayınlamamalıdır.",
      },
      limits: {
        en: "A committee can centralize decisions and also become a queue. Delegate routine low-risk approvals with clear standards. Keep central review for high-impact, novel, disputed or legally sensitive uses.",
        tr: "Komite kararları merkezileştirebilir ve aynı zamanda sıra oluşturabilir. Rutin düşük riskli onayları açık standartlarla devredin. Merkezi incelemeyi yüksek etkili, yeni, tartışmalı veya hukuken hassas kullanımlar için tutun.",
      },
      sequence: {
        en: "Approve the mandate. Define scope and exclusions. Name decision owners. Publish thresholds and escalation. Fund control work. Test the route with a real system. Review delays and missing authority.",
        tr: "Yetkiyi onaylayın. Kapsamı ve hariçleri tanımlayın. Karar sahiplerini adlandırın. Eşikleri ve aktarımı yayınlayın. Kontrol işini finanse edin. Yolu gerçek sistemle test edin. Gecikmeleri ve eksik yetkiyi inceleyin.",
      }, sourceIds: ["nist-rmf", "oecd-principles"],
    },
    {
      id: "inventory", category: { en: "Visibility", tr: "Görünürlük" }, title: { en: "Keep a decision-ready AI inventory", tr: "Karara hazır yapay zeka envanteri tutun" },
      summary: {
        en: "A useful inventory does more than count models. It shows where AI affects people or operations, which components and data it uses, who owns it and which evidence supports release.",
        tr: "Yararlı envanter modelleri saymaktan fazlasını yapar. Yapay zekanın insanları veya operasyonu nerede etkilediğini, hangi bileşenleri ve veriyi kullandığını, kimin sahip olduğunu ve hangi kanıtın yayını desteklediğini gösterir.",
      },
      mechanism: {
        en: "Record purpose, users, affected groups, outputs, decisions, deployment status, owner, model, provider, data sources, integrations, geography, risk tier, approvals, controls, incidents and review dates. Link records to evidence instead of copying it.",
        tr: "Amaç, kullanıcılar, etkilenen gruplar, çıktılar, kararlar, dağıtım durumu, sahip, model, sağlayıcı, veri kaynakları, entegrasyonlar, coğrafya, risk katmanı, onaylar, kontroller, olaylar ve inceleme tarihlerini kaydedin. Kanıtı kopyalamak yerine kayıtlara bağlayın.",
      },
      evaluate: {
        en: "Reconcile the inventory against procurement, code, cloud accounts, data flows and vendor announcements. Sample entries and verify the live system matches the record. Track unknown, retired and temporarily disabled states.",
        tr: "Envanteri satın alma, kod, bulut hesapları, veri akışları ve üretici duyurularıyla uzlaştırın. Kayıtları örnekleyin ve canlı sistemin kayıtla eşleştiğini doğrulayın. Bilinmeyen, emekli ve geçici kapalı durumları izleyin.",
      },
      decision: {
        en: "Do not allow production without a minimum complete record and accountable owner. Use automation to discover candidates, but require a person to confirm purpose, impact and classification.",
        tr: "Asgari eksiksiz kayıt ve sorumlu sahip olmadan üretime izin vermeyin. Adayları bulmak için otomasyon kullanın, fakat amaç, etki ve sınıflandırmayı bir kişinin doğrulamasını isteyin.",
      },
      limits: {
        en: "An inventory becomes stale when updates depend on memory. Connect changes in models, data, vendors and deployment to review triggers. Measure coverage and record age, not only record count.",
        tr: "Güncellemeler hafızaya bağlıysa envanter eskir. Model, veri, üretici ve dağıtım değişikliklerini inceleme tetiklerine bağlayın. Yalnızca kayıt sayısını değil, kapsamı ve kayıt yaşını ölçün.",
      },
      sequence: {
        en: "Define one record schema. Import known systems. Discover missing uses. Assign owners. Validate high-impact entries first. Connect change signals. Review coverage monthly. Retire records with evidence.",
        tr: "Tek kayıt şeması tanımlayın. Bilinen sistemleri içe aktarın. Eksik kullanımları bulun. Sahip atayın. Önce yüksek etkili kayıtları doğrulayın. Değişim sinyallerini bağlayın. Kapsamı aylık inceleyin. Kayıtları kanıtla emekli edin.",
      }, sourceIds: ["nist-rmf", "nist-genai"],
    },
    {
      id: "risk", category: { en: "Assessment", tr: "Değerlendirme" }, title: { en: "Classify risk from context and impact", tr: "Riski bağlam ve etkiye göre sınıflandırın" },
      summary: {
        en: "The same model can support a low-impact draft or a high-impact decision. Governance must therefore assess the complete use, affected people, operating context, automation and possible harm.",
        tr: "Aynı model düşük etkili taslağı veya yüksek etkili kararı destekleyebilir. Bu nedenle yönetişim tam kullanımı, etkilenen insanları, işletim bağlamını, otomasyonu ve olası zararı değerlendirmelidir.",
      },
      mechanism: {
        en: "Assess severity, likelihood, scale, reversibility, exposure, vulnerability, human dependence and ability to detect errors. Include privacy, security, safety, discrimination, misinformation, labor, environment, rights and operational continuity where relevant.",
        tr: "Şiddeti, olasılığı, ölçeği, geri alınabilirliği, maruziyeti, savunmasızlığı, insan bağımlılığını ve hataları tespit etme yeteneğini değerlendirin. İlgili olduğunda gizlilik, güvenlik, emniyet, ayrımcılık, yanlış bilgi, emek, çevre, haklar ve operasyon sürekliliğini ekleyin.",
      },
      evaluate: {
        en: "Use evidence from intended users, affected groups, domain experts, testing, incidents and comparable systems. Document uncertainty and disagreements. Reassess after changes in purpose, model, data, integration, geography or scale.",
        tr: "Amaçlanan kullanıcılardan, etkilenen gruplardan, alan uzmanlarından, testlerden, olaylardan ve benzer sistemlerden kanıt kullanın. Belirsizliği ve anlaşmazlıkları belgeleyin. Amaç, model, veri, entegrasyon, coğrafya veya ölçek değişince yeniden değerlendirin.",
      },
      decision: {
        en: "Set risk tiers that change real requirements: reviewer independence, testing depth, documentation, monitoring, approval and release scope. Avoid a score that creates a label but no control difference.",
        tr: "Gerçek gereksinimleri değiştiren risk katmanları belirleyin: inceleyen bağımsızlığı, test derinliği, belge, izleme, onay ve yayın kapsamı. Etiket oluşturan fakat kontrol farkı yaratmayan puandan kaçının.",
      },
      limits: {
        en: "Risk matrices can hide contested values and uncertain probabilities. Keep the factual basis and affected perspectives beside the rating. Escalate high-severity uncertainty instead of averaging it away.",
        tr: "Risk matrisleri tartışmalı değerleri ve belirsiz olasılıkları gizleyebilir. Olgusal temeli ve etkilenen bakışları derecenin yanında tutun. Yüksek şiddetli belirsizliği ortalamak yerine aktarın.",
      },
      sequence: {
        en: "Describe the use and affected people. Identify possible harm and benefit. Estimate exposure and controls. Assign a provisional tier. Review evidence independently. Record uncertainty. Set the next review trigger.",
        tr: "Kullanımı ve etkilenen insanları açıklayın. Olası zarar ve yararı belirleyin. Maruziyeti ve kontrolleri tahmin edin. Geçici katman atayın. Kanıtı bağımsız inceleyin. Belirsizliği kaydedin. Sonraki inceleme tetikini belirleyin.",
      }, sourceIds: ["nist-rmf", "nist-genai", "oecd-principles"],
    },
    {
      id: "controls", category: { en: "Assurance", tr: "Güvence" }, title: { en: "Turn requirements into tested controls", tr: "Gereksinimleri test edilmiş kontrollere dönüştürün" },
      summary: {
        en: "A control is a repeatable action that reduces risk and produces evidence. Policy text, provider claims and training can support a control, but none proves that the live system behaves as required.",
        tr: "Kontrol, riski azaltan ve kanıt üreten tekrarlanabilir eylemdir. Politika metni, sağlayıcı iddiaları ve eğitim kontrolü destekleyebilir, fakat hiçbiri canlı sistemin gerektiği gibi davrandığını kanıtlamaz.",
      },
      mechanism: {
        en: "Map each requirement to an owner, implementation, test, evidence item, frequency and failure response. Combine preventive controls, detection, human oversight, access limits, documentation, user notice, recourse and recovery as the use requires.",
        tr: "Her gereksinimi sahibe, uygulamaya, teste, kanıt öğesine, sıklığa ve hata yanıtına bağlayın. Kullanımın gerektirdiği şekilde önleyici kontrolleri, tespiti, insan gözetimini, erişim sınırlarını, belgeleri, kullanıcı bildirimini, itirazı ve kurtarmayı birleştirin.",
      },
      evaluate: {
        en: "Test control design and operation. A review step may exist but fail because reviewers lack time, authority or information. Sample real decisions, inspect logs and verify that failed checks block or escalate as designed.",
        tr: "Kontrol tasarımını ve işletimini test edin. İnceleme adımı bulunabilir, fakat inceleyenler süre, yetki veya bilgiden yoksunsa başarısız olabilir. Gerçek kararları örnekleyin, kayıtları inceleyin ve hatalı kontrollerin tasarlandığı gibi engellediğini veya aktardığını doğrulayın.",
      },
      decision: {
        en: "Release only when mandatory controls pass and residual risk has an authorized owner. Time-limit exceptions, narrow their scope and record compensating controls. Do not convert repeated exceptions into silent policy.",
        tr: "Yalnızca zorunlu kontroller geçtiğinde ve kalan riskin yetkili sahibi olduğunda yayınlayın. İstisnaları süreyle ve kapsamla sınırlayın, telafi eden kontrolleri kaydedin. Tekrarlanan istisnaları sessiz politikaya dönüştürmeyin.",
      },
      limits: {
        en: "Controls can conflict or create new harm. Strong filtering may reduce access, and human review may delay urgent work. Measure side effects and include affected groups when tuning controls.",
        tr: "Kontroller çatışabilir veya yeni zarar yaratabilir. Güçlü filtreleme erişimi azaltabilir, insan incelemesi acil işi geciktirebilir. Yan etkileri ölçün ve kontrolleri ayarlarken etkilenen grupları dahil edin.",
      },
      sequence: {
        en: "List requirements. Map controls and owners. Define passing evidence. Implement before launch. Test independently. Record residual risk. Approve or block. Monitor operation. Retest after material change.",
        tr: "Gereksinimleri listeleyin. Kontrolleri ve sahipleri eşleyin. Geçme kanıtını tanımlayın. Yayın öncesi uygulayın. Bağımsız test edin. Kalan riski kaydedin. Onaylayın veya engelleyin. İşletimi izleyin. Önemli değişimden sonra yeniden test edin.",
      }, sourceIds: ["nist-rmf", "nist-genai", "oecd-principles"],
    },
    {
      id: "monitoring", category: { en: "Operations", tr: "Operasyon" }, title: { en: "Monitor use, incidents and change", tr: "Kullanımı, olayları ve değişimi izleyin" },
      summary: {
        en: "Pre-release tests cover expected cases. Production adds new users, inputs, incentives, dependencies and scale. Governance needs signals that connect technical behavior to user and business outcomes.",
        tr: "Yayın öncesi testler beklenen vakaları kapsar. Üretim yeni kullanıcılar, girdiler, teşvikler, bağımlılıklar ve ölçek ekler. Yönetişim teknik davranışı kullanıcı ve iş sonuçlarına bağlayan sinyaller gerektirir.",
      },
      mechanism: {
        en: "Monitor quality, policy failures, overrides, complaints, appeals, access, drift, security events, affected-group outcomes and control health. Define incident severity, containment, evidence preservation, notification, recovery and learning before an incident.",
        tr: "Kaliteyi, politika hatalarını, geçersiz kılmaları, şikayetleri, itirazları, erişimi, sapmayı, güvenlik olaylarını, etkilenen grup sonuçlarını ve kontrol sağlığını izleyin. Olaydan önce olay şiddetini, sınırlamayı, kanıt korumayı, bildirimi, kurtarmayı ve öğrenmeyi tanımlayın.",
      },
      evaluate: {
        en: "Rehearse a realistic failure. Confirm that teams can identify affected systems and people, disable risky functions, preserve records, reach decision owners and verify recovery. Measure detection and containment time.",
        tr: "Gerçekçi bir hatayı prova edin. Ekiplerin etkilenen sistemleri ve insanları belirleyebildiğini, riskli işlevleri kapatabildiğini, kayıtları koruyabildiğini, karar sahiplerine ulaşabildiğini ve kurtarmayı doğrulayabildiğini onaylayın. Tespit ve sınırlama süresini ölçün.",
      },
      decision: {
        en: "Use explicit thresholds to pause, narrow or stop a system. Connect provider, model, data, prompt, policy and integration changes to review. A successful deployment is not permanent approval.",
        tr: "Sistemi duraklatmak, daraltmak veya durdurmak için açık eşikler kullanın. Sağlayıcı, model, veri, prompt, politika ve entegrasyon değişikliklerini incelemeye bağlayın. Başarılı dağıtım kalıcı onay değildir.",
      },
      limits: {
        en: "Monitoring can miss unreported harm and can itself create privacy risk. Collect the minimum useful data, protect access, set retention and add direct feedback and appeal routes.",
        tr: "İzleme bildirilmeyen zararı kaçırabilir ve kendisi gizlilik riski yaratabilir. En az yararlı veriyi toplayın, erişimi koruyun, saklama süresi belirleyin ve doğrudan geri bildirim ile itiraz yolları ekleyin.",
      },
      sequence: {
        en: "Select outcome and control signals. Set thresholds and owners. Instrument safely. Rehearse response. Review trends and complaints. Contain incidents. Verify recovery. Add lessons to controls and tests.",
        tr: "Sonuç ve kontrol sinyallerini seçin. Eşikleri ve sahipleri belirleyin. Güvenle ölçümleyin. Yanıtı prova edin. Eğilimleri ve şikayetleri inceleyin. Olayları sınırlayın. Kurtarmayı doğrulayın. Dersleri kontrollere ve testlere ekleyin.",
      }, sourceIds: ["nist-rmf", "nist-genai"],
    },
    {
      id: "rules", category: { en: "Compliance", tr: "Uyum" }, title: { en: "Track duties by role, place and date", tr: "Görevleri rol, yer ve tarihe göre izleyin" },
      summary: {
        en: "AI rules do not arrive as one global checklist. Duties can depend on jurisdiction, sector, system role, risk class, distribution path and implementation date. Timelines can also change.",
        tr: "Yapay zeka kuralları tek küresel kontrol listesi olarak gelmez. Görevler yargı alanına, sektöre, sistem rolüne, risk sınıfına, dağıtım yoluna ve uygulama tarihine bağlı olabilir. Takvimler de değişebilir.",
      },
      mechanism: {
        en: "The European Commission service desk presents the EU AI Act as a phased timeline and states that enforcement powers and penalties follow applicable dates. Organizations must map their role and system before selecting duties.",
        tr: "Avrupa Komisyonu hizmet masası AB Yapay Zeka Yasasını aşamalı takvim olarak sunar ve uygulama yetkileriyle cezaların geçerli tarihleri izlediğini belirtir. Kurumlar görevleri seçmeden önce rollerini ve sistemlerini eşlemelidir.",
      },
      evaluate: {
        en: "Maintain a requirements register with source link, jurisdiction, role, system scope, effective date, owner, interpretation, control and evidence. Have qualified legal and domain reviewers confirm high-impact mappings.",
        tr: "Kaynak bağlantısı, yargı alanı, rol, sistem kapsamı, yürürlük tarihi, sahip, yorum, kontrol ve kanıt içeren gereksinim kaydı tutun. Yüksek etkili eşlemeleri nitelikli hukuk ve alan uzmanlarına doğrulatın.",
      },
      decision: {
        en: "Use voluntary frameworks to organize risk work, but do not present them as proof of legal compliance. Where rules conflict or remain uncertain, record the issue, owner, interim control and decision deadline.",
        tr: "Risk işini düzenlemek için gönüllü çerçeveleri kullanın, fakat bunları hukuki uyum kanıtı olarak sunmayın. Kurallar çatışıyor veya belirsiz kalıyorsa konuyu, sahibi, geçici kontrolü ve karar son tarihini kaydedin.",
      },
      limits: {
        en: "This page cannot determine an organization’s duties. Official text, regulator guidance and facts change. Review current sources before each material launch, market entry, provider change or high-impact use.",
        tr: "Bu sayfa bir kurumun görevlerini belirleyemez. Resmî metin, düzenleyici rehberlik ve gerçekler değişir. Her önemli yayın, pazar girişi, sağlayıcı değişimi veya yüksek etkili kullanım öncesi güncel kaynakları inceleyin.",
      },
      sequence: {
        en: "Map markets, sectors and roles. Identify current official sources. Record dates and duties. Obtain qualified review. Implement controls. Retain evidence. Watch updates. Reassess before each material change.",
        tr: "Pazarları, sektörleri ve rolleri eşleyin. Güncel resmî kaynakları belirleyin. Tarihleri ve görevleri kaydedin. Nitelikli inceleme alın. Kontrolleri uygulayın. Kanıt tutun. Güncellemeleri izleyin. Her önemli değişim öncesi yeniden değerlendirin.",
      }, sourceIds: ["eu-timeline", "eu-enforcement", "nist-rmf", "oecd-principles"],
    },
  ],
};

export const evergreenGuides: Record<EvergreenGuideSlug, EvergreenGuide> = {
  "ai-agents": agents,
  "ai-chips-infrastructure": chips,
  "ai-governance": governance,
};

type GuideAuditEntry = {
  version: number;
  lastVerified: string;
  evidenceCheckedAt: string;
  reviewStatus: "verified" | "review-required";
  changeSummary: GuideText;
};

const auditSources = guideState.sources as Record<string, { fingerprint: string; checkedAt: string }>;
const auditGuides = guideState.guides as Record<EvergreenGuideSlug, GuideAuditEntry>;

export function evergreenGuidePath(slug: EvergreenGuideSlug) {
  return `/guides/${slug}`;
}

export function getEvergreenGuideAudit(guide: EvergreenGuide) {
  const state = auditGuides[guide.slug];
  const sources = guide.sourceIds.flatMap((sourceId) => {
    const source = evergreenSourceById.get(sourceId);
    return source ? [source] : [];
  });
  const complete = Boolean(state && sources.length === guide.sourceIds.length && guide.sourceIds.every((sourceId) => auditSources[sourceId]?.fingerprint));
  return {
    checkedAt: state?.evidenceCheckedAt ?? guideState.checkedAt,
    lastVerified: state?.lastVerified ?? guideState.checkedAt,
    reviewRequired: state?.reviewStatus !== "verified",
    complete,
    sectionCount: guide.sections.length,
    sourceCount: sources.length,
    sources,
  };
}

const evergreenPatterns: Record<EvergreenGuideSlug, RegExp> = {
  "ai-agents": /\b(ai agents?|agentic (?:ai|system|workflow)|autonomous ai|coding agents?|model context protocol|mcp server|github copilot|claude code)\b/i,
  "ai-chips-infrastructure": /\b(ai chips?|ai infrastructure|gpus?|nvidia|tpus?|semiconductor|high[- ]bandwidth memory|hbm|nvlink|cuda|mtia|ai data cent(?:er|re))\b/i,
  "ai-governance": /\b(ai governance|ai regulation|ai policy|ai act|artificial intelligence (?:law|regulation|policy)|ai safety institute|ai copyright|chatgpt (?:court|lawsuit)|anthropic blacklist)\b/i,
};

export function evergreenGuideSlugsForText(value: string): EvergreenGuideSlug[] {
  return (Object.keys(evergreenPatterns) as EvergreenGuideSlug[]).filter((slug) => evergreenPatterns[slug].test(value));
}

export function liveTrendsForEvergreenGuide(trends: Trend[], slug: EvergreenGuideSlug, limit = 5) {
  const pattern = evergreenPatterns[slug];
  return trends
    .filter((trend) => pattern.test(trend.title))
    .slice(0, limit)
    .map((trend) => ({ slug: trend.slug, title: trend.title, category: trend.category, lastSeenAt: trend.last_seen_at }));
}

export function evergreenGuidesForCategory(category: string) {
  const normalized = category.trim().toLowerCase();
  if (normalized === "artificial intelligence") return Object.values(evergreenGuides);
  if (normalized === "developer tools") return [evergreenGuides["ai-agents"], evergreenGuides["ai-chips-infrastructure"]];
  return [];
}

export function evergreenGuideEnglishWordCount(guide: EvergreenGuide) {
  const values = [guide.title.en, guide.description.en, guide.promise.en, guide.audience.en, guide.answerQuestion.en, guide.directAnswer.en, guide.disclaimer.en];
  for (const section of guide.sections) values.push(section.title.en, section.summary.en, section.mechanism.en, section.evaluate.en, section.decision.en, section.limits.en, section.sequence.en);
  return values.join(" ").trim().split(/\s+/).length;
}
