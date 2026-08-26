'use client';

import { useRouter } from 'next/navigation';
import { useLanguage } from './LanguageProvider';

export default function LanguageToggle() {
  const router = useRouter();
  const { locale, t } = useLanguage();

  function choose(nextLocale) {
    if (nextLocale === locale) return;
    document.cookie = `tvsporrehberi:locale=${nextLocale}; path=/; max-age=31536000; samesite=lax`;
    document.documentElement.lang = nextLocale;
    router.refresh();
  }

  return <div className="language-toggle" aria-label={t('language.label')}>
    <button type="button" className={locale === 'tr' ? 'active' : ''} onClick={() => choose('tr')}>{t('language.tr')}</button>
    <button type="button" className={locale === 'en' ? 'active' : ''} onClick={() => choose('en')}>{t('language.en')}</button>
  </div>;
}
