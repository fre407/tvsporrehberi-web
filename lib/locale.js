import { cookies } from 'next/headers';
import { DEFAULT_LOCALE, LOCALES } from './i18n';

export async function getLocale() {
  const locale = (await cookies()).get('tvsporrehberi:locale')?.value;
  return LOCALES.has(locale) ? locale : DEFAULT_LOCALE;
}
