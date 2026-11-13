import Link from 'next/link';
import { allAnalyses, analysisUrl } from '../../lib/analyses';
import { istDateLong } from '../../lib/format';
import { SITE_URL } from '../../lib/links';

export const revalidate = false;

export const metadata = {
  title: 'Maç Analizleri: Büyük Maçların Maç Sonu Değerlendirmeleri',
  description: 'Galatasaray, Fenerbahçe, Beşiktaş, Trabzonspor ve A Milli Takım maçlarının maç sonu analizleri: kırılma anları, oyuncular ve tahminimiz neden tuttu ya da tutmadı.',
  alternates: { canonical: `${SITE_URL}/mac-analizleri` },
};

export default function AnalysesIndexPage() {
  const list = allAnalyses();
  return (
    <>
      <div className="crumb wrap">
        <Link href="/">Ana Sayfa</Link> › Maç Analizleri
      </div>
      <div className="hero" style={{ paddingBottom: 10 }}>
        <div className="wrap">
          <div className="eyebrow">Maç Analizleri</div>
          <h1>Büyük maçların maç sonu analizleri</h1>
          <p className="page-desc">
            İddialı Tahminler yazdığımız her maçın ertesi günü: maçın nasıl şekillendiği, kırılma anları, öne çıkan
            oyuncular ve maç öncesi tahminimizin neden tuttuğu ya da tutmadığı.
          </p>
        </div>
      </div>
      <section style={{ paddingTop: 8 }}>
        <div className="wrap legal-text">
          {list.length === 0 ? (
            <p>
              İlk maç sonu analizleri yakında burada. Maç öncesi yazılarımız için{' '}
              <Link href="/iddiali-tahminler">İddialı Tahminler</Link> bölümüne göz atabilirsin.
            </p>
          ) : (
            list.map((a) => (
              <div key={a.slug} style={{ marginBottom: 22 }}>
                <h2>
                  <Link href={analysisUrl(a)}>{a.title}</Link>
                </h2>
                <p>
                  {istDateLong(a.kickoff)} · Maç sonucu {a.finalScore.home}-{a.finalScore.away}. {a.description}
                </p>
              </div>
            ))
          )}
        </div>
      </section>
    </>
  );
}
