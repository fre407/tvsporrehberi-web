import Link from 'next/link';
import AppCta from '../../components/AppCta';
import { getPopularTeams, windowIso } from '../../lib/data';
import { MAJOR_COMPETITION_KEYS } from '../../lib/competitions';
import { SITE_URL } from '../../lib/links';
import { getLocale } from '../../lib/locale';

export const revalidate = 1800;

export const metadata = {
  title: 'Tüm Takımlar — Maç Programı, Saatleri ve Yayın Kanalları',
  description: 'Galatasaray, Fenerbahçe, Beşiktaş, Trabzonspor ve Avrupa\'nın popüler kulüplerinin yaklaşan maçları, kaçta oynanacağı ve hangi kanalda yayınlandığı bilgisi.',
  alternates: { canonical: `${SITE_URL}/takimlar` },
};

export default async function TeamsIndexPage() {
  const locale = await getLocale();
  let teams = [];
  try {
    const { startIso, endIso } = windowIso(2, 21);
    teams = await getPopularTeams({ competitionKeys: MAJOR_COMPETITION_KEYS, startIso, endIso });
  } catch {
    teams = [];
  }

  return (
    <>
      <div className="hero" style={{ paddingBottom: 10 }}>
        <div className="wrap">
          <div className="eyebrow">{locale === 'en' ? 'Teams' : 'Takımlar'}</div>
          <h1>
            {locale === 'en' ? <>Popular <em>teams</em></> : <>Popüler <em>takımlar</em></>}
          </h1>
          <p className="page-desc">{locale === 'en' ? 'Select a team to see its upcoming and recent matches, kick-off times and broadcasters.' : 'Bir takıma tıkla, yaklaşan ve son maçlarını, saatlerini ve yayın kanallarını gör.'}</p>
        </div>
      </div>

      <section style={{ paddingTop: 8 }}>
        <div className="wrap">
          {teams.length === 0 ? (
            <div className="guide empty-note">{locale === 'en' ? 'There are no upcoming matches to list right now.' : 'Şu an listelenecek yaklaşan maç bulunamadı.'}</div>
          ) : (
            <div className="index-grid">
              {teams.map((t) => (
                <Link key={t.slug} href={`/takim/${t.slug}`} className="index-card">
                  {t.logo ? <img className="index-card-crest" src={t.logo} alt="" /> : <span className="index-card-crest fallback">⚽</span>}
                  <span className="index-card-name">{t.name}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <AppCta campaign="takimlar_sayfasi" />
    </>
  );
}
