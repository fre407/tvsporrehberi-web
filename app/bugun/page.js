import Guide from '../../components/Guide';
import AppCta from '../../components/AppCta';
import { getFixturesInWindow } from '../../lib/data';
import { istDateKey, istDateLong } from '../../lib/format';
import { SITE_URL } from '../../lib/links';

export const revalidate = 300;

export async function generateMetadata() {
  const dateLabel = istDateLong(new Date().toISOString());
  return {
    title: `Bugünün Maç Programı ve Yayın Kanalları (${dateLabel})`,
    description: `${dateLabel} tarihinde oynanacak tüm maçlar, saatleri ve hangi kanalda yayınlandığı — Süper Lig, Şampiyonlar Ligi ve Avrupa'nın büyük liglerinde bugünün TV rehberi.`,
    alternates: { canonical: `${SITE_URL}/bugun` },
  };
}

export default async function TodayPage() {
  const now = new Date();
  const startIso = new Date(now.getTime() - 20 * 3600 * 1000).toISOString();
  const endIso = new Date(now.getTime() + 30 * 3600 * 1000).toISOString();

  let rows = [];
  try {
    rows = await getFixturesInWindow(startIso, endIso);
  } catch {
    rows = [];
  }

  const todayKey = istDateKey(now.toISOString());
  const todayRows = rows.filter((r) => istDateKey(r.kickoff_at) === todayKey);

  return (
    <>
      <div className="hero" style={{ paddingBottom: 10 }}>
        <div className="wrap">
          <div className="eyebrow">{istDateLong(now.toISOString())}</div>
          <h1>
            Bugünün <em>maç programı</em>
          </h1>
          <p className="page-desc">
            Bugün oynanacak tüm maçlar, saatleri (TSİ) ve yayınlandığı kanal — lig lig sıralı.
          </p>
        </div>
      </div>

      <section style={{ paddingTop: 8 }}>
        <div className="wrap">
          <Guide rows={todayRows} />
        </div>
      </section>

      <AppCta campaign="bugunun_maclari" />
    </>
  );
}
