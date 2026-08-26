'use client';

import { useEffect, useState } from 'react';
import { playStoreUrl } from '../lib/links';
import { useLanguage } from './LanguageProvider';

const DISMISS_KEY = '@tvsporrehberi_app_banner_dismissed';

export default function StickyBanner() {
  const { t } = useLanguage();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem(DISMISS_KEY) !== '1') setVisible(true);
    } catch {
      setVisible(true);
    }
  }, []);

  function dismiss() {
    setVisible(false);
    try {
      localStorage.setItem(DISMISS_KEY, '1');
    } catch {
      // localStorage kapalı olabilir (gizli sekme vb.) — sorun değil, sadece
      // bir sonraki ziyarette banner tekrar görünür.
    }
  }

  if (!visible) return null;

  return (
    <div className="sticky-banner">
      <div className="wrap sticky-banner-inner">
        <img className="sticky-banner-logo" src="/icon.png" alt="TV Spor Rehberi" width="32" height="32" />
        <div className="sticky-banner-copy">
          <span className="sticky-banner-kicker">{t('banner.kicker')}</span>
          <span className="sticky-banner-text">{t('banner.text')}</span>
        </div>
        <div className="sticky-banner-actions">
          <a href={playStoreUrl('sticky_banner')} target="_blank" rel="noopener noreferrer" className="sticky-banner-cta">
            <span>Google Play</span><strong>{t('banner.download')}</strong>
          </a>
          <button type="button" onClick={dismiss} aria-label={t('banner.close')} className="sticky-banner-close">
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}
