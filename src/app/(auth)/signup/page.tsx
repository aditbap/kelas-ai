import { redirect } from 'next/navigation';

import { getAppSession, roleHome } from '@/lib/session';

import { SignupForm } from './signup-form';

export default async function SignupPage() {
  const session = await getAppSession();
  if (session) redirect(roleHome(session.role));

  return <SignupForm />;
}
