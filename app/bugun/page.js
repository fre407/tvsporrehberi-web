import Guide from '../../components/Guide';
import DayTabs from '../../components/DayTabs';
import AppCta from '../../components/AppCta';
import { getFixturesInWindow } from '../../lib/data';
import { dateKeyOffset, istDateLong, istKeyToUtcRange } from '../../lib/format';
import { SITE_URL } from '../../lib/links';
import { getLocale } from '../../lib/locale';

export const revalidate = 60;

export async function generateMetadata() {
  const dateLabel = istDateLong(new Date().toISOString());
  return {
    title: `Bugünün Maç Programı ve Yayın Kanalları (${dateLabel})`,
    description: `${dateLabel} tarihinde oynanacak tüm maçlar, saatleri ve hangi kanalda yayınlandığı — Süper Lig, Şampiyonlar Ligi ve Avrupa'nın büyük liglerinde bugünün TV rehberi.`,
    alternates: { canonical: `${SITE_URL}/bugun` },
  };
}

export default async function TodayPage() {
  const locale = await getLocale();
  const todayKey = dateKeyOffset(0);
  const { startIso, endIso } = istKeyToUtcRange(todayKey);

  let rows = [];
  try {
    rows = await getFixturesInWindow(startIso, endIso);
  } catch {
    rows = [];
  }

  return (
    <>
      <div className="hero" style={{ paddingBottom: 10 }}>
        <div className="wrap">
          <div className="eyebrow">{istDateLong(new Date().toISOString())}</div>
          <h1>
            {locale === 'en' ? <>Today&apos;s <em>match schedule</em></> : <>Bugünün <em>maç programı</em></>}
          </h1>
          <p className="page-desc">
            {locale === 'en' ? 'All matches being played today, their kick-off times (Türkiye time) and broadcaster — ordered by competition. Browse the days below for yesterday, tomorrow and the next two weeks.' : 'Bugün oynanacak tüm maçlar, saatleri (TSİ) ve yayınlandığı kanal — lig lig sıralı. Dün, yarın ve önümüzdeki 2 haftanın programı için aşağıdaki günlere göz at.'}
          </p>
        </div>
      </div>

      <section style={{ paddingTop: 8 }}>
        <div className="wrap">
          <DayTabs activeOffset={0} locale={locale} />
          <Guide rows={rows} />
        </div>
      </section>

      <AppCta campaign="bugunun_maclari" />
    </>
  );
}
