'use client';

import { createContext, useContext, type ReactNode } from 'react';

import { dictionaries, type Dictionary, type Locale } from './dictionaries';

const LocaleContext = createContext<{ locale: Locale; t: Dictionary } | null>(null);

/*
  The server is the source of truth: `locale` comes from the cookie read in
  the root layout, not from client state. Switching language sets the cookie
  and calls router.refresh(), which re-renders the layout and flows a new
  `locale` prop down to this provider.
*/
export function LocaleProvider({ locale, children }: { locale: Locale; children: ReactNode }) {
  return (
    <LocaleContext.Provider value={{ locale, t: dictionaries[locale] }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error('useLocale must be used within a LocaleProvider');
  }
  return context;
}
