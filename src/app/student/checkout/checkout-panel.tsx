'use client';

import { useState, type FormEvent } from 'react';
import { Dialog } from '@base-ui/react/dialog';
import { X, Check } from '@phosphor-icons/react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Dictionary } from '@/lib/i18n/dictionaries';
import { applyDiscount, findPromoCode, type PromoCode } from '@/lib/promo-codes';
import { Reveal } from '@/components/reveal';

const currencyFormatter = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0,
});

export function CheckoutPanel({
  priceAmount,
  t,
}: {
  priceAmount: number;
  t: Dictionary['student']['checkout']['panel'];
}) {
  const [open, setOpen] = useState(false);

  const [promoInput, setPromoInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<PromoCode | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [payError, setPayError] = useState<string | null>(null);
  const [isPaying, setIsPaying] = useState(false);

  // A live preview only - the actual charge is always recomputed server-side
  // from the code itself when the student pays.
  const finalAmount = appliedPromo
    ? applyDiscount(priceAmount, appliedPromo.discountPercent)
    : priceAmount;
  const discountAmount = priceAmount - finalAmount;
  const isFree = finalAmount <= 0;

  function handleApplyPromo(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPromoError(null);

    const trimmed = promoInput.trim();
    if (!trimmed) {
      setPromoError(t.promoEmpty);
      return;
    }

    const promo = findPromoCode(trimmed);
    if (!promo) {
      setAppliedPromo(null);
      setPromoError(t.promoInvalid);
      return;
    }
    setAppliedPromo(promo);
  }

  function handleRemovePromo() {
    setAppliedPromo(null);
    setPromoInput('');
    setPromoError(null);
  }

  async function handlePay() {
    setPayError(null);
    setIsPaying(true);

    const response = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ promoCode: appliedPromo?.code }),
    });
    let data: Record<string, unknown> = {};
    const text = await response.text();
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      console.error('Failed to parse checkout response:', text);
      setPayError(t.genericServerError);
      setIsPaying(false);
      return;
    }

    if (!response.ok) {
      const errorMessage = typeof data.error === 'string' ? data.error : t.genericError;
      setPayError(errorMessage);
      setIsPaying(false);
      return;
    }

    window.location.href = typeof data.url === 'string' ? data.url : '/student/modules';
  }

  return (
    <>
      {/* 1. The Pricing Card (matches landing page UI) */}
      <Reveal className="mx-auto max-w-md rounded-xl border border-hairline bg-elevated p-10 text-center shadow-product">
        <h3 className="text-tagline text-ink">{t.packageName}</h3>
        <p className="mt-2 text-caption text-ink-muted">{t.accessDescription}</p>
        <p className="mt-6 text-display-md text-ink">{currencyFormatter.format(priceAmount)}</p>
        <p className="mt-1 text-fine text-ink-muted">{t.oneTimePayment}</p>

        <ul className="mt-8 space-y-3 text-left text-caption text-ink-muted">
          {t.features.map((feature) => (
            <li key={feature} className="flex items-start gap-2.5">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-action" weight="bold" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>

        <div className="mt-8">
          <Button onClick={() => setOpen(true)} className="w-full justify-center">
            {t.getAccessCta}
          </Button>
        </div>
      </Reveal>

      {/* 2. The Checkout Popup Dialog */}
      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Portal>
          <Dialog.Backdrop className="fixed inset-0 z-50 bg-void/50 backdrop-blur-sm transition-all duration-300" />
          <Dialog.Popup className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-canvas p-6 shadow-product outline-none animate-in fade-in zoom-in-95 duration-200">
            <Dialog.Close className="absolute right-4 top-4 rounded-sm p-1 text-ink-muted transition-colors hover:bg-elevated hover:text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-action">
              <X size={20} />
            </Dialog.Close>

            <h2 className="text-lg font-semibold text-ink mb-4">{t.dialogTitle}</h2>

            {/* The existing checkout summary */}
            <div className="rounded-lg border border-hairline bg-elevated p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-caption font-medium text-ink">{t.packageName}</p>
                  <p className="mt-0.5 text-fine text-ink-muted">{t.accessDescription}</p>
                </div>
                <span className="shrink-0 rounded-full bg-action/10 px-2 py-0.5 text-fine font-medium text-action">
                  {t.badge}
                </span>
              </div>

              <div className="mt-5 space-y-1.5 border-t border-hairline pt-4">
                <div className="flex items-center justify-between text-caption">
                  <span className="text-ink-muted">{t.price}</span>
                  <span className={appliedPromo ? 'text-ink-muted line-through' : 'text-ink'}>
                    {currencyFormatter.format(priceAmount)}
                  </span>
                </div>
                {appliedPromo ? (
                  <div className="flex items-center justify-between text-caption">
                    <span className="text-action">
                      {t.promoLabel.replace('{code}', appliedPromo.code)}
                    </span>
                    <span className="text-action">-{currencyFormatter.format(discountAmount)}</span>
                  </div>
                ) : null}
                <div className="flex items-center justify-between pt-1.5 text-caption font-semibold text-ink">
                  <span>{t.total}</span>
                  <span>{currencyFormatter.format(finalAmount)}</span>
                </div>
              </div>

              <form onSubmit={handleApplyPromo} className="mt-5 border-t border-hairline pt-4">
                <Label htmlFor="promo-code">{t.promoCodeLabel}</Label>
                <div className="mt-1.5 flex gap-2">
                  <Input
                    id="promo-code"
                    name="promoCode"
                    value={promoInput}
                    onChange={(event) => setPromoInput(event.target.value)}
                    placeholder={t.promoPlaceholder}
                    disabled={!!appliedPromo}
                    className="flex-1"
                  />
                  {appliedPromo ? (
                    <Button type="button" variant="outline" size="sm" onClick={handleRemovePromo}>
                      {t.remove}
                    </Button>
                  ) : (
                    <Button type="submit" variant="outline" size="sm">
                      {t.apply}
                    </Button>
                  )}
                </div>
                {promoError ? (
                  <p className="mt-1.5 text-fine text-destructive">{promoError}</p>
                ) : null}
                {appliedPromo ? (
                  <p className="mt-1.5 text-fine text-action">{t.promoApplied}</p>
                ) : null}
              </form>

              <div className="mt-5">
                <Button
                  type="button"
                  onClick={handlePay}
                  disabled={isPaying}
                  className="w-full justify-center"
                >
                  {isPaying ? t.processing : isFree ? t.payFree : t.payNow}
                </Button>
                {payError ? <p className="mt-2 text-fine text-destructive">{payError}</p> : null}
              </div>
            </div>
          </Dialog.Popup>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
