import { redirect } from 'next/navigation';
import { Suspense } from 'react';

import { getAppSession, roleHome } from '@/lib/session';

import { LoginForm } from './login-form';

export default async function LoginPage() {
  const session = await getAppSession();
  if (session) redirect(roleHome(session.role));

  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
