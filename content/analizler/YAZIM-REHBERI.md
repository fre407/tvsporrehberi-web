# Maç Analizleri — yazım rehberi

Bu dosya, tvsporrehberi.com'daki "Maç Analizleri" (maç sonu) yazılarının
kalıbıdır. Her akşam çalışan otomatik görev (`mac-analizleri-aksam`) yazıyı
yazmadan önce bu dosyayı baştan sona okur ve buna uyar.

## Kapsam
- Yalnızca **İddialı Tahminler yazısı olan** maçlar (4 büyükler + A Milli Takım).
- Analiz, **maç gününden 1 gün sonra** yazılır (maç günü TSİ "dün" ya da daha
  eski). Geçmişe dönük yazı yok: 13.11.2026 öncesi maçlara analiz yazılmaz
  (`scripts/analiz/bekleyen.mjs` bunu kendisi süzer).

## Altın kurallar
1. **Çok detaylı araştırma.** Önce `bekleyen.mjs` çıktısındaki skor, olaylar
   (gol/kart dakikaları) ve istatistik. Sonra web: maç raporları, teknik
   direktör ve oyuncu açıklamaları, hakem kararları/VAR tartışmaları, maçın
   kırılma anları, taraftar ve kamuoyu tepkisi.
2. **Ünlü yazarlardan ilham, kopya yok.** Türkiye'de en çok okunan maç sonu
   yazarlarının ve köşe yazılarının (Fanatik, Fotomaç, Sporx, Hürriyet,
   Milliyet, Sabah, NTV Spor, beIN Sports, Ajansspor, 90min ve tanınmış
   köşe yazarları) değerlendirmelerini oku; **hangi konuların öne çıktığını,
   yazarların maçı nasıl okuduğunu ve ortak eğilimi** not al. Cümleleri ASLA
   aynen alma; fikirleri kendi gözlemlerinle birleştir ve özgün cümlelerle
   yaz. Gerekirse "yorumcuların çoğu ... üzerinde birleşti" gibi isim
   vermeden genel eğilimi aktar. Yazar adı vererek alıntı yapma.
3. **Tahminin karnesi zorunlu.** Maç öncesi tahmin yazımızı oku
   (`content/tahminler/{predictionSlug}.json`): skor tahmini, gerekçeler,
   tercihler. Ayrı bir bölümde dürüstçe değerlendir: **neden tuttu, neden
   tutmadı?** Hangi varsayım doğru çıktı, hangisi yanlış; konjonktür
   değerlendirmemiz sahaya yansıdı mı? Savunmaya geçme, özür dileme;
   analitik ol. Bölüm başlığında "Tahmin" geçmeli (ör. "Tahminimiz neden
   tutmadı?", "Tahminimizin karnesi").
4. **Uydurma bilgi yok.** Skor, gol dakikası, oyuncu adı, istatistik,
   açıklama — hepsi veri ya da güvenilir kaynakla doğrulanır. Emin olunmayan
   bilgi yazılmaz.
5. **Oran, kupon, bahis sitesi, link yok.** İmza "TV Spor Rehberi Editörü"
   (sahte yazar yok).
6. Klişe yok ("Sonuç olarak", "Özetle", "Unutmamak gerekir ki", "zorlu bir
   sınav" …). Her yazı farklı başlasın. Taraf tutma; maçı iyi bilen tarafsız
   bir yazar gibi yaz.

## Yapı
- `title`: `{Ev} - {Deplasman} Maç Analizi: {kanca}` (55–90 karakter). Milli
  rakiplerde Türkçe ülke adı (Belçika).
- `seoTitle`: `{Ev} - {Deplasman} Maç Analizi ve Değerlendirme ({gg.aa.yyyy})`
- `description`: 110–170 karakter; skor + maçın ana hikâyesi.
- `intro`: **"Maç sonucu: {Ev} {a-b} {Deplasman}."** ile başlar, 3–5 cümleyle
  maçın özeti.
- `sections` (en az 5, toplam en az 700 kelime, hedef 800–1000):
  1. "Maçın hikâyesi" — dakika dakika değil, maçın akışı ve evreleri.
  2. "Kırılma anları" — goller, kırmızı kartlar, VAR, değişiklikler.
  3. "Öne çıkanlar ve sönük kalanlar" — oyuncu değerlendirmeleri.
  4. "Teknik direktörlerin planı" — taktik, oyun planı, maç içi hamleler.
  5. "Tahminimiz neden tuttu / tutmadı?" — ZORUNLU, yukarıdaki kural 3.
  6. (İsteğe bağlı) "Yorumcular ne diyor?" — genel eğilim, isimsiz.
  7. (İsteğe bağlı) "Bundan sonra ne olacak?" — puan durumu, sıradaki maç.
- `closing`: 2–3 cümle, kendi sesinle kapanış.

## Dosya biçimi — `content/analizler/{slug}.json`
```json
{
  "slug": "fenerbahce-liverpool-mac-analizi-2026-11-04",
  "predictionSlug": "fenerbahce-liverpool-mac-tahmini-2026-11-04",
  "matchSlug": "fenerbahce-liverpool-2026-11-04",
  "homeTeam": "Fenerbahçe",
  "awayTeam": "Liverpool",
  "competition": "sampiyonlar_ligi",
  "round": "League Stage - 4",
  "kickoff": "2026-11-04T17:45:00Z",
  "finalScore": { "home": 1, "away": 2 },
  "title": "...", "seoTitle": "...", "description": "...",
  "intro": "Maç sonucu: Fenerbahçe 1-2 Liverpool. ...",
  "sections": [{ "heading": "Maçın hikâyesi", "paragraphs": ["..."] }],
  "closing": "...",
  "author": "TV Spor Rehberi Editörü",
  "publishedAt": "2026-11-05T18:10:00+03:00",
  "updatedAt": "2026-11-05T18:10:00+03:00"
}
```
- `slug`, `predictionSlug`, `matchSlug`, `homeTeam`, `awayTeam`, `kickoff`,
  `finalScore` değerlerini `bekleyen.mjs` çıktısından AYNEN al.
- Kaydettikten sonra `node --no-warnings scripts/analiz/dogrula.mjs {slug}`.
