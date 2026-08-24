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
        <span className="sticky-banner-text">
          📲 <strong>TV Spor Rehberi</strong> uygulamasını indir — maç bildirimlerini kaçırma.
        </span>
        <div className="sticky-banner-actions">
          <a href={playStoreUrl('sticky_banner')} target="_blank" rel="noopener noreferrer" className="sticky-banner-cta">
            İndir
          </a>
          <button type="button" onClick={dismiss} aria-label="Banner'ı kapat" className="sticky-banner-close">
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}
