import Link from 'next/link';
import { SITE_URL } from '../../lib/links';

export const revalidate = false;

export const metadata = {
  title: 'İletişim',
  description: 'TV Spor Rehberi ile iletişim: yanlış maç saati veya kanal bildirimi, öneri, reklam ve iş birliği talepleri için e-posta adresimiz.',
  alternates: { canonical: `${SITE_URL}/iletisim` },
  robots: { index: true, follow: true },
};

export default function ContactPage() {
  return (
    <>
      <div className="hero" style={{ paddingBottom: 10 }}>
        <div className="wrap">
          <div className="eyebrow">İletişim</div>
          <h1>Bize ulaş</h1>
        </div>
      </div>
      <section style={{ paddingTop: 8 }}>
        <div className="wrap legal-text">
          <p>
            TV Spor Rehberi, <strong>Fre4 Studios</strong> tarafından geliştirilip işletilen bağımsız bir futbol yayın
            rehberidir. Her türlü soru, öneri ve geri bildirim için bize e-posta ile ulaşabilirsin:
          </p>
          <p>
            <a href="mailto:fre4dev@gmail.com">fre4dev@gmail.com</a>
          </p>

          <h2>Yanlış bilgi bildirimi</h2>
          <p>
            Bir maçın saatini, kanalını veya skorunu yanlış gördüysen e-postana maçın adını ve doğru bilgiyi yazman
            yeterli. Bildirimler incelenip doğrulandıktan sonra düzeltilir. Mobil uygulamadaki maç detay ekranında
            bulunan &quot;Hata Bildir&quot; düğmesini de kullanabilirsin.
          </p>

          <h2>Reklam ve iş birliği</h2>
          <p>
            Reklam, sponsorluk veya veri iş birliği talepleri için aynı adrese konu satırında &quot;İş birliği&quot;
            yazarak ulaşabilirsin.
          </p>

          <h2>Telif ve içerik talepleri</h2>
          <p>
            Sitede canlı yayın, maç görüntüsü veya yayın bağlantısı bulunmaz; yalnızca maç programı, saat, yayıncı
            kanal adı ve skor bilgisi yer alır. İçerikle ilgili bir talebin varsa e-posta ile bildirmen yeterli.
          </p>

          <p>
            Site hakkında daha fazla bilgi için <Link href="/hakkimizda">Hakkımızda</Link>, kişisel verilerin
            işlenmesi için <Link href="/gizlilik-politikasi">Gizlilik Politikası</Link> sayfalarına göz atabilirsin.
          </p>
        </div>
      </section>
    </>
  );
}
