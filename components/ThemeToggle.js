'use client';

import { useEffect, useState } from 'react';
import { useLanguage } from './LanguageProvider';

const STORAGE_KEY = 'tvsporrehberi:theme';

export default function ThemeToggle() {
  const { t } = useLanguage();
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    const next = saved === 'dark' ? 'dark' : 'light';
    setTheme(next);
    document.documentElement.dataset.theme = next;
  }, []);

  function choose(next) {
    setTheme(next);
    document.documentElement.dataset.theme = next;
    window.localStorage.setItem(STORAGE_KEY, next);
  }

  return (
    <div className="theme-toggle" aria-label={t('theme.label')}>
      <button type="button" className={theme === 'dark' ? 'active' : ''} onClick={() => choose('dark')}>{t('theme.dark')}</button>
      <button type="button" className={theme === 'light' ? 'active' : ''} onClick={() => choose('light')}>{t('theme.light')}</button>
    </div>
  );
}
