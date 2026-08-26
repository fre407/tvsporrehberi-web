import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import Guide from '../../../components/Guide';
import AppCta from '../../../components/AppCta';
import FormDots from '../../../components/FormDots';
import JsonLd from '../../../components/JsonLd';
import { getFixturesForTeamSlug, teamResultLetter, windowIso } from '../../../lib/data';
import { slugify } from '../../../lib/format';
import { SITE_URL } from '../../../lib/links';
import { TEAM_NAME_ALIASES } from '../../../lib/teamNames';
import { getLocale } from '../../../lib/locale';

export const revalidate = 600;

// Takım adları kanonikleştirildiği için (bkz. lib/teamNames.js) eskiden
// "Everton FC" gibi bir varyanttan üretilmiş ve Google'ın çoktan indekslemiş
// olabileceği bir slug artık hiçbir fikstürle eşleşmeyip 404 verirdi — bunun
// yerine kanonik slug'a 301/308 yönlendiriyoruz.
const ALIAS_SLUG_REDIRECTS = (() => {
  const map = {};
  for (const [alias, canonical] of Object.entries(TEAM_NAME_ALIASES)) {
    const aliasSlug = slugify(alias);
    const canonicalSlug = slugify(canonical);
    if (aliasSlug !== canonicalSlug) map[aliasSlug] = canonicalSlug;
  }
  return map;
})();

async function loadTeam(slugParam) {
  const slug = slugify(decodeURIComponent(slugParam));
  const redirectTo = ALIAS_SLUG_REDIRECTS[slug] ?? null;
  if (redirectTo) return { matches: [], displayName: null, slug, redirectTo };
  const { startIso, endIso } = windowIso(30, 60);
  try {
    const { matches, displayName } = await getFixturesForTeamSlug(slug, { startIso, endIso });
    return { matches, displayName, slug, redirectTo: null };
  } catch {
    return { matches: [], displayName: null, slug, redirectTo: null };
  }
}

export async function generateMetadata({ params }) {
  const { slug: slugParam } = await params;
  const { displayName, slug, redirectTo } = await loadTeam(slugParam);
  if (redirectTo) return { title: 'Yönlendiriliyor…' };
  if (!displayName) return { title: 'Takım Bulunamadı' };
  return {
    title: `${displayName} Maçı Ne Zaman, Saat Kaçta, Hangi Kanalda?`,
    description: `${displayName} takımının yaklaşan ve son maçları, maç saatleri ve hangi kanalda yayınlandığı bilgisi.`,
    alternates: { canonical: `${SITE_URL}/takim/${slug}` },
  };
}

export default async function TeamPage({ params }) {
  const locale = await getLocale();
  const { slug: slugParam } = await params;
  const { matches, displayName, slug, redirectTo } = await loadTeam(slugParam);
  if (redirectTo) redirect(`/takim/${redirectTo}`);
  if (!displayName) notFound();

  const now = Date.now();
  const upcoming = matches.filter((m) => new Date(m.kickoff_at).getTime() >= now - 3 * 3600 * 1000);
  const past = matches
    .filter((m) => new Date(m.kickoff_at).getTime() < now - 3 * 3600 * 1000)
    .slice(-8)
    .reverse();
  const form = past.map((m) => teamResultLetter(m, displayName)).filter(Boolean).slice(0, 5);

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: locale === 'en' ? 'Home' : 'Ana Sayfa', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: displayName, item: `${SITE_URL}/takim/${slug}` },
    ],
  };

  return (
    <>
      <JsonLd data={breadcrumbLd} />
      <div className="crumb wrap">
        <Link href="/">{locale === 'en' ? 'Home' : 'Ana Sayfa'}</Link> › {displayName}
      </div>
      <div className="hero" style={{ paddingBottom: 10 }}>
        <div className="wrap">
          <div className="eyebrow">{locale === 'en' ? 'Team Guide' : 'Takım Rehberi'}</div>
          <h1>{displayName}</h1>
          <p className="page-desc">{locale === 'en' ? `Upcoming ${displayName} matches, kick-off times and broadcast channels.` : `${displayName} takımının yaklaşan maçları, saatleri ve yayın kanalları.`}</p>
          {form.length > 0 ? (
            <div style={{ marginTop: 14 }}>
              <FormDots results={form} />
            </div>
          ) : null}
        </div>
      </div>

      <section style={{ paddingTop: 8 }}>
        <div className="wrap">
          <div className="sec-head">
            <div className="sec-title">
              {locale === 'en' ? <>Upcoming <span>Matches</span></> : <>Yaklaşan <span>Maçlar</span></>}
            </div>
          </div>
          <Guide rows={upcoming} />
        </div>
      </section>

      {past.length > 0 ? (
        <section style={{ paddingTop: 0 }}>
          <div className="wrap">
            <div className="sec-head">
              <div className="sec-title">
                {locale === 'en' ? <>Recent <span>Matches</span></> : <>Son <span>Maçlar</span></>}
              </div>
            </div>
            <Guide rows={past} />
          </div>
        </section>
      ) : null}

      <AppCta campaign="takim_sayfasi" />
    </>
  );
}
