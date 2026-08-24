import { notFound } from 'next/navigation';
import Guide from '../../../components/Guide';
import AppCta from '../../../components/AppCta';
import FormDots from '../../../components/FormDots';
import { getFixturesForTeamSlug, teamResultLetter, windowIso } from '../../../lib/data';
import { slugify } from '../../../lib/format';
import { SITE_URL } from '../../../lib/links';

export const revalidate = 600;

async function loadTeam(slugParam) {
  const slug = slugify(decodeURIComponent(slugParam));
  const { startIso, endIso } = windowIso(30, 60);
  try {
    const { matches, displayName } = await getFixturesForTeamSlug(slug, { startIso, endIso });
    return { matches, displayName, slug };
  } catch {
    return { matches: [], displayName: null, slug };
  }
}

export async function generateMetadata({ params }) {
  const { slug: slugParam } = await params;
  const { displayName, slug } = await loadTeam(slugParam);
  if (!displayName) return { title: 'Takım Bulunamadı' };
  return {
    title: `${displayName} Maçları — Fikstür ve Yayın Bilgisi`,
    description: `${displayName} takımının yaklaşan ve son maçları, maç saatleri ve hangi kanalda yayınlandığı bilgisi.`,
    alternates: { canonical: `${SITE_URL}/takim/${slug}` },
  };
}

export default async function TeamPage({ params }) {
  const { slug: slugParam } = await params;
  const { matches, displayName } = await loadTeam(slugParam);
  if (!displayName) notFound();

  const now = Date.now();
  const upcoming = matches.filter((m) => new Date(m.kickoff_at).getTime() >= now - 3 * 3600 * 1000);
  const past = matches
    .filter((m) => new Date(m.kickoff_at).getTime() < now - 3 * 3600 * 1000)
    .slice(-8)
    .reverse();
  const form = past.map((m) => teamResultLetter(m, displayName)).filter(Boolean).slice(0, 5);

  return (
    <>
      <div className="hero" style={{ paddingBottom: 10 }}>
        <div className="wrap">
          <div className="eyebrow">Takım Rehberi</div>
          <h1>{displayName}</h1>
          <p className="page-desc">{displayName} takımının yaklaşan maçları, saatleri ve yayın kanalları.</p>
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
              Yaklaşan <span>Maçlar</span>
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
                Son <span>Maçlar</span>
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
