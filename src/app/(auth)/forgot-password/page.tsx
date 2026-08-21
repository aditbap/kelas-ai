'use client';

import Link from 'next/link';
import { useState, useTransition } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { authClient } from '@/lib/auth-client';

export default function ForgotPasswordPage() {
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
        setError(requestError.message ?? 'Something went wrong. Please try again.');
        return;
      }

      setSubmitted(true);
    });
  }

  if (submitted) {
    return (
      <div>
        <h1 className="text-lg font-semibold tracking-tight">Check your email</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          If an account exists for <strong>{email}</strong>, we sent a link to set a new password.
        </p>
        <Link
          href="/login"
          className="mt-6 inline-block text-sm text-foreground underline underline-offset-4"
        >
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-lg font-semibold tracking-tight">Reset your password</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Enter your email and we&apos;ll send you a link to set a new password.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
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
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        ) : null}

        <Button type="submit" className="w-full justify-center" disabled={isPending}>
          {isPending ? 'Sending…' : 'Send reset link'}
        </Button>

        <Link
          href="/login"
          className="block text-center text-sm text-muted-foreground hover:text-foreground"
        >
          Back to sign in
        </Link>
      </form>
    </div>
  );
}
