import Link from 'next/link';
import { dateKeyOffset } from '../lib/format';

// Uygulamadaki gün şeridiyle aynı fikir (Dün/Bugün/Yarın + sonraki günler) —
// SEO için her gün AYRI bir URL'e (/gun/YYYY-MM-DD) sahip, "sadece bugün"
// değil (kullanıcı isteği, 2026-08-24).
const FIRST_OFFSET = -1;
const LAST_OFFSET = 13; // dün + bugün + gelecek 13 gün = 2 haftalık kapsam

function labelForOffset(offset, dateKey) {
  if (offset === -1) return 'Dün';
  if (offset === 0) return 'Bugün';
  if (offset === 1) return 'Yarın';
  return new Intl.DateTimeFormat('tr-TR', {
    timeZone: 'Europe/Istanbul',
    day: '2-digit',
    month: 'short',
  }).format(new Date(`${dateKey}T12:00:00+03:00`));
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
        return (
          <Link key={offset} href={href} className={`day-tab${active ? ' active' : ''}`}>
            {labelForOffset(offset, dateKey)}
          </Link>
        );
      })}
    </div>
  );
}
