import { playStoreUrl } from '../lib/links';
import { getLocale } from '../lib/locale';
import { t } from '../lib/i18n';

export default async function AppCta({ campaign }) {
  const locale = await getLocale();
  return (
    <section>
      <div className="wrap">
        <div className="app-cta">
          <div>
            <h2>
              {t(locale, 'cta.title1')}
              <br />
              <em>{t(locale, 'cta.title2')}</em>
            </h2>
            <p>
              {t(locale, 'cta.text')}
            </p>
            <div className="store-row">
              <a className="store-btn" href={playStoreUrl(campaign)} target="_blank" rel="noopener noreferrer">
                {t(locale, 'cta.download')}
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
