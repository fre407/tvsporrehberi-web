# tvsporrehberi.com — DEVİR NOTU (güncel: 03.11.2026, main `56ef6d8`)

> Yeni oturum: bu dosyayı baştan sona oku. Bu not **yalnızca web sitesi** içindir.
> TV Spor Rehberi **mobil uygulaması** (FutbolMaclari / `tv-spor-rehberi-app`) ve **Circuit oyunu**
> bu işin kapsamı DIŞINDA — onlara ait klasörleri, kodları, sürümleri ve veri hattını açma, değiştirme,
> önerme. Site, uygulamanın Supabase verisini **yalnızca okur**.

---

## 1. Kısa kimlik
| | |
|---|---|
| Site | https://tvsporrehberi.com (kanonik adres **apex**, www → apex 308) |
| Ne yapar | "Hangi maç hangi kanalda, saat kaçta?" TV yayın rehberi + canlı skor, kadro, istatistik, puan durumu, maç yorumları, "İddialı Tahminler" yazıları |
| Yerel klasör | `C:\Users\fatih\tvsporrehberi-web` |
| GitHub | `fre407/tvsporrehberi-web`, dal `main` |
| Yayın | Vercel — **`main`'e her push = otomatik canlı yayın** (~30 sn – 2 dk). Ortam değişkeni yok |
| Teknoloji | Next.js 16.3 (App Router, RSC), React 18, `@supabase/supabase-js`. TypeScript yok, test için `node:test` |
| Stüdyo adı | Her metinde **"Fre4 Studios"** (asla "Fre4 Developments") |
| Dil | Kullanıcıyla Türkçe konuş. Site TR + EN (`lib/i18n.js`, çerez/`lib/locale.js`) |

## 2. Çalışma ortamı (bu makine)
- **Node PATH'te değil**, `E:\` üzerinde. Bash'te her komutun başına: `PATH="/e:$PATH" npm ...`
  (PowerShell: `$env:Path = "E:\;" + $env:Path`).
- Komutlar:
  - `npm run dev` — geliştirme (`.claude/launch.json` → port 3000). `predev` tahmin yazılarını derler.
  - `npm run build` → `npx next start -p 3030` — üretim derlemesini yerelde dene.
  - `npm test` — 15 test (`tests/*.test.mjs`: yapılandırılmış veri + gece yarısı/ay/yıl sonu tarihleri).
  - `npm run seo-audit` (canlı) / `node --no-warnings scripts/seo-audit.mjs http://localhost:3030 --sample 40` (yerel).
    P0/P1 = 0 olmalı. Son canlı sonuç: 54/54 sayfa, P0 0, P1 0, P3 9 (uzun takım adlı başlıklar).
- **curl ile test ederken tarayıcı User-Agent'ı ver** (`-A "Mozilla/5.0 Chrome/130"`): `proxy.js`
  curl/python/headless gibi istemcilere 403 verir.
- Windows'ta eski `next start` süreçleri portu tutabiliyor: `Get-NetTCPConnection -LocalPort 3030`
  → `taskkill /PID <id> /T /F`.

