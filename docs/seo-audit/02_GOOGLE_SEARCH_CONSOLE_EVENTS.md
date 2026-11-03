# 02 — Search Console "Etkinlikler" Hatası

## Rapordaki durum
Search Console bilgileri kullanıcının paylaştığı ekran ve rapora dayanıyor. Bu çalışmada
Search Console hesabına erişilmedi ve hesapta hiçbir ayar değiştirilmedi.

- 3 geçersiz öğe, hata: "location alanı eksik". Taranma tarihi 2 Kasım.
- Uyarılar: endDate, offers, image, eventStatus, description, performer, organizer.
- Etkilenen adresler İddialı Tahminler yazıları:
  `celtic-besiktas`, `trabzonspor-sc-freiburg`, `galatasaray-vfb-stuttgart`.

## Kök neden
| Yer | Eski işaretleme | Sorun |
|---|---|---|
| `/iddiali-tahminler/[slug]` | `Article.about = SportsEvent` (location yok) | Raporlanan 3 hata buradan |
| `/mac/[slug]` | `SportsEvent` + `location: {name: <turnuva adı>}` + `BroadcastEvent → broadcastOfEvent: SportsEvent` | Sahte konum. Google bu sayfaları taradıkça hata sayısı büyüyecekti (canlıda 66 Event öğesi, 9 sahte konum ölçüldü) |

## Neden Event işaretlemesi uygun değil
- Google Event belgesine göre etkinlik fiziksel bir mekânda gerçekleşmeli, ve Event zengin
  sonucu Türkiye'de sunulmuyor.
- Google'ın genel yapılandırılmış veri kuralları "A sports live streaming site labeling
  broadcasts as local events" durumunu yanıltıcı işaretleme olarak sayıyor.
- Sitenin sayfaları maçın TV yayın rehberi. Elimizde stadyum, bilet, organizatör ve bitiş
  saati verisi yok. Bu alanları doldurmak uydurma olurdu ve master prompt bunu yasaklıyor.

## Çözüm (`lib/structuredData.js`)
- Maç sayfası: `WebPage` (`@id`, `url`, `name`, `description`, `inLanguage: tr-TR`,
  `isPartOf: WebSite`, `about: [SportsTeam, SportsTeam]`) + `BreadcrumbList`. JSON-LD'deki
  açıklama, meta açıklamanın aynısı.
- Tahmin yazısı: `Article`. Yazar ve yayıncı `Organization "TV Spor Rehberi"` (kişi
  uydurulmadı). `about` alanında iki `SportsTeam` var. `image` alanı yazının OG görseli.
- `findEventTypes()` JSON-LD ağacını iç içe tarar. Testler ve `seo-audit` betiği bunu
  kullanarak Event türünün geri gelmesini engeller.
- Sayfa noindex yapılmadı, silinmedi, Googlebot'tan gizlenmedi.

## Beklenen etki
- Event zengin sonucu kaybedilmiyor, çünkü Türkiye'de zaten gösterilmiyordu.
- Yayından sonra Google sayfaları yeniden taradıkça Etkinlikler raporundaki öğeler
  "geçersiz" listesinden düşer. Hiç Event öğesi kalmayınca rapor boş görünebilir. Bu normal.
- Maç sayfaları için Google'ın zengin sonuç desteği olan bir alternatif yok. BreadcrumbList
  geçerli kalıyor.
