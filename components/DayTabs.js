import Link from 'next/link';
import { dateKeyOffset } from '../lib/format';
import { t } from '../lib/i18n';

// Uygulamadaki gün şeridiyle aynı fikir (Dün/Bugün/Yarın + sonraki günler) —
// SEO için her gün AYRI bir URL'e (/gun/YYYY-MM-DD) sahip, "sadece bugün"
// değil (kullanıcı isteği, 2026-08-24).
const FIRST_OFFSET = -1;
const LAST_OFFSET = 13; // dün + bugün + gelecek 13 gün = 2 haftalık kapsam

function labelForOffset(offset, locale) {
  if (offset === -1) return t(locale, 'common.yesterday');
  if (offset === 0) return t(locale, 'common.today');
  if (offset === 1) return t(locale, 'common.tomorrow');
  return null;
}

function dateLabels(dateKey, locale) {
  const date = new Date(`${dateKey}T12:00:00+03:00`);
  const formatLocale = locale === 'en' ? 'en-GB' : 'tr-TR';
  const fullDate = new Intl.DateTimeFormat(formatLocale, {
    timeZone: 'Europe/Istanbul',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
  const weekday = new Intl.DateTimeFormat(formatLocale, {
    timeZone: 'Europe/Istanbul',
    weekday: 'long',
  }).format(date);
  return {
    fullDate,
    weekday: weekday.charAt(0).toUpperCase() + weekday.slice(1),
  };
}

export default function DayTabs({ activeOffset, locale = 'tr' }) {
  const offsets = [];
  for (let o = FIRST_OFFSET; o <= LAST_OFFSET; o++) offsets.push(o);

  return (
    <div className="day-tabs">
      {offsets.map((offset) => {
        const dateKey = dateKeyOffset(offset);
        const href = offset === 0 ? '/bugun' : `/gun/${dateKey}`;
        const active = offset === activeOffset;
        const shortLabel = labelForOffset(offset, locale);
        const labels = shortLabel ? null : dateLabels(dateKey, locale);
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
