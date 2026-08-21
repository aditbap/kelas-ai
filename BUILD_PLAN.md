# Build Plan: Corporate AI Training Platform

**Companion to:** [`PRD.md`](./PRD.md) — read that first for the *what/why*; this document is the *build order*.

**How to use this:** Each phase has a goal, concrete tasks, and exit criteria. Phases are ordered by dependency, not by user-facing priority — foundational plumbing (schema, auth, tenant scoping) comes before any feature vertical, because every later phase depends on it being correct. Within a phase, tasks are listed roughly in build order. Do not start a phase until the previous phase's exit criteria are met.

---

## Phase 0 — Project Scaffolding

**Goal:** A running, empty Next.js app with the full toolchain wired up, deployed to a staging environment from day one.

- [ ] Initialize Next.js (TypeScript, App Router) project.
- [ ] Set up Tailwind CSS (or chosen styling approach) and a base UI component set.
- [ ] Set up PostgreSQL (local dev via Docker; staging via Neon/Supabase per PRD §8.1).
- [ ] Install and configure Prisma; connect to the dev database.
- [ ] Set up environment variable management (`.env.local`, `.env.example`) for DB URL, auth secrets, Stripe keys, email provider key, S3 credentials.
- [ ] Set up linting/formatting (ESLint, Prettier) and a pre-commit hook.
- [ ] Create a minimal CI pipeline (typecheck + lint + build on push).
- [ ] Deploy the empty app to Vercel staging to confirm the pipeline end-to-end.

**Exit criteria:** `main` branch auto-deploys to a staging URL; `npx prisma studio` connects to a real dev database.

---

## Phase 1 — Data Model & Multi-Tenant Foundation

**Goal:** The full schema from PRD §7 exists as Prisma models, and every query is provably tenant-scoped before any feature is built on top of it.

- [ ] Write the Prisma schema: `Tenant`, `User` (with `role` enum), `InstructorTenantAssignment`, `Cohort`, `Module`, `Lesson`, `Assignment`, `Submission`, `Grade`, `ProgressRecord`, `ResourceItem`, `Subscription`, `Payment`.
- [ ] Run the first migration; seed a dev database with 1–2 fake tenants, users of each role, and sample content for local testing.
- [ ] Build the **central authorization layer** (PRD §8.3): a single module/helper that every data-access function routes through, resolving `{ userId, role, tenantId }` from the session and rejecting/scoping queries accordingly. This is the most important file in the codebase — every later phase depends on it being correct and *not bypassed*.
- [ ] Write automated tests specifically proving tenant isolation: a user from Tenant A can never read/write Tenant B's data, for every entity type.

**Exit criteria:** Tenant-isolation tests pass; schema reviewed against every workflow in PRD §5 to confirm no missing fields/relations.

---

## Phase 2 — Authentication & Role-Based Routing

**Goal:** Users can sign up/log in, land on the correct dashboard for their role, and are blocked from routes outside their role.

- [ ] Integrate Auth.js (or Clerk) per PRD §8.1; sessions carry `userId`, `role`, `tenantId`.
- [ ] Build login, password-set (from invite), and logout flows.
- [ ] Build route/middleware guards per role: `/employee/*`, `/admin/*` (Company Admin), `/instructor/*`, `/super-admin/*`.
- [ ] Build the four empty dashboard shells (one per role) with role-appropriate nav, using placeholder content.

**Exit criteria:** All four roles can log in and see their own shell; a logged-in Employee cannot reach `/admin/*` etc.

---

## Phase 3 — Marketing Site (Static Content)

**Goal:** The public, unauthenticated site is live with all informational pages from PRD §4.1.

- [ ] Build Home (hero + value prop + CTAs), How It Works, Programs/Curriculum, Benefits, Testimonials & Client Logos, FAQ as static/server-rendered pages.
- [ ] Build the Pricing page displaying seat-banded tiers (content can be hardcoded/CMS-lite for MVP — no admin UI needed for pricing copy).
- [ ] Build the "Book a Consultation" lead form (submits to email/CRM — simplest viable: send a notification email; no CRM integration required for MVP).

**Exit criteria:** All marketing pages are live on staging, responsive, and reviewed for the positioning language in PRD §1.1.

---

## Phase 4 — Self-Serve Checkout & Workspace Provisioning

**Goal:** A visitor can pay and land in a fully provisioned workspace, unattended (PRD §5.1).

- [ ] Integrate Stripe Checkout for the seat-banded packages from the Pricing page.
- [ ] Build the Stripe webhook handler (`checkout.session.completed`) that creates: `Tenant`, `Subscription`, and a `User` with role `CompanyAdmin`.
- [ ] Send a welcome email (via Resend/SendGrid) with a workspace setup link (set password, name workspace, upload logo).
- [ ] Build the minimal workspace-setup flow the welcome email links to.
- [ ] Handle Stripe billing lifecycle events (`invoice.paid`, `customer.subscription.updated`) to keep `Subscription` status current.

