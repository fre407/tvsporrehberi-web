// "Rehber" yazıları — elle yazılmış, özgün, zamanla eskimeyen içerik
// (2026-11-12, AdSense "düşük değerli içerik" reddi sonrası). Kural: kesin
// bilinen bilgi; yayın hakkı/sözleşme süresi/şampiyonluk sayısı gibi
// değişebilen iddialar yok. İmza kurum adıyla (sahte yazar yok).

import kulupler from './guides/kulupler';
import milli from './guides/milli';
import bilgi from './guides/bilgi';
// Haftalık eklenen yazılar (content/rehber/*.json → scripts/rehber/derle.mjs).
import weekly from './generated/rehber.json';

const BASE_GUIDES = [
  {
    slug: 'mac-saatleri-tsi-saat-farki',
    title: 'Avrupa Maçlarının Türkiye Saatiyle Başlama Saati Neden Değişiyor?',
    description: 'Şampiyonlar Ligi ve Avrupa liglerindeki maçların TSİ başlama saati yıl içinde neden bir saat kayıyor? Yaz saati ve kış saati farkını örneklerle anlattık.',
    publishedAt: '2026-11-12',
    intro: 'Aynı turnuvanın maçı ekim ayında 22:00\'de, kasım ayında 23:00\'te başlıyorsa yayın akışında hata yoktur. Fark, Türkiye ile Avrupa ülkelerinin saat uygulamalarının farklı olmasından kaynaklanır.',
    sections: [
      {
        heading: 'Türkiye tüm yıl aynı saati kullanıyor',
        paragraphs: [
          'Türkiye 2016\'dan bu yana yaz ve kış saati arasında geçiş yapmıyor; ülke tüm yıl boyunca UTC+3 saat dilimini kullanıyor. Bu, Türkiye saatinin (TSİ) yıl içinde hiç değişmediği anlamına gelir.',
          'Avrupa\'nın büyük bölümü ise hâlâ yılda iki kez saat değiştiriyor. Mart ayının son pazarı saatler bir saat ileri alınıyor (yaz saati), ekim ayının son pazarı ise bir saat geri alınıyor (kış saati). Türkiye bu değişikliklere katılmadığı için Avrupa ile aramızdaki saat farkı yılın iki döneminde farklı oluyor.',
        ],
      },
      {
        heading: 'Fark ne kadar oluyor?',
        paragraphs: [
          'Almanya, İspanya, İtalya ve Fransa gibi Orta Avrupa ülkeleri yaz aylarında Türkiye\'den 1 saat geride, kış aylarında 2 saat geridedir. İngiltere ve Portekiz ise yaz aylarında 2 saat, kış aylarında 3 saat geridedir.',
          'Somut bir örnek verelim: Şampiyonlar Ligi\'nin akşam maçları Orta Avrupa saatiyle 21:00\'de başlar. Ekim sonuna kadar bu maçlar Türkiye\'de 22:00\'de izlenir; saatler geri alındıktan sonra aynı maçlar 23:00\'te başlar. Aynı mantıkla 18:45\'te başlayan erken maçlar yaz döneminde 19:45, kış döneminde 20:45 olarak görünür.',
          'Premier Lig\'de de durum aynıdır: İngiltere\'de 15:00\'te başlayan klasik cumartesi maçı yaz döneminde TSİ 17:00\'de, kış döneminde TSİ 18:00\'de başlar.',
        ],
      },
      {
        heading: 'Süper Lig maçları neden etkilenmiyor?',
        paragraphs: [
          'Süper Lig ve diğer yerel turnuvaların maçları zaten Türkiye saatine göre planlanır. Saat uygulaması değişmediği için bu maçların saatleri yıl içinde kaymaz; değişiklik yalnızca maç Avrupa\'nın bir şehrinde, oranın yerel saatine göre planlandığında ortaya çıkar.',
          'Türk takımlarının Avrupa kupası maçları için ise maçın nerede oynandığı belirleyicidir. Deplasman maçı Avrupa\'da oynanıyorsa saat genellikle oranın yerel saatine göre belirlenir ve Türkiye\'de yıl içindeki farka göre farklı saatlerde izlenir.',
        ],
      },
      {
        heading: 'Yayın rehberinde saatleri nasıl gösteriyoruz?',
        paragraphs: [
          'TV Spor Rehberi\'ndeki tüm maç saatleri Türkiye saatiyle (TSİ) gösterilir. Maç verisi uluslararası standart zamanla (UTC) gelir ve her maç için ayrı ayrı Türkiye saatine çevrilir; bu yüzden ekim ve mart aylarındaki saat değişikliklerinde ayrıca bir şey yapmanız gerekmez.',
          'Gece yarısına yakın başlayan maçlar için de dikkatli olmak gerekir. Örneğin Amerika\'daki bir maç TSİ ile ertesi gün 03:00\'te başlıyorsa rehberde o maç ertesi günün programında yer alır. Bir maçı bulamadığınızda bir sonraki günün listesine bakmanız çoğu zaman yeterlidir.',
        ],
      },
      {
        heading: 'Kısa özet',
        paragraphs: [
          'Türkiye\'nin saati yıl boyunca sabittir; değişen Avrupa\'nın saatidir. Ekim sonundan mart sonuna kadar Avrupa maçları Türkiye\'de bir saat daha geç başlar, yaz döneminde ise bir saat daha erken. Rehberdeki saatler bu farkı her zaman hesaba katar.',
        ],
      },
    ],
  },
  {
    slug: 'sampiyonlar-ligi-lig-asamasi-formati',
    title: 'Şampiyonlar Ligi, Avrupa Ligi ve Konferans Ligi Yeni Formatı Nasıl İşliyor?',
    description: 'UEFA kupalarındaki 36 takımlı lig aşaması, 8 ve 6 maçlık takvim, ilk 8 ve play-off sistemi: yeni Avrupa kupası formatını sade bir dille anlattık.',
    publishedAt: '2026-11-12',
    intro: '2024-25 sezonuyla birlikte UEFA\'nın üç kulüp turnuvasında da eski dörtlü gruplar kaldırıldı. Yerine tüm takımların tek bir puan tablosunda sıralandığı "lig aşaması" geldi. Sistemi ilk kez takip edenler için adım adım anlatıyoruz.',
    sections: [
      {
        heading: 'Gruplar yerine tek bir puan tablosu',
        paragraphs: [
          'Eski sistemde 32 takım sekiz gruba ayrılır ve her takım kendi grubundaki üç rakiple iki kez oynardı. Yeni sistemde Şampiyonlar Ligi, Avrupa Ligi ve Konferans Ligi\'nin her birinde 36 takım bulunuyor ve bu takımların hepsi tek bir ortak tabloda yer alıyor.',
          'Takımlar artık aynı rakiple iki kez oynamıyor. Kura, her takıma farklı güç torbalarından farklı rakipler veriyor. Bu sayede lig aşamasında daha çok sayıda büyük eşleşme ortaya çıkıyor ve her maçın sonucu doğrudan tüm sıralamayı etkiliyor.',
        ],
      },
      {
        heading: 'Kaç maç oynanıyor?',
        paragraphs: [
          'Şampiyonlar Ligi ve Avrupa Ligi\'nde her takım lig aşamasında 8 maç oynuyor: 4 maç kendi sahasında, 4 maç deplasmanda. Konferans Ligi\'nde bu sayı 6\'dır: 3 iç saha, 3 deplasman.',
          'Galibiyet 3, beraberlik 1 puan getiriyor. Puan eşitliğinde ilk bakılan kriter averajdır; ardından atılan gol ve deplasmanda atılan gol gibi kriterler sırayla devreye giriyor. Takımlar farklı rakiplerle oynadığı için ikili averaj bu aşamada kullanılmıyor.',
        ],
      },
      {
        heading: 'Sıralamanın anlamı: ilk 8, 9-24 ve 25. sıra sonrası',
        paragraphs: [
          'Lig aşaması bittiğinde tablo üç bölgeye ayrılır. İlk 8 sırayı alan takımlar doğrudan son 16 turuna yükselir ve bir tur dinlenmiş olur.',
          '9. ile 24. sıra arasındaki 16 takım, iki maç üzerinden oynanan play-off turunda eşleşir. Bu turun kazananları son 16\'da ilk 8\'deki takımların rakibi olur. 25. sıra ve altındaki takımlar turnuvadan elenir; eski sistemdeki gibi bir alt turnuvaya aktarılmaz.',
          'Bu yapı, son haftalara kadar çok sayıda takımın bir hedef için oynamasını sağlıyor: zirvedekiler ilk 8 için, ortadakiler play-off için, alt sıralardakiler ise 24. sıraya tutunmak için mücadele ediyor.',
        ],
      },
      {
        heading: 'Son 16\'dan finale',
        paragraphs: [
          'Son 16 turundan itibaren turnuva klasik eleme usulüyle devam eder. Eşleşmeler iki maç üzerinden oynanır; toplam skorda eşitlik olursa uzatmaya, gerekirse penaltı atışlarına gidilir. Deplasman golü kuralı artık uygulanmıyor.',
          'Final tek maçtır ve sezon başında belirlenen bir stadyumda oynanır. Avrupa Ligi şampiyonu sonraki sezonun Şampiyonlar Ligi\'ne, Konferans Ligi şampiyonu ise Avrupa Ligi\'ne katılma hakkı elde eder.',
        ],
      },
      {
        heading: 'Maç günleri ve takibi',
        paragraphs: [
          'Şampiyonlar Ligi maçları salı ve çarşamba, Avrupa Ligi ve Konferans Ligi maçları perşembe akşamları oynanır. Lig aşamasının son haftasında aynı turnuvanın tüm maçları aynı saatte başlar; böylece hiçbir takım rakiplerinin sonucunu bilerek oynamaz.',
          'TV Spor Rehberi\'nde her üç turnuvanın lig sayfasında yaklaşan maçları, saatlerini ve Türkiye\'deki yayıncısını; maç sayfalarında ise canlı skoru ve maç sonrası istatistikleri bulabilirsiniz.',
        ],
      },
    ],
  },
  {
    slug: 'puan-esitligi-nasil-bozulur',
    title: 'Ligde Puan Eşitliği Nasıl Bozulur? Süper Lig ve Avrupa Liglerinde İkili Averaj',
    description: 'Puanlar eşit olduğunda sıralama nasıl belirlenir? Süper Lig, La Liga ve Serie A\'daki ikili averaj ile Premier Lig ve Bundesliga\'daki genel averaj farkını açıkladık.',
    publishedAt: '2026-11-12',
    intro: 'Sezonun son haftalarında en çok sorulan sorulardan biri şudur: "Puanlar eşit olursa kim üstte biter?" Cevap lige göre değişir. Bazı ligler önce iki takımın kendi aralarındaki maçlara, bazıları ise sezon boyunca atılan ve yenen gollerin farkına bakar.',
    sections: [
      {
        heading: 'İki temel yaklaşım: ikili averaj ve genel averaj',
        paragraphs: [
          'Genel averaj, bir takımın sezon boyunca attığı gol sayısından yediği gol sayısının çıkarılmasıyla bulunur. Puan tablolarındaki "AV" ya da "+/-" sütunu budur.',
          'İkili averaj (ikili sonuç) ise yalnızca puanları eşit olan takımların kendi aralarında oynadığı maçlara bakar. Önce bu maçlarda toplanan puan, ardından bu maçlardaki gol farkı karşılaştırılır. Yani sezon boyunca kaç gol atıldığından önce, doğrudan rakibe karşı ne yapıldığı önem kazanır.',
        ],
      },
      {
        heading: 'Süper Lig\'de sıra nasıl belirleniyor?',
        paragraphs: [
          'Süper Lig\'de puanları eşit olan takımlar arasında ilk olarak aralarındaki maçlarda toplanan puanlara bakılır. Bu da eşitse aralarındaki maçlardaki gol farkı devreye girer. Eşitlik hâlâ bozulmamışsa genel averaja, ardından atılan gol sayısına geçilir.',
          'Bu kuralın pratik bir sonucu var: Süper Lig\'de doğrudan rakiple oynanan maçlar, puan tablosunda göründüğünden daha değerlidir. İki takım sezonu aynı puanla bitirirse, aralarındaki iki maçı daha iyi geçiren taraf genel averajı daha kötü olsa bile üstte yer alabilir.',
          'İkiden fazla takım aynı puanda olduğunda ise yalnızca bu takımların birbirleriyle oynadığı maçlardan küçük bir "mini tablo" oluşturulur ve sıralama bu tabloya göre yapılır.',
        ],
      },
      {
        heading: 'La Liga ve Serie A da ikili averajı kullanıyor',
        paragraphs: [
          'İspanya\'da La Liga, puan eşitliğinde Süper Lig gibi önce takımların kendi aralarındaki maçlara bakar. İtalya\'da Serie A da sıralamayı belirlerken ikili sonuçları genel averajın önüne koyar.',
          'Serie A\'da ek bir kural daha var: şampiyonluk ya da küme düşme sınırında iki takım puan eşitliğiyle biterse, sıralama tek maçlık bir eşleşmeyle belirlenebilir. Bu yüzden İtalya\'da sezonun son gününden sonra bile ek bir maç oynanması mümkündür.',
        ],
      },
      {
        heading: 'Premier Lig, Bundesliga ve Ligue 1: önce genel averaj',
        paragraphs: [
          'İngiltere\'de Premier Lig, puan eşitliğinde önce genel averaja, ardından atılan gol sayısına bakar. İkili sonuçlar ancak bu kriterler de eşitse gündeme gelir. Almanya\'da Bundesliga ve Fransa\'da Ligue 1 de genel averajı ilk sıraya koyan ligler arasındadır.',
          'Bu sistemde sezon boyunca atılan her gol önemlidir. Zayıf bir rakibe karşı 1-0 yerine 4-0 kazanmak, sezon sonunda bir takımı bir üst sıraya taşıyabilir.',
        ],
      },
      {
        heading: 'Avrupa kupalarında durum farklı',
        paragraphs: [
          'Şampiyonlar Ligi, Avrupa Ligi ve Konferans Ligi\'nin lig aşamasında takımlar farklı rakiplerle oynadığı için ikili averaj kullanılmaz; puan eşitliğinde önce averaja bakılır.',
          'TV Spor Rehberi\'ndeki puan tabloları, her ligin kendi resmi sıralamasını gösterir. Sezonun son haftalarında eşit puanlı takımlar varsa yukarıdaki kuralları akılda tutmak, tablonun neden o şekilde sıralandığını anlamayı kolaylaştırır.',
        ],
      },
    ],
  },
  {
    slug: 'yayin-bilgisi-nasil-hazirlaniyor',
    title: 'TV Spor Rehberi Nasıl Çalışıyor? Maç ve Yayın Bilgisi Nasıl Hazırlanıyor?',
    description: 'Maç saatleri, yayın kanalları, canlı skor ve "Yayınlanmıyor" etiketinin anlamı: TV Spor Rehberi\'ndeki bilgilerin nasıl toplandığını ve nasıl okunacağını anlattık.',
    publishedAt: '2026-11-12',
    intro: 'TV Spor Rehberi tek bir soruyu en hızlı şekilde yanıtlamak için var: "Bu maç hangi kanalda, saat kaçta?" Bu yazıda sitedeki bilgilerin nereden geldiğini, ne sıklıkla güncellendiğini ve ekranda gördüğünüz etiketlerin ne anlama geldiğini anlatıyoruz.',
    sections: [
      {
        heading: 'Maç programı ve skorlar',
        paragraphs: [
          'Maç programı, sonuçlar, canlı skor, kadrolar ve istatistikler lisanslı bir spor verisi sağlayıcısından otomatik olarak alınır. Fikstürler gün içinde düzenli aralıklarla, canlı maçlar ise maç sürerken çok daha sık güncellenir. Bir maçın saati ertelenir ya da değişirse yeni saat bir sonraki güncellemeyle rehbere yansır.',
          'Saatlerin tamamı Türkiye saatiyle (TSİ) gösterilir. Maç saati verisi uluslararası standart zamanla gelir ve her maç için ayrı ayrı Türkiye saatine çevrilir; Avrupa\'daki yaz/kış saati değişikliklerinin etkisini ayrı bir rehber yazısında açıkladık.',
        ],
      },
      {
        heading: 'Yayın kanalları nereden geliyor?',
        paragraphs: [
          'Bir maçın Türkiye\'de hangi kanalda ya da dijital platformda yayınlanacağı, yayıncı kuruluşların duyurduğu yayın akışlarından derlenir. Aynı maç birden fazla yayıncıda yer alıyorsa (örneğin bir televizyon kanalı ve bir dijital platform) hepsi maç satırında birlikte gösterilir.',
          'Kanal adına tıkladığınızda o kanalın yayın akışı sayfasına gidersiniz. Bu sayfada önümüzdeki günlerde o kanalda yayınlanacak maçların listesi bulunur.',
        ],
      },
      {
        heading: 'Etiketlerin anlamı',
        paragraphs: [
          '"Yayınlanmıyor" etiketi, o maçın Türkiye\'de yayınlanmayacağı bilgisinin doğrulandığı durumlarda kullanılır. Kanal bilgisi henüz netleşmemiş maçlarda bu ifadeyi kullanmıyoruz; yayıncı duyurusu geldiğinde kanal adı eklenir.',
          'Bazı maçlarda kanal adının yanında "(Azerbaycan)" etiketi görürsünüz. Bunlar Türkiye\'den de ilgi gören Azerbaycan yayıncılarıdır; Türk yayıncılarla karışmaması için her zaman listenin sonunda ve etiketle gösterilir.',
          'Canlı maçlarda skorun yanında maçın dakikası yer alır. Maç sırasında atılan goller ve görülen kırmızı kartlar, bilgi güncel ve skorla tutarlı olduğunda skor kartının altında oyuncu adı ve dakikasıyla listelenir.',
        ],
      },
      {
        heading: 'Hangi turnuvaları takip ediyoruz?',
        paragraphs: [
          'Rehber; Süper Lig, TFF 1. Lig ve Türkiye Kupası başta olmak üzere Türk futbolunu, Şampiyonlar Ligi, Avrupa Ligi ve Konferans Ligi\'ni, Premier Lig, La Liga, Serie A, Bundesliga ve Ligue 1\'i ve milli takım turnuvalarını kapsar. Türkiye\'de yayıncısı olan diğer ligler de programda yer alabilir.',
          'Puan durumu, gol ve asist krallığı gibi bilgiler ilgili lig sayfalarında; maç öncesi analizler ise İddialı Tahminler bölümünde yer alır.',
        ],
      },
      {
        heading: 'Hata gördüğünüzde',
        paragraphs: [
          'Yayın akışları son dakikada değişebildiği için nadiren de olsa bir kanal bilgisi güncelliğini yitirebilir. Hatalı ya da eksik bir bilgi fark ederseniz İletişim sayfasındaki e-posta adresinden bize yazabilirsiniz; düzeltme talepleri en kısa sürede değerlendirilir.',
          'Site ve TV Spor Rehberi mobil uygulaması aynı veri altyapısını kullanır. Uygulama ek olarak favori takım ve canlı skor bildirimleri sunar.',
        ],
      },
    ],
  },
];

// Hub sayfasında kategori sırası; temel yazılar "Futbol Bilgisi" altında.
export const GUIDE_CATEGORIES = ['Güncel', 'Futbol Tarihi', 'Kulüpler', 'Milli Takım', 'Efsaneler', 'Oyuncular', 'Avrupa ve Dünya', 'Futbol Bilgisi'];
export const GUIDES = [
  ...weekly,
  ...kulupler,
  ...milli,
  ...bilgi,
  ...BASE_GUIDES.map((guide) => ({ category: 'Futbol Bilgisi', publishedAt: '2026-11-12', ...guide })),
].map((guide) => ({ publishedAt: '2026-11-12', ...guide }));

export function guideBySlug(slug) {
  return GUIDES.find((guide) => guide.slug === slug) ?? null;
}

export function guideUrl(guide) {
  return `/rehber/${guide.slug}`;
}
