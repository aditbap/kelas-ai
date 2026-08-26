import {
  Check,
  ChartBar,
  Code,
  Headset,
  Lightning,
  Megaphone,
  Plus,
  UsersThree,
} from '@phosphor-icons/react/dist/ssr';
import Image from 'next/image';
import Link from 'next/link';

import { Reveal } from '@/components/reveal';
import { Tile } from '@/components/tile';
import { TrainingFormatSection } from '@/components/training-format-section';
import { Button } from '@/components/ui/button';
import { getTranslations } from '@/lib/i18n/get-locale';
import { ALL_ACCESS_PRICE_IDR } from '@/lib/pricing';

/*
  Tools the training actually covers. These are real first-party logos rather
  than a fabricated "trusted by" client wall: the business is onboarding its
  first cohorts, so inventing client logos would be false social proof.

  Every slug below is verified against Simple Icons. OpenAI and Microsoft were
  withdrawn from that set over trademark policy, so ChatGPT and Copilot cannot
  be shown here without self-hosting their marks.
*/
const tools = [
  { slug: 'claude', name: 'Claude' },
  { slug: 'googlegemini', name: 'Gemini' },
  { slug: 'githubcopilot', name: 'GitHub Copilot' },
  { slug: 'perplexity', name: 'Perplexity' },
  { slug: 'notion', name: 'Notion' },
  { slug: 'googledocs', name: 'Google Docs' },
];

// Icons for the program tracks, matched by index to `t.home.programs.items`.
const programIcons = [Lightning, ChartBar, Megaphone, Headset, UsersThree, Code];

const currencyFormatter = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0,
});

