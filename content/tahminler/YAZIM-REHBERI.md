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
- **Türkiye A Milli Takımı**'nın resmi maçları (Uluslar Ligi, Dünya Kupası /
  EURO elemeleri ve finalleri). Özel/hazırlık maçı yok. "Kulüplerde son
  durum" bölümünde milli takımın teknik direktörü, kamp kadrosu, federasyon
  ve rakip milli takımın durumu anlatılır (başlıkta yine "Kulüp" ya da
  uygun bir ifade geçmeli). Rakip veride İngilizce adla gelir (Belgium);
  metinde ve başlıkta Türkçe adı (Belçika) kullan, homeTeam/awayTeam alanları
  veri adıyla kalır.
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

## Konjonktür: takımları SADECE sahadaki puanla değerlendirme

Kullanıcının en önemli uyarısı (2026-11-02): "Takımların güncel durumunu
sadece futbol ve puana göre değil, her anlamda, konjonktürel olarak
değerlendir." Bir takımın sahaya nasıl çıkacağını puan tablosundan çok
kulübün o haftaki havası belirler. Her yazıdan önce MUTLAKA araştır:

- **Teknik direktör:** yeni mi geldi, kovuldu mu, istifa mı etti, geçici
  hoca mı var, yeni hoca gelmek üzere mi, koltuğu sallanıyor mu? Geçici
  hocalı ve yönetim krizindeki bir takım, kâğıt üstündeki kadrosunun çok
  altında oynar — tahmine bunu yansıt.
- **Yönetim ve camia:** başkana/yönetime protesto, "istifa" tezahüratı,
  olağanüstü toplantı, seçim/kongre, mali sorun, transfer yasağı.
- **Soyunma odası:** oyuncu–taraftar gerginliği, kadro dışı bırakılanlar,
  ayrılık söylentileri, hocayla sorun, kaptanın sakatlığı.
- **Moral ve seri:** üst üste yenilgiler, kaçan maçlar ("2-0'dan 2-2"),
  derbi yenilgisinin yorgunluğu ya da galibiyet serisinin özgüveni.
- **Takvim ve motivasyon:** maç yoğunluğu, rotasyon, hafta sonu derbi/lider
  maçı, tur atlama hesabı, ligdeki yarış (kendi liginde kaçıncı?).
- **Rakibin konjonktürü:** yabancı rakibin de hocası baskı altında mı,
  kendi liginde kaçıncı, krizde mi, yükselişte mi?
- **Kamuoyu beklentisi:** taraftarın ve yorumcuların bu maçtan ne beklediği
  ("ağır bir yenilgi korkusu", "farklı galibiyet beklentisi"). Beklentiyi
  yazıda söyle; katılıyorsan neden, katılmıyorsan neden.

Bu araştırma yazıda **"Kulüplerde son durum"** başlıklı ayrı bir bölüm
olarak yer alır (zorunlu; başlıkta "Kulüp" geçmeli) ve skor tahminini
doğrudan etkiler.

## Skor tahmini nasıl verilir (skor ayarı)

Hata (2026-11-02): ilk dört yazının hepsine 2-1/1-2 verilmişti — riskten
kaçınıp her maça "güvenli" tek farklı skor yazmak gerçekçi değildir.

1. `mac-verisi.mjs` çıktısındaki `golBeklentisi` hareket noktasıdır:
   beklenen goller, 1/X/2 olasılıkları ve en olası skorlar. Bu taban lig
   seviyesi farkını ve iç saha avantajını hesaba katar ama konjonktürü
   BİLMEZ.
2. Konjonktürle düzelt: krizdeki, geçici hocalı, sakatlıklarla savunması
   dağılmış takımın yiyeceği gol beklentisini artır; serisi süren,
   özgüvenli takımınkini artır. Fark büyükse skor da büyük olur: güçlü
   rakibe karşı krizdeki takıma 0-3, 1-4, hatta 0-5 yazmaktan çekinme.
3. Dengeli maçta beraberlik (1-1, 2-2) de gerçek bir seçenektir.
4. Tek farklı skor ancak gerçekten dengeli ve tek golün belirleyeceği bir
   maçsa verilir; her maça varsayılan olarak 2-1/1-2 yazma. Son yazıların
   skorlarına bak, hepsi tek farklıysa bu maçın gerçekten öyle olup
   olmadığını yeniden düşün.
5. Skorun gerekçesini yazıda açıkça kur: "neden 1-4, neden 0-2 değil?"

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
   - "Kulüplerde son durum" (ZORUNLU, ilk bölüm) — yukarıdaki konjonktür
     başlıklarından bulunanlar: hoca, yönetim, camia, moral, kamuoyu
     beklentisi; iki takım için de.
   - "Form durumu" — iki takımın son 5 resmi maçı, gol attığı/yediği,
     iç saha/deplasman performansı, kendi liglerindeki yeri. Somut skorlar.
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

1. Veri: `node --no-warnings scripts/tahmin/mac-verisi.mjs` çıktısı —
   fikstür, kanal, son maçlar, turnuva ve kendi ligindeki puan durumu,
   gol beklentisi (`golBeklentisi`), aralarındaki son maçlar.
2. Web — KONJONKTÜR (her iki takım için, son 1 hafta): hoca durumu,
   yönetim/camia krizi, protesto, istifa, yeni hoca söylentisi, soyunma
   odası, taraftar tepkisi, kamuoyu beklentisi. (WebSearch "extended".)
3. Web — son 48 saatin maç haberleri: sakat/cezalı, kadro, muhtemel 11,
   hoca açıklaması, rotasyon ihtimali, hakem. (WebSearch "standard";
   gerekirse "extended".)
4. Web: Türkiye'deki popüler tahmin yazıları/yorumcular bu maç için ne
   diyor (Fanatik iddaa, Sporx, 90min, Milliyet Skorer, Ajansspor, Fotomaç,
   yorumcu YouTube başlıkları). Sadece eğilimi not al, metni kopyalama.
5. Hepsini birleştirip kendi gerçekçi tahminini oluştur ("Skor tahmini
   nasıl verilir" bölümüne uy). Popüler görüşe körü körüne uyma; veri ve
   konjonktür başka şey söylüyorsa onu yaz.

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
