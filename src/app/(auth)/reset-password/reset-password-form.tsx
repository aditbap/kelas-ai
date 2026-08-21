'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useTransition } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { authClient } from '@/lib/auth-client';

const MIN_PASSWORD_LENGTH = 8;

export function ResetPasswordForm() {
  const router = useRouter();
  const token = useSearchParams().get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (!token) {
    return (
      <div>
        <h1 className="text-lg font-semibold tracking-tight">Link expired or invalid</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          This set-password link is missing or no longer valid. Request a new one to continue.
        </p>
        <Link
          href="/forgot-password"
          className="mt-6 inline-block text-sm text-foreground underline underline-offset-4"
        >
          Request a new link
        </Link>
      </div>
    );
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    startTransition(async () => {
      const { error: resetError } = await authClient.resetPassword({
        newPassword: password,
        token: token!,
      });

      if (resetError) {
        setError(resetError.message ?? 'Something went wrong. Please try again.');
        return;
      }

      router.push('/login');
    });
  }

  return (
    <div>
      <h1 className="text-lg font-semibold tracking-tight">Set your password</h1>
      <p className="mt-1 text-sm text-muted-foreground">Choose a password for your account.</p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
        <div className="space-y-1.5">
          <Label htmlFor="password">New password</Label>
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
          <Label htmlFor="confirmPassword">Confirm password</Label>
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
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        ) : null}

        <Button type="submit" className="w-full justify-center" disabled={isPending}>
          {isPending ? 'Saving…' : 'Set password'}
        </Button>
      </form>
    </div>
  );
}
