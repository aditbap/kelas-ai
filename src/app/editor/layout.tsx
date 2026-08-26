import type { ReactNode } from 'react';

import { AppShell } from '@/components/app-shell';
import { Role } from '@/generated/prisma/client/enums';
import { requireRole } from '@/lib/session';

export default async function EditorLayout({ children }: { children: ReactNode }) {
  const session = await requireRole(Role.Editor);

  return (
    <AppShell session={session} role="editor">
      {children}
    </AppShell>
  );
}
