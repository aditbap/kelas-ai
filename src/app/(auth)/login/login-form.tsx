'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useTransition } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Role } from '@/generated/prisma/client/enums';
import { authClient } from '@/lib/auth-client';
import { useLocale } from '@/lib/i18n/locale-context';
import { roleHome } from '@/lib/roles';

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get('next');
  const { t } = useLocale();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    startTransition(async () => {
      const { data, error: signInError } = await authClient.signIn.email({ email, password });

      if (signInError || !data) {
        setError(signInError?.message ?? t.auth.genericError);
        return;
      }

      router.push(next ?? roleHome(data.user.role ?? Role.Student));
      router.refresh();
    });
  }

  return (
    <div>
      <h1 className="text-tagline">{t.auth.login.title}</h1>
      <p className="mt-1 text-caption text-ink-muted">{t.auth.login.subtitle}</p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
        <div className="space-y-1.5">
          <Label htmlFor="email">{t.auth.login.email}</Label>
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
          <div className="flex items-center justify-between">
            <Label htmlFor="password">{t.auth.login.password}</Label>
            <Link href="/forgot-password" className="text-fine text-ink-muted hover:text-ink">
              {t.auth.login.forgotPassword}
            </Link>
          </div>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
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
          {isPending ? t.auth.login.submitPending : t.auth.login.submit}
        </Button>
      </form>

      <p className="mt-6 text-center text-caption text-ink-muted">
        {t.auth.login.noAccount}{' '}
        <Link href="/signup" className="font-medium text-ink hover:underline">
          {t.auth.login.createAccount}
        </Link>
      </p>
    </div>
  );
}
