'use client';

import { useState } from 'react';
import { Dialog } from '@base-ui/react/dialog';
import { X, User, EnvelopeSimple } from '@phosphor-icons/react';
import type { Session } from 'better-auth/types';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { authClient } from '@/lib/auth-client';

export function ProfileSettingsDialog({
  open,
  onOpenChange,
  session,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  session: Session;
}) {
  const [name, setName] = useState(session.name);
  const [email, setEmail] = useState(session.email);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSaving(true);

    try {
      const { error: updateError } = await authClient.updateUser({
        name,
        // better-auth doesn't inherently support email updates through the standard updateUser call without specialized config (like email verification flows), but we include it in UI for completion. Usually we'd just update name.
      });

      if (updateError) {
        setError(updateError.message ?? 'Failed to update profile.');
      } else {
        onOpenChange(false);
      }
    } catch (err) {
      setError('An unexpected error occurred.');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-void/50 backdrop-blur-sm transition-all duration-300" />
        <Dialog.Popup className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-canvas p-6 shadow-product outline-none animate-in fade-in zoom-in-95 duration-200">
          <Dialog.Close className="absolute right-4 top-4 rounded-sm p-1 text-ink-muted transition-colors hover:bg-elevated hover:text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-action">
            <X size={20} />
          </Dialog.Close>

          <Dialog.Title className="text-lg font-semibold text-ink">Profile Settings</Dialog.Title>
          <Dialog.Description className="mt-1 text-sm text-ink-muted mb-6">
            Customize your account profile.
          </Dialog.Description>

          <form onSubmit={handleSave} className="space-y-5">
            {/* Avatar preview */}
            <div className="flex justify-center mb-6">
              <div className="h-20 w-20 shrink-0 rounded-full bg-action/10 flex items-center justify-center text-action font-semibold text-3xl ring-4 ring-action/5">
                {name.charAt(0).toUpperCase()}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name" className="flex items-center gap-1.5">
                <User size={16} /> Full Name
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-1.5">
                <EnvelopeSimple size={16} /> Email Address
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled
                className="bg-elevated text-ink-muted cursor-not-allowed opacity-70"
                title="Email cannot be changed directly"
              />
            </div>

            {error && <p className="text-fine text-destructive">{error}</p>}

            <div className="mt-8 pt-4 flex justify-end gap-3 border-t border-hairline">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="default" disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
