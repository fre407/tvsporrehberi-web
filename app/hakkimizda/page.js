import Link from 'next/link';
import { SITE_URL, playStoreUrl } from '../../lib/links';

export const revalidate = false;

export const metadata = {
  title: 'Hakkımızda',
  description: 'TV Spor Rehberi kimin tarafından işletiliyor, maç ve yayın bilgileri nereden geliyor — site hakkında kısa bilgi.',
  alternates: { canonical: `${SITE_URL}/hakkimizda` },
  robots: { index: true, follow: true },
};

export default function AboutPage() {
  return (
    <>
      <div className="hero" style={{ paddingBottom: 10 }}>
        <div className="wrap">
          <div className="eyebrow">Hakkımızda</div>
          <h1>TV Spor Rehberi nedir?</h1>
        </div>
      </div>
      <section style={{ paddingTop: 8 }}>
        <div className="wrap legal-text">
          <p>
            TV Spor Rehberi, Süper Lig&apos;den Şampiyonlar Ligi&apos;ne Avrupa&apos;nın büyük liglerindeki maçların
            hangi kanalda, saat kaçta yayınlandığını ve canlı skorlarını tek bir yerde toplayan ücretsiz bir yayın
            rehberidir. Bu web sitesi, aynı isimli Android uygulamasının bir uzantısıdır ve aynı veri altyapısını
            kullanır.
          </p>

          <h2>Kim işletiyor?</h2>
          <p>
            Site ve mobil uygulama, <strong>Fre4 Developments</strong> tarafından geliştirilip işletiliyor.
            Herhangi bir spor kulübü, lig, federasyon veya yayın kuruluşuyla bağlantılı, sponsorlu veya bunlar
            tarafından onaylanmış değildir.
          </p>

          <h2>Bilgiler nereden geliyor?</h2>
          <p>
            Maç programı, canlı skor, kadro ve istatistik verileri lisanslı bir spor verisi sağlayıcısından otomatik
            olarak çekilir ve düzenli aralıklarla güncellenir. Yayın kanalı bilgileri, resmi TV/platform duyurularına
            dayanır.
          </p>

          <h2>Mobil uygulama</h2>
          <p>
            Aynı bilgilere favori takım bildirimleri, canlı skor bildirimleri gibi ek özelliklerle mobil uygulamadan
            da ulaşabilirsin.{' '}
            <a href={playStoreUrl('hakkimizda')} target="_blank" rel="noopener noreferrer">
              Play Store&apos;dan indir →
            </a>
          </p>

          <h2>İletişim</h2>
          <p>
            Sorular, düzeltme talepleri veya geri bildirim için{' '}
            <a href="mailto:fre4dev@gmail.com">fre4dev@gmail.com</a> adresinden ulaşabilirsin. Gizlilik
            uygulamalarımız hakkında detaylı bilgi için{' '}
            <Link href="/gizlilik-politikasi">Gizlilik Politikası</Link> sayfasına bakabilirsin.
          </p>
        </div>
      </section>
    </>
  );
}
