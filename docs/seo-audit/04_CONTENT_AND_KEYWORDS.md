# 04 — İçerik ve Anahtar Kelimeler

## Sayfa türlerine göre hedef sorgular
| Sayfa | Hedef sorgu kalıbı | Durum |
|---|---|---|
| `/mac/[slug]` | "X - Y maçı hangi kanalda", "saat kaçta" | Title kalıbı doğru. Açıklama artık maç durumuna göre yazılıyor |
| `/bugun` | "bugün hangi maçlar var", "bugünkü maçlar hangi kanalda" | Title 77 karakter (P3), tarih title içinde |
| `/takim/[slug]` | "Galatasaray maçı ne zaman / hangi kanalda" | ✅ |
| `/lig/[slug]` | "Süper Lig maç programı", "yayın kanalları" | ✅ |
| `/kanal/[slug]` | "TRT 1 yayın akışı maç", "beIN Sports 1 bugün" | ✅ Maç sayfasından artık bağlantı alıyor |
| `/iddiali-tahminler` | "Galatasaray maçı tahmini", "iddaa yorumu" | Title ve açıklama kısaltıldı |

## Yapılan içerik düzeltmeleri
- Maç sayfası meta açıklaması beş durumu ayırıyor: bitti, bitti ama skor bilinmiyor, canlı,
  ertelendi/iptal, yaklaşan. Eskiden bitmiş maç için de gelecek zaman kullanılıyordu.
  Saatten sonra gelen hatalı Türkçe ek de kaldırıldı.
- Uzun title/description'lar kısaltıldı: /iddiali-tahminler, /yayin-haklari, /ligler.
- Kalan 9 uzun title, uzun takım adlarından geliyor (ör. "Eintracht Frankfurt - Hamburger
  SV"). Google uzun başlığı kendisi kısaltır. Takım adını bozmamak için bunlara
  dokunulmadı (P3).

## İddialı Tahminler
- Oran, kupon, bahis sitesi adı veya bağlantısı yok. Mevcut kural korunuyor.
- Yazar "TV Spor Rehberi Editörü" olarak görünüyor, JSON-LD'de Organization. Gerçek olmayan
  kişi biyografisi oluşturulmadı.
- **Kullanıcı kararı:** master prompt ana sayfada yazının kısa özetinin gösterilmesini
  öneriyor. Kullanıcı daha önce yazının ana sayfada tamamının gösterilmesini istemişti. Bu
  davranış değiştirilmedi. Canonical yazı sayfasında olduğu için çift içerik riski düşük.

## Güven sayfaları
/hakkimizda, /iletisim ve /gizlilik-politikasi mevcut ve 200 dönüyor. Sahte ekip üyesi
eklenmedi.
