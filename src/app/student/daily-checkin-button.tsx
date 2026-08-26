'use client';

import { useState } from 'react';
import { CalendarBlank, X, SmileySad, SmileyMeh, Smiley } from '@phosphor-icons/react/dist/ssr';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Dictionary } from '@/lib/i18n/dictionaries';
import { useLocale } from '@/lib/i18n/locale-context';

type DailyCheckInButtonProps = {
  t: Dictionary['student']['dailyCheckin'];
  activeClasses: { id: string; title: string }[];
};

export function DailyCheckInButton({ t, activeClasses }: DailyCheckInButtonProps) {
  const { locale } = useLocale();
  const [isOpen, setIsOpen] = useState(false);
  const [mood, setMood] = useState<'bad' | 'neutral' | 'good' | null>(null);
  const [selectedClass, setSelectedClass] = useState('');
  const [reflection, setReflection] = useState('');

  const today = new Date().toLocaleDateString(locale === 'id' ? 'id-ID' : 'en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const isReflectionValid = reflection.length >= 100;
  const isFormValid = mood !== null && isReflectionValid;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;
    setIsOpen(false);
    setMood(null);
    setSelectedClass('');
    setReflection('');
  };

  return (
    <>
      <Button className="w-full mt-5" variant="default" onClick={() => setIsOpen(true)}>
        {t.writeCheckIn}
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-background rounded-2xl border border-hairline w-full max-w-md shadow-lg relative flex flex-col">
            <div className="p-5">
              <button
                onClick={() => setIsOpen(false)}
                className="absolute top-4 right-4 text-ink-muted hover:text-ink transition-colors"
                aria-label={t.close}
              >
                <X className="h-4 w-4" />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-xl border border-hairline flex items-center justify-center shrink-0">
                  <CalendarBlank className="h-5 w-5 text-ink" />
                </div>
                <h2 className="text-xl font-bold text-ink">{t.title}</h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Date */}
                <div className="space-y-1.5">
                  <Label className="text-sm font-semibold text-ink">{t.date}</Label>
                  <Input value={today} disabled className="bg-muted/30 h-9 text-sm" />
                </div>

                {/* Mood */}
                <div className="space-y-1.5">
                  <Label className="text-sm font-semibold text-ink">
                    {t.moodLabel} <span className="text-destructive">*</span>
                  </Label>
                  <div className="flex items-center gap-6">
                    <button
                      type="button"
                      onClick={() => setMood('bad')}
                      className={`flex flex-col items-center gap-1 transition-opacity ${mood === 'bad' ? 'opacity-100' : 'opacity-40 hover:opacity-70'}`}
                    >
                      <SmileySad
                        className="h-8 w-8 text-ink"
                        weight={mood === 'bad' ? 'fill' : 'regular'}
                      />
                      <span className="text-xs font-medium text-ink">{t.moodBad}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setMood('neutral')}
                      className={`flex flex-col items-center gap-1 transition-opacity ${mood === 'neutral' ? 'opacity-100' : 'opacity-40 hover:opacity-70'}`}
                    >
                      <SmileyMeh
                        className="h-8 w-8 text-ink"
                        weight={mood === 'neutral' ? 'fill' : 'regular'}
                      />
                      <span className="text-xs font-medium text-ink">{t.moodNeutral}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setMood('good')}
                      className={`flex flex-col items-center gap-1 transition-opacity ${mood === 'good' ? 'opacity-100' : 'opacity-40 hover:opacity-70'}`}
                    >
                      <Smiley
                        className="h-8 w-8 text-ink"
                        weight={mood === 'good' ? 'fill' : 'regular'}
                      />
                      <span className="text-xs font-medium text-ink">{t.moodGood}</span>
                    </button>
                  </div>
                </div>

                {/* Study focus */}
                <div className="space-y-1.5">
                  <Label className="text-sm font-semibold text-ink">{t.directionLabel}</Label>
                  <div className="rounded-lg border border-hairline p-3 space-y-2">
                    <Label className="text-xs font-medium text-ink">{t.selectClassLabel}</Label>
                    <select
                      value={selectedClass}
                      onChange={(e) => setSelectedClass(e.target.value)}
                      className="w-full rounded-md border border-hairline bg-transparent px-2.5 py-1.5 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-action"
                    >
                      <option value="" disabled>
                        {t.selectClassPlaceholder}
                      </option>
                      {activeClasses.map((cls) => (
                        <option key={cls.id} value={cls.id}>
                          {cls.title}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Reflection */}
                <div className="space-y-1.5">
                  <Label className="text-sm font-semibold text-ink">
                    {t.reflectionLabel} <span className="text-destructive">*</span>
                  </Label>
                  <textarea
                    value={reflection}
                    onChange={(e) => setReflection(e.target.value)}
                    placeholder={t.reflectionPlaceholder}
                    className="w-full rounded-md border border-hairline bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-ink-muted focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-action min-h-[80px] resize-none"
                  />
                  <p
                    className={`text-[10px] ${isReflectionValid ? 'text-ink-muted' : 'text-destructive'}`}
                  >
                    {t.reflectionMinChars.replace('{count}', String(reflection.length))}
                  </p>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-hairline">
                  <Button
                    size="sm"
                    type="button"
                    variant="outline"
                    onClick={() => setIsOpen(false)}
                  >
                    {t.cancel}
                  </Button>
                  <Button size="sm" type="submit" variant="default" disabled={!isFormValid}>
                    {t.send}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