**Exit criteria:** A full test purchase (Stripe test mode) results in a working Company Admin login within minutes, no manual steps.

---

## Phase 5 — Employee Onboarding

**Goal:** A Company Admin can populate their workspace with employees (PRD §5.2).

- [ ] Build "Invite Employee" (single, by email) in the Company Admin dashboard.
- [ ] Build bulk CSV import (name + email columns; validate and dedupe against existing roster).
- [ ] Invited employees receive an email → set password → land in `/employee` scoped to the correct tenant.
- [ ] Build the roster view/list (name, email, invite status, joined date) for Company Admin.

**Exit criteria:** A Company Admin can invite 1 employee and bulk-import 10 via CSV; both flows result in working employee logins.

---

## Phase 6 — Cohort Management

**Goal:** Onsite training sessions exist as schedulable objects that content and employees attach to (PRD §7, `Cohort`).

- [ ] Build Cohort CRUD (name, onsite date, assigned instructor) — usable by Instructor and Company Admin.
- [ ] Allow Company Admin/Instructor to assign employees to a Cohort (individually or bulk from the roster).
- [ ] Build the "My Cohort" view for employees (onsite date, instructor name).

**Exit criteria:** A cohort can be created, staffed with employees and an instructor, and is visible to all its members.

---

## Phase 7 — Content Authoring (Instructor)

**Goal:** Instructors can build a curriculum and publish it to specific cohorts (PRD §5.3).

- [ ] Build Module CRUD (title, description) in the Instructor dashboard.
- [ ] Build Lesson/Material CRUD within a Module (ordered list; text, video embed URL, file attachment via S3 upload).
- [ ] Build Assignment CRUD within a Module (instructions, submission type, optional due date).
- [ ] Build the "Publish to Cohort(s)" action (creates `ModuleCohortPublication` rows), making a Module visible to its members.

**Exit criteria:** An Instructor can author a 2-lesson Module with 1 Assignment and publish it to a test Cohort; it becomes visible to that cohort's employees (verified in Phase 8).

---

## Phase 8 — Learning Experience (Employee)

**Goal:** Employees can consume published content and track their own progress (PRD §5.4 steps 1).

- [ ] Build the Employee "Learning Modules" list (only modules published to their cohort).
- [ ] Build Module detail → Lesson viewer, marking each lesson complete as viewed/finished.
- [ ] Wire lesson-completion events into `ProgressRecord`.
- [ ] Build the Employee "My Progress" view (per-module completion, overall %).

**Exit criteria:** An employee in the Phase 7 test cohort sees the published Module, completes both lessons, and their progress record updates correctly.

---

## Phase 9 — Assignments & Grading

**Goal:** The submit → grade → feedback loop works end-to-end (PRD §5.4 steps 2–4).

- [ ] Build the Assignment submission UI for employees (file upload to S3 / text entry / link, per `submissionType`).
- [ ] Build the Instructor Grading Queue (pending submissions across their assigned tenants/cohorts).
- [ ] Build the grading action (score/pass-fail + written feedback), writing a `Grade` record and updating the `Submission` status.
- [ ] Surface grade + feedback back on the employee's Assignment view; update `ProgressRecord`.
- [ ] Notify the employee by email when a submission is graded.

**Exit criteria:** A full submit → grade → feedback-visible cycle works for one assignment, including the email notification.

---

## Phase 10 — Progress Dashboards & Reporting

**Goal:** Company Admins and Instructors can see aggregate adoption data, not just per-employee detail (PRD §5.5).

