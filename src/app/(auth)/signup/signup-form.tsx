'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { authClient } from '@/lib/auth-client';
import { useLocale } from '@/lib/i18n/locale-context';

export function SignupForm() {
  const router = useRouter();
  const { t } = useLocale();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    startTransition(async () => {
      const { error: signUpError } = await authClient.signUp.email({ name, email, password });

      if (signUpError) {
        setError(signUpError.message ?? t.auth.genericError);
        return;
      }

      // Every self-serve sign-up is a Student - no role selection needed.
      router.push('/student');
      router.refresh();
    });
  }

  return (
    <div>
      <h1 className="text-tagline">{t.auth.signup.title}</h1>
      <p className="mt-1 text-caption text-ink-muted">{t.auth.signup.subtitle}</p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
        <div className="space-y-1.5">
          <Label htmlFor="name">{t.auth.signup.name}</Label>
          <Input
            id="name"
            name="name"
            autoComplete="name"
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="email">{t.auth.signup.email}</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="password">{t.auth.signup.password}</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </div>

        {error ? (
          <p role="alert" className="text-caption text-destructive">
            {error}
          </p>
        ) : null}

        <Button type="submit" className="w-full justify-center" disabled={isPending}>
          {isPending ? t.auth.signup.submitPending : t.auth.signup.submit}
        </Button>
      </form>

      <p className="mt-6 text-center text-caption text-ink-muted">
        {t.auth.signup.haveAccount}{' '}
        <Link href="/login" className="font-medium text-ink hover:underline">
          {t.auth.signup.signIn}
        </Link>
      </p>
    </div>
  );
}
