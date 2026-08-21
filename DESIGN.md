# DESIGN.md — Corporate AI Training Platform

**Companion to:** [`PRD.md`](./PRD.md) and [`BUILD_PLAN.md`](./BUILD_PLAN.md)
**Status:** Derived from the shipped implementation (marketing site + all four dashboard shells). Update this file again whenever a new UI pattern ships that isn't captured here yet.

---

## 1. Design Principles

- **Trustworthy, not flashy.** Buyers are HR/L&D decision-makers evaluating a B2B tool — clean and credible beats loud and trendy.
- **Clarity over decoration.** Content (curriculum, progress, pricing) should be scannable at a glance.
- **One system, two surfaces.** The public marketing site and the authenticated platform share the same tokens/components but use different layouts: marketing is a vertical section flow, the platform is a sidebar + content shell.

---

## 2. Foundation: shadcn tokens ([`src/app/globals.css`](src/app/globals.css))

Colors are defined as CSS variables (oklch) and consumed via Tailwind utility classes (`bg-primary`, `text-muted-foreground`, `border-border`, etc.) — never hardcode hex values in components.

| Token                            | Light value                                | Usage                                                                |
| -------------------------------- | ------------------------------------------ | -------------------------------------------------------------------- |
| `--background` / `--foreground`  | white / near-black                         | Page background & default text                                       |
| `--primary`                      | `oklch(0.546 0.245 262.881)` (≈ `#2563EB`) | CTAs, links, active states, positive badges                          |
| `--primary-foreground`           | near-white                                 | Text on primary-colored surfaces                                     |
| `--muted` / `--muted-foreground` | light gray / mid gray                      | Secondary backgrounds, secondary text                                |
| `--border`                       | light gray                                 | Card borders, dividers, table rules                                  |
| `--destructive`                  | red                                        | Errors, "at risk" states                                             |
| `--radius`                       | `0.625rem`                                 | Base radius; `rounded-lg`/`rounded-xl`/`rounded-full` derive from it |

Dark mode variables exist in `globals.css` but are unstyled beyond the shadcn defaults — not a deliberate part of this product's design yet.

**Font:** Geist Sans (`--font-geist-sans`, applied via `font-sans`), Geist Mono for code/monospace contexts.

---

## 3. Typography scale (as used)

| Role                   | Classes                                                                     |
| ---------------------- | --------------------------------------------------------------------------- |
| Marketing H1           | `text-4xl sm:text-5xl font-bold tracking-tight`                             |
| Marketing H2 (section) | `text-2xl sm:text-3xl font-bold tracking-tight`                             |
| Dashboard page title   | `text-2xl font-semibold tracking-tight`                                     |
| Card/subsection title  | `text-lg font-semibold` or `text-base font-semibold`                        |
| Body                   | `text-sm` (dashboards) / `text-lg text-muted-foreground` (marketing intros) |
| Meta/caption           | `text-xs text-muted-foreground`                                             |

---

## 4. Layout

**Marketing site** ([`src/app/(marketing)/`](<src/app/(marketing)/>)):

- Shared shell: sticky `MarketingNav` (h-16, blurred background) + page content + `MarketingFooter` — see [`marketing-nav.tsx`](src/components/marketing-nav.tsx) / [`marketing-footer.tsx`](src/components/marketing-footer.tsx).
- Container: `mx-auto max-w-6xl px-6` (narrower `max-w-3xl`/`max-w-2xl` for text-heavy centered sections like FAQ or a single hero).
- Vertical section flow, sections separated by `border-t border-border`, alternating `bg-muted/40` backgrounds.
- Section padding: `py-20`–`py-24`.

**Authenticated platform** ([`src/components/app-shell.tsx`](src/components/app-shell.tsx)):

- Left sidebar (`md:w-64`, `bg-sidebar`) with role label, nav links, user info, sign-out — collapses to a horizontal scroll bar on mobile.
- Main content: `flex-1 p-6 md:p-10`, typically wrapped in a `max-w-4xl` or `max-w-5xl` column.
- Nav items not yet built are shown but disabled with a "Soon" pill, rather than hidden — see `NavItem.enabled` in `app-shell.tsx`.

---

## 5. Components (implemented patterns)

- **Button** ([`src/components/ui/button.tsx`](src/components/ui/button.tsx)): variants `default | outline | secondary | ghost | destructive | link`, sizes `xs–lg` + icon sizes. Polymorphic via Base UI's `render` prop (e.g. `<Button render={<Link href="/pricing">…} />` for a link styled as a button).
- **Card-like container:** `rounded-xl border border-border bg-background p-6` for content cards (pricing, benefits, programs); `rounded-lg border border-border p-4`/`p-5` for tighter dashboard panels and forms.
- **Status/badge pill:** `rounded-full px-2 py-0.5 text-xs font-medium` — `bg-primary/10 text-primary` for positive/active, `bg-destructive/10 text-destructive` for at-risk/error, `border border-border text-muted-foreground` for neutral (e.g. "Invited").
- **Data table:** `w-full text-sm`, header row `border-b border-border bg-muted/40 text-muted-foreground`, body rows `border-b border-border last:border-0`, cells `px-4 py-2` — used identically across the roster, team-progress, and tenant-list tables.
- **List panel:** `divide-y divide-border rounded-lg border border-border` wrapping `px-4 py-3` items — used for grading queues and assigned-module lists.
- **Forms:** shadcn `Label` + `Input`, fields spaced `space-y-1.5` within a field and `space-y-3`/`space-y-4` between fields; inline error in `text-destructive`, success/confirmation in `text-primary`, both `text-xs`/`text-sm`.

---

## 6. Tone & Copy

- Direct, benefit-led headlines (e.g., "Turn AI from a buzzword into a daily productivity tool for your employees").
- Marketing copy never fabricates stats or testimonials before they're real — the Testimonials page says so explicitly rather than inventing quotes.
- Authenticated-app copy is plain and task-focused (no marketing language inside dashboards).

---

## 7. Known gaps

- No dark mode styling beyond shadcn's defaults — full dark theme is unstyled.
- No dedicated empty/loading/error states beyond simple inline text (e.g. "No employees yet…") — revisit once real usage surfaces a need for richer states.
