# 01 — Yönetici Özeti (TV Spor Rehberi, 03.11.2026)

Kapsam: yalnızca tvsporrehberi.com web sitesi (repo `tvsporrehberi-web`). TV Spor Rehberi
mobil uygulamasına, veri hattına ve CIRCUIT oyununa dokunulmadı.

Bu rapordaki tüm değişiklikler `seo-audit-2026-11-03` dalında. **Canlıya çıkmadı.** `main`'e
birleştirmek Vercel'de otomatik yayın demek ve bu kullanıcı onayı bekliyor.

## En önemli bulgu
Search Console'daki "Etkinlikler → location alanı eksik" hatası (3 geçersiz öğe) **İddialı
Tahminler** yazılarından geliyordu. Yazıların `Article.about` alanında konumsuz bir
`SportsEvent` vardı. Maç sayfalarında da sorun vardı: `SportsEvent` + `BroadcastEvent`
kullanılıyor, `location` alanına turnuva adı yazılıyordu (sahte konum). Google bu sayfaları
henüz raporlamamıştı ama aynı hatanın kaynağı bunlardı.

Google'ın Event zengin sonucu fiziksel mekânda yapılan etkinlikler içindir ve Türkiye'de
desteklenmiyor. Genel yapılandırılmış veri kuralları da "A sports live streaming site labeling
broadcasts as local events" durumunu yanıltıcı işaretleme örneği olarak sayıyor. Bu nedenle
konum uydurmak yerine **Event işaretlemesi tamamen kaldırıldı.** Maç sayfaları artık
`WebPage`, yazılar `Article` olarak işaretleniyor. İki sayfa türü de `about: SportsTeam`
kullanıyor.

## Sayılarla önce / sonra (`npm run seo-audit`)
| Ölçüt | Canlı (önce) | Yerel derleme (sonra) |
|---|---|---|
| İncelenen sayfa (200) | 51 / 54 | 54 / 54 |
| P0 (kritik) | 3 (site haritasındaki takım sayfaları 404) | 0 |
| P1 (yüksek) | 77 | 0 |
| Event türünde öğe | 66 | 0 |
| Sahte konum | 9 | 0 |
| Site haritasında olup noindex olan | 2 | 0 |
| P3 (uzun title/description) | 13 | 9 (uzun takım adlarından) |

## Diğer düzeltmeler
- Supabase'in 1000 satır sınırı, geniş zaman pencerelerini sessizce kesiyordu. Bu yüzden
  bazı takım sayfaları 404 veriyordu (elversberg, cska-sofya). Sorgular artık sayfalanıyor.
- "Milan" ile "AC Milan" iki ayrı takım sayfası oluşturuyordu. İkisi birleştirildi ve
  /takim/milan artık 308 ile /takim/ac-milan'a gidiyor.
- Maç sayfasının meta açıklaması maçın durumuna göre yazılıyor. Bitmiş maç için "oynanacak"
  denmiyor.
- Maç sayfasından kanal sayfasına iç bağlantı eklendi.
- Gece saatlerinde ana sayfa başlığı "Yarının Maçları" oluyor.
- CLS düzeltildi: uygulama şeridi sunucuda çiziliyor (ölçülen kayma 0,176).
- Açık temada metin kontrastı 4,5:1 eşiğinin üstüne çıkarıldı (ölçülen değer 5,08:1).
- Eski kimlikli adresler ve takım takma adları için yönlendirmeler kalıcı (308) yapıldı.
- 15 otomatik test ve `seo-audit` betiği eklendi.

## Kullanıcıdan beklenen
1. Dalın canlıya alınması için onay.
2. Yayından sonra Search Console'da "Düzeltmeyi doğrula" adımı (bkz. 07_MANUAL_ACTIONS).
