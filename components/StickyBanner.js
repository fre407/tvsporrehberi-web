'use client';

import { useEffect, useState } from 'react';
import { APP_STORE_URL, playStoreUrl } from '../lib/links';
import { useLanguage } from './LanguageProvider';

const DISMISS_KEY = '@tvsporrehberi_app_banner_dismissed';

// Mağaza amblemleri tek renk (currentColor) — düğme rengine uyum sağlıyor,
// harici görsel isteği yok.
function PlayIcon() {
  return (
    <svg className="sticky-banner-store-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path fill="currentColor" d="M22.018 13.298l-3.919 2.218-3.515-3.493 3.543-3.521 3.891 2.202a1.49 1.49 0 0 1 0 2.594zM1.337.924a1.486 1.486 0 0 0-.112.568v21.017c0 .217.045.419.124.6l11.155-11.087L1.337.924zm12.207 10.065l3.258-3.238L3.45.195a1.466 1.466 0 0 0-.946-.179l11.04 10.973zm0 2.067l-11 10.933c.298.036.612-.016.906-.183l13.324-7.54-3.23-3.21z" />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg className="sticky-banner-store-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path fill="currentColor" d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701" />
    </svg>
  );
}

export default function StickyBanner() {
  const { t } = useLanguage();
  // Sunucuda GÖRÜNÜR basılır ki sonradan belirip sayfayı aşağı itmesin (CLS).
  // Kapatmış ziyaretçide app/layout.js'teki erken betik <html data-app-banner="off">
  // koyar, CSS şeridi ilk boyamadan önce gizler; burada da bileşen kaldırılır.
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    try {
      if (localStorage.getItem(DISMISS_KEY) === '1') setVisible(false);
    } catch {
      // localStorage kapalı — şerit görünür kalır.
    }
  }, []);

  function dismiss() {
    setVisible(false);
    document.documentElement.dataset.appBanner = 'off';
    try {
      localStorage.setItem(DISMISS_KEY, '1');
    } catch {
      // localStorage kapalı olabilir (gizli sekme vb.) — sorun değil, sadece
      // bir sonraki ziyarette banner tekrar görünür.
    }
  }

  if (!visible) return null;

  // Dar ekranda (bkz. globals.css) düğmeler yalnızca amblem olarak kalıyor,
  // erişilebilir ad aria-label'dan geliyor.
  return (
    <div className="sticky-banner">
      <div className="wrap sticky-banner-inner">
        <img className="sticky-banner-logo" src="/icon.png" alt="TV Spor Rehberi" width="32" height="32" />
        <div className="sticky-banner-copy">
          <span className="sticky-banner-kicker">{t('banner.kicker')}</span>
          <span className="sticky-banner-text">{t('banner.text')}</span>
        </div>
        <div className="sticky-banner-actions">
          <a href={playStoreUrl('sticky_banner')} target="_blank" rel="noopener noreferrer" className="sticky-banner-cta" aria-label={`Google Play — ${t('banner.download')}`}>
            <PlayIcon />
            <span className="sticky-banner-cta-text"><span>{t('banner.download')}</span><strong>Google Play</strong></span>
          </a>
          <a href={APP_STORE_URL} target="_blank" rel="noopener noreferrer" className="sticky-banner-cta" aria-label={`App Store — ${t('banner.download')}`}>
            <AppleIcon />
            <span className="sticky-banner-cta-text"><span>{t('banner.download')}</span><strong>App Store</strong></span>
          </a>
          <button type="button" onClick={dismiss} aria-label={t('banner.close')} className="sticky-banner-close">
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}
