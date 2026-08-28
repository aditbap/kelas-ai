import type { Metadata } from 'next';
import { Geist_Mono, Inter } from 'next/font/google';
import './globals.css';

/*
  SF Pro is proprietary and resolves natively via `-apple-system` on Apple
  platforms (see the font stack in globals.css). Inter is the documented
  open-source substitute for everywhere else, tuned per the design notes:
  slightly tighter tracking on display sizes to match SF Pro's cadence.
*/
const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  display: 'swap',
});

import { ThemeProvider } from '@/components/theme-provider';
import { getLocale } from '@/lib/i18n/get-locale';
import { LocaleProvider } from '@/lib/i18n/locale-context';

export const metadata: Metadata = {
  title: 'Kelas AI: From AI Awareness to AI Adoption',
  description:
    'Corporate AI training that sticks. Onsite instruction backed by a digital companion platform for practice, progress tracking, and adoption.',
};

export default async function RootLayout({ children }: LayoutProps<'/'>) {
  const locale = await getLocale();

  return (
    <html
      lang={locale}
      suppressHydrationWarning
      data-scroll-behavior="smooth"
      className={`${inter.variable} ${geistMono.variable} h-full`}
    >
      <body className="flex min-h-full flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <LocaleProvider locale={locale}>{children}</LocaleProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
