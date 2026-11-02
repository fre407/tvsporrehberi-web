# İddialı Tahminler — yazım rehberi

Bu dosya, tvsporrehberi.com'daki "İddialı Tahminler" yazılarının kalıbıdır.
Her akşam çalışan otomatik görev (Claude) yazıyı yazmadan önce bu dosyayı
baştan sona okur ve buna uyar. Kalıp; Türkiye'de en çok okunan maç önü /
iddaa tahmin yazılarının (Fanatik, Sporx, 90min, Milliyet Skorer, Misli
"Günün Tüyoları", Bilyoner yazarları) ortak özelliklerinden çıkarıldı ve
tek bir yazarın sesiyle birleştirildi: o sitelerde tahminler genelde birkaç
yazara bölünür; bizde tek, akıcı, baştan sona okunan bir maç önü yazısı var.

## Kapsam

- Galatasaray, Fenerbahçe, Beşiktaş ve Trabzonspor'un **resmi** maçları:
  Süper Lig, Türkiye Kupası, Süper Kupa, UEFA kupaları. Hazırlık maçı yok.
- İki büyük karşılaşıyorsa (derbi) tek yazı.
- Yazı maçtan 12–48 saat önce yayımlanır.

## Altın kurallar

1. **Kopya yok.** Başka sitelerin cümleleri asla aynen alınmaz. Onlardan
   yalnızca *bilgi* (sakat, cezalı, hoca açıklaması, istatistik) ve *genel
   eğilim* (ör. "yorumcuların çoğu karşılıklı gol bekliyor") alınır, kendi
   cümlelerimizle anlatılır. Kopya içerik Google'da cezalandırılır.
2. **Uydurma bilgi yok.** Sakat/cezalı, skor, istatistik, hoca sözü — hepsi
   araştırmada gerçekten bulunan bilgiye dayanır. Emin olunmayan bilgi
   yazılmaz ya da "son antrenmanda durumu netleşecek" gibi temkinli verilir.
   Oyuncu adlarını ve kulüplerini kontrol et; yanlış takımda oyuncu yazma.
3. **Oran, kupon, bahis sitesi yok.** "MS 1", "KG Var", "2.5 Üst", "İY/MS"
   gibi iddaa terimleri serbest; oran sayısı (1.85 gibi), "kupon", "banko
   kupon", bahis sitesi/uygulama adı (Bilyoner, Misli, Nesine vb.) ve link
   kesinlikle yok. Yasa dışı bahis sitelerinden hiç söz edilmez.
4. **Taraf tutma yok.** Büyük takımın taraftarı gibi değil, maçı iyi bilen
   tarafsız bir spor yazarı gibi yaz. Gerekirse büyük takımın kaybedeceğini
   ya da zorlanacağını açıkça söyle — gerçekçilik güven kazandırır.
5. **Yazar kimliği uydurulmaz.** İmza her zaman "TV Spor Rehberi Editörü".

## Ses ve üslup (insan gibi yazmanın yolu)

- Sohbet havasında, kendinden emin, yer yer iddialı: "bence", "tercihim",
  "burada risk almam", "bu maçta beraberlik bana uzak geliyor" gibi birinci
  tekil ifadeler kullan; ama her cümleye "bence" koyma.
- Cümle uzunluklarını karıştır. Kısa, vurucu cümleler + açıklayıcı uzun
  cümleler. Arada tek cümlelik çarpıcı bir tespit olabilir.
- Futbol jargonunu doğal kullan: "orta saha göbeği", "kanat bindirmesi",
  "geçiş savunması", "set hücumu", "ikinci top", "duran top", "pres hattı",
  "kontra atak", "ilk 15 dakika", "son çeyrek".
- Takma adları ölçülü kullan: "sarı-kırmızılılar", "sarı-lacivertliler",
  "siyah-beyazlılar", "bordo-mavililer"; rakip için de kendi lakabı.
- Somut ol: "son 5 maçta 13 gol" gibi gerçek sayılar ver; genel laf yerine
  isim ve durum söyle.
- **Yapay zekâ kokan kalıplardan kaçın:** "Sonuç olarak", "Özetle",
  "Unutmamak gerekir ki", "heyecan dolu bir mücadele bizi bekliyor",
  "taraftarlar nefesini tutmuş", "her iki takım da", "bu maç sadece bir maç
  değil", "zorlu bir sınav" gibi klişeler ve her paragrafı aynı kalıpla
  bitirmek yasak. Madde işareti yağmuru yok; düzyazı ağırlıklı.
- Her yazı farklı başlasın. Aynı giriş cümlesi iki yazıda tekrarlanmasın.

## Başlık

