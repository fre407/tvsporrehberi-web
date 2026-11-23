import Link from 'next/link';
import { SITE_URL } from '../../lib/links';

export const revalidate = false;

export const metadata = {
  title: 'Gizlilik Politikası',
  description: 'TV Spor Rehberi web sitesinin gizlilik politikası — hangi verilerin işlendiği, çerezler ve reklam gösterimi hakkında bilgi.',
  alternates: { canonical: `${SITE_URL}/gizlilik-politikasi` },
  robots: { index: true, follow: true },
};

export default function PrivacyPage() {
  return (
    <>
      <div className="hero" style={{ paddingBottom: 10 }}>
        <div className="wrap">
          <div className="eyebrow">Yasal</div>
          <h1>Gizlilik Politikası</h1>
        </div>
      </div>
      <section style={{ paddingTop: 8 }}>
        <div className="wrap legal-text">
          <p>
            Bu sayfa, <strong>tvsporrehberi.com</strong> web sitesinin ziyaretçi verilerini nasıl işlediğini açıklar.
            TV Spor Rehberi mobil uygulamasının (Android ve iOS) kendi gizlilik politikası ayrıdır ve uygulama içindeki bağlantıdan
            ulaşılabilir.
          </p>

          <h2>Hangi veriler toplanıyor?</h2>
          <p>
            Sitede üyelik veya kayıt yoktur; ziyaretçilerden gerçek isim, e-posta ya da telefon gibi kişisel veriler
            talep edilmez. Sunucularımız, standart web sunucusu günlükleri kapsamında IP adresi ve tarayıcı bilgisi
            gibi teknik verileri güvenlik ve kötüye kullanımı (ör. otomatik veri kazıma) önlemek amacıyla kısa
            süreliğine işleyebilir.
          </p>

          <h2>Maç yorumları ve &quot;Kim kazanır?&quot; anketi</h2>
          <p>
            Maç sayfalarındaki yorum alanını kullanırsanız yazdığınız <strong>takma ad</strong> ve{' '}
            <strong>yorum metni</strong>, yorumun yazıldığı maç ve gönderim zamanıyla birlikte saklanır ve sitede
            herkese açık olarak gösterilir. Gerçek adınızı veya iletişim bilgilerinizi yazmamanızı öneririz.
            Anketteki tercihiniz (ev sahibi, beraberlik ya da deplasman) yalnızca toplam oy sayısını oluşturmak için
            saklanır; kimin hangi tercihi yaptığı gösterilmez.
          </p>
          <p>
            Spam, tekrar gönderim ve kötüye kullanımı önlemek için her iki özellikte de IP adresinizin kendisi değil,
            geri çevrilemeyen bir özeti (karma değeri) kaydedilir. Hakaret, argo ve bağlantı içeren yorumlar otomatik
            olarak reddedilir; birden fazla ziyaretçi tarafından bildirilen yorumlar gizlenir. Takma adınız ve oy
            tercihiniz, bir sonraki ziyaretinizde hatırlanması için yalnızca kendi tarayıcınızda da tutulur. Bir
            yorumunuzun silinmesini isterseniz aşağıdaki e-posta adresinden, yorumun yazıldığı maçı belirterek bize
            ulaşabilirsiniz.
          </p>

          <h2>Çerezler ve yerel depolama</h2>
          <p>
            Site; tema (açık/koyu), dil, takip ettiğiniz takım/maç tercihleri ve &quot;uygulamayı indir&quot; bandını
            kapatma tercihinizi hatırlamak için tarayıcınızın yerel depolamasını (localStorage) ve dil tercihi için
            bir çerezi kullanır. Bu veriler yalnızca kendi cihazınızda tutulur, bize gönderilmez; tarayıcı
            ayarlarınızdan istediğiniz zaman silebilirsiniz.
          </p>

          <h2>Reklamlar (Google AdSense)</h2>
          <p>
            Sitenin bazı bölümlerinde Google AdSense aracılığıyla reklam gösterilebilir. Google, ilgi alanına dayalı
            reklam sunmak için çerezler kullanabilir. Google&apos;ın reklam çerezlerini nasıl kullandığı ve kişisel
            reklamları nasıl kapatabileceğiniz hakkında bilgi için{' '}
            <a href="https://policies.google.com/technologies/ads" target="_blank" rel="noopener noreferrer">
              Google Reklam Politikaları
            </a>{' '}
            ve{' '}
            <a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer">
              Google Reklam Ayarları
            </a>{' '}
            sayfalarını ziyaret edebilirsiniz. Google dahil üçüncü taraf reklam sağlayıcıları, bu siteye ve
            diğer sitelere yaptığınız önceki ziyaretlere dayalı reklam göstermek için çerez kullanabilir.
            Kişiselleştirilmiş reklamları yukarıdaki Google Reklam Ayarları sayfasından kapatabilirsiniz.
          </p>

          <h2>Maç ve yayın verileri</h2>
          <p>
            Sitede gösterilen maç programı, canlı skor, kadro ve istatistik bilgileri üçüncü taraf bir spor verisi
            sağlayıcısından alınır ve herkese açık, kişisel olmayan içeriklerdir.
          </p>

          <h2>Üçüncü taraf bağlantılar</h2>
          <p>
            Site, Google Play Store gibi üçüncü taraf sitelere bağlantılar içerir. Bu sitelerin kendi gizlilik
            politikaları geçerlidir; TV Spor Rehberi bu sitelerin içeriğinden sorumlu değildir.
          </p>

          <h2>Haklarınız (KVKK ve GDPR)</h2>
          <p>
            6698 sayılı Kişisel Verilerin Korunması Kanunu ve (geçerli olduğu durumlarda) Avrupa Birliği Genel Veri
            Koruma Tüzüğü kapsamında; verilerinizin işlenip işlenmediğini öğrenme, bilgi talep etme, düzeltilmesini
            veya silinmesini isteme ve işlemeye itiraz etme haklarına sahipsiniz. Talepleriniz için aşağıdaki
            e-posta adresine yazabilirsiniz.
          </p>

          <h2>İletişim</h2>
          <p>
            Bu politika hakkında sorularınız için <a href="mailto:fre4dev@gmail.com">fre4dev@gmail.com</a> adresine
            yazabilir veya <Link href="/iletisim">İletişim</Link> sayfasını kullanabilirsiniz. Site, Fre4 Studios
            tarafından işletilmektedir.
          </p>

          <p className="legal-updated">Son güncelleme: Kasım 2026</p>
        </div>
      </section>
    </>
  );
}
