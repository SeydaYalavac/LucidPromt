"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export type Locale = "en" | "tr";

const STORAGE_KEY = "whats-happening-locale";

const tr = {
  "nav.primary": "Ana menü",
  "nav.mobile": "Mobil menü",
  "nav.world": "Dünya",
  "nav.trending": "Trendler",
  "nav.explore": "Keşfet",
  "nav.map": "Harita",
  "nav.pricing": "Fiyatlandırma",
  "nav.security": "AI güvenliği",
  "nav.how": "Nasıl çalışır",
  "nav.search": "Ara",
  "nav.openSearch": "Aramayı aç",
  "nav.signIn": "Giriş yap",
  "nav.signUp": "Kayıt ol",
  "nav.signOut": "Çıkış yap",
  "nav.openAccount": "Hesap menüsünü aç",
  "nav.open": "Menüyü aç",
  "nav.close": "Menüyü kapat",
  "locale.label": "Dil",
  "locale.english": "English",
  "locale.turkish": "Türkçe",
  "search.dialog": "Trend ve sayfalarda ara",
  "search.close": "Kapat",
  "search.heading": "Kaynak bağlantılı sinyal haritasında ara",
  "search.placeholder": "Trend, ülke veya kategori ara",
  "search.all": "Tüm trendlerde “{query}” ara",
  "search.countryUnknown": "Ülke atfedilmedi",
  "search.instructions": "Gezinmek için ↑ ↓, açmak için Enter, kapatmak için Esc.",
  "hero.title": "KURUCULAR VE ANALİSTLER İÇİN\nKAYNAK BAĞLANTILI\nTREND İSTİHBARATI",
  "hero.description": "Kurucuların ve analistlerin gelişen teknolojiyi izlemesi için kaynak bağlantılı yapay zeka trend istihbaratı. Her sinyalin arkasındaki ülke etiketli en erken mevcut kanıtı inceleyin.",
  "hero.search": "Trendlerde ara",
  "hero.placeholder1": "Kaynak bağlantılı sinyal kuyruğunda ara",
  "hero.placeholder2": "Hangi teknoloji konuları en yüksek puanı alıyor?",
  "hero.placeholder3": "Japonya'dan ülke etiketli kanıtları göster",
  "hero.placeholder4": "Hangi sinyaller en yüksek hıza sahip?",
  "hero.placeholder5": "Puanlanmış bilim sinyallerini bul",
  "hero.dataUnavailable": "Üretim verisi kullanılamıyor",
  "hero.dataConnected": "Kaynak verisine bağlı",
  "hero.signalsLoaded": "{count} sinyal kaydı yüklendi",
  "hero.signalCountUnavailable": "Sinyal sayısı kullanılamıyor",
  "hero.trendsLoaded": "{count} trend kaydı yüklendi",
  "hero.trendCountUnavailable": "Trend sayısı kullanılamıyor",
  "hero.sourceLinked": "kaynak bağlantılı",
  "hero.explore": "Keşfet",
  "pulse.title": "KÜRESEL NABIZ",
  "pulse.description": "Kaynak izi ekli, mevcut en yüksek puanlı trendler.",
  "pulse.demo": "DEMO VERİSİ",
  "pulse.unavailable": "Canlı veri alımı Supabase bağlantısını bekliyor.",
  "pulse.velocity": "Hız {value}",
  "pulse.countryUnknown": "Ülke atfedilmedi",
  "pulse.updated": "Güncellendi {time}",
  "pulse.why": "Nedenini anla",
  "next.title": "SIRADA NE VAR?",
  "next.description": "Henüz Küresel Nabız eşiğini geçmemiş, yenilik puanı yüksek erken sinyaller.",
  "next.score": "Sinyal puanı",
  "next.novelty": "Yenilik {value}",
  "feed.title": "Kaynak gözlemleri",
  "feed.empty": "Henüz bağlı bir kaynak gözlemi yok.",
  "faq.kicker": "Ürün SSS",
  "faq.title": "SORULAR,\nYANITLAR.",
  "faq.description": "Sinyal motorunun nasıl çalıştığı, puanların ne anlama geldiği ve erken erişimde neler bekleyebileceğiniz.",
  "world.kicker": "Dünya masası",
  "world.title": "Şu anda hareket eden hikayeler.",
  "world.description": "En güçlü güncel konu öne çıkar. Her bilgilendirme konuyu, ilginin neden arttığını ve hangi kaynakların desteklediğini açıklar.",
  "world.openMap": "Sinyal haritasını aç",
  "world.aria": "Dünya trendleri",
  "world.demo": "Bu ortamda demo verisi açıkça etkin.",
  "trending.kicker": "Canlı araştırma masası",
  "trending.title": "Trend bilgilendirmeleri.",
  "trending.description": "Her öğe konuyu, sıralamasının arkasındaki kanıtı, kime yardımcı olduğunu ve iddianın nerede doğrulanacağını açıklar.",
  "trending.today": "bugün kaynakla doğrulanmış yapay zeka trendi",
  "trending.targetMet": "günlük hedef karşılandı",
  "trending.belowTarget": "kaynak arzı {target} hedefinin altında",
  "trending.aria": "Trend sinyalleri",
  "trending.loadingMore": "Daha fazla sinyal yükleniyor…",
  "trending.shown": "{count} trend gösteriliyor",
  "filters.aria": "Trend filtreleri",
  "filters.title": "Bilgilendirmeleri filtrele",
  "filters.search": "Ara",
  "filters.placeholder": "Konu veya ülke",
  "filters.category": "Kategori",
  "filters.order": "Sıralama",
  "filters.highest": "En yüksek puan",
  "filters.fastest": "En yüksek hız",
  "filters.newest": "En yeni görülen",
  "filters.saved": "Yalnızca kaydedilenler",
  "filters.reset": "Filtreleri sıfırla",
  "explore.kicker": "Kategoriye göre keşfet",
  "explore.title": "Önemli konuları araştırın.",
  "explore.description": "Kaynakla desteklenen konuları sade bir açıklama, ilginin neden arttığı ve uygulanabilir bir sonraki adımla inceleyin.",
  "explore.categories": "Trend kategorileri",
  "explore.left": "Kategorileri sola kaydır",
  "explore.right": "Kategorileri sağa kaydır",
  "explore.empty": "Henüz {category} trendi yok.",
  "category.all": "Tümü",
  "category.ai": "Yapay zeka",
  "category.science": "Bilim",
  "category.technology": "Teknoloji",
  "category.business": "İş dünyası",
  "category.sports": "Spor",
  "category.entertainment": "Eğlence",
  "category.artificial intelligence": "Yapay zeka",
  "category.developer tools": "Geliştirici araçları",
  "category.world": "Dünya",
  "category.space": "Uzay",
  "state.loading": "Trend kayıtları yükleniyor",
  "state.heading": "Arayüz hazır. Canlı akış henüz bağlı değil.",
  "state.unavailable": "Canlı trend verisi üretim bağlantısını bekliyor.",
  "state.failClosed": "Güncel olay gibi örnek hikâyeler göstermek yerine burada duruyoruz.",
  "state.empty": "Henüz bu filtrelerle eşleşen trend yok.",
  "card.global": "Küresel",
  "card.score": "Puan {value}",
  "card.save": "{title} trendini kaydet",
  "card.remove": "{title} trendini kaydedilenlerden çıkar",
  "card.share": "{title} trendini paylaş",
  "card.sourceSystems": "{count} kaynak sistemi",
  "card.singleSource": "Tek kaynaklı kanıt",
  "card.sourceLinked": "Kaynak bağlantılı",
  "card.fallback": "İncelenmek üzere kaynak kanıtı eklenmiş güncel bir konu.",
  "card.read": "Makalenin tamamını oku",
  "footer.description": "Puanlanmış sinyalleri ve kaynaklarını inceleyin.",
  "footer.countries": "Ülkeler",
  "footer.about": "Hakkında",
  "footer.privacy": "Gizlilik",
  "footer.terms": "Koşullar",
  "footer.support": "Destek",
  "trend.unavailable": "Doğrulanmış üretim kanıtı yüklenemediği için bu bilgilendirme kullanılamıyor.",
  "trend.timeUnavailable": "Zaman bilgisi yok",
  "trend.article": "Trend makalesi",
  "trend.global": "Küresel",
  "trend.score": "Puan {value}",
  "trend.demo": "Demo verisi",
  "trend.fallbackSummary": "Bu konu için henüz doğrulanmış kaynak bağlamı yok.",
  "trend.independentSites": "{count} bağımsız kanıt sitesi",
  "trend.singleSource": "Tek kaynaklı kanıt",
  "trend.updated": "Son güncelleme {time}",
  "trend.openEvidence": "En yeni kanıtı aç",
  "trend.saved": "Kaydedildi",
  "trend.save": "Kaydet",
  "trend.copied": "Bağlantı kopyalandı",
  "trend.share": "Paylaş",
  "trend.deep": "Derin araştırma bilgilendirmesi",
  "trend.concise": "Kısa kanıt notu",
  "trend.hostedSource": "bağımsız sitede barındırılan kaynak",
  "trend.hostedSources": "bağımsız sitede barındırılan kaynak",
  "trend.conciseWhy": "Mevcut kanıt henüz uzun bir anlatımı desteklemiyor. İkinci bir bağımsız kaynak geldiğinde bu sayfa otomatik olarak derinleşecek.",
  "trend.noArticle": "Kaynak destekli bir makale yok. Desteklenmeyen bölümler bilerek boş bırakıldı.",
  "trend.evidenceTrail": "Kanıt izi",
  "trend.sourcesHeading": "Bu makalenin arkasındaki kaynaklar",
  "trend.linkedReport": "Bağlantılı haber",
  "trend.measuredSignal": "Ölçülen sinyal",
  "trend.trendScore": "Trend puanı",
  "trend.velocity": "Hız",
  "trend.reach": "Erişim",
  "trend.novelty": "Yenilik",
  "trend.evidenceStatus": "Kanıt durumu",
  "trend.articleDepth": "Makale derinliği",
  "trend.independentSitesLabel": "Bağımsız siteler",
  "trend.signalSystems": "Sinyal sistemleri",
  "trend.lastUpdated": "Son güncelleme",
  "trend.firstDetected": "İlk tespit",
  "trend.depthDeep": "Derin",
  "trend.depthConcise": "Kısa",
  "auth.signIn": "Giriş yap",
  "auth.signUp": "Kayıt ol",
  "auth.signOut": "Çıkış yap",
  "auth.email": "E-posta",
  "auth.password": "Şifre",
  "auth.confirmPassword": "Şifreyi doğrula",
  "auth.name": "Görünen ad",
  "auth.forgot": "Şifrenizi mi unuttunuz?",
  "auth.noAccount": "Hesabınız yok mu?",
  "auth.hasAccount": "Zaten hesabınız var mı?",
  "auth.or": "veya",
} as const;

