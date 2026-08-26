'use client';

import { Printer } from '@phosphor-icons/react';

import { Button } from '@/components/ui/button';

export function PrintButton({ label }: { label: string }) {
  return (
    <Button size="sm" onClick={() => window.print()} className="print:hidden">
      <Printer size={16} />
      {label}
    </Button>
  );
}
