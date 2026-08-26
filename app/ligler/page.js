import Link from 'next/link';
import AppCta from '../../components/AppCta';
import { COMPETITIONS, competitionLabel, competitionSlug, isMajorCompetition } from '../../lib/competitions';
import { SITE_URL } from '../../lib/links';
import { getLocale } from '../../lib/locale';

export const metadata = {
  title: 'Tüm Ligler ve Kupalar — Maç Programı, Puan Durumu, Yayın Bilgileri',
  description: 'Süper Lig, Şampiyonlar Ligi, Premier Lig, LaLiga ve daha fazlası — her ligin maç programı, puan durumu ve hangi kanalda yayınlandığı bilgisi tek sayfada.',
  alternates: { canonical: `${SITE_URL}/ligler` },
};

function LeagueGrid({ keys, locale }) {
  return (
    <div className="index-grid">
      {keys.map((key) => (
        <Link key={key} href={`/lig/${competitionSlug(key)}`} className="index-card">
          <span className="index-card-flag">{COMPETITIONS[key].flag}</span>
          <span className="index-card-name">{competitionLabel(key, locale)}</span>
        </Link>
      ))}
    </div>
  );
}

export default async function LeaguesIndexPage() {
  const locale = await getLocale();
  const allKeys = Object.keys(COMPETITIONS);
  const majorKeys = allKeys.filter(isMajorCompetition);
  const otherKeys = allKeys.filter((k) => !isMajorCompetition(k)).sort((a, b) => competitionLabel(a, locale).localeCompare(competitionLabel(b, locale), locale));

  return (
    <>
      <div className="hero" style={{ paddingBottom: 10 }}>
        <div className="wrap">
          <div className="eyebrow">{locale === 'en' ? 'Leagues & Cups' : 'Ligler & Kupalar'}</div>
          <h1>
            {locale === 'en' ? <>The <em>leagues</em> we cover</> : <>Takip ettiğimiz <em>ligler</em></>}
          </h1>
          <p className="page-desc">{locale === 'en' ? 'Select a league to see its current fixture list and broadcast channels.' : 'Bir lige tıkla, o ligin güncel maç programını ve yayın kanallarını gör.'}</p>
        </div>
      </div>

      <section style={{ paddingTop: 8 }}>
        <div className="wrap">
          <div className="sec-head">
            <div className="sec-title">
              {locale === 'en' ? <>Popular <span>Leagues</span></> : <>Popüler <span>Ligler</span></>}
            </div>
          </div>
          <LeagueGrid keys={majorKeys} locale={locale} />
        </div>
      </section>

      <section style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="sec-head">
            <div className="sec-title">
              {locale === 'en' ? <>Other Leagues <span>and Cups</span></> : <>Diğer Ligler <span>ve Kupalar</span></>}
            </div>
          </div>
          <LeagueGrid keys={otherKeys} locale={locale} />
        </div>
      </section>

      <AppCta campaign="ligler_sayfasi" />
    </>
  );
}
