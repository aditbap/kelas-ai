# DESIGN.md — Corporate AI Training Platform

**Companion to:** [`PRD.md`](./PRD.md) and [`BUILD_PLAN.md`](./BUILD_PLAN.md)
**Reference:** Visual direction adapted from [ruangguru.com/rea](https://www.ruangguru.com/rea) (clean, professional, tech-forward B2B/edtech style).

This is the design system to follow when building any UI for this project (marketing site and platform dashboards). No UI has been built yet — treat this as the starting spec, and update it once real screens exist.

---

## 1. Design Principles

- **Trustworthy, not flashy.** Buyers are HR/L&D decision-makers evaluating a B2B tool — clean and credible beats loud and trendy.
- **Clarity over decoration.** Content (curriculum, progress, pricing) should be scannable at a glance.
- **Consistent across both sides of the product** — the public marketing site and the authenticated learning platform should feel like the same product, not two different apps.

---

## 2. Color Palette

| Token | Value | Usage |
|---|---|---|
| `--color-bg` | `#FFFFFF` | Page background |
| `--color-bg-muted` | `#F7F8FA` | Section alternation, cards |
| `--color-primary` | `#2563EB` | CTAs, links, active states |
| `--color-primary-hover` | `#1D4ED8` | Hover/pressed state |
| `--color-text` | `#0F172A` | Headlines, body text |
| `--color-text-muted` | `#64748B` | Secondary text, captions |
| `--color-border` | `#E2E8F0` | Dividers, card borders |
| `--color-success` | `#16A34A` | Progress, completion states |
| `--color-warning` | `#D97706` | Alerts, discount badges |
| `--color-danger` | `#DC2626` | Errors, destructive actions |

Keep accent color usage to CTAs, links, and active/selected states — everything else stays neutral (white/gray/dark text).

## 3. Typography

- **Font:** Inter (or system sans-serif fallback: `-apple-system, Segoe UI, sans-serif`).
- **Scale:**
  - H1 (hero): 40–48px, bold, tight line-height
  - H2 (section): 28–32px, bold
  - H3 (card/subsection): 18–20px, semibold
  - Body: 16px, regular, 1.5 line-height
  - Caption/meta: 13–14px, regular, `--color-text-muted`
- Pricing and key numbers get extra weight (bold/semibold) and slightly larger size to stand out, per the reference site's pricing-card treatment.

## 4. Layout

- Single-column, vertical section flow for marketing pages (hero → value prop → programs/pricing → testimonials → CTA).
- Sticky top navigation bar for the marketing site.
- Max content width: `1200px`, centered, with `24px` horizontal padding on mobile.
- Section vertical spacing: `80–120px` desktop, `48–64px` mobile.
- Dashboards (authenticated app) use a left sidebar + content area layout, not the marketing site's vertical flow.

## 5. Components

- **Buttons:** solid `--color-primary` for primary CTA, outline/ghost for secondary. Rounded corners (`8px`). Clear hover state.
- **Cards:** white background, `1px solid --color-border`, `12px` radius, subtle shadow on hover for clickable cards. Used for pricing tiers, program cards, resource items.
- **Pricing cards:** highlight the recommended tier, show discount/seat-band badges using `--color-warning`.
- **Badges:** small pill shape, used for status (invite pending, completed, in progress) and discount labels.
- **Testimonial/logo carousel:** used for social proof (client logos, alumni/employee quotes) on the marketing site.
- **Progress indicators:** for employee dashboards — simple bar or ring, `--color-success` when complete.
- **Forms:** labeled inputs, `--color-border` default, `--color-primary` on focus, inline validation in `--color-danger`.

## 6. Tone & Copy

- Direct, benefit-led headlines (e.g., "Turn AI from a buzzword into a daily productivity tool for your employees").
- Use concrete numbers/stats for credibility (seats, completion rates, companies onboarded) once real data exists — do not fabricate stats.
- Keep authenticated-app copy plain and task-focused (no marketing language inside dashboards).

---

## 7. Status

This document is a **pre-build spec**, not derived from a shipped UI yet. Once Phase 3 (Marketing Site) and Phase 2 (dashboard shells) in `BUILD_PLAN.md` produce real screens, regenerate/update this file from the actual implementation so it reflects what's shipped, not just intent.
