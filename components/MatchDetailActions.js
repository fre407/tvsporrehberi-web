'use client';

import { useState } from 'react';

export default function MatchDetailActions({ shareUrl, shareText }) {
  const [shared, setShared] = useState(false);

  async function share() {
    try {
      if (navigator.share) await navigator.share({ title: 'TV Spor Rehberi', text: shareText, url: shareUrl });
      else await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
      setShared(true);
      window.setTimeout(() => setShared(false), 1800);
    } catch {
      // Kullanıcı paylaşım penceresini kapattığında sessiz kal.
    }
  }

  return (
    <div className="match-action-row">
      <button type="button" className="share-button" onClick={share}>
        {shared ? 'Bağlantı kopyalandı' : '↗ Paylaş'}
      </button>
    </div>
  );
}
