'use client';

import Link from 'next/link';
import { useState } from 'react';
import { broadcasterLabel, broadcastServices, isForeignBroadcaster, teamSlug } from '../lib/data';
import { competitionLabel } from '../lib/competitions';
import { istDateLong, istTime, matchSlug } from '../lib/format';
import { SITE_URL } from '../lib/links';

// Maç listesinde bir satıra tıklayınca açılan kart. Maçın durumuna göre
// (oynanmadı / canlı / bitti / ertelendi) farklı bilgi gösterir; hepsi
// satırdaki gerçek veriden, ekstra istek yok.

// Kanal erişim etiketi — yalnızca kesin bilinen yayıncılar için. Listede
// olmayan bir kanal etiketsiz kalır (yanlış "şifresiz" iddiasından iyidir).
// Türkçe küçük harfe çevirmede "beIN" → "beın" olur, desen ikisini de kabul eder.
const FREE_TO_AIR = /^(trt 1|trt spor|trt spor yıldız|trt türk|trt kurdi|trt avaz|a spor|atv|a2 tv|tv100|tv8|kanal d|show tv|star tv|now)$/;
const SUBSCRIPTION = /be[iı]n|s sport|exxen|\btod\b|d-smart|smart spor/;

function accessTag(name, en) {
  if (isForeignBroadcaster(name)) return null;
  const key = name.toLocaleLowerCase('tr').trim();
  if (FREE_TO_AIR.test(key)) return { label: en ? 'Free-to-air' : 'Şifresiz', free: true };
  if (SUBSCRIPTION.test(key)) return { label: en ? 'Subscription' : 'Abonelikli', free: false };
  return null;
}

// Veri kaynağının İngilizce tur adları → Türkçe. Tanınmayan biçim olduğu
// gibi gösterilir.
const ROUND_NAMES_TR = {
  'Knockout Round Play-offs': 'Play-off turu',
  'Round of 32': 'Son 32',
  'Round of 16': 'Son 16',
  'Quarter-finals': 'Çeyrek final',
  'Semi-finals': 'Yarı final',
  Final: 'Final',
};

function roundText(round, en) {
  if (!round) return null;
  const week = round.match(/^Regular Season - (\d+)$/);
  if (week) return en ? `Matchweek ${week[1]}` : `${week[1]}. Hafta`;
  if (en) return round;
  const league = round.match(/^League Stage - (\d+)$/);
  if (league) return `Lig aşaması · ${league[1]}. maç günü`;
  const group = round.match(/^Group ([A-Z]) - (\d+)$/);
  if (group) return `${group[1]} Grubu · ${group[2]}. maç`;
  const nth = round.match(/^(?:(\d+)(?:st|nd|rd|th) Round|Round (\d+))$/);
  if (nth) return `${nth[1] ?? nth[2]}. tur`;
  return ROUND_NAMES_TR[round] ?? round;
}

function timeUntil(iso, en) {
  const minutes = Math.round((new Date(iso).getTime() - Date.now()) / 60000);
  if (minutes <= 0) return null;
  const d = Math.floor(minutes / 1440);
  const h = Math.floor((minutes % 1440) / 60);
  const m = minutes % 60;
  if (d > 0) return en ? `${d} d ${h} h` : `${d} gün ${h} sa`;
  if (h > 0) return en ? `${h} h ${m} min` : `${h} sa ${m} dk`;
  return en ? `${m} min` : `${m} dk`;
}

// Google Takvim "etkinlik oluştur" bağlantısı (API/anahtar gerektirmez).
function calendarUrl(row, channelText, en) {
  const stamp = (date) => date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  const start = new Date(row.kickoff_at);
  const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);
  const pageUrl = `${SITE_URL}/mac/${matchSlug(row.home_team, row.away_team, row.kickoff_at)}`;
  const details = `${competitionLabel(row.competition_key, en ? 'en' : 'tr')}${channelText ? ` · ${en ? 'Channel' : 'Kanal'}: ${channelText}` : ''}\n${pageUrl}`;
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: `${row.home_team} - ${row.away_team}`,
    dates: `${stamp(start)}/${stamp(end)}`,
    details,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

function resultText(row, en) {
  const { home_score: hs, away_score: as, home_penalty: hp, away_penalty: ap } = row;
  if (hs == null || as == null) return null;
  if (hs !== as) {
    const winner = hs > as ? row.home_team : row.away_team;
    return en ? `${winner} won` : `Kazanan: ${winner}`;
  }
  if (hp != null && ap != null && hp !== ap) {
    const winner = hp > ap ? row.home_team : row.away_team;
    return en ? `${winner} won on penalties (${hp}–${ap})` : `Penaltılarla kazanan: ${winner} (${hp}–${ap})`;
  }
  return en ? 'Ended in a draw' : 'Maç berabere bitti';
}

function Team({ name, logo, away }) {
  return (
    <Link href={`/takim/${teamSlug(name)}`} className={`match-expanded-team${away ? ' away' : ''}`}>
      {logo ? <img src={logo} alt="" width="58" height="58" loading="lazy" /> : null}
      <strong>{name}</strong>
    </Link>
  );
}

