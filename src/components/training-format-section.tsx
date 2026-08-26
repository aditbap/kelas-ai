'use client';

import {
  Buildings,
  MonitorPlay,
  ArrowsClockwise,
  SlidersHorizontal,
  MapPin,
} from '@phosphor-icons/react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Reveal } from '@/components/reveal';
import type { Dictionary } from '@/lib/i18n/dictionaries';

const mediaByFormatId = {
  onsite: {
    icon: Buildings,
    mediaType: 'video' as const,
    mediaSrc:
      'https://cdn-web-2.ruangguru.com/landing-page-web/public/staticpages/www.ruangguru.com/rea/pelatihan-ai-perusahaan/assets/hero-bg-BXatHlj2.webm',
    badgeIcon: MapPin,
  },
  online: {
    icon: MonitorPlay,
    mediaType: 'image' as const,
    mediaSrc: 'https://picsum.photos/seed/kelas-ai-online/1200/800?grayscale',
    badgeIcon: MonitorPlay,
  },
  hybrid: {
    icon: ArrowsClockwise,
    mediaType: 'image' as const,
    mediaSrc: 'https://picsum.photos/seed/kelas-ai-hybrid/1200/800?grayscale',
    badgeIcon: ArrowsClockwise,
  },
};

export function TrainingFormatSection({ t }: { t: Dictionary['home']['trainingFormat'] }) {
  const formats = (['onsite', 'online', 'hybrid'] as const).map((id) => ({
    id,
    ...t.formats[id],
    ...mediaByFormatId[id],
    recommended: id === 'onsite',
  }));

  const [selectedFormatId, setSelectedFormatId] = useState<(typeof formats)[number]['id']>(
    formats[0].id,
  );

  const selectedFormat = formats.find((f) => f.id === selectedFormatId) || formats[0];

  return (
    <div className="mx-auto w-full max-w-6xl py-12 md:py-20 px-6">
      <Reveal className="text-center mb-12">
        <h2 className="text-display-md text-ink md:text-display-lg">{t.heading}</h2>
      </Reveal>

      <div className="grid gap-6 md:grid-cols-2 lg:gap-12 items-stretch min-h-[400px]">
        {/* Left Column: Selection Cards */}
        <div className="flex flex-col gap-4 justify-center">
          {formats.map((format, index) => {
            const isSelected = selectedFormatId === format.id;
            return (
              <Reveal key={format.id} delay={index * 0.1}>
                <button
                  type="button"
                  onClick={() => setSelectedFormatId(format.id)}
                  className={cn(
                    'relative w-full text-left rounded-xl border p-5 transition-all duration-200 overflow-hidden outline-none focus-visible:ring-2 focus-visible:ring-action focus-visible:ring-offset-2',
                    isSelected
                      ? 'border-action bg-action/5 shadow-[0_0_15px_rgba(var(--color-action),0.15)]'
                      : 'border-hairline bg-elevated hover:bg-parchment',
                  )}
                >
                  {format.recommended && (
                    <div className="absolute top-0 inset-x-0 h-6 bg-action flex items-center justify-center">
                      <span className="text-[10px] font-bold tracking-widest text-white uppercase">
                        {t.recommended}
                      </span>
                    </div>
                  )}

                  <div className={cn('flex items-start gap-4', format.recommended && 'mt-4')}>
                    <div
                      className={cn(
                        'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-colors',
                        isSelected
                          ? 'bg-action text-white'
                          : 'bg-parchment border border-hairline text-ink-muted',
                      )}
                    >
                      <format.icon size={20} weight={isSelected ? 'fill' : 'regular'} />
                    </div>
                    <div>
                      <h3
                        className={cn(
                          'text-base font-semibold',
                          isSelected ? 'text-ink' : 'text-ink',
                        )}
                      >
                        {format.title}
                      </h3>
                      <p className="mt-1 text-sm leading-relaxed text-ink-muted">
                        {format.description}
                      </p>
                    </div>
                  </div>
                </button>
              </Reveal>
            );
          })}
        </div>

        {/* Right Column: Media Display */}
        <Reveal className="h-[300px] sm:h-[400px] md:h-auto rounded-xl border border-hairline bg-elevated overflow-hidden relative shadow-product">
          {/* Floating Badge */}
          <div className="absolute top-4 left-4 z-10 flex items-center gap-1.5 rounded-full bg-action px-3 py-1.5 text-xs font-semibold text-white shadow-sm backdrop-blur-md">
            <selectedFormat.badgeIcon size={14} weight="bold" />
            {selectedFormat.badge}
          </div>

          <div
            className="absolute inset-0 w-full h-full animate-in fade-in duration-500"
            key={selectedFormat.id}
          >
            {selectedFormat.mediaType === 'video' ? (
              <video
                src={selectedFormat.mediaSrc}
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover"
              />
            ) : (
              <img
                src={selectedFormat.mediaSrc}
                alt={selectedFormat.title}
                className="w-full h-full object-cover"
              />
            )}
          </div>
        </Reveal>
      </div>

      <Reveal className="mt-12 flex justify-center">
        <Button variant="outline" className="rounded-full px-6">
          <SlidersHorizontal size={16} className="mr-2" />
          {t.compareCta}
        </Button>
      </Reveal>
    </div>
  );
}