function PricingSection({ t }: { t: Awaited<ReturnType<typeof getTranslations>>['t'] }) {
  return (
    <Reveal className="mx-auto max-w-md rounded-lg border border-hairline bg-elevated p-10 text-center">
      <h3 className="text-tagline text-ink">{t.home.pricing.packageName}</h3>
      <p className="mt-2 text-caption text-ink-muted">{t.home.pricing.packageTagline}</p>
      <p className="mt-6 text-display-md text-ink">
        {currencyFormatter.format(ALL_ACCESS_PRICE_IDR)}
      </p>
      <p className="mt-1 text-fine text-ink-muted">{t.home.pricing.priceNote}</p>

      <ul className="mt-8 space-y-3 text-left text-caption text-ink-muted">
        {t.home.pricing.features.map((feature) => (
          <li key={feature} className="flex items-start gap-2.5">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-action" weight="bold" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <div className="mt-8">
        <Button
          className="w-full justify-center"
          render={<Link href="/signup">{t.home.pricing.cta}</Link>}
        />
      </div>
    </Reveal>
  );
}

export default async function Home() {
  const { t } = await getTranslations();

  return (
    <>
      {/* Hero: centered stack, the signature tile composition. */}
      <Tile surface="canvas" className="pt-16 pb-0 md:pt-24">
        <Reveal className="mx-auto max-w-3xl text-center">
          <h1 className="text-[40px] leading-[1.07] font-semibold tracking-[-0.5px] text-ink md:text-hero">
            {t.home.hero.title}
          </h1>
          <p className="mx-auto mt-5 max-w-[46ch] text-lead-airy text-ink-muted">
            {t.home.hero.subtitle}
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button render={<Link href="#pricing">{t.home.hero.ctaPricing}</Link>} />
            <Button
              variant="outline"
              render={<Link href="/consultation">{t.home.hero.ctaConsultation}</Link>}
            />
          </div>
        </Reveal>

        <Reveal delay={0.15} className="mt-14">
          <video
            src="https://cdn-web-2.ruangguru.com/landing-page-web/public/staticpages/www.ruangguru.com/rea/pelatihan-ai-perusahaan/assets/hero-bg-BXatHlj2.webm"
            autoPlay
            loop
            muted
            playsInline
            className="w-full rounded-lg shadow-product"
          />
        </Reveal>
      </Tile>

      {/* Tool strip: logos only, no category labels underneath. */}
      <Tile surface="parchment">
        <h2 className="text-center text-caption font-semibold text-ink-muted">
          {t.home.tools.heading}
        </h2>
        <ul className="mt-8 grid grid-cols-3 items-center justify-items-center gap-x-6 gap-y-10 md:grid-cols-6">
          {tools.map((tool) => (
            <li key={tool.slug}>
              <Image
                src={`https://cdn.simpleicons.org/${tool.slug}/6e6e73`}
                alt={tool.name}
                width={32}
                height={32}
                className="h-7 w-auto opacity-80"
                unoptimized
              />
            </li>
          ))}
        </ul>
      </Tile>

      {/* Programs: the curriculum tracks a cohort's instructor draws from. */}
      <Tile surface="canvas" id="programs">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="text-display-md text-ink md:text-display-lg">{t.home.programs.heading}</h2>
          <p className="mx-auto mt-4 max-w-[46ch] text-body text-ink-muted">
            {t.home.programs.description}
          </p>
        </Reveal>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {t.home.programs.items.map((program, index) => {
            const Icon = programIcons[index];
            return (
              <Reveal key={program.title} delay={index * 0.06}>
                <article className="h-full rounded-lg border border-hairline bg-elevated p-6">
                  <Icon size={24} weight="bold" className="text-action" />
                  <h3 className="mt-4 text-tagline text-ink">{program.title}</h3>
                  <p className="mt-2 text-caption text-ink-muted">{program.description}</p>
                </article>
              </Reveal>
            );
          })}
        </div>

        <Reveal delay={0.1} className="mt-10 text-center">
          <Button
            variant="outline"
            render={<Link href="#how-it-works">{t.home.programs.cta}</Link>}
          />
        </Reveal>
      </Tile>

      {/* How it works: the four-step process, one anchor per nav item. */}
      <Tile surface="parchment" id="how-it-works">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="text-display-md text-ink md:text-display-lg">
            {t.home.howItWorks.heading}
          </h2>
          <p className="mx-auto mt-4 max-w-[48ch] text-body text-ink-muted">
            {t.home.howItWorks.description}
          </p>
        </Reveal>

        <ol className="mt-12 grid gap-px overflow-hidden rounded-lg bg-hairline md:grid-cols-2">
          {t.home.howItWorks.steps.map((step, index) => (
            <li key={step.title} className="bg-parchment">
              <Reveal delay={index * 0.06} className="h-full bg-elevated p-8">
                <h3 className="text-tagline text-ink">{step.title}</h3>
                <p className="mt-3 text-caption text-ink-muted">{step.description}</p>
              </Reveal>
            </li>
          ))}
        </ol>
      </Tile>

      <TrainingFormatSection t={t.home.trainingFormat} />

      {/* Media band: the habit loop, the part most training programs skip. */}
      <Tile surface="dark-2" innerClassName="max-w-4xl">
        <Reveal className="text-center">
          <h2 className="text-display-md text-on-dark md:text-display-lg">
            {t.home.habit.heading}
          </h2>
          <p className="mx-auto mt-5 max-w-[52ch] text-body text-on-dark-muted">
            {t.home.habit.description}
          </p>
        </Reveal>
      </Tile>

      {/* Pricing: one All-Access package. */}
      <Tile surface="canvas" id="pricing">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="text-display-md text-ink md:text-display-lg">{t.home.pricing.heading}</h2>
          <p className="mx-auto mt-4 max-w-[52ch] text-body text-ink-muted">
            {t.home.pricing.description}
          </p>
        </Reveal>

        <div className="mt-12">
          <PricingSection t={t} />
        </div>
      </Tile>

      {/* FAQ: native disclosure, keyboard accessible with no JS. */}
      <Tile surface="parchment" innerClassName="max-w-3xl" id="faq">
        <Reveal className="text-center">
          <h2 className="text-display-md text-ink md:text-display-lg">{t.home.faq.heading}</h2>
        </Reveal>

        <div className="mt-10 divide-y divide-hairline overflow-hidden rounded-lg border border-hairline bg-elevated">
          {t.home.faq.items.map((faq) => (
            <details key={faq.question} className="group">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 p-6 text-body-strong font-semibold text-ink [&::-webkit-details-marker]:hidden">
                <span className="min-w-0">{faq.question}</span>
                <Plus
                  size={18}
                  weight="bold"
                  className="shrink-0 text-ink-muted transition-transform duration-200 group-open:rotate-45"
                />
              </summary>
              <p className="px-6 pb-6 text-caption text-ink-muted">{faq.answer}</p>
            </details>
          ))}
        </div>
      </Tile>

      {/* Close. Honest about the stage the business is at. */}
      <Tile surface="canvas" innerClassName="max-w-2xl">
        <Reveal className="text-center">
          <h2 className="text-display-md text-ink md:text-display-lg">{t.home.close.heading}</h2>
          <p className="mt-5 text-body text-ink-muted">{t.home.close.description}</p>
          <div className="mt-8">
            <Button render={<Link href="/consultation">{t.common.bookConsultation}</Link>} />
          </div>
        </Reveal>
      </Tile>
    </>
  );
}
