import Link from 'next/link';
import AppCta from '../../components/AppCta';
import { COMPETITIONS, competitionSlug, isMajorCompetition } from '../../lib/competitions';
import { SITE_URL } from '../../lib/links';

export const metadata = {
  title: 'Tüm Ligler ve Kupalar — Maç Programı, Puan Durumu, Yayın Bilgileri',
  description: 'Süper Lig, Şampiyonlar Ligi, Premier Lig, LaLiga ve daha fazlası — her ligin maç programı, puan durumu ve hangi kanalda yayınlandığı bilgisi tek sayfada.',
  alternates: { canonical: `${SITE_URL}/ligler` },
};

function LeagueGrid({ keys }) {
  return (
    <div className="index-grid">
      {keys.map((key) => (
        <Link key={key} href={`/lig/${competitionSlug(key)}`} className="index-card">
          <span className="index-card-flag">{COMPETITIONS[key].flag}</span>
          <span className="index-card-name">{COMPETITIONS[key].label}</span>
        </Link>
      ))}
    </div>
  );
}

export default function LeaguesIndexPage() {
  const allKeys = Object.keys(COMPETITIONS);
  const majorKeys = allKeys.filter(isMajorCompetition);
  const otherKeys = allKeys.filter((k) => !isMajorCompetition(k)).sort((a, b) => COMPETITIONS[a].label.localeCompare(COMPETITIONS[b].label, 'tr'));

  return (
    <>
      <div className="hero" style={{ paddingBottom: 10 }}>
        <div className="wrap">
          <div className="eyebrow">Ligler &amp; Kupalar</div>
          <h1>
            Takip ettiğimiz <em>ligler</em>
          </h1>
          <p className="page-desc">Bir lige tıkla, o ligin güncel maç programını ve yayın kanallarını gör.</p>
        </div>
      </div>

      <section style={{ paddingTop: 8 }}>
        <div className="wrap">
          <div className="sec-head">
            <div className="sec-title">
              Popüler <span>Ligler</span>
            </div>
          </div>
          <LeagueGrid keys={majorKeys} />
        </div>
      </section>

      <section style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="sec-head">
            <div className="sec-title">
              Diğer Ligler <span>ve Kupalar</span>
            </div>
          </div>
          <LeagueGrid keys={otherKeys} />
        </div>
      </section>

      <AppCta campaign="ligler_sayfasi" />
    </>
  );
}
