'use client';

import { useState } from 'react';

function escapeSvg(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' }[char]));
}

function initials(name) {
  return String(name).split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase();
}

async function svgToPng(svg, width, height) {
  const blob = new Blob([svg], { type: 'image/svg+xml' });
  const imageUrl = URL.createObjectURL(blob);
  try {
    const image = new Image();
    await new Promise((resolve, reject) => { image.onload = resolve; image.onerror = reject; image.src = imageUrl; });
    const canvas = document.createElement('canvas');
    canvas.width = width; canvas.height = height;
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
  const [previewOpen, setPreviewOpen] = useState(false);
  const [format, setFormat] = useState('wide');
  if (!match) return null;

  async function shareCard() {
    const [homeLogo, awayLogo] = await Promise.all([logoDataUrl(match.homeLogo), logoDataUrl(match.awayLogo)]);
    const crest = (logo, x, label) => logo
      ? `<image href="${logo}" x="${x - 82}" y="192" width="164" height="164" preserveAspectRatio="xMidYMid meet"/>`
      : `<circle cx="${x}" cy="274" r="88" fill="#171812" stroke="#ffe812" stroke-opacity=".7" stroke-width="3"/><text x="${x}" y="295" fill="#ffe812" font-size="58" font-family="Arial" font-weight="800" text-anchor="middle">${escapeSvg(label)}</text>`;
    const wideSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
      <defs><radialGradient id="glow" cx="50%" cy="45%" r="65%"><stop stop-color="#3b3510"/><stop offset="1" stop-color="#0a0a08"/></radialGradient><linearGradient id="line" x1="0" x2="1"><stop stop-color="#ffe812" stop-opacity="0"/><stop offset=".5" stop-color="#ffe812"/><stop offset="1" stop-color="#ffe812" stop-opacity="0"/></linearGradient></defs>
      <rect width="1200" height="630" fill="#080907"/><rect width="1200" height="630" fill="url(#glow)"/><path d="M0 88H1200M0 542H1200" stroke="url(#line)" stroke-width="2"/>
      <text x="72" y="66" fill="#ffe812" font-size="28" font-family="Impact, Arial Black, sans-serif" letter-spacing="3">TV SPOR REHBERİ</text><text x="1128" y="66" fill="#c9c4ae" font-size="18" font-family="Trebuchet MS, Arial, sans-serif" font-weight="700" text-anchor="end">BUGÜNÜN MAÇI</text>
      ${crest(homeLogo, 238, initials(match.homeTeam))}${crest(awayLogo, 962, initials(match.awayTeam))}
      <text x="238" y="405" fill="#fff" font-size="31" font-family="Trebuchet MS, Arial, sans-serif" font-weight="700" text-anchor="middle">${escapeSvg(match.homeTeam)}</text><text x="962" y="405" fill="#fff" font-size="31" font-family="Trebuchet MS, Arial, sans-serif" font-weight="700" text-anchor="middle">${escapeSvg(match.awayTeam)}</text>
      <text x="600" y="248" fill="#c9c4ae" font-size="24" font-family="Trebuchet MS, Arial, sans-serif" font-weight="700" text-anchor="middle">BUGÜN</text><text x="600" y="330" fill="#ffe812" font-size="84" font-family="Impact, Arial Black, sans-serif" letter-spacing="2" text-anchor="middle">${escapeSvg(match.time)}</text><text x="600" y="365" fill="#c9c4ae" font-size="21" font-family="Trebuchet MS, Arial, sans-serif" text-anchor="middle">TSİ</text>
      <rect x="390" y="451" width="420" height="52" rx="26" fill="#1d1c14" stroke="#5b5520"/><text x="600" y="485" fill="#ffe812" font-size="24" font-family="Trebuchet MS, Arial, sans-serif" font-weight="700" text-anchor="middle">${escapeSvg(match.channel)}</text>
      <text x="600" y="581" fill="#9c967f" font-size="20" font-family="Trebuchet MS, Arial, sans-serif" text-anchor="middle">tvsporrehberi.com · Maçlar · Kanallar · Saatler</text>
    </svg>`;
    const instagramCrest = (logo, x, label) => logo
      ? `<image href="${logo}" x="${x - 115}" y="338" width="230" height="230" preserveAspectRatio="xMidYMid meet"/>`
      : `<circle cx="${x}" cy="453" r="105" fill="#171812" stroke="#ffe812" stroke-opacity=".7" stroke-width="4"/><text x="${x}" y="476" fill="#ffe812" font-size="70" font-family="Impact, Arial Black, sans-serif" text-anchor="middle">${escapeSvg(label)}</text>`;
    const instagramSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1350" viewBox="0 0 1080 1350">
      <defs><radialGradient id="igGlow" cx="50%" cy="42%" r="68%"><stop stop-color="#4a4212"/><stop offset="1" stop-color="#080907"/></radialGradient><linearGradient id="igLine" x1="0" x2="1"><stop stop-color="#ffe812" stop-opacity="0"/><stop offset=".5" stop-color="#ffe812"/><stop offset="1" stop-color="#ffe812" stop-opacity="0"/></linearGradient></defs>
      <rect width="1080" height="1350" fill="#080907"/><rect width="1080" height="1350" fill="url(#igGlow)"/><path d="M0 118H1080M0 1222H1080" stroke="url(#igLine)" stroke-width="3"/>
      <text x="70" y="82" fill="#ffe812" font-size="32" font-family="Impact, Arial Black, sans-serif" letter-spacing="3">TV SPOR REHBERİ</text><text x="1010" y="82" fill="#c9c4ae" font-size="19" font-family="Trebuchet MS, Arial, sans-serif" font-weight="700" text-anchor="end">MAÇ KARTI</text>
      <text x="540" y="230" fill="#c9c4ae" font-size="28" font-family="Trebuchet MS, Arial, sans-serif" font-weight="700" text-anchor="middle">BUGÜN · ${escapeSvg(match.time)} TSİ</text>
      ${instagramCrest(homeLogo, 250, initials(match.homeTeam))}${instagramCrest(awayLogo, 830, initials(match.awayTeam))}
      <text x="250" y="650" fill="#fff" font-size="36" font-family="Trebuchet MS, Arial, sans-serif" font-weight="700" text-anchor="middle">${escapeSvg(match.homeTeam)}</text><text x="830" y="650" fill="#fff" font-size="36" font-family="Trebuchet MS, Arial, sans-serif" font-weight="700" text-anchor="middle">${escapeSvg(match.awayTeam)}</text>
      <text x="540" y="500" fill="#ffe812" font-size="46" font-family="Impact, Arial Black, sans-serif" text-anchor="middle">VS</text><text x="540" y="820" fill="#ffe812" font-size="112" font-family="Impact, Arial Black, sans-serif" letter-spacing="3" text-anchor="middle">${escapeSvg(match.time)}</text><text x="540" y="866" fill="#c9c4ae" font-size="24" font-family="Trebuchet MS, Arial, sans-serif" text-anchor="middle">TÜRKİYE SAATİ İLE</text>
      <rect x="150" y="955" width="780" height="74" rx="37" fill="#1d1c14" stroke="#6c6323" stroke-width="2"/><text x="540" y="1004" fill="#ffe812" font-size="31" font-family="Trebuchet MS, Arial, sans-serif" font-weight="700" text-anchor="middle">${escapeSvg(match.channel)}</text>
      <text x="540" y="1165" fill="#a59e84" font-size="24" font-family="Trebuchet MS, Arial, sans-serif" text-anchor="middle">tvsporrehberi.com</text><text x="540" y="1200" fill="#817a66" font-size="19" font-family="Trebuchet MS, Arial, sans-serif" text-anchor="middle">Maçlar · Kanallar · Saatler</text>
    </svg>`;
    const isInstagram = format === 'instagram';
    const png = await svgToPng(isInstagram ? instagramSvg : wideSvg, isInstagram ? 1080 : 1200, isInstagram ? 1350 : 630);
    const file = new File([png], isInstagram ? 'tv-spor-rehberi-instagram-4x5.png' : 'tv-spor-rehberi-yatay-mac-karti.png', { type: 'image/png' });
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

  const cardPreview = <div className="daily-share-card">
    <div className="share-card-top"><span>PAYLAŞILABİLİR MAÇ KARTI</span><b>TV SPOR REHBERİ</b></div>
    <div className="share-card-match"><div>{match.homeLogo ? <img src={match.homeLogo} alt="" /> : <b>{initials(match.homeTeam)}</b>}<strong>{match.homeTeam}</strong></div><i>VS</i><div>{match.awayLogo ? <img src={match.awayLogo} alt="" /> : <b>{initials(match.awayTeam)}</b>}<strong>{match.awayTeam}</strong></div></div>
    <div className="share-card-meta"><b>{match.time} <small>TSİ</small></b><span>{match.channel}</span></div>
    <div className="share-card-formats"><button type="button" className={format === 'wide' ? 'active' : ''} onClick={() => setFormat('wide')}>Yatay · 1200×630</button><button type="button" className={format === 'instagram' ? 'active' : ''} onClick={() => setFormat('instagram')}>Instagram · 1080×1350</button></div>
    <button type="button" onClick={shareCard}>↗ {format === 'instagram' ? 'Instagram görselini paylaş' : message}</button>
  </div>;

  return <>
    <aside className="share-card-launcher">
      <div><span>MAÇI PAYLAŞ</span><strong>Arkadaşlarına görsel maç kartı gönder</strong></div>
      <button type="button" onClick={() => setPreviewOpen(true)}>Kartı görüntüle ↗</button>
    </aside>
    {previewOpen ? <div className="share-card-modal" role="dialog" aria-modal="true" aria-label="Paylaşılabilir maç kartı" onClick={() => setPreviewOpen(false)}>
      <div className="share-card-modal-inner" onClick={(event) => event.stopPropagation()}>
        <button className="share-card-close" type="button" onClick={() => setPreviewOpen(false)} aria-label="Kart önizlemesini kapat">×</button>
        {cardPreview}
      </div>
    </div> : null}
  </>;
}
