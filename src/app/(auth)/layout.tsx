import Link from 'next/link';
import type { ReactNode } from 'react';

import { LanguageToggle } from '@/components/language-toggle';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-parchment p-6">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex items-center justify-between">
          <span aria-hidden className="w-10" />
          <Link href="/" className="text-tagline font-display tracking-tight text-ink">
            Kelas AI
          </Link>
          <LanguageToggle className="w-10 justify-end text-fine text-ink-muted" />
        </div>
        <div className="rounded-lg border border-hairline bg-elevated p-8">{children}</div>
      </div>
    </div>
  );
}
