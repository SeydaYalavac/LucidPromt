# What's Happening: canlı trend backend'i

Bu uygulama statik trend kartları yerine resmi/veri-lisanslı API'lerden sinyal toplar, trend skorlar, Supabase üzerinden hızlı okur, yeni trend için bir defa AI açıklaması üretir ve trend başına canlı geliştirici sohbeti sunar.

```text
HN API ─────────┐
GitHub REST ────┼─> 10 dk worker ─> normalize/cluster/score ─> Supabase
Google RSS ─────┤                                           ├─> Edge-cached Next API ─> SWR UI
optional APIs ──┘                                           └─> Realtime chat
                                              new trend ───────> OpenAI Why Layer (once)
```

## Hızlı kurulum

1. Supabase projesi oluşturun ve `supabase/migrations/20260820_realtime_trends.sql` dosyasını SQL Editor'da çalıştırın.
2. Supabase Authentication bölümünde GitHub provider'ını açın. Callback URL olarak Supabase'in gösterdiği callback'i GitHub OAuth App'e ekleyin.
3. `.env.example` dosyasını `.env.local` olarak kopyalayın ve public/secret anahtarları doldurun.
4. `npm run ingest` ile ilk veriyi çekin; ardından `npm run dev` ile uygulamayı açın.
5. GitHub Actions için aynı Supabase/OpenAI değerlerini repository secrets olarak, kaynak seçimlerini repository variables olarak ekleyin.

```bash
npm install
npm run typecheck
npm test
npm run ingest
npm run dev
```

`DEMO_MODE=true` yalnızca yerel görsel test içindir. Bu mod veriyi açıkça `DEMO DATA` olarak etiketler, canlı veriyle karıştırmaz ve sohbet yazmayı kapatır. Production'da açmayın.

## Dosya haritası

- `supabase/migrations/20260820_realtime_trends.sql`: `trends`, `signals`, `countries`, `chat_messages`, `ingestion_runs`, RLS ve Realtime.
- `workers/sources.ts`: resmi HN, GitHub, Google Trends RSS ve isteğe bağlı Reddit/X/Tavily/Exa adaptörleri.
- `workers/trend-ingest.ts`: paralel kaynak okuma, normalize etme, kümeleme, skorlama, upsert ve Why Layer tetikleme.
- `src/lib/scoring.ts`: Velocity %45, Reach %35, Novelty %20 birleşik skoru. Her metrik 0–100 aralığında.
- `src/lib/why-layer.ts`: OpenAI Responses API Structured Outputs ile `What happened?`, `Why now?`, `Where it started?` alanları.
- `src/app/api/trends/**`: Edge-cache başlıkları taşıyan trend/sinyal/country okuma route'ları.
- `src/app/api/trends/[slug]/messages/route.ts`: bearer session doğrulama, server-side moderasyon ve kontrollü chat insert'i.
- `src/components/TrendChat.tsx`: GitHub OAuth, Supabase Realtime ve canlı mesaj akışı.

## Global Pulse ve performans

`trends.is_global_pulse` PostgreSQL generated column'dur ve `score > 80` olduğunda otomatik `true` olur. Partial index, skora göre sıralı Global Pulse okumalarını hızlandırır. Next route'ları 15 saniyelik CDN cache ve 60 saniyelik stale-while-revalidate başlığı döndürür. SWR görünür ekranda 15–30 saniyede yeniler; chat cache beklemeden Realtime değişikliklerini alır.

## Why Layer: yalnızca bir defa

Worker yeni trend eklediğinde `claim_why_generation(trend_id)` RPC'sini çağırır. Atomik `pending -> processing` geçişini yalnızca bir process kazanır. Başarılı çıktı veritabanına yazılır; başarısız kayıt kendiliğinden tekrar denenmez. Operatör sebebi çözdükten sonra ilgili satırı bilinçli olarak `pending` durumuna alabilir.

## Sohbet güvenliği

- Herkes görünür mesajları okuyabilir; yalnızca doğrulanmış Supabase oturumu yazabilir.
- Client doğrudan insert yetkisi almaz. Next route token'ı doğrular, moderasyonu çalıştırır ve sonra service role ile yazar.
- OpenAI anahtarı varsa `omni-moderation-latest`, yoksa dar kapsamlı yerel spam/tehdit filtresi kullanılır.
- Veritabanı trigger'ı kullanıcı başına dakikada 8 mesaj sınırı uygular. Mesaj gövdesi 1–1000 karakterdir.
- `SUPABASE_SECRET_KEY` ve `OPENAI_API_KEY` hiçbir zaman browser bundle'ına girmez.

## Kaynaklar, telif ve hukuki sınırlar

“Sınırsız” fiziksel olarak API limitlerinden bağımsız değildir. Bu mimari kaynak adaptörü ve worker sayısı eklenerek yatay büyür; her sağlayıcının kullanım şartı, kota ve lisansı yine geçerlidir.

| Kaynak | Erişim | Saklanan veri |
|---|---|---|
| Hacker News | Resmi Firebase API | başlık, link, puan/yorum sayısı |
| GitHub | Resmi REST Search API | repo adı, kısa açıklama, link, star/fork sayısı |
| Google Trends | Resmi trending RSS | sorgu adı, yaklaşık trafik, Trends linki |
| Reddit | Resmi OAuth API, opsiyonel | başlık, en fazla 500 karakter excerpt, permalink, metrikler |
| X | Resmi recent-search API, opsiyonel | en fazla 280 karakter post, resmi post linki, public metrics |
| Tavily/Exa | Sağlayıcı API'si, opsiyonel | başlık, link, en fazla 500 karakter sağlayıcı snippet'i |

HTML scraping yoktur. Haber metni, tam Reddit yorumları veya tam makale gövdesi kopyalanmaz. Kaynak URL her sinyalle tutulur; excerpt sınırlandırılır. GitHub'ın resmi “Trending API”si olmadığı için adaptör, son 7 günde oluşturulan ve en çok star alan public repository'leri resmi Search API üzerinden kullanır; bunu “GitHub Trending” diye yanlış etiketlemez.

Production'a almadan önce gizlilik politikasına veri kaynaklarını, saklama süresini ve kullanıcı mesajı moderasyonunu ekleyin. X/Reddit gibi sağlayıcılarda silme/takedown yükümlülüklerini kendi planınıza göre uygulayın. Bu repo hukuki danışmanlık sunmaz; ürünün faaliyet göstereceği ülkeler için hukuk incelemesi gerekir.

## Operasyon

GitHub Actions workflow'u her 10 dakikada bir çalışır ve aynı anda ikinci ingestion run'ını başlatmaz. Hata alan kaynak diğerlerini durdurmaz; `ingestion_runs` tablosu partial/failed durumunu ve kısa hata metnini kaydeder. Varsayılan kaynak seti anahtarsız HN, GitHub ve Google Trends RSS'tir. Reddit, X, Tavily ve Exa ancak anahtarları verilip `INGEST_SOURCES` içine eklenince çalışır.
