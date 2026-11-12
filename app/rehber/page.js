import Link from 'next/link';
import { GUIDES, GUIDE_CATEGORIES, guideUrl } from '../../lib/guides';
import { SITE_URL } from '../../lib/links';

export const revalidate = false;

export const metadata = {
  title: 'Futbol Rehberi: Maç Saatleri, Turnuva Formatları ve Yayın Bilgisi',
  description: 'Avrupa maçlarının TSİ saat farkı, UEFA kupalarının yeni formatı, puan eşitliği kuralları ve yayın bilgisinin nasıl hazırlandığı üzerine rehber yazıları.',
  alternates: { canonical: `${SITE_URL}/rehber` },
};

export default function GuidesIndexPage() {
  return (
    <>
      <div className="crumb wrap">
        <Link href="/">Ana Sayfa</Link> › Rehber
      </div>
      <div className="hero" style={{ paddingBottom: 10 }}>
        <div className="wrap">
          <div className="eyebrow">Rehber</div>
          <h1>Futbol izleyicisi için rehber yazıları</h1>
          <p className="page-desc">
            Türk futbolunun büyük kulüpleri, A Milli Takım'ın unutulmaz turnuvaları, efsane isimler ve futbolun
            kuralları üzerine sade bir dille yazdığımız rehber yazıları.
          </p>
        </div>
      </div>
      <section style={{ paddingTop: 8 }}>
        <div className="wrap legal-text">
          {GUIDE_CATEGORIES.map((category) => {
            const items = GUIDES.filter((guide) => guide.category === category);
            if (items.length === 0) return null;
            return (
              <div key={category} style={{ marginBottom: 30 }}>
                <div className="eyebrow" style={{ marginBottom: 6 }}>{category}</div>
                {items.map((guide) => (
                  <div key={guide.slug} style={{ marginBottom: 22 }}>
                    <h2>
                      <Link href={guideUrl(guide)}>{guide.title}</Link>
                    </h2>
                    <p>{guide.description}</p>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </section>
    </>
  );
}
