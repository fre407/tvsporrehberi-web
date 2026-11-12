# Rehber yazıları — haftalık yazım rehberi

Her 7 günde bir **en az 6 yazı** eklenir: **3 "Güncel"** + **3 "Futbol Tarihi"**.
Otomatik görev (`rehber-haftalik`) bu dosyayı baştan sona okur ve uyar.

## Konu seçimi
- **Güncel (3):** son 7–10 günün Türk ve dünya futbolunda en çok konuşulan
  konuları. Örnek: bir teknik direktör değişikliğinin arka planı, şampiyonluk
  yarışının durumu, Avrupa kupalarında Türk takımlarının tablosu, A Milli
  Takım'ın yeni dönemi, öne çıkan bir genç oyuncunun yükselişi, yaklaşan büyük
  bir derbinin hikâyesi. Haber kopyası değil; "neden önemli, ne anlama geliyor"
  açıklaması. Tarih geçince eskimeyecek biçimde yaz ("12 Kasım'da…" gibi kesin
  tarih ver, "dün" deme).
- **Futbol Tarihi (3):** Türk futbolseverin ilgisini çekecek tarih konuları:
  unutulmaz maçlar, efsane oyuncular ve hocalar, kulüplerin kuruluş hikâyeleri,
  rekorlar, büyük turnuvalardan anlar, ünlü transferler, statların hikâyesi.
  Türk futbolu ağırlıklı; dünya futbolundan Türk okurun bildiği büyük hikâyeler
  de olur.
- Var olan yazılarla (lib/guides*, content/rehber) aynı konuyu tekrar etme;
  `/rehber` listesine ve slug'lara bak.

## Altın kurallar
1. **Uydurma bilgi yok.** Her tarih, skor, isim, sayı web araştırmasıyla
   doğrulanır. Emin olunmayan ayrıntı yazılmaz. Kaynaklar arasında çelişki
   varsa o ayrıntıyı çıkar.
2. **Kopya yok.** Bilgi alınır, cümle alınmaz. Kendi cümlelerimizle yaz.
3. **Oran, kupon, bahis sitesi, link yok.** Sahte yazar yok; imza kurum.
4. Siyasi tartışmalara, yargı süreçlerine ve kişileri karalayan iddialara girme.
5. Doğal Türkçe: kısa ve uzun cümle karışık, somut bilgi, klişe yok
   ("Sonuç olarak", "Özetle", "Unutmamak gerekir ki" yasak).

## Biçim — `content/rehber/{slug}.json`
```json
{
  "slug": "kucuk-harf-tireli-slug",
  "category": "Güncel" | "Futbol Tarihi",
  "title": "30-110 karakter, merak uyandıran ama dürüst başlık",
  "description": "110-170 karakter, Google açıklaması",
  "publishedAt": "YYYY-MM-DD",
  "intro": "2-3 cümlelik giriş",
  "sections": [{ "heading": "Ara başlık", "paragraphs": ["...", "..."] }]
}
```
- En az 4 bölüm, en az 500 kelime (hedef 600–800).
- Kaydettikten sonra `node --no-warnings scripts/rehber/dogrula.mjs {slug}`;
  hata varsa düzelt.
