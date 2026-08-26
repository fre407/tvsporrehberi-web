'use client';

import { useEffect, useState } from 'react';
import { playStoreUrl } from '../lib/links';

const DISMISS_KEY = '@tvsporrehberi_app_banner_dismissed';

export default function StickyBanner() {
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
        <span className="sticky-banner-icon" aria-hidden="true">TV</span>
        <div className="sticky-banner-copy">
          <span className="sticky-banner-kicker">TV SPOR REHBERİ UYGULAMASI</span>
          <span className="sticky-banner-text">Maç saati, yayıncı kanal ve canlı skor bildirimlerini kaçırma.</span>
        </div>
        <div className="sticky-banner-actions">
          <a href={playStoreUrl('sticky_banner')} target="_blank" rel="noopener noreferrer" className="sticky-banner-cta">
            <span>Google Play</span><strong>Ücretsiz indir</strong>
          </a>
          <button type="button" onClick={dismiss} aria-label="Banner'ı kapat" className="sticky-banner-close">
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}
