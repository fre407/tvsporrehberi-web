'use client';

import { useState } from 'react';

function escapeSvg(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' }[char]));
}

function initials(name) {
  return String(name).split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase();
}

async function svgToPng(svg) {
  const blob = new Blob([svg], { type: 'image/svg+xml' });
  const imageUrl = URL.createObjectURL(blob);
  try {
    const image = new Image();
    await new Promise((resolve, reject) => { image.onload = resolve; image.onerror = reject; image.src = imageUrl; });
    const canvas = document.createElement('canvas');
    canvas.width = 1200; canvas.height = 630;
    canvas.getContext('2d').drawImage(image, 0, 0);
    const png = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
    return png ?? blob;
  } finally { URL.revokeObjectURL(imageUrl); }
}

async function logoDataUrl(url) {
  if (!url) return null;
  try {
    const response = await fetch(url, { mode: 'cors' });
    if (!response.ok) return null;
    const blob = await response.blob();
    return await new Promise((resolve) => { const reader = new FileReader(); reader.onload = () => resolve(reader.result); reader.onerror = () => resolve(null); reader.readAsDataURL(blob); });
  } catch { return null; }
}

export default function DailyShareCard({ match }) {
  const [message, setMessage] = useState('Görseli paylaş');
  if (!match) return null;

  async function shareCard() {
    const [homeLogo, awayLogo] = await Promise.all([logoDataUrl(match.homeLogo), logoDataUrl(match.awayLogo)]);
    const crest = (logo, x, label) => logo
      ? `<image href="${logo}" x="${x - 82}" y="192" width="164" height="164" preserveAspectRatio="xMidYMid meet"/>`
      : `<circle cx="${x}" cy="274" r="88" fill="#171812" stroke="#ffe812" stroke-opacity=".7" stroke-width="3"/><text x="${x}" y="295" fill="#ffe812" font-size="58" font-family="Arial" font-weight="800" text-anchor="middle">${escapeSvg(label)}</text>`;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
      <defs><radialGradient id="glow" cx="50%" cy="45%" r="65%"><stop stop-color="#3b3510"/><stop offset="1" stop-color="#0a0a08"/></radialGradient><linearGradient id="line" x1="0" x2="1"><stop stop-color="#ffe812" stop-opacity="0"/><stop offset=".5" stop-color="#ffe812"/><stop offset="1" stop-color="#ffe812" stop-opacity="0"/></linearGradient></defs>
      <rect width="1200" height="630" fill="#080907"/><rect width="1200" height="630" fill="url(#glow)"/><path d="M0 88H1200M0 542H1200" stroke="url(#line)" stroke-width="2"/>
      <text x="72" y="66" fill="#ffe812" font-size="28" font-family="Impact, Arial Black, sans-serif" letter-spacing="3">TV SPOR REHBERİ</text><text x="1128" y="66" fill="#c9c4ae" font-size="18" font-family="Trebuchet MS, Arial, sans-serif" font-weight="700" text-anchor="end">BUGÜNÜN MAÇI</text>
      ${crest(homeLogo, 238, initials(match.homeTeam))}${crest(awayLogo, 962, initials(match.awayTeam))}
      <text x="238" y="405" fill="#fff" font-size="31" font-family="Trebuchet MS, Arial, sans-serif" font-weight="700" text-anchor="middle">${escapeSvg(match.homeTeam)}</text><text x="962" y="405" fill="#fff" font-size="31" font-family="Trebuchet MS, Arial, sans-serif" font-weight="700" text-anchor="middle">${escapeSvg(match.awayTeam)}</text>
      <text x="600" y="248" fill="#c9c4ae" font-size="24" font-family="Trebuchet MS, Arial, sans-serif" font-weight="700" text-anchor="middle">BUGÜN</text><text x="600" y="330" fill="#ffe812" font-size="84" font-family="Impact, Arial Black, sans-serif" letter-spacing="2" text-anchor="middle">${escapeSvg(match.time)}</text><text x="600" y="365" fill="#c9c4ae" font-size="21" font-family="Trebuchet MS, Arial, sans-serif" text-anchor="middle">TSİ</text>
      <rect x="390" y="451" width="420" height="52" rx="26" fill="#1d1c14" stroke="#5b5520"/><text x="600" y="485" fill="#ffe812" font-size="24" font-family="Trebuchet MS, Arial, sans-serif" font-weight="700" text-anchor="middle">${escapeSvg(match.channel)}</text>
      <text x="600" y="581" fill="#9c967f" font-size="20" font-family="Trebuchet MS, Arial, sans-serif" text-anchor="middle">tvsporrehberi.com · Maçlar · Kanallar · Saatler</text>
    </svg>`;
    const png = await svgToPng(svg);
    const file = new File([png], 'tv-spor-rehberi-bugunun-maci.png', { type: 'image/png' });
    try {
      if (navigator.canShare?.({ files: [file] })) await navigator.share({ title: 'Bugünün maçı', files: [file] });
      else {
        const url = URL.createObjectURL(file);
        const link = document.createElement('a');
        link.href = url; link.download = 'tv-spor-rehberi-bugunun-maci.png'; link.click();
        URL.revokeObjectURL(url);
      }
      setMessage('Hazır!');
      window.setTimeout(() => setMessage('Görseli paylaş'), 1800);
    } catch {}
  }

  return <aside className="daily-share-card">
    <div className="share-card-top"><span>PAYLAŞILABİLİR MAÇ KARTI</span><b>TV SPOR REHBERİ</b></div>
    <div className="share-card-match"><div>{match.homeLogo ? <img src={match.homeLogo} alt="" /> : <b>{initials(match.homeTeam)}</b>}<strong>{match.homeTeam}</strong></div><i>VS</i><div>{match.awayLogo ? <img src={match.awayLogo} alt="" /> : <b>{initials(match.awayTeam)}</b>}<strong>{match.awayTeam}</strong></div></div>
    <div className="share-card-meta"><b>{match.time} <small>TSİ</small></b><span>{match.channel}</span></div>
    <button type="button" onClick={shareCard}>↗ {message}</button>
  </aside>;
}