export type TranslationKey = keyof typeof tr;

type LocaleContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: TranslationKey, variables?: Record<string, string | number>) => string;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function normalizeLocale(value: unknown): Locale {
  return value === "tr" ? "tr" : "en";
}

export function interpolate(template: string, variables: Record<string, string | number> = {}) {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => String(variables[key] ?? `{${key}}`));
}

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, updateLocale] = useState<Locale>("en");

  useEffect(() => {
    const saved = normalizeLocale(window.localStorage.getItem(STORAGE_KEY));
    const restore = window.setTimeout(() => updateLocale(saved), 0);
    return () => window.clearTimeout(restore);
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = useCallback((next: Locale) => {
    updateLocale(next);
    window.localStorage.setItem(STORAGE_KEY, next);
    document.documentElement.lang = next;
  }, []);

  const value = useMemo<LocaleContextValue>(() => ({
    locale,
    setLocale,
    t: (key, variables) => interpolate(locale === "tr" ? tr[key] : english[key], variables),
  }), [locale, setLocale]);

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const context = useContext(LocaleContext);
  if (!context) throw new Error("useLocale must be used inside LocaleProvider");
  return context;
}

export function localeCategoryLabel(category: string, locale: Locale) {
  if (locale === "en") return category;
  const normalizedCategory = category.trim().replace(/\s+/g, " ").toLocaleLowerCase();
  const key = `category.${normalizedCategory}` as TranslationKey;
  return key in tr ? tr[key] : category;
}

const english = Object.fromEntries(Object.keys(tr).map((key) => [key, key])) as Record<TranslationKey, string>;

Object.assign(english, {
  "nav.primary": "Primary navigation", "nav.mobile": "Mobile navigation", "nav.world": "World", "nav.trending": "Trending", "nav.explore": "Explore", "nav.map": "Map", "nav.pricing": "Pricing", "nav.security": "AI security", "nav.how": "How it works", "nav.search": "Search", "nav.openSearch": "Open search", "nav.signIn": "Sign in", "nav.signUp": "Sign up", "nav.signOut": "Sign out", "nav.openAccount": "Open account menu", "nav.open": "Open navigation", "nav.close": "Close navigation",
  "locale.label": "Language", "locale.english": "English", "locale.turkish": "Türkçe",
  "search.dialog": "Search trends and pages", "search.close": "Close", "search.heading": "Search the source-linked signal map", "search.placeholder": "Search a trend, country, or category", "search.all": "Search all trends for “{query}”", "search.countryUnknown": "Country not attributed", "search.instructions": "Use ↑ ↓ to move, Enter to open, Esc to close.",
  "hero.title": "SOURCE-LINKED TREND\nINTELLIGENCE FOR\nFOUNDERS & ANALYSTS", "hero.description": "Source-linked AI trend intelligence for founders and analysts tracking emerging technology. Inspect the earliest available country-tagged evidence behind each signal.", "hero.search": "Search trends", "hero.placeholder1": "Search the source-linked signal queue", "hero.placeholder2": "Which technology topics score highest?", "hero.placeholder3": "Show country-tagged evidence from Japan", "hero.placeholder4": "Which signals have the fastest velocity?", "hero.placeholder5": "Find scored science signals", "hero.dataUnavailable": "Production data unavailable", "hero.dataConnected": "Connected source data", "hero.signalsLoaded": "{count} signal records loaded", "hero.signalCountUnavailable": "Signal count unavailable", "hero.trendsLoaded": "{count} trend records loaded", "hero.trendCountUnavailable": "Trend count unavailable", "hero.sourceLinked": "source-linked", "hero.explore": "Explore",
  "pulse.title": "GLOBAL PULSE", "pulse.description": "The highest-scoring available trends, with their source trail attached.", "pulse.demo": "DEMO DATA", "pulse.unavailable": "Live ingestion is waiting for its Supabase connection.", "pulse.velocity": "Velocity {value}", "pulse.countryUnknown": "Country not attributed", "pulse.updated": "Updated {time}", "pulse.why": "Understand why",
  "next.title": "WHAT'S NEXT?", "next.description": "Early signals with high novelty that have not crossed the Global Pulse threshold.", "next.score": "Signal score", "next.novelty": "Novelty {value}",
  "feed.title": "Source observations", "feed.empty": "No connected source observations are available yet.", "faq.kicker": "Product FAQ", "faq.title": "QUESTIONS,\nANSWERED.", "faq.description": "How the signal engine works, what its scores mean, and what you can expect during early access.",
  "world.kicker": "World desk", "world.title": "The stories moving now.", "world.description": "The strongest current topic leads. Every briefing names what it is, why attention moved, and which sources support it.", "world.openMap": "Open the signal map", "world.aria": "World trends", "world.demo": "Demo data is explicitly enabled in this environment.",
  "trending.kicker": "Live research desk", "trending.title": "Trending briefings.", "trending.description": "Each item explains the topic, the evidence behind its rank, who it helps, and where to verify the claim.", "trending.today": "source-qualified AI trends today", "trending.targetMet": "daily target met", "trending.belowTarget": "source supply below {target} target", "trending.aria": "Trending signals", "trending.loadingMore": "Loading more signals…", "trending.shown": "{count} trends shown",
  "filters.aria": "Trend filters", "filters.title": "Filter briefings", "filters.search": "Search", "filters.placeholder": "Topic or country", "filters.category": "Category", "filters.order": "Order", "filters.highest": "Highest score", "filters.fastest": "Fastest velocity", "filters.newest": "Most recently seen", "filters.saved": "Saved only", "filters.reset": "Reset filters",
  "explore.kicker": "Explore by category", "explore.title": "Research what matters.", "explore.description": "Browse source-backed topics with a plain explanation, the reason attention moved, and a practical next step.", "explore.categories": "Trend categories", "explore.left": "Scroll categories left", "explore.right": "Scroll categories right", "explore.empty": "No {category} trends are available yet.",
  "category.all": "All", "category.ai": "AI", "category.science": "Science", "category.technology": "Technology", "category.business": "Business", "category.sports": "Sports", "category.entertainment": "Entertainment",
  "state.loading": "Loading trend records", "state.heading": "The interface is ready. The live feed is not connected yet.", "state.unavailable": "Live trend data is waiting for its production connection.", "state.failClosed": "We stop here instead of showing sample stories as current events.", "state.empty": "No trends match these filters yet.",
  "card.global": "Global", "card.score": "Score {value}", "card.save": "Save {title}", "card.remove": "Remove {title} from saved trends", "card.share": "Share {title}", "card.sourceSystems": "{count} source systems", "card.singleSource": "Single-source evidence", "card.sourceLinked": "Source linked", "card.fallback": "A current topic with source evidence attached for review.", "card.read": "Read the full article",
  "footer.description": "Inspect scored signals and their sources.", "footer.countries": "Countries", "footer.about": "About", "footer.privacy": "Privacy", "footer.terms": "Terms", "footer.support": "Support",
  "trend.unavailable": "This briefing is unavailable because verified production evidence could not be loaded.", "trend.timeUnavailable": "Time unavailable", "trend.article": "Trend article", "trend.global": "Global", "trend.score": "Score {value}", "trend.demo": "Demo data", "trend.fallbackSummary": "Verified source context is not available for this topic yet.", "trend.independentSites": "{count} independent evidence sites", "trend.singleSource": "Single-source evidence", "trend.updated": "Last updated {time}", "trend.openEvidence": "Open newest evidence", "trend.saved": "Saved", "trend.save": "Save", "trend.copied": "Link copied", "trend.share": "Share", "trend.deep": "Deep research briefing", "trend.concise": "Concise evidence note", "trend.hostedSource": "independently hosted source", "trend.hostedSources": "independently hosted sources", "trend.conciseWhy": "The available evidence does not yet support a long-form account. This page will deepen automatically when a second independent source arrives.", "trend.noArticle": "A source-backed article is not available. Unsupported sections are intentionally left blank.", "trend.evidenceTrail": "Evidence trail", "trend.sourcesHeading": "Sources behind this article", "trend.linkedReport": "Linked report", "trend.measuredSignal": "Measured signal", "trend.trendScore": "Trend score", "trend.velocity": "Velocity", "trend.reach": "Reach", "trend.novelty": "Novelty", "trend.evidenceStatus": "Evidence status", "trend.articleDepth": "Article depth", "trend.independentSitesLabel": "Independent sites", "trend.signalSystems": "Signal systems", "trend.lastUpdated": "Last updated", "trend.firstDetected": "First detected", "trend.depthDeep": "Deep", "trend.depthConcise": "Concise",
  "auth.signIn": "Sign in", "auth.signUp": "Sign up", "auth.signOut": "Sign out", "auth.email": "Email", "auth.password": "Password", "auth.confirmPassword": "Confirm password", "auth.name": "Display name", "auth.forgot": "Forgot password?", "auth.noAccount": "Don't have an account?", "auth.hasAccount": "Already have an account?", "auth.or": "or",
});