- [ ] Build the Company Admin Team Progress dashboard: roster-wide completion %, submission rates, engagement trend, and a flag for employees with no activity in N days.
- [ ] Build the Instructor's cross-cohort/tenant analytics view (scoped to their `InstructorTenantAssignment`s).
- [ ] Specifically surface **post-training engagement** as a distinct metric (activity after the cohort's onsite date) — this is the platform's core value signal per PRD §5.6 and §10.

**Exit criteria:** Dashboards render correctly against the seeded multi-employee test data from earlier phases, including at least one "post-training" data point.

---

## Phase 11 — AI Resource Library

**Goal:** The always-available tips/templates/guides library exists, browsable by employees and manageable by Instructors (PRD §4.2, §7 `ResourceItem`).

- [ ] Build ResourceItem CRUD for Instructors (type: tip/template/guide; title, content, tags; global vs. tenant-specific).
- [ ] Build the Employee-facing library view: searchable/filterable by type and tag.

**Exit criteria:** An Instructor publishes a global prompt template; it's visible to employees across multiple tenants.

---

## Phase 12 — Post-Training Habit Loop

**Goal:** The platform proactively re-engages employees after the onsite date, not just on-demand (PRD §5.6).

- [ ] Build a scheduled job (cron) that identifies cohorts whose onsite date has passed and employees with low recent activity.
- [ ] Send periodic nudge emails (new resource highlight, unfinished module/assignment reminder) — define and implement a concrete cadence (e.g., weekly), resolving the open question in PRD §12.6.
- [ ] Add corresponding in-app nudges (e.g., a banner/card on the Employee dashboard).

**Exit criteria:** Running the job against seeded "past onsite date" test data produces the expected emails and in-app nudges, without duplicate sends.

---

## Phase 13 — Super Admin Tools

**Goal:** Platform ops can manage the whole system without touching the database directly (PRD §4.2, §6.5).

- [ ] Build Tenant management (list all tenants, view status, suspend/reactivate).
- [ ] Build cross-tenant billing oversight (subscriptions, revenue view).
- [ ] Build Instructor-to-Tenant assignment management.
- [ ] Build the Global Content Library view (all `isGlobalTemplate` Modules and global `ResourceItem`s).
- [ ] Audit-log all Super Admin cross-tenant data access per PRD §9.

**Exit criteria:** A Super Admin can suspend a tenant (blocking its users from logging in) and reassign an instructor, with both actions audit-logged.

---

## Phase 14 — Billing Self-Service (Company Admin)

**Goal:** Company Admins can manage their own subscription without contacting sales (PRD §6.3).

- [ ] Build the Billing page: current plan, seats used/available, upcoming renewal date.
- [ ] Build "upgrade seats" flow via Stripe Billing (prorated seat increase).
- [ ] Build invoice history/download.

**Exit criteria:** A test tenant can increase its seat count through the UI and the change reflects correctly in Stripe and the `Subscription` record.

---

## Phase 15 — Non-Functional Hardening

**Goal:** The platform meets the baseline bar from PRD §9 before launch.

- [ ] Accessibility pass (WCAG 2.1 AA) across marketing site and authenticated platform.
- [ ] Responsive/mobile QA on all authenticated dashboards, not just marketing pages.
- [ ] Full security review of the authorization layer (Phase 1): confirm no route/action skips tenant/role checks; confirm file uploads are validated and access-controlled (an employee's submission file shouldn't be fetchable by another tenant).
- [ ] Performance pass on dashboard queries at realistic seed scale (PRD §9 performance target).
- [ ] Confirm audit logging covers grading actions, tenant provisioning, and Super Admin cross-tenant access.

**Exit criteria:** No unscoped/unguarded data-access path found in review; Lighthouse/axe accessibility checks pass on key pages.

---

## Phase 16 — Testing

**Goal:** Confidence to ship and to keep shipping without regressions.

- [ ] Unit tests for the authorization layer and progress-calculation logic (highest risk of silent bugs).
- [ ] Integration tests for the core workflows in PRD §5 (purchase→provisioning, invite→onboarding, author→publish→learn, submit→grade).
- [ ] End-to-end test covering the full happy path: checkout → provision → invite employee → publish module → complete lesson → submit assignment → grade → see feedback → see it reflected in the Company Admin dashboard.

**Exit criteria:** The E2E happy-path test passes reliably in CI.

---

## Phase 17 — Deployment & Launch Readiness

**Goal:** Production environment is live, monitored, and safe to point real customers at.

- [ ] Provision production Postgres, S3 bucket, and configure production env vars/secrets in Vercel.
- [ ] Configure production Stripe webhook endpoint and email domain (SPF/DKIM) for deliverability.
- [ ] Set up error monitoring (e.g., Sentry) and uptime/log monitoring.
- [ ] Point the production domain at the deployment; verify SSL.
- [ ] Run the Phase 16 E2E happy-path test against production (with a real test purchase in Stripe live mode, then refund/void it).

**Exit criteria:** A real, disposable end-to-end purchase-to-grading cycle succeeds in production.

---

## Phase 18 — Launch Checklist

- [ ] PRD §12 assumptions log reviewed and resolved (pricing model, cohort semantics, localization, data-isolation requirements, nudge cadence) — no open business assumptions left unconfirmed.
- [ ] First real customer/tenant onboarded, with a founder/ops person shadowing the flow live.
- [ ] KPI tracking in place for the metrics in PRD §10 (checkout conversion, module/assignment completion, post-training active usage).

---

## Suggested Team Sequencing (if parallelizing)

Phases 0–2 are strictly sequential and blocking for everything else. After that, work can split into two roughly parallel tracks that converge before Phase 15:

- **Track A (buyer-side):** Phase 3 → 4 → 5 → 6 → 14
- **Track B (learning core):** Phase 7 → 8 → 9 → 10 → 11 → 12

Phase 13 (Super Admin) can start any time after Phase 1–2 and run in parallel with both tracks, since it mostly reads/manages data the other tracks produce.
