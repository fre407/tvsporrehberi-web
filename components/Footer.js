import Link from 'next/link';
import { APP_STORE_URL, playStoreUrl } from '../lib/links';
import { t } from '../lib/i18n';

export default function Footer({ locale }) {
  return (
    <footer className="site">
      <div className="wrap">
        <div className="foot-grid">
          <div className="foot-brand-block">
            <Link className="brand foot-brand" href="/">
              <div className="brand-mark">TV</div>
              <div className="brand-name">SPOR<span>REHBERİ</span></div>
            </Link>
            <p>{t(locale, 'footer.text')}</p>
            <div className="foot-app-row">
              <a href={playStoreUrl('footer_app')} target="_blank" rel="noopener noreferrer" className="foot-app-cta">
                <span className="foot-app-play" aria-hidden="true">▶</span>
                <span><small>{t(locale, 'footer.app')}</small><strong>Google Play</strong></span>
                <b aria-hidden="true">↗</b>
              </a>
              <a href={APP_STORE_URL} target="_blank" rel="noopener noreferrer" className="foot-app-cta">
                <span className="foot-app-play" aria-hidden="true">↓</span>
                <span><small>{t(locale, 'footer.app')}</small><strong>App Store</strong></span>
                <b aria-hidden="true">↗</b>
              </a>
            </div>
          </div>

          <nav className="foot-column" aria-label={t(locale, 'footer.explore')}>
            <h2>{t(locale, 'footer.explore')}</h2>
            <Link href="/iddiali-tahminler">{t(locale, 'footer.predictions')}</Link>
            <Link href="/bugun">{t(locale, 'footer.today')}</Link>
            <Link href="/canli">{t(locale, 'footer.live')}</Link>
            <Link href="/ligler">{t(locale, 'footer.leagues')}</Link>
            <Link href="/kanallar">{t(locale, 'footer.channels')}</Link>
            <Link href="/yayin-haklari">{t(locale, 'footer.rights')}</Link>
            <Link href="/rehber">{locale === 'en' ? 'Guides' : 'Rehber'}</Link>
          </nav>

          <nav className="foot-column" aria-label={t(locale, 'footer.info')}>
            <h2>{t(locale, 'footer.info')}</h2>
            <Link href="/hakkimizda">{t(locale, 'footer.about')}</Link>
            <Link href="/iletisim">{t(locale, 'footer.contact')}</Link>
            <Link href="/gizlilik-politikasi">{t(locale, 'footer.privacy')}</Link>
            <a href="https://fre407.github.io/yasal-bilgilendirme.html" target="_blank" rel="noopener noreferrer">{t(locale, 'footer.legal')}</a>
          </nav>
        </div>
        <div className="foot-bottom">
          <span>© {new Date().getFullYear()} TV Spor Rehberi</span>
          <span>{t(locale, 'footer.updated')}</span>
        </div>
      </div>
    </footer>
  );
}
