import Link from 'next/link';
import { playStoreUrl } from '../lib/links';

export default function Footer() {
  return (
    <footer className="site">
      <div className="wrap">
        <div className="foot-grid">
          <div className="foot-brand-block">
            <Link className="brand foot-brand" href="/">
              <div className="brand-mark">TV</div>
              <div className="brand-name">SPOR<span>REHBERİ</span></div>
            </Link>
            <p>Günün maçlarını, yayıncı kanalları ve canlı skorları tek yerde takip et.</p>
            <a href={playStoreUrl('footer_app')} target="_blank" rel="noopener noreferrer" className="foot-app-cta">
              <span className="foot-app-play" aria-hidden="true">▶</span>
              <span><small>Uygulamayı indir</small><strong>Google Play</strong></span>
              <b aria-hidden="true">↗</b>
            </a>
          </div>

          <nav className="foot-column" aria-label="Keşfet">
            <h2>Keşfet</h2>
            <Link href="/bugun">Bugünün Maçları</Link>
            <Link href="/canli">Canlı Skorlar</Link>
            <Link href="/ligler">Ligler</Link>
            <Link href="/kanallar">Kanallar</Link>
          </nav>

          <nav className="foot-column" aria-label="Bilgiler">
            <h2>Bilgiler</h2>
            <Link href="/hakkimizda">Hakkımızda</Link>
            <Link href="/gizlilik-politikasi">Gizlilik Politikası</Link>
            <a href="https://fre407.github.io/yasal-bilgilendirme.html" target="_blank" rel="noopener noreferrer">Yasal Bilgilendirme</a>
          </nav>
        </div>
        <div className="foot-bottom">
          <span>© {new Date().getFullYear()} TV Spor Rehberi</span>
          <span>Maç, kanal ve skor bilgileri düzenli olarak güncellenir.</span>
        </div>
      </div>
    </footer>
  );
}
