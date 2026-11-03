# 09 — Test Sonuçları

## Birim testleri — `npm test`
`node --no-warnings --test tests/*.test.mjs`. Sonuç: **15 test, 15 geçti, 0 başarısız.**

Yapılandırılmış veri (`tests/structured-data.test.mjs`):
- Maç sayfası, 5 senaryo: gelecek maç, stadyum bilinmiyor, ertelenmiş, iptal/yayıncı
  bilinmiyor, geçmiş maç. Her senaryoda şunlar doğrulanır: tür `WebPage`; Event türü yok;
  `location`, `offers`, `organizer`, `performer`, `startDate`, `endDate`, `eventStatus`
  alanları yok; JSON-LD açıklaması meta açıklamayla aynı; iki takım `SportsTeam` olarak var.
- Tahmin yazısı: tür `Article`, Event yok, yazar `Organization`.
- `findEventTypes` iç içe Event türünü yakalıyor (regresyon koruması).
- Breadcrumb sırası.

Tarih (`tests/dates.test.mjs`):
- Gün anahtarı İstanbul saatiyle 23:55, 00:00 ve 00:05'te doğru.
- Ay sonu ve yıl sonu geçişleri doğru.
- `istKeyToUtcRange('2026-11-04')` → `2026-11-03T21:00Z`.
- Gece yarısından sonraki maçın slug'ı ertesi günün tarihini alıyor.

## Denetim — `npm run seo-audit`
| | Canlı (önce) | Yerel derleme (sonra) |
|---|---|---|
| Sayfa 200 | 51/54 | 54/54 |
| Site haritası adresi | 679 | 646 (noindex ve hatalı takım adresleri çıktı) |
| P0 / P1 / P2 / P3 | 3 / 77 / 0 / 13 | 0 / 0 / 0 / 9 |
| Event öğesi / sahte konum | 66 / 9 | 0 / 0 |

## Elle doğrulamalar (yerel derleme)
- `/takim/milan` → **308** → `/takim/ac-milan`
- Maç sayfası HTML'inde `href="/kanal/bein-sports-2"` var.
- Ana sayfa HTML'inde `class="sticky-banner"` (SSR) ve erken gizleme betiği var.
- Açık tema kontrastı 5,08:1, ölçülen beş öğenin hepsinde. Altı sayfa türü tarandı ve
  4,5'in altında kalan öğe bulunmadı.

## Yapılmayanlar
- Canlı PSI'nın "sonra" ölçümü yayından sonra yapılacak.
- Search Console doğrulaması kullanıcıda.