- `title` (sayfanın H1'i): `{Ev} - {Deplasman} Maç Tahmini: {iddialı kanca}`
  - Kanca kısa, merak uyandıran, tahmini ele veren bir cümle:
    "Kadıköy'de Liverpool alıp gidecek", "Aslan evinde affetmez",
    "Gol düellosu kapıda", "Karadeniz'de Alman duvarı".
  - Toplam 55–80 karakter. Kanca abartılı ama yalan değil.
- `seoTitle` (tarayıcı sekmesi / Google başlığı, 60 karaktere yakın):
  `{Ev} - {Deplasman} Maç Tahmini ve İddaa Yorumu ({gg.aa.yyyy})`
- `description` (Google açıklaması, 140–160 karakter): skor tahminini,
  maçın tarihini/kanalını ve en güçlü tercihi içersin.

## Yazının yapısı

1. **Giriş paragrafı (`intro`)** — MUTLAKA skor tahminiyle başlar:
   "Skor tahminim: Fenerbahçe 1-2 Liverpool." Ardından 3–5 cümleyle maçın
   bağlamı (turnuva, haftası/aşaması, puan durumu, maçın önemi) ve tahminin
   kısa gerekçesi. Tarih, saat (TSİ) ve yayın kanalı burada doğal geçsin.
2. **Bölümler (`sections`)** — her birinin kısa bir ara başlığı var; en az
   5 bölüm, her bölüm 1–2 paragraf, toplam en az 650 kelime:
   - "Form durumu" — iki takımın son 5 resmi maçı, gol attığı/yediği,
     iç saha/deplasman performansı. Somut skorlar.
   - "Sakatlar, cezalılar ve muhtemel 11" — kim yok, kim döndü, hocanın
     muhtemel tercihi. Bilgi yoksa uydurma, "kadro sürprizi beklenmiyor" de.
   - "Taktik çerçeve / maçın anahtarı" — hocaların oyun planı, eşleşmeler,
     belirleyici oyuncular, hakem (biliniyorsa).
   - "İlk yarı beklentisi" — ilk 45'in temposu, kim baskı kurar, ilk yarı
     skoru beklentisi.
   - "İkinci yarı ve maçın kırılma anı" — değişiklikler, yorgunluk, son
     çeyrek, skorun nasıl şekilleneceği.
   - (Varsa) "Aralarındaki son maçlar" — head-to-head.
   - "Yorumcular ne diyor?" (isteğe bağlı) — Türkiye'deki tahmin
     yazarlarının genel eğilimi, kendi cümlelerimizle ve isim vermeden
     ("yorumcuların büyük kısmı ev sahibine yakın duruyor" gibi). Bizim
     tahminimiz farklıysa nedenini söyle.
3. **Tercihler (`picks`)** — 3–5 iddaa tercihi, en güçlüsü ilk sırada:
   `{ "market": "Maç Sonucu", "pick": "MS 2", "note": "kısa gerekçe" }`
   Kullanılabilir pazarlar: Maç Sonucu (MS 1 / MS X / MS 2), Çifte Şans
   (1-X, X-2, 1-2), Karşılıklı Gol (KG Var / KG Yok), Toplam Gol (1.5/2.5/3.5
   Üst/Alt), İlk Yarı Sonucu, İY/MS (ör. "X/1"), İlk Yarı 0.5/1.5 Üst/Alt,
   Handikap (ör. "Handikaplı MS 1 (0:1)"), Korner/Kart yalnızca veri varsa.
   Tercihler skor tahminiyle çelişmesin (skor 2-1 ise "KG Yok" olmaz).
4. **Son söz (`closing`)** — 2–3 cümle, kendi sesinle kısa kapanış; skoru
   tekrar etmek yerine maçın kilit noktasını vurgula. "Sonuç olarak" ile
   başlama.

## Araştırma sırası (her yazıdan önce)

1. Veri: `node scripts/tahmin/mac-verisi.mjs` çıktısı — fikstür, kanal, son
   maçlar, puan durumu, aralarındaki son maçlar.
2. Web: her iki takım için son 48 saatin haberleri — sakat/cezalı, kadro,
   hoca açıklaması, rotasyon ihtimali, hakem. (WebSearch "standard";
   gerekirse "extended".)
3. Web: Türkiye'deki popüler tahmin yazıları/yorumcular bu maç için ne
   diyor (Fanatik iddaa, Sporx, 90min, Milliyet Skorer, Ajansspor, Fotomaç,
   yorumcu YouTube başlıkları). Sadece eğilimi not al, metni kopyalama.
4. Hepsini birleştirip kendi gerçekçi tahminini oluştur. Popüler görüşe
   körü körüne uyma; veri başka şey söylüyorsa onu yaz.

## Dosya biçimi

`content/tahminler/{slug}.json` — örnek alanlar:

```json
{
  "slug": "fenerbahce-liverpool-mac-tahmini-2026-11-04",
  "matchSlug": "fenerbahce-liverpool-2026-11-04",
  "homeTeam": "Fenerbahçe",
  "awayTeam": "Liverpool",
  "competition": "sampiyonlar_ligi",
  "round": "League Stage - 4",
  "kickoff": "2026-11-04T17:45:00Z",
  "channel": "TRT 1",
  "title": "Fenerbahçe - Liverpool Maç Tahmini: ...",
  "seoTitle": "Fenerbahçe - Liverpool Maç Tahmini ve İddaa Yorumu (04.11.2026)",
  "description": "...",
  "scorePrediction": { "home": 1, "away": 2 },
  "intro": "Skor tahminim: Fenerbahçe 1-2 Liverpool. ...",
  "sections": [{ "heading": "Form durumu", "paragraphs": ["...", "..."] }],
  "picks": [{ "market": "Maç Sonucu", "pick": "MS 2", "note": "..." }],
  "closing": "...",
  "keywords": ["fenerbahçe liverpool tahmin", "fenerbahçe liverpool iddaa"],
  "author": "TV Spor Rehberi Editörü",
  "publishedAt": "2026-11-02T19:10:00+03:00",
  "updatedAt": "2026-11-02T19:10:00+03:00"
}
```

- `slug` = ev ve deplasman takımının sitedeki adlarının slug'ı +
  `-mac-tahmini-` + maç tarihi (TSİ, YYYY-MM-DD).
- `matchSlug` = `mac-verisi.mjs` çıktısındaki `matchSlug` (sitedeki maç
  sayfasının adresi); aynen kopyala.
- Kaydetmeden önce `node scripts/tahmin/dogrula.mjs` çalıştır; hata varsa düzelt.
