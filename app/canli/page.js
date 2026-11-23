import Link from 'next/link';
import LiveGuide from '../../components/LiveGuide';
import Guide from '../../components/Guide';
import AppCta from '../../components/AppCta';
import { broadcastServices, getFixturesInWindow, isIndexWorthyMatch, matchStatus } from '../../lib/data';
import { SITE_URL } from '../../lib/links';
import { getLocale } from '../../lib/locale';

export const revalidate = 30;

export const metadata = {
  title: 'Canlı Maç Skorları',
  description: 'Şu an oynanan tüm maçların canlı skorları, dakikaları ve yayın kanalları — otomatik güncellenir. Son sonuçlar ve sıradaki maçlar da burada.',
  alternates: { canonical: `${SITE_URL}/canli` },
};

const SIDE_LIST_LIMIT = 8;
const DAY_MS = 24 * 60 * 60 * 1000;

// Canlı maç yokken sayfa neredeyse boş kalıyordu (AdSense "düşük değerli
// içerik" denetimi, 2026-11-23). Aynı 2 günlük pencereden, gerçek veriyle:
// son 24 saatte biten önemli maçlar ve sıradaki önemli maçlar.
function pickRows(rows) {
  const now = Date.now();
  const important = (r) => isIndexWorthyMatch(r) || broadcastServices(r).length > 0;
  const live = rows.filter((r) => matchStatus(r) === 'live');
  const finished = rows
    .filter((r) => matchStatus(r) === 'finished' && now - new Date(r.kickoff_at).getTime() < DAY_MS && important(r))
    .sort((a, b) => new Date(b.kickoff_at) - new Date(a.kickoff_at))
    .slice(0, SIDE_LIST_LIMIT)
    .reverse();
  const upcoming = rows
    .filter((r) => matchStatus(r) === 'upcoming' && important(r))
    .slice(0, SIDE_LIST_LIMIT);
  return { live, finished, upcoming };
}

export default async function LivePage() {
  const locale = await getLocale();
  const en = locale === 'en';
  let live = [];
  let finished = [];
  let upcoming = [];
  try {
    const now = Date.now();
    const rows = await getFixturesInWindow(new Date(now - DAY_MS).toISOString(), new Date(now + DAY_MS).toISOString());
    ({ live, finished, upcoming } = pickRows(rows));
  } catch {
    // Veri alınamazsa canlı bölüm istemci tarafında yine yenilenmeye çalışır.
  }

  return (
    <>
      <div className="hero" style={{ paddingBottom: 10 }}>
        <div className="wrap">
          <div className="eyebrow">● {en ? 'Live' : 'Canlı'}</div>
          <h1>
            {en ? <>Live <em>match scores</em></> : <>Canlı <em>maç skorları</em></>}
          </h1>
          <p className="page-desc">{en ? 'Scores, minutes and broadcasters for all live matches — refreshed automatically.' : 'Şu an oynanan tüm maçların skoru, dakikası ve yayın kanalı — otomatik yenilenir.'}</p>
        </div>
      </div>

      <section style={{ paddingTop: 8 }}>
        <div className="wrap">
          <LiveGuide initialRows={live} />
        </div>
      </section>

      {upcoming.length > 0 ? (
        <section style={{ paddingTop: 0 }}>
          <div className="wrap">
            <div className="sec-head">
              <div className="sec-title">{en ? <>Next <span>matches</span></> : <>Sıradaki <span>maçlar</span></>}</div>
              <Link className="sec-link" href="/bugun">{en ? 'Full schedule →' : 'Tüm program →'}</Link>
            </div>
            <Guide rows={upcoming} />
          </div>
        </section>
      ) : null}

      {finished.length > 0 ? (
        <section style={{ paddingTop: 0 }}>
          <div className="wrap">
            <div className="sec-head">
              <div className="sec-title">{en ? <>Latest <span>results</span></> : <>Son <span>sonuçlar</span></>}</div>
            </div>
            <Guide rows={finished} />
          </div>
        </section>
      ) : null}

      <AppCta campaign="canli_skorlar" />
    </>
  );
}
