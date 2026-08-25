import Link from 'next/link';
import { dateKeyOffset } from '../lib/format';

// Uygulamadaki gün şeridiyle aynı fikir (Dün/Bugün/Yarın + sonraki günler) —
// SEO için her gün AYRI bir URL'e (/gun/YYYY-MM-DD) sahip, "sadece bugün"
// değil (kullanıcı isteği, 2026-08-24).
const FIRST_OFFSET = -1;
const LAST_OFFSET = 13; // dün + bugün + gelecek 13 gün = 2 haftalık kapsam

function labelForOffset(offset) {
  if (offset === -1) return 'Dün';
  if (offset === 0) return 'Bugün';
  if (offset === 1) return 'Yarın';
  return null;
}

function dateLabels(dateKey) {
  const date = new Date(`${dateKey}T12:00:00+03:00`);
  const fullDate = new Intl.DateTimeFormat('tr-TR', {
    timeZone: 'Europe/Istanbul',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
  const weekday = new Intl.DateTimeFormat('tr-TR', {
    timeZone: 'Europe/Istanbul',
    weekday: 'long',
  }).format(date);
  return {
    fullDate,
    weekday: weekday.charAt(0).toUpperCase() + weekday.slice(1),
  };
}

export default function DayTabs({ activeOffset }) {
  const offsets = [];
  for (let o = FIRST_OFFSET; o <= LAST_OFFSET; o++) offsets.push(o);

  return (
    <div className="day-tabs">
      {offsets.map((offset) => {
        const dateKey = dateKeyOffset(offset);
        const href = offset === 0 ? '/bugun' : `/gun/${dateKey}`;
        const active = offset === activeOffset;
        const shortLabel = labelForOffset(offset);
        const labels = shortLabel ? null : dateLabels(dateKey);
        return (
          <Link key={offset} href={href} className={`day-tab${labels ? ' day-tab-date' : ''}${active ? ' active' : ''}`}>
            {shortLabel || (
              <>
                <span className="day-tab-date-main">{labels.fullDate}</span>
                <span className="day-tab-date-weekday">{labels.weekday}</span>
              </>
            )}
          </Link>
        );
      })}
    </div>
  );
}
