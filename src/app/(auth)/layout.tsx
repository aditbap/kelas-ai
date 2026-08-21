import type { ReactNode } from 'react';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/30 p-6">
      <div className="w-full max-w-sm">
        <p className="mb-6 text-center text-sm font-semibold tracking-tight text-foreground">
          Kelas AI
        </p>
        <div className="rounded-lg border border-border bg-card p-6 shadow-sm">{children}</div>
      </div>
    </div>
  );
}
