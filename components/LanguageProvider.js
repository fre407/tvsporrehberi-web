'use client';

import { createContext, useContext } from 'react';
import { DEFAULT_LOCALE, t } from '../lib/i18n';

const LanguageContext = createContext({ locale: DEFAULT_LOCALE, t: (key, values) => t(DEFAULT_LOCALE, key, values) });

export function LanguageProvider({ locale, children }) {
  return <LanguageContext.Provider value={{ locale, t: (key, values) => t(locale, key, values) }}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  return useContext(LanguageContext);
}
