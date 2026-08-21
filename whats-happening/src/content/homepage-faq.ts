export type HomepageFaq = {
  question: string;
  answer: string;
};

export const homepageFaqs: HomepageFaq[] = [
  {
    question: "What is What's Happening in AI?",
    answer:
      "What's Happening is a source-linked trend-intelligence product for founders and analysts tracking emerging technology. It turns scattered source observations into scored trends, linked evidence, country context, and a plain-language explanation of why attention moved.",
  },
  {
    question: "How are source signals scored?",
    answer:
      "The system reads official or permissioned sources such as Hacker News, GitHub, and Google Trends, then groups related signals into trends. Each trend score combines velocity, reach, and novelty, while source links stay attached so you can inspect the evidence behind it.",
  },
  {
    question: "What does country context mean?",
    answer:
      "Country context is based on the earliest country-tagged evidence available for a trend. It shows where attributed evidence first appeared in the system, not where a topic was invented, began, or was caused.",
  },
  {
    question: "What is a breakout watch signal?",
    answer:
      "A breakout watch signal is a scored trend candidate with strong novelty and rising observed attention that has not crossed the Global Pulse threshold. It ranks what may deserve inspection; it does not predict future popularity.",
  },
  {
    question: "How fresh is the trend data?",
    answer:
      "When the live data service is configured, source ingestion is designed to run every 10 minutes and the homepage refreshes active trends every 15 to 30 seconds. If live data is unavailable, the product says so instead of presenting demo fixtures as current activity.",
  },
  {
    question: "How much does What's Happening cost?",
    answer:
      "The public product views cost $0. Account-based early access is also priced at $0, but account creation and live trend records are unavailable until the production data service is connected. There is no checkout or paid plan today.",
  },
];

export const homepageFaqsTr: HomepageFaq[] = [
  { question: "What's Happening in AI nedir?", answer: "What's Happening, gelişen teknolojiyi izleyen kurucular ve analistler için kaynak bağlantılı bir trend istihbaratı ürünüdür. Dağınık kaynak gözlemlerini puanlanmış trendlere, bağlantılı kanıtlara, ülke bağlamına ve ilginin neden değiştiğini açıklayan sade bir özete dönüştürür." },
  { question: "Kaynak sinyalleri nasıl puanlanır?", answer: "Sistem Hacker News, GitHub ve Google Trends gibi resmi veya izinli kaynakları okur, ardından ilgili sinyalleri trendler halinde gruplar. Her trend puanı hız, erişim ve yeniliği birleştirir; kanıtları inceleyebilmeniz için kaynak bağlantıları korunur." },
  { question: "Ülke bağlamı ne anlama gelir?", answer: "Ülke bağlamı, bir trend için mevcut en erken ülke etiketli kanıta dayanır. Bir konunun icat edildiği, başladığı veya sebep olduğu yeri değil, atfedilmiş kanıtın sistemde ilk görüldüğü yeri gösterir." },
  { question: "Yükseliş izleme sinyali nedir?", answer: "Yükseliş izleme sinyali, güçlü yeniliğe ve artan gözlemlenmiş ilgiye sahip ancak Küresel Nabız eşiğini geçmemiş puanlı bir trend adayıdır. Nelerin incelenmeye değer olabileceğini sıralar; gelecekteki popülerliği tahmin etmez." },
  { question: "Trend verileri ne kadar güncel?", answer: "Canlı veri hizmeti yapılandırıldığında kaynak alımı her 10 dakikada bir çalışacak şekilde tasarlanmıştır ve ana sayfa aktif trendleri 15 ila 30 saniyede bir yeniler. Canlı veri kullanılamıyorsa ürün, demo kayıtlarını güncel etkinlik gibi göstermek yerine bunu açıkça belirtir." },
  { question: "What's Happening ne kadar?", answer: "Herkese açık ürün görünümleri 0 ABD dolarıdır. Hesap tabanlı erken erişim de 0 ABD doları olarak fiyatlandırılmıştır; üretim veri hizmeti bağlanana kadar hesap oluşturma ve canlı trend kayıtları kullanılamaz. Bugün ödeme veya ücretli plan yoktur." },
];
