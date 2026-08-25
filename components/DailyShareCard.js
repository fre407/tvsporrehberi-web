'use client';

import { useState } from 'react';

function escapeSvg(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' }[char]));
}

export default function DailyShareCard({ match }) {
  const [message, setMessage] = useState('Görseli paylaş');
  if (!match) return null;

  async function shareCard() {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630"><rect width="100%" height="100%" fill="#0d0d0b"/><rect x="42" y="42" width="1116" height="546" rx="30" fill="#171713" stroke="#ffe812" stroke-opacity=".45"/><text x="90" y="130" fill="#ffe812" font-size="30" font-family="Arial" font-weight="700">TV SPOR REHBERİ · BUGÜNÜN MAÇI</text><text x="90" y="290" fill="#ffffff" font-size="62" font-family="Arial" font-weight="700">${escapeSvg(match.homeTeam)} - ${escapeSvg(match.awayTeam)}</text><text x="90" y="385" fill="#ffe812" font-size="46" font-family="Arial" font-weight="700">${escapeSvg(match.time)} (TSİ)</text><text x="90" y="465" fill="#bcb8a7" font-size="34" font-family="Arial">${escapeSvg(match.channel)}</text><text x="90" y="545" fill="#8f8b7d" font-size="26" font-family="Arial">tvsporrehberi.com</text></svg>`;
    const file = new File([svg], 'tv-spor-rehberi-mac.svg', { type: 'image/svg+xml' });
    try {
      if (navigator.canShare?.({ files: [file] })) await navigator.share({ title: 'Bugünün maçı', files: [file] });
      else {
        const url = URL.createObjectURL(file);
        const link = document.createElement('a');
        link.href = url; link.download = 'tv-spor-rehberi-mac.svg'; link.click();
        URL.revokeObjectURL(url);
      }
      setMessage('Hazır!');
      window.setTimeout(() => setMessage('Görseli paylaş'), 1800);
    } catch {}
  }

  return <aside className="daily-share-card"><span>PAYLAŞILABİLİR MAÇ KARTI</span><strong>{match.homeTeam} - {match.awayTeam}</strong><p>{match.time} (TSİ) · {match.channel}</p><button type="button" onClick={shareCard}>↗ {message}</button></aside>;
}
