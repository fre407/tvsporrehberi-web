# 05 — Performans ve Erişilebilirlik

## PageSpeed Insights (canlı ana sayfa, mobil, 03.11.2026, önce)
PSI API kotası dolduğu (429) için ölçüm pagespeed.web.dev arayüzünden okundu.

| Kategori | Puan |
|---|---|
| Performans | 88 |
| Erişilebilirlik | 96 |
| En iyi uygulamalar | 100 |
| SEO | 100 |

| Metrik | Değer |
|---|---|
| FCP | 0,9 sn |
| LCP | 0,9 sn |
| TBT | 0 ms |
| **CLS** | **0,229** (eşik 0,1) |
| Speed Index | 3,0 sn |

## CLS kök nedeni ve düzeltme
- `<main>` 0,176 kayıyordu. `StickyBanner` sunucuda `null` dönüyor, hydration'dan sonra
  belirip sayfayı aşağı itiyordu.
- Düzeltme: şerit sunucuda görünür çiziliyor. Daha önce kapatmış ziyaretçide
  `app/layout.js` içindeki erken betik `<html data-app-banner="off">` koyuyor ve CSS
  şeridi ilk boyamadan önce gizliyor. Bu yüzden kapatmış kullanıcıda da kayma yok.
- Kalan kayma: yazı tipi değişimi yaklaşık 0,053. Açık iş (bkz. 08), çünkü font metrik
  ayarı görsel test gerektiriyor.

## Erişilebilirlik — renk kontrastı
- PSI'nin işaretlediği öğeler (açık tema, sarı vurgu metni krem zeminde): logodaki
  "REHBERİ", `.eyebrow`, başlıktaki `<em>`, "Tüm program" bağlantısı, "Sıradaki maçlar"
  başlığı.
- Düzeltme: yeni `--accent-text` belirteci eklendi. Koyu temada değeri sarının kendisi
  (değişiklik yok), açık temada `#8a6100`. Açık temada `.eyebrow` da bu rengi kullanıyor.
- Yerel ölçüm: beş öğenin hepsi **5,08:1**, AA eşiği 4,5. /bugun, maç, lig, takım ve
  tahmin sayfalarında bu rengin düşük kontrastlı kullanımı kalmadı. Koyu zeminli mağaza
  düğmeleri sarıda bırakıldı.

## Sonra ölçümü
Canlı PSI ölçümü ancak yayından sonra yapılabilir. **Henüz ölçülmedi.**
Beklenti: CLS yaklaşık 0,05 civarı, erişilebilirlik 100. Doğrulanmadı.
