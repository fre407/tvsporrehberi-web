'use client';

import { useEffect, useState } from 'react';

const STORAGE_KEY = 'tvsporrehberi:theme';

export default function ThemeToggle() {
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    const next = saved === 'light' ? 'light' : 'dark';
    setTheme(next);
    document.documentElement.dataset.theme = next;
  }, []);

  function choose(next) {
    setTheme(next);
    document.documentElement.dataset.theme = next;
    window.localStorage.setItem(STORAGE_KEY, next);
  }

  return (
    <div className="theme-toggle" aria-label="Renk teması">
      <button type="button" className={theme === 'dark' ? 'active' : ''} onClick={() => choose('dark')}>Koyu</button>
      <button type="button" className={theme === 'light' ? 'active' : ''} onClick={() => choose('light')}>Açık</button>
    </div>
  );
}
