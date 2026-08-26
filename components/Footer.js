import Link from 'next/link';
import { playStoreUrl } from '../lib/links';
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
            <a href={playStoreUrl('footer_app')} target="_blank" rel="noopener noreferrer" className="foot-app-cta">
              <span className="foot-app-play" aria-hidden="true">▶</span>
              <span><small>{t(locale, 'footer.app')}</small><strong>Google Play</strong></span>
              <b aria-hidden="true">↗</b>
            </a>
          </div>

          <nav className="foot-column" aria-label={t(locale, 'footer.explore')}>
            <h2>{t(locale, 'footer.explore')}</h2>
            <Link href="/bugun">{t(locale, 'footer.today')}</Link>
            <Link href="/canli">{t(locale, 'footer.live')}</Link>
            <Link href="/ligler">{t(locale, 'footer.leagues')}</Link>
            <Link href="/kanallar">{t(locale, 'footer.channels')}</Link>
          </nav>

          <nav className="foot-column" aria-label={t(locale, 'footer.info')}>
            <h2>{t(locale, 'footer.info')}</h2>
            <Link href="/hakkimizda">{t(locale, 'footer.about')}</Link>
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
