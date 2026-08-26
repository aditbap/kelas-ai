import { cookies } from 'next/headers';

import { dictionaries, type Dictionary, type Locale } from './dictionaries';

export const LOCALE_COOKIE = 'locale';

export async function getLocale(): Promise<Locale> {
  const store = await cookies();
  return store.get(LOCALE_COOKIE)?.value === 'id' ? 'id' : 'en';
}

/* Convenience for Server Components that just need the strings, not the raw locale. */
export async function getTranslations(): Promise<{ locale: Locale; t: Dictionary }> {
  const locale = await getLocale();
  return { locale, t: dictionaries[locale] };
}
