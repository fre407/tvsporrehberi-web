'use client';

import Link from 'next/link';
import { channelDisplay } from '../lib/data';
import { matchSlug } from '../lib/format';
import { useLanguage } from './LanguageProvider';

export default function LiveNowStrip({ rows }) {
  const { locale, t } = useLanguage();
  if (!rows?.length) return null;
  return (
    <div className="live-now-strip">
      <div className="wrap live-now-inner">
        <span className="live-now-label">● {locale === 'en' ? 'LIVE NOW' : 'ŞU AN CANLI'}</span>
        {rows.slice(0, 3).map((row) => (
          <Link key={row.id} href={`/mac/${matchSlug(row.home_team, row.away_team, row.kickoff_at)}`}>
            {row.elapsed != null ? `${row.elapsed}'` : t('common.live')} · {row.home_team} {row.home_score ?? '-'}–{row.away_score ?? '-'} {row.away_team}
            <small>{channelDisplay(row, locale)}</small>
          </Link>
        ))}
        <Link className="live-now-all" href="/canli">{t('live.all')}</Link>
      </div>
    </div>
  );
}
