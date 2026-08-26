'use client';

import Link from 'next/link';
import { useState, useTransition } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { authClient } from '@/lib/auth-client';
import { useLocale } from '@/lib/i18n/locale-context';

export default function ForgotPasswordPage() {
  const { t } = useLocale();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    startTransition(async () => {
      const { error: requestError } = await authClient.requestPasswordReset({
        email,
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (requestError) {
        setError(requestError.message ?? t.auth.genericError);
        return;
      }

      setSubmitted(true);
    });
  }

  if (submitted) {
    const [before, after] = t.auth.forgotPassword.checkEmailDescription.split('{email}');

    return (
      <div>
        <h1 className="text-tagline">{t.auth.forgotPassword.checkEmailTitle}</h1>
        <p className="mt-2 text-caption text-ink-muted">
          {before}
          <strong>{email}</strong>
          {after}
        </p>
        <Link
          href="/login"
          className="mt-6 inline-block text-caption text-ink underline underline-offset-4"
        >
          {t.auth.forgotPassword.backToSignIn}
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-tagline">{t.auth.forgotPassword.title}</h1>
      <p className="mt-1 text-caption text-ink-muted">{t.auth.forgotPassword.subtitle}</p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
        <div className="space-y-1.5">
          <Label htmlFor="email">{t.auth.forgotPassword.email}</Label>
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

        {error ? (
          <p role="alert" className="text-caption text-destructive">
            {error}
          </p>
        ) : null}

        <Button type="submit" className="w-full justify-center" disabled={isPending}>
          {isPending ? t.auth.forgotPassword.submitPending : t.auth.forgotPassword.submit}
        </Button>

        <Link
          href="/login"
          className="block text-center text-caption text-ink-muted hover:text-ink"
        >
          {t.auth.forgotPassword.backToSignIn}
        </Link>
      </form>
    </div>
  );
}
