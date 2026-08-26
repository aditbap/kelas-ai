'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useTransition } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { authClient } from '@/lib/auth-client';
import { useLocale } from '@/lib/i18n/locale-context';

const MIN_PASSWORD_LENGTH = 8;

export function ResetPasswordForm() {
  const router = useRouter();
  const token = useSearchParams().get('token');
  const { t } = useLocale();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (!token) {
    return (
      <div>
        <h1 className="text-tagline">{t.auth.resetPassword.linkInvalidTitle}</h1>
        <p className="mt-2 text-caption text-ink-muted">
          {t.auth.resetPassword.linkInvalidDescription}
        </p>
        <Link
          href="/forgot-password"
          className="mt-6 inline-block text-caption text-ink underline underline-offset-4"
        >
          {t.auth.resetPassword.requestNewLink}
        </Link>
      </div>
    );
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(t.auth.resetPassword.passwordTooShort.replace('{min}', String(MIN_PASSWORD_LENGTH)));
      return;
    }
    if (password !== confirmPassword) {
      setError(t.auth.resetPassword.passwordMismatch);
      return;
    }

    startTransition(async () => {
      const { error: resetError } = await authClient.resetPassword({
        newPassword: password,
        token: token!,
      });

      if (resetError) {
        setError(resetError.message ?? t.auth.genericError);
        return;
      }

      router.push('/login');
    });
  }

  return (
    <div>
      <h1 className="text-tagline">{t.auth.resetPassword.title}</h1>
      <p className="mt-1 text-caption text-ink-muted">{t.auth.resetPassword.subtitle}</p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
        <div className="space-y-1.5">
          <Label htmlFor="password">{t.auth.resetPassword.newPassword}</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={MIN_PASSWORD_LENGTH}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="confirmPassword">{t.auth.resetPassword.confirmPassword}</Label>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            required
            minLength={MIN_PASSWORD_LENGTH}
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
          />
        </div>

        {error ? (
          <p role="alert" className="text-caption text-destructive">
            {error}
          </p>
        ) : null}

        <Button type="submit" className="w-full justify-center" disabled={isPending}>
          {isPending ? t.auth.resetPassword.submitPending : t.auth.resetPassword.submit}
        </Button>
      </form>
    </div>
  );
}
