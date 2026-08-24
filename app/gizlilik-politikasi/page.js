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
            TV Spor Rehberi Android uygulamasının kendi gizlilik politikası ayrıdır ve uygulama içindeki bağlantıdan
            ulaşılabilir.
          </p>

          <h2>Hangi veriler toplanıyor?</h2>
          <p>
            Sitede üyelik, kayıt veya form doldurma yoktur; ziyaretçilerden isim, e-posta gibi kişisel veriler
            doğrudan talep edilmez. Sunucularımız, standart web sunucusu günlükleri kapsamında IP adresi ve
            tarayıcı bilgisi gibi teknik verileri güvenlik ve kötüye kullanımı (ör. otomatik veri kazıma) önlemek
            amacıyla kısa süreliğine işleyebilir.
          </p>

          <h2>Çerezler ve yerel depolama</h2>
          <p>
            Site, &quot;uygulamayı indir&quot; bandını kapattığınızda bu tercihi hatırlamak için tarayıcınızın yerel
            depolamasını (localStorage) kullanır — bu veri yalnızca kendi cihazınızda tutulur, bize gönderilmez.
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
            sayfalarını ziyaret edebilirsiniz.
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

          <h2>İletişim</h2>
          <p>
            Bu politika hakkında sorularınız için TV Spor Rehberi uygulamasındaki iletişim/geri bildirim
            seçeneklerini kullanabilirsiniz.
          </p>

          <p className="legal-updated">Son güncelleme: Ağustos 2026</p>
        </div>
      </section>
    </>
  );
}
