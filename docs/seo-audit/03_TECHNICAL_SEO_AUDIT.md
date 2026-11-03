# 03 — Teknik SEO Denetimi

Araç: `node --no-warnings scripts/seo-audit.mjs [baseUrl] --sample 40`.
Çalıştırılan ortamlar: canlı site (önce) ve yerel üretim derlemesi `next start -p 3030`
(sonra).

## Tarama / dizinleme
| Konu | Bulgu | Durum |
|---|---|---|
| Site haritası | 6 alt harita, geçerli XML, yalnız apex adresler | ✅ |
| Site haritasında 404 | /takim/elversberg, /takim/milan, /takim/cska-sofya. Supabase `max-rows = 1000` takım listesini kesiyordu (`.limit(5000)` bu sınırı aşmıyor) | ✅ `fetchAllRows()` ile `.range()` sayfalama |
| Site haritasında noindex | 3 günden eski maç sayfası noindex, ama site haritası 1 saat önbellekli ve 3 gün geriye bakıyordu | ✅ Pencere 2,5 güne indirildi |
| Çift takım sayfası | Milan / AC Milan | ✅ Takma ad + 308 |
| robots.txt | Erişilebilir, site haritası belirtiliyor | ✅ |

## Canonical ve yönlendirmeler
| Konu | Durum |
|---|---|
| Her sayfada kendi apex canonical'ı | ✅ 0 hata |
| www → apex, http → https | ✅ Tek adımda, canlıda ölçüldü |
| Eski kimlikli maç adresi → slug | 307 idi, ✅ 308 (`permanentRedirect`) yapıldı |
| Takım takma adı → asıl slug | 307 idi, ✅ 308 yapıldı |

## SSR (Googlebot UA ile ilk HTML)
Anahtar sayfaların hepsinde tek H1 var. Maç adları, saatler, kanallar ve `/mac/` bağlantıları
ilk HTML'de bulunuyor. İçerik JavaScript'e bağlı değil.

## /bugun ve gece yarısı
- Gün anahtarları İstanbul saatine göre hesaplanıyor (`istDateKey`, `dateKeyOffset`,
  `istKeyToUtcRange`).
- 23:55, 00:00, 00:05, ay sonu ve yıl sonu durumları testle doğrulandı
  (bkz. 09_TEST_RESULTS).
- Ana sayfa: önizlemede bugüne ait maç yoksa (gece) başlık "Yarının Maçları" oluyor.

## Yapılandırılmış veri
Bkz. 02. Event öğesi sayısı 66'dan 0'a indi, sahte konum sayısı 9'dan 0'a. Çift tür yok.

## Güvenlik başlıkları
HSTS, X-Content-Type-Options, X-Frame-Options DENY, Referrer-Policy ve Permissions-Policy
var. **CSP yok.** AdSense ve GA4 nedeniyle dikkatle kurulmalı. Açık iş (bkz. 08).

## Uygulama bağlantıları
Google Play bağlantısı 200 dönüyor. App Store sayfası "TV Spor Rehberi App" uygulamasına
gidiyor.
