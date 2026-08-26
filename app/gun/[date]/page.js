import { notFound, redirect } from 'next/navigation';
import Guide from '../../../components/Guide';
import DayTabs from '../../../components/DayTabs';
import AppCta from '../../../components/AppCta';
import { getFixturesInWindow } from '../../../lib/data';
import { dateKeyDiffDays, dateKeyOffset, istDateLong, istKeyToUtcRange } from '../../../lib/format';
import { SITE_URL } from '../../../lib/links';
import { getLocale } from '../../../lib/locale';

export const revalidate = 60;

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
// Gün sayfaları bir sezon boyunca erişilebilir kalır. Gün şeridi sade
// kalmak için kısa olsa da, Google'ın ve eski paylaşımların URL'leri 404'e
// düşmez. Gelecek 30 gün de planlanmış fikstürler için açıktır.
const MIN_OFFSET = -365;
const MAX_OFFSET = 30;

function resolveOffset(dateParam) {
  if (!DATE_RE.test(dateParam)) return null;
  const today = dateKeyOffset(0);
  return dateKeyDiffDays(today, dateParam);
}

export async function generateMetadata({ params }) {
  const { date } = await params;
  const offset = resolveOffset(date);
  if (offset === null || offset < MIN_OFFSET || offset > MAX_OFFSET) return { title: 'Sayfa Bulunamadı' };

  const dateLabel = istDateLong(`${date}T12:00:00+03:00`);
  return {
    title: `${dateLabel} Maç Programı ve Yayın Kanalları`,
    description: `${dateLabel} tarihinde oynanacak/oynanan tüm maçlar, saatleri ve hangi kanalda yayınlandığı bilgisi.`,
    alternates: { canonical: `${SITE_URL}/gun/${date}` },
  };
}

export default async function DayPage({ params }) {
  const locale = await getLocale();
  const { date } = await params;
  const offset = resolveOffset(date);
  if (offset === null) notFound();
  if (offset === 0) redirect('/bugun'); // bugün için tek kanonik adres /bugun
  if (offset < MIN_OFFSET || offset > MAX_OFFSET) notFound();

  const { startIso, endIso } = istKeyToUtcRange(date);
  let rows = [];
  try {
    rows = await getFixturesInWindow(startIso, endIso);
  } catch {
    rows = [];
  }

  const dateLabel = istDateLong(`${date}T12:00:00+03:00`);
  const heading = offset === -1 ? 'Dünün maç programı' : offset === 1 ? 'Yarının maç programı' : `${dateLabel} maç programı`;

  return (
    <>
      <div className="hero" style={{ paddingBottom: 10 }}>
        <div className="wrap">
          <div className="eyebrow">{dateLabel}</div>
          <h1 style={{ fontSize: 38 }}>{heading}</h1>
          <p className="page-desc">Bu tarihte oynanan/oynanacak tüm maçlar, saatleri (TSİ) ve yayın kanalları.</p>
        </div>
      </div>

      <section style={{ paddingTop: 0 }}>
        <div className="wrap">
          <DayTabs activeOffset={offset} locale={locale} />
          <Guide rows={rows} />
        </div>
      </section>

      <AppCta campaign="gun_sayfasi" />
    </>
  );
}
