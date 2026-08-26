'use client';

import { useState } from 'react';
import FavoriteButton from './FavoriteButton';

export default function MatchDetailActions({ matchId, matchName, homeId, homeName, awayId, awayName, channelId, channelName, shareUrl, shareText }) {
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
      <FavoriteButton favoriteId={`match:${matchId}`} label={matchName} />
      <FavoriteButton favoriteId={`team:${homeId}`} label={homeName} />
      <FavoriteButton favoriteId={`team:${awayId}`} label={awayName} />
      {channelId ? <FavoriteButton favoriteId={`channel:${channelId}`} label={channelName} /> : null}
      <button type="button" className="share-button" onClick={share}>
        {shared ? 'Bağlantı kopyalandı' : '↗ Paylaş'}
      </button>
    </div>
  );
}
