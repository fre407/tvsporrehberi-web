import { playStoreUrl } from '../lib/links';

export default function AppCta({ campaign }) {
  return (
    <section>
      <div className="wrap">
        <div className="app-cta">
          <div>
            <h2>
              Bildirim gelsin,
              <br />
              <em>sen kaçırma.</em>
            </h2>
            <p>
              Favori takımının maçı yaklaşınca, İlk 11 açıklanınca ve maç bitince telefonuna anında haber
              verelim. TV Spor Rehberi uygulamasını indir, hiçbir maçı kaçırma.
            </p>
            <div className="store-row">
              <a className="store-btn" href={playStoreUrl(campaign)} target="_blank" rel="noopener noreferrer">
                ▶ Google Play&apos;den İndir
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
