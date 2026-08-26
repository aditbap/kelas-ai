'use client';

import { Dialog } from '@base-ui/react/dialog';
import { X, LockKeyOpen } from '@phosphor-icons/react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { useLocale } from '@/lib/i18n/locale-context';

export function SubscriptionPopup({ hasAccess }: { hasAccess: boolean }) {
  const { t } = useLocale();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!hasAccess) {
      const hasSeen = sessionStorage.getItem('hasSeenSubscriptionPopup');
      if (!hasSeen) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setOpen(true);
      }
    }
  }, [hasAccess]);

  function handleClose() {
    setOpen(false);
    sessionStorage.setItem('hasSeenSubscriptionPopup', 'true');
  }

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) handleClose();
      }}
    >
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-void/50 backdrop-blur-sm transition-all duration-300" />
        <Dialog.Popup className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-canvas p-6 shadow-product outline-none animate-in fade-in zoom-in-95 duration-200">
          <Dialog.Close className="absolute right-4 top-4 rounded-sm p-1 text-ink-muted transition-colors hover:bg-elevated hover:text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-action">
            <X size={20} />
          </Dialog.Close>

          <div className="flex flex-col items-center text-center mt-2">
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-pink-500/10 text-pink-500 ring-4 ring-pink-500/5">
              <LockKeyOpen size={28} weight="fill" />
            </div>

            <Dialog.Title className="text-xl font-semibold text-ink">
              {t.student.subscriptionPopup.title}
            </Dialog.Title>

            <Dialog.Description className="mt-3 text-sm leading-relaxed text-ink-muted">
              {t.student.subscriptionPopup.description}
            </Dialog.Description>

            <div className="mt-8 w-full">
              <Button
                className="w-full justify-center"
                variant="default"
                render={<Link href="/student/checkout" />}
                onClick={handleClose}
              >
                {t.student.subscriptionPopup.cta}
              </Button>
            </div>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