## 3. Klasör haritası
```
app/                        Next.js rotaları (hepsi sunucuda çizilir, SSR)
  layout.js                 <html>, tema+banner erken betiği, AdSense betiği, GSC doğrulama, Header/Footer/StickyBanner
  page.js                   Ana sayfa (düzen: lib/siteConfig.js HOME_LAYOUT='pano'); İddialı Tahminler kısa özet kutusu
  bugun/  canli/  gun/[date]/   Günlük program, canlı skorlar, belirli gün
  mac/[slug]/page.js        Maç detayı — slug: {ev}-{dep}-YYYY-MM-DD (eski sayısal id → 308)
  takim/[slug]/  takimlar/  Takım sayfası (takma ad → 308), takım listesi
  lig/[slug]/  ligler/      Lig sayfası (puan durumu, istatistik), lig listesi
  kanal/[slug]/  kanallar/  Kanal sayfası, kanal listesi
  yayin-haklari/            Veriden "hangi lig hangi kanalda"
  iddiali-tahminler/        Liste + [slug] yazı sayfası + [slug]/opengraph-image.js
  hakkimizda/ iletisim/ gizlilik-politikasi/ not-found.js
  api/live  api/search  api/comments  api/predictions   (istemci uçları; no-store)
  robots.js  sitemap.xml/route.js (dizin) + sitemaps/{static,leagues,days,matches,entities,tahminler}.xml
components/                 27 bileşen. Önemliler:
  Guide.js / MatchDayBoard.js / MatchExpandedCard.js   Ana sayfa ve gün listeleri (saat blokları, açılır kart)
  LiveGuide.js / LiveNowStrip.js                       Canlı yenileme (/api/live)
  Lineups, MatchStats, HeadToHead, Standings, LeagueStats, FormDots   Maç/lig veri blokları
  MatchComments.js / MatchPrediction.js                Yorumlar + "Kim kazanır?" anketi
  PredictionShowcase.js                                Ana sayfa tahmin kutusu (yalnız özet)
  StickyBanner.js                                      Üst uygulama şeridi (SSR'de görünür — CLS düzeltmesi)
  Header, Footer, SearchBox, ThemeToggle, LanguageToggle/Provider, FavoriteButton (localStorage), AppCta, DailyShareCard, JsonLd
lib/
  supabase.js               İstemci (anon anahtar kodda, herkese açık; yazma güvenliği RLS'te)
  data.js                   TÜM veri sorguları + kurallar: matchStatus, broadcastServices, channelDisplay,
                            isForeignBroadcaster (Azerbaycan kanalları sona + etiket), isIndexWorthyMatch,
                            fetchAllRows (1000 satır sınırı için .range sayfalama), getFixture*, getStandings…
  format.js                 İstanbul saati: istTime, istDateKey, istKeyToUtcRange, dateKeyOffset, slugify, matchSlug
  competitions.js           Turnuva anahtarları, slug, etiket, öncelik
  teamNames.js              Takım adı birleştirme (ör. Milan → AC Milan), kanal adı
  structuredData.js         JSON-LD üreticileri (WebPage, Article, Breadcrumb) + findEventTypes
  sitemapXml.js             Site haritası girdileri ve pencereleri
  predictions.js            Tahmin yazıları erişimi (lib/generated/tahminler.json'dan)
  links.js                  SITE_URL, playStoreUrl(campaign) UTM'li, APP_STORE_URL
  siteConfig.js             HOME_LAYOUT ('pano' | 'klasik')
  i18n.js, locale.js, rounds.js
  generated/tahminler.json  derle.mjs çıktısı (depoya commit'li)
content/tahminler/          Tahmin yazıları (*.json) + YAZIM-REHBERI.md (yazım kuralları)
scripts/
  seo-audit.mjs             SEO denetimi
  tahmin/                   mac-verisi.mjs (veri), kurallar.mjs, dogrula.mjs, derle.mjs, oyun-kontrol.ps1
tests/                      structured-data.test.mjs, dates.test.mjs
supabase/site_match_comments.sql   Siteye ait tablolar/fonksiyonlar (bir kez elle çalıştırıldı)
docs/seo-audit/01-09        03.11.2026 SEO denetim raporları
public/ads.txt, app-ads.txt AdSense/AdMob (bot filtresinden muaf, apex'te yönlendirmesiz 200)
next.config.mjs             Güvenlik başlıkları, www→apex yönlendirme
proxy.js                    Bot filtresi + bellek içi hız sınırı (iyi botlar her zaman geçer)
```
`README.md` ESKİ (SportsEvent vb. yazıyor) — doğru kaynak bu not.

## 4. Veri
- Supabase projesi `pwpwibvomoujxokjxtlp`, görünüm **`fixtures_with_channel`** (+ kadro/istatistik/puan tabloları).
  Veri, mobil uygulamanın **kilitli veri hattı** tarafından doldurulur — siteden o hatta/tablolara
  **dokunulmaz**, yalnızca okunur.
