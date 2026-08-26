import Link from 'next/link';
import { CheckCircle } from '@phosphor-icons/react/dist/ssr';

import { Button } from '@/components/ui/button';
import type { Payment } from '@/generated/prisma/client/client';
import type { Dictionary, Locale } from '@/lib/i18n/dictionaries';

const currencyFormatter = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0,
});

export function ManageSubscription({
  payment,
  locale,
  t,
}: {
  payment: Payment;
  locale: Locale;
  t: Dictionary['student']['manageSubscription'];
}) {
  const purchasedOn = payment.createdAt.toLocaleDateString(locale === 'id' ? 'id-ID' : 'en-GB', {
    dateStyle: 'long',
  });

  return (
    <div className="mx-auto max-w-md rounded-xl border border-hairline bg-elevated p-10 text-center shadow-product">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-action/10 text-action">
        <CheckCircle size={28} weight="fill" />
      </div>

      <h1 className="mt-5 text-tagline text-ink">{t.title}</h1>
      <p className="mt-2 text-caption text-ink-muted">{t.subtitle}</p>

      <div className="mt-8 space-y-3 rounded-lg border border-hairline bg-canvas p-5 text-left text-caption">
        <div className="flex items-center justify-between">
          <span className="text-ink-muted">{t.statusLabel}</span>
          <span className="rounded-full bg-action/10 px-2 py-0.5 text-fine font-medium text-action">
            {t.statusActive}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-ink-muted">{t.purchasedOn}</span>
          <span className="text-ink">{purchasedOn}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-ink-muted">{t.amountPaid}</span>
          <span className="text-ink">
            {payment.promoCode && payment.amount === 0
              ? t.freeViaPromo.replace('{code}', payment.promoCode)
              : currencyFormatter.format(payment.amount)}
          </span>
        </div>
      </div>

      <p className="mt-5 text-fine text-ink-muted">{t.lifetimeNote}</p>

      <div className="mt-8">
        <Button className="w-full justify-center" render={<Link href="/student/modules" />}>
          {t.backToModules}
        </Button>
      </div>
    </div>
  );
}
