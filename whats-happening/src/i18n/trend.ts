import type { Locale } from "./locale";
import type { Trend, TrendArticleSection, TrendBrief } from "@/types/trends";

function referenceIds(brief: TrendBrief) {
  return brief.evidence.map((item) => item.reference_id);
}

function sourceNames(brief: TrendBrief) {
  return [...new Set(brief.evidence.map((item) => item.label))].join(" ve ");
}

export function localizeTrendBrief(trend: Trend, brief: TrendBrief | null | undefined, locale: Locale): TrendBrief | null | undefined {
  if (!brief || locale === "en") return brief;
  const ids = referenceIds(brief);
  const leadIds = ids.slice(0, Math.min(2, ids.length));
  const names = sourceNames(brief);
  const sourceCount = brief.evidence_source_count;
  const siteCount = brief.article.independent_source_count;
  const isDeep = brief.article.depth === "deep";
  const sections: TrendArticleSection[] = [
    {
      id: "background", label: "Arka plan", heading: "Kanıt ne gösteriyor?",
      claims: [{ text: `${trend.title}, bağlantılı güncel kaynaklarda izlenen bir yapay zeka konusudur. Bu sayfa, iddiayı kaynak başlıklarını veya bağlantılarını değiştirmeden mevcut kanıtla sınırlar.`, evidence_reference_ids: leadIds, kind: "reported" }],
    },
    {
      id: "why_now", label: "Neden şimdi?", heading: "İlgi neden şimdi hareket etti?",
      claims: [{ text: sourceCount > 1 ? `Konu ${names} dahil ${sourceCount} ayrı sinyal sisteminde görünüyor. Bu çapraz kaynak hareketi daha yakından incelemeyi hak eder, ancak gelecekteki büyümeyi kanıtlamaz.` : `Mevcut sıralama tek bir ölçülen sinyal sistemi tarafından destekleniyor. Bunu doğrulanmış ivme değil, erken bir araştırma ipucu olarak değerlendirin.`, evidence_reference_ids: ids, kind: "measured" }],
    },
    ...(isDeep ? [{
      id: "timeline" as const, label: "Zaman çizelgesi", heading: "Sinyal nasıl gelişti?",
      claims: brief.evidence.slice(0, 5).map((item) => ({ text: `${new Date(item.published_at || item.observed_at).toLocaleDateString("tr-TR", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" })}: ${item.label}, “${item.source_title}” kaydını yayımladı.`, evidence_reference_ids: [item.reference_id], kind: item.kind === "signal" ? "measured" as const : "reported" as const })),
    }] : []),
    ...(isDeep ? [{
      id: "impact" as const, label: "Etki", heading: "Bu neyi değiştirebilir?",
      claims: [{ text: `Kanıt ${siteCount} bağımsız sitede bulunuyor. Bu dağılım konuyu tek platformlu bir sıçramadan daha güçlü bir araştırma adayı yapar, ancak kalıcı benimsenme iddiasını desteklemez.`, evidence_reference_ids: ids, kind: "analysis" as const }],
    }, {
      id: "practical_implications" as const, label: "Pratik çıkarımlar", heading: "Nasıl araştırılmalı?",
      claims: [{ text: "Tarihli kanıtları karşılaştırın, özgün kaynak materyalini açın ve ölçülen ilgiyi bağlantılı haberlerdeki iddialardan ayırın.", evidence_reference_ids: leadIds, kind: "analysis" as const }],
    }] : []),
    {
      id: "counterpoints", label: "Kanıt sınırları", heading: "Kanıt neyi ispatlamıyor?",
      claims: [
        { text: `Bu bilgilendirme ${siteCount} bağımsız sitedeki mevcut kanıta dayanır. İlginin varlığını ve ne zaman gözlemlendiğini gösterebilir; nedensellik, gelecekteki büyüme veya alttaki fikrin kökenini belirleyemez.`, evidence_reference_ids: ids, kind: "limitation" },
        ...(!isDeep ? [{ text: "İkinci bir bağımsız kaynak gelene kadar makale bilinçli olarak kısa tutulur.", evidence_reference_ids: ids, kind: "limitation" as const }] : []),
      ],
    },
  ];

  return {
    ...brief,
    what_it_is: `${trend.title}, mevcut kaynak kanıtıyla izlenen güncel bir yapay zeka konusudur.`,
    why_trending: sourceCount > 1 ? `Konu ${sourceCount} ayrı sinyal sisteminde aynı dönemde görünüyor.` : "Konu şu anda tek bir sinyal sistemi tarafından destekleniyor.",
    useful_for: "Kaynakları karşılaştırmadan önce konunun daha derin araştırmaya değip değmediğini değerlendirmek için kullanışlıdır.",
    next_step: "En yeni kanıtı açın, özgün kaynağı inceleyin ve merkezi iddiayı bağımsız kaynaklarla doğrulayın.",
    caution: sourceCount > 1 ? "Birden fazla kaynak sistemi ilgiyi gösterir; neden veya gelecekteki büyümeyi kanıtlamaz." : "Tek kaynak sistemi bulunduğu için ilginin nedeni ve kalıcılığı doğrulanmamıştır.",
    article: { ...brief.article, sections },
  };
}