- **PostgREST 1000 satır sınırı** sorguyu sessizce keser (`.limit(5000)` aşmaz) → geniş pencerelerde `fetchAllRows()` kullan.
- Siteye ait yazılabilir tablolar yalnızca: `site_match_comments`, `site_match_predictions` (+ fonksiyonlar,
  küfür/argo/bağlantı filtresi `site_comment_is_clean` ve hız sınırı **veritabanında**; 3 bildirimde yorum gizlenir;
  yönetim Supabase Table Editor'dan). Veritabanında silme / geri alınamaz migration yapma; SQL'i kullanıcı çalıştırır.

## 5. SEO — güncel kurallar (bozma)
- Kanonik = **apex**. Bir daha www'ye çevirme (2026-11-01'deki yönlendirme döngüsü GSC'yi sıfırlamıştı).
- **Event/SportsEvent/BroadcastEvent JSON-LD YOK — bilinçli.** Maç sayfası `WebPage`, tahmin `Article`,
  `about: SportsTeam`. Google Event zengin sonucu TR'de yok ve "yayını yerel etkinlik gibi işaretlemek"
  politikaya aykırı. Sahte stadyum/bilet/organizatör/bitiş saati ekleme. Testler bunu korur.
- Maç sayfası noindex: başlama saatinden **3 gün** sonra veya `isIndexWorthyMatch` yanlışsa
  (çekirdek turnuva değil ve yayıncı yok). `follow: true`. Site haritası maçları **2,5 gün geri / 30 gün ileri** listeler.
  Açık tartışma: zengin içerikli geçmiş büyük maçlar için koşullu indeks pilotu — **AdSense kararından sonra**
  (kullanıcı henüz karar vermedi).
- Meta açıklama maç durumuna göre (`matchDescription` — bitti/canlı/ertelendi/yaklaşan).
- Sitemap'te noindex veya yönlendirmeli adres olmamalı (seo-audit denetler).
- Açık işler (öncelik sırası): yazı tipi kaynaklı CLS ~0,053; CSP (önce Report-Only, AdSense/GA/Supabase alanları);
  9 uzun başlık (P3, takım adı bozulmasın).

## 6. Google hesapları — durum
- **Search Console**: yalnız apex URL-önek mülkü. Claude'un erişimi yok; işlemleri kullanıcı yapar.
  Bekleyen: Etkinlikler → "location alanı eksik" → **Düzeltmeyi doğrula** (03.11 yayından sonra), PSI yeniden ölçüm.
- **AdSense** (`ca-pub-3167111771074405`): "Düşük değere sahip içerik" reddi sonrası **inceleme 2026-11-01'de istendi, sonuç bekleniyor.**
  İnceleme sürerken sayfa silme / büyük yapı değişikliği yapma. Otomatik reklamlar AÇIK (yalnız alt sabit reklam,
  vinyet açık, sayfa başı ≤7), **otomatik optimizasyon KAPALI kalacak** (kullanıcı kararı). Onay gelirse:
  AB/İngiltere izin mesajını aç, reklam yerleşimini canlıda kontrol et. `.google-auto-placed` ızgara koruması CSS'te.
- GA4 sitede yok.

## 7. İddialı Tahminler
- Kapsam: GS, FB, BJK, TS'nin **resmi** maçları (hazırlık yok). Adres: `/iddiali-tahminler/{ev}-{dep}-mac-tahmini-YYYY-MM-DD`.
- Yazı = `content/tahminler/<slug>.json`. Kurallar `content/tahminler/YAZIM-REHBERI.md` + `scripts/tahmin/kurallar.mjs`
  (≥650 kelime, ≥5 bölüm, giriş "Skor tahminim:" ile başlar, tercih skorla çelişmez).
- **Kullanıcının kesin kuralları:** iddaa terimleri serbest ama **oran, kupon, bahis sitesi adı/bağlantısı YOK**;
  imza "TV Spor Rehberi Editörü" — **sahte insan yazar/biyografi uydurma**; başka siteden metin kopyalama;
  **konjonktür zorunlu** ("Kulüplerde son durum": hoca, yönetim, camia, moral, kamuoyu beklentisi);
  skor `mac-verisi` gol beklentisinden başlar, konjonktürle düzeltilir — **her maça 2-1/1-2 verme**.
- Akış: `mac-verisi.mjs` → yazıyı yaz → `dogrula.mjs` (hata = çıkış 1, push yok) → `derle.mjs`
  (`lib/generated/tahminler.json`) → commit + push.
- **Akşam görevi** `iddiali-tahminler-aksam` (19:00/21:00/23:00, tanım:
  `C:\Users\fatih\.claude\scheduled-tasks\iddiali-tahminler-aksam\SKILL.md`): önce `oyun-kontrol.ps1`
  (tam ekran/oyun ya da GPU 3D > %35 → erteler), sonra 54 saatlik eksik yazıları yazar ve push eder.
  Ağır komut ve tarayıcı açmaz. Claude masaüstü açık olmalı. Bu görev de push ettiği için çalışmaya başlamadan
  `git pull --rebase` yap.
- Ana sayfada en yakın günün yazısının **yalnızca kısa özeti** (başlık, skor, ilk 2 cümle, 3 tercih, "tamamını oku").
  Yazının tamamı kendi sayfasında (kullanıcı 03.11'de onayladı).
- Bitmiş maçta "tuttu/tutmadı" `evaluatePick` ile otomatik.

## 8. Tasarım ve davranış kararları (kullanıcının)
- Ana sayfa düzeni "2 + 6": `MatchDayBoard` + saat bloklu `Guide`. Geri dönüş: `HOME_LAYOUT='klasik'` ya da git etiketi
  `tasarim-oncesi-2026-11-01`.
- Varsayılan tema **açık**; koyu tema seçilebilir (`tvsporrehberi:theme`). Vurgu metni `--accent-text`
  (açık temada `#8a6100`, kontrast 5,08:1). Koyu zemin üstünde sarı kalır.
- Üst sarı şerit: Play + App Store düğmeleri. Kapatma: `@tvsporrehberi_app_banner_dismissed`.
- Azerbaycan kanalları gizlenmez; Türk kanallarından sonra "(Azerbaycan)" etiketiyle.
- Maç sayfasında yorumlar + anket uygulama satırının altında; maç sayfası kanal adlarını `/kanal/...` sayfalarına bağlar.

## 9. Çalışma kuralları
- Yalnızca bu repo. Uygulama, veri hattı, Circuit = dokunma.
- Değişiklik **canlıya push = yayın**: büyük/riskli değişiklikte önce kullanıcıya sor; kullanıcı onay verince
  `main`'e push et (kullanıcı site değişikliklerinin GitHub'a gitmesini istiyor). Commit sonu:
  `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- Yayından önce: `npm test`, `npm run build`, yerelde `seo-audit`. Yayından sonra canlıda `npm run seo-audit`.
- DNS, Vercel, Search Console, AdSense ve ücretli servislerde kullanıcı onayı olmadan işlem yok;
  yapılmamış işi yapılmış gibi raporlama.
- Hiçbir sayfayı hata kapatmak için noindex yapma / silme / gizleme.

## 10. Son değişiklikler (yeniden eskiye)
- `56ef6d8` Ana sayfa tahmin kutusu kısa özet.
- `17b311a` SEO denetimi: Event işaretlemesi kaldırıldı, takım 404'leri (1000 satır), Milan birleşimi, 308'ler,
  sitemap 2,5 gün, durum farkında açıklama, maç→kanal bağlantısı, gece başlığı, CLS ve kontrast, testler + seo-audit.
- `fa80eec` Tahmin: konjonktür bölümü + skor ayarı (GS-STU 2-2, FB-LIV 1-4, TS-FRE 2-1, CEL-BJK 1-3).
- `baea202` İddialı Tahminler. `5b2e7df` Yorumlar + anket. `6dc21bb` "2+6" ana sayfa. `68a045f` kanonik döngü düzeltmesi.
