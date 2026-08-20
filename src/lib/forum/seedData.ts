export type ForumReply = {
  id: string;
  author: string;
  role: string;
  body: string;
  votes: number;
  isSolution: boolean;
  createdAt: string;
};

export type ForumThread = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  tags: string[];
  votes: number;
  replies: ForumReply[];
  solved: boolean;
  author: string;
  modelTag: string;
  forkPrompt: string;
  createdAt: string;
};

export const forumThreads: ForumThread[] = [
  {
    id: "thread-1",
    slug: "gemini-teknik-ozet-promptu",
    title: "Gemini için düşük halüsinasyonlu teknik özet promptu",
    excerpt:
      "Kaynağa bağlı, doğrulanabilir cevap üretmek için sistem ve kullanıcı promptu nasıl ayrıştırılır?",
    body:
      "Uzun teknik dökümanları özetletirken model kaynak dışına çıkıyor. Hedefim, sadece verilen belge içeriğine yaslanan ve boşluk gördüğünde bunu açıkça söyleyen bir Gemini prompt kalıbı oluşturmak. Özellikle sistem rolü, kullanıcı isteği ve çıktı formatı arasındaki ayrımı sertleştirmek istiyorum.",
    tags: ["gemini", "grounding", "summary"],
    votes: 41,
    solved: true,
    author: "selin",
    modelTag: "Gemini 2.5 Flash",
    createdAt: "2026-08-18",
    forkPrompt:
      "Rol: Kıdemli teknik özetleme asistanı.\nGörev: Sadece sağlanan doküman parçalarına dayanarak kısa bir teknik özet üret.\nKurallar:\n1. Bilgi eksikse tahmin etme, 'kaynakta belirtilmemiş' de.\n2. Çıktıyı 'Ana fikirler', 'Kritik riskler', 'Açık sorular' başlıklarıyla ver.\n3. Her iddianın dayandığı pasajı kısa alıntı veya referans etiketiyle belirt.\n4. En fazla 5 madde kullan.\nBağlam: Aşağıdaki teknik içeriği özetle...",
    replies: [
      {
        id: "reply-1",
        author: "derya",
        role: "RAG Engineer",
        body:
          "Sistem promptuna 'yalnızca sağlanan bağlamdan çıkarım yap' cümlesini eklemek tek başına yetmiyor. Ayrıca cevapta kaynak referansı zorunlu olmalı ve her başlık için 'yeterli kanıt yoksa boş bırak' kuralı yazılmalı.",
        votes: 18,
        isSolution: true,
        createdAt: "2026-08-18",
      },
      {
        id: "reply-2",
        author: "kaan",
        role: "AI Product Dev",
        body:
          "Ben kullanıcı promptuna negatif kural da ekliyorum: 'Genel bilgiyle tamamlama yapma'. Bu ifade halüsinasyonu görünür biçimde azalttı.",
        votes: 11,
        isSolution: false,
        createdAt: "2026-08-19",
      },
    ],
  },
  {
    id: "thread-2",
    slug: "claude-rag-kaynak-zorunlulugu",
    title: "Claude ile RAG cevaplarında kaynak zorunluluğu nasıl yazılır?",
    excerpt:
      "Chunk seçiminden sonra modelin sadece verilen belgeye yaslanmasını nasıl sertleştiriyorsunuz?",
    body:
      "Claude tarafında cevap kalitesi iyi ama bazen belge dışı birleştirmeler yapıyor. Kaynak göstermeyi sadece UI katmanında değil, doğrudan prompt düzeyinde bir sözleşmeye çevirmek istiyorum. Deneyenlerin kullandığı yapı ve çıktı şablonlarını merak ediyorum.",
    tags: ["claude", "rag", "citations"],
    votes: 28,
    solved: false,
    author: "mert",
    modelTag: "Claude Sonnet",
    createdAt: "2026-08-17",
    forkPrompt:
      "Rol: Kaynak odaklı RAG cevaplayıcısı.\nGörev: Sadece verilen retrieval sonuçlarına dayanarak cevap ver.\nÇıktı formatı:\n- Kısa cevap\n- Kaynaklar\n- Belirsizlikler\nKurallar:\n- Her paragrafın sonunda köşeli parantezle kaynak kimliği yaz.\n- Kaynakta yoksa bunu açıkça belirt.\n- Genel bilgi ekleme yapma.\nSoru: ...",
    replies: [
      {
        id: "reply-3",
        author: "eda",
        role: "ML Engineer",
        body:
          "Ben cevabı iki aşamaya böldüm: önce sadece ilgili chunk kimliklerini seçtiriyorum, sonra ikinci adımda yalnız bu kimliklerle cevap ürettiriyorum. Kaynak disiplini çok daha iyi oldu.",
        votes: 13,
        isSolution: false,
        createdAt: "2026-08-17",
      },
      {
        id: "reply-4",
        author: "bora",
        role: "Prompt Designer",
        body:
          "Çıktı şemasına 'unsupported_claims' alanı eklemek faydalı. Model bazı iddiaları destekleyemediğini burada listeleyebiliyor.",
        votes: 9,
        isSolution: false,
        createdAt: "2026-08-18",
      },
    ],
  },
  {
    id: "thread-3",
    slug: "gpt-guardrail-sablonlari",
    title: "GPT sistem promptunda guardrail dili için örnek şablonlar",
    excerpt:
      "Riskli tıbbi, hukuki ve finansal istemlerde yön değiştiren reusable sistem metinleri paylaşılıyor.",
    body:
      "Tek bir sistem prompt ile farklı risk alanlarını güvenli biçimde karşılamak istiyorum. Özellikle bağlayıcı karar vermeden yön değiştiren, soru netleştiren ve kullanıcıyı güvenli çerçeveye alan reusable guardrail şablonları arıyorum.",
    tags: ["gpt", "guardrails", "safety"],
    votes: 35,
    solved: true,
    author: "zeynep",
    modelTag: "GPT-5",
    createdAt: "2026-08-16",
    forkPrompt:
      "Rol: Dikkatli güvenlik odaklı asistan.\nGörev: Riskli alanlarda bağlayıcı karar vermeden yardımcı ol.\nUygulama:\n1. Kullanıcının riskli hedefini tespit et.\n2. Neden bağlayıcı cevap verilemeyeceğini tek cümlede açıkla.\n3. Güvenli alternatif: eğitim amaçlı açıklama, soru listesi veya senaryo analizi sun.\n4. Gizli veri, gelecek tahmini veya profesyonel karar yerine geçecek hüküm verme.\nİstek: ...",
    replies: [
      {
        id: "reply-5",
        author: "naz",
        role: "Safety PM",
        body:
          "Önce risk sınıfını adlandırıp sonra güvenli alternatife geçmek kullanıcıya daha dürüst geliyor. 'Bu isteğin finansal tahmin içerdiğini görüyorum' gibi bir açılış iyi çalışıyor.",
        votes: 16,
        isSolution: true,
        createdAt: "2026-08-16",
      },
      {
        id: "reply-6",
        author: "alp",
        role: "Full-stack Dev",
        body:
          "Ben ayrıca kullanıcıya tek tıkla güvenli yeniden yazım vermeyi seviyorum. Senin Modül A tarafındaki akışa çok uyuyor.",
        votes: 8,
        isSolution: false,
        createdAt: "2026-08-17",
      },
    ],
  },
  {
    id: "thread-4",
    slug: "prompt-optimizer-skor-sinyalleri",
    title: "Prompt optimizer skor kartı hangi sinyalleri puanlamalı?",
    excerpt:
      "Bağlam, kısıt, netlik ve doğrulanabilirlik dışındaki sinyaller için topluluk örnekleri.",
    body:
      "Skor kartı bugün bağlam, kısıt ve netlik eksenlerinde çalışıyor. Buna ek olarak doğrulanabilirlik, çıktı biçimi sertliği ve güvenlik uyumu gibi metrikleri nasıl ağırlıklandırmak gerektiğini tartışmak istiyorum.",
    tags: ["ux", "prompting", "scoring"],
    votes: 19,
    solved: false,
    author: "emir",
    modelTag: "Multi-model",
    createdAt: "2026-08-15",
    forkPrompt:
      "Rol: Prompt değerlendirme asistanı.\nGörev: Aşağıdaki promptu 100 üzerinden puanla.\nMetrikler:\n- Bağlam açıklığı\n- Kısıtların kesinliği\n- Çıktı formatı netliği\n- Doğrulanabilirlik\n- Güvenlik uyumu\nÇıktı: tablo + 3 iyileştirme önerisi.\nPrompt: ...",
    replies: [
      {
        id: "reply-7",
        author: "ipek",
        role: "UX Researcher",
        body:
          "Kullanıcıların en hızlı anladığı şey ağırlıkları görmek oldu. Metrik adının yanında yüzdesel etkiyi göstermek güzel olabilir.",
        votes: 7,
        isSolution: false,
        createdAt: "2026-08-15",
      },
      {
        id: "reply-8",
        author: "cem",
        role: "Prompt Engineer",
        body:
          "Ben 'kanıtlanabilirlik' metrik ekledim. Kullanıcı kaynağa veya veri setine işaret ettiğinde ekstra puan veriyorum.",
        votes: 6,
        isSolution: false,
        createdAt: "2026-08-16",
      },
    ],
  },
];

export function getForumThreadBySlug(slug: string) {
  return forumThreads.find((thread) => thread.slug === slug);
}