export default function MatchExpandedCard({ row, status, locale }) {
  const en = locale === 'en';
  const [shareNote, setShareNote] = useState(null);
  const isLive = status === 'live';
  const isFinished = status === 'finished' || status === 'finished_unknown';
  const isOff = status === 'not_happening';
  const isUpcoming = status === 'upcoming';
  const hasScore = row.home_score != null && row.away_score != null;
  const services = broadcastServices(row);
  const channelText = services.map((name) => broadcasterLabel(name, locale)).join(' / ');
  const href = `/mac/${matchSlug(row.home_team, row.away_team, row.kickoff_at)}`;
  const round = roundText(row.round, en);
  const countdown = isUpcoming ? timeUntil(row.kickoff_at, en) : null;
  const result = isFinished ? resultText(row, en) : null;

  async function share() {
    const url = `${SITE_URL}${href}`;
    const text = `${row.home_team} - ${row.away_team} · ${istTime(row.kickoff_at)} TSİ${channelText ? ` · ${channelText}` : ''}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: `${row.home_team} - ${row.away_team}`, text, url });
        return;
      }
      await navigator.clipboard.writeText(`${text}\n${url}`);
      setShareNote(en ? 'Link copied' : 'Bağlantı kopyalandı');
    } catch {
      // Kullanıcı paylaşım penceresini kapattıysa sessizce geç.
    }
  }

  let center;
  if (isLive) {
    center = (
      <>
        <span>{hasScore ? `${row.home_score} – ${row.away_score}` : (en ? 'LIVE' : 'CANLI')}</span>
        <em className="match-expanded-live">● {row.elapsed != null ? `${row.elapsed}'` : ''} {en ? 'Live' : 'Canlı'}</em>
      </>
    );
  } else if (isFinished && hasScore) {
    center = (
      <>
        <span>{row.home_score} – {row.away_score}</span>
        <em>{en ? 'Full time' : 'Maç sonu'}{row.home_penalty != null && row.away_penalty != null ? ` · ${en ? 'pens' : 'pen.'} ${row.home_penalty}–${row.away_penalty}` : ''}</em>
      </>
    );
  } else {
    center = <span>{istTime(row.kickoff_at)}</span>;
  }

  const channelLabel = isFinished ? (en ? 'Broadcast on' : 'Yayınlayan kanal') : isLive ? (en ? 'Watch now on' : 'Şu an yayında') : (en ? 'Channel' : 'Kanal');

  return (
    <div className="match-expanded" onClick={(event) => event.stopPropagation()}>
      <Team name={row.home_team} logo={row.home_logo} />
      <div className="match-expanded-center">
        {center}
        <small>{competitionLabel(row.competition_key, locale)}{round ? ` · ${round}` : ''}</small>
      </div>
      <Team name={row.away_team} logo={row.away_logo} away />

      <dl className="match-expanded-facts">
        <div>
          <dt>{en ? 'Date' : 'Tarih'}</dt>
          <dd>{istDateLong(row.kickoff_at)}</dd>
        </div>
        <div>
          <dt>{en ? 'Kick-off' : 'Başlama saati'}</dt>
          <dd>{istTime(row.kickoff_at)} <small>TSİ</small></dd>
        </div>
        <div className="match-expanded-channels">
          <dt>{channelLabel}</dt>
          <dd>
            {services.length > 0 ? (
              services.map((name) => {
                const tag = accessTag(name, en);
                return (
                  <span className="match-expanded-chan" key={name}>
                    {broadcasterLabel(name, locale)}
                    {tag ? <b className={tag.free ? 'is-free' : ''}>{tag.label}</b> : null}
                  </span>
                );
              })
            ) : row.confirmed_unavailable ? (
              en ? 'Not broadcast in Türkiye' : 'Türkiye’de yayınlanmıyor'
            ) : (
              en ? 'Broadcaster not announced yet' : 'Yayıncı henüz açıklanmadı'
            )}
          </dd>
        </div>
        {countdown ? (
          <div>
            <dt>{en ? 'Starts in' : 'Başlamasına'}</dt>
            <dd className="match-expanded-accent">{countdown}</dd>
          </div>
        ) : null}
        {result ? (
          <div>
            <dt>{en ? 'Result' : 'Sonuç'}</dt>
            <dd className="match-expanded-accent">{result}</dd>
          </div>
        ) : null}
        {isFinished && !hasScore ? (
          <div>
            <dt>{en ? 'Result' : 'Sonuç'}</dt>
            <dd>{en ? 'Match over, final score pending' : 'Maç bitti, skor bekleniyor'}</dd>
          </div>
        ) : null}
        {isOff ? (
          <div>
            <dt>{en ? 'Status' : 'Durum'}</dt>
            <dd className="match-expanded-accent">{en ? 'Postponed or cancelled' : 'Ertelendi veya iptal edildi'}</dd>
          </div>
        ) : null}
      </dl>

      <div className="match-expanded-actions">
        <Link href={href} className="match-expanded-link">
          {isFinished ? (en ? 'Match details and stats →' : 'Maç detayı ve istatistikler →') : isLive ? (en ? 'Live score page →' : 'Canlı skor sayfası →') : (en ? 'Match details →' : 'Maç detayı →')}
        </Link>
        {isUpcoming ? (
          <a href={calendarUrl(row, channelText, en)} target="_blank" rel="noopener noreferrer" className="match-expanded-btn">
            {en ? 'Add to calendar' : 'Takvime ekle'}
          </a>
        ) : null}
        <button type="button" className="match-expanded-btn" onClick={share}>
          {shareNote ?? (en ? 'Share' : 'Paylaş')}
        </button>
      </div>
    </div>
  );
}
