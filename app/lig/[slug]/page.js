import { notFound } from 'next/navigation';
import Guide from '../../../components/Guide';
import AppCta from '../../../components/AppCta';
import { getFixturesForCompetition, windowIso } from '../../../lib/data';
import { competitionFlag, competitionKeyFromSlug, competitionLabel } from '../../../lib/competitions';
import { SITE_URL } from '../../../lib/links';

export const revalidate = 600;

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const key = competitionKeyFromSlug(slug);
  if (!key) return { title: 'Lig Bulunamadı' };
  const label = competitionLabel(key);
  return {
    title: `${label} Maç Programı ve Yayın Kanalları`,
    description: `${label}'nde bu hafta oynanacak tüm maçlar, saatleri ve hangi kanalda yayınlandığı bilgisi.`,
    alternates: { canonical: `${SITE_URL}/lig/${slug}` },
  };
}

export default async function LeaguePage({ params }) {
  const { slug } = await params;
  const key = competitionKeyFromSlug(slug);
  if (!key) notFound();

  const { startIso, endIso } = windowIso(2, 14);
  let rows = [];
  try {
    rows = await getFixturesForCompetition(key, { startIso, endIso });
  } catch {
    rows = [];
  }

  return (
    <>
      <div className="hero" style={{ paddingBottom: 10 }}>
        <div className="wrap">
          <div className="eyebrow">{competitionFlag(key)} Lig Rehberi</div>
          <h1>{competitionLabel(key)}</h1>
          <p className="page-desc">
            {competitionLabel(key)}&apos;nde yaklaşan tüm maçlar, saatleri ve yayın kanalları.
          </p>
        </div>
      </div>

      <section style={{ paddingTop: 8 }}>
        <div className="wrap">
          <Guide rows={rows} />
        </div>
      </section>

      <AppCta campaign="lig_sayfasi" />
    </>
  );
}
