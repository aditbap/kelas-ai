# Build Plan: Corporate AI Training Platform

**Companion to:** [`PRD.md`](./PRD.md) — read that first for the _what/why_; this document is the _build order_.

**How to use this:** Each phase has a goal, concrete tasks, and exit criteria. Phases are ordered by dependency, not by user-facing priority — foundational plumbing (schema, auth, tenant scoping) comes before any feature vertical, because every later phase depends on it being correct. Within a phase, tasks are listed roughly in build order. Do not start a phase until the previous phase's exit criteria are met.

**Checklist status:** first audited against commit `5eba267`, then updated after a fix pass across Phases 0–13 (bug fixes to what existed, plus finishing the genuinely-unbuilt pieces of Phases 12–13), then updated again after a second pass covering: swapping the payment provider from Stripe to Xendit (Phase 4), building Phase 14 (Billing Self-Service), and hardening Phase 15/16 (audit logging, a security review, and real unit test coverage). Boxes with a **⚠️** note are built but have a known, still-open issue — treat those as "done, needs a fix," not "not started." Boxes with a **✅ Fixed** note were ⚠️-flagged in a previous audit and have since been corrected.

**Cross-cutting fixes from the first pass, not tied to one checklist line:** `getAppSession` (src/lib/session.ts) is now wrapped in React's `cache()` so a layout + page no longer each independently re-run the session/tenant-assignment query; `instructor/page.tsx` and `employee/modules/page.tsx` now run their independent queries via `Promise.all` instead of sequentially; the `ActionState` type duplicated across 8 action files is now defined once in `src/lib/actions.ts`.

**Cross-cutting changes from the second pass:** the payment provider is now Xendit, not Stripe, everywhere in the codebase (`src/lib/xendit.ts`, `src/lib/checkout-external-id.ts`, `src/lib/provisioning.ts`, `src/lib/billing.ts`, `src/app/api/checkout`, `src/app/api/xendit/webhook`, `src/app/api/billing/upgrade`) — this affects the Phase 4 and Phase 14 checklists specifically. Every mutating server action now calls `logAudit`. `npm test` is now actually wired into CI (it was defined in `package.json` but never run there before), and a pre-existing CI bug was fixed: a clean checkout's `npx tsc --noEmit` failed on a missing `LayoutProps` global type because `.next/types` didn't exist yet — `npx next typegen` now runs before the typecheck step.

---

## ⚠️ Architecture pivot (third pass): everything below predates a role-model rewrite

At the user's request, the product was pivoted from the 4-role multi-tenant B2B model this document describes (Employee/Company Admin/Instructor/Super Admin, one Tenant per purchasing company) to a **flat 2-role platform: Student and Editor**. This was a deliberate, explicit decision, not scope creep — see the conversation for the three confirming questions asked before any code changed (role reduction → dropping tenants entirely → re-targeting payments at individual Students).

**What changed, concretely:**

- `Role` enum is now just `Student` and `Editor`. `Employee`→`Student`, `Instructor`→`Editor`. `CompanyAdmin` and `SuperAdmin` are gone — there is no company/workspace admin layer and no cross-tenant ops layer.
- `Tenant`, `Subscription`, and `InstructorTenantAssignment` models are deleted. `Cohort`, `Module`, and `Grade` now reference their owning `Editor` directly (`editorId`, `createdByEditorId`, `gradedByEditorId`) instead of going through a tenant.
- `ResourceItem` lost `isGlobal`/`tenantId` — the resource library is flat, visible to every Student.
- **Self-serve sign-up is enabled** (`src/app/(auth)/signup`) — anyone can create a Student account directly; there's no more invite-only onboarding. Editor accounts have no self-serve or invite path at all right now — they only exist via `prisma/seed.ts` or a direct DB insert (see Phase 18 open items below).
- **Payments are re-targeted at enrollment, not workspace purchase:** an Editor sets an optional one-time price on a `Cohort` (`priceAmount`, nullable = free); a Student either joins a free cohort directly or pays once via a Xendit Invoice to enroll (`src/lib/enrollment.ts`, `src/lib/checkout-external-id.ts`'s `enroll:` externalId format). There is no more recurring "Subscription" concept — `/admin/billing` (seat upgrades) is deleted entirely.
- Routes: `/admin/*` and `/super-admin/*` are deleted. `/instructor/*` → `/editor/*`, `/employee/*` → `/student/*`. New: `/editor/cohorts` (create/manage cohorts, including a free "comp seat" add-by-email), `/student/browse` (browse open cohorts, join free or pay-and-join), `/(auth)/signup`.
- The dev database was reset (it only held seed data, no production deployment exists yet — see Phase 17) and re-seeded with 1 Editor and 2 Students.

**Every phase below (0–18) describes the pre-pivot architecture** and has not been individually rewritten line-by-line for the new model — that would effectively mean re-authoring this entire document, which wasn't done in this pass given the scope already covered (schema, auth, every route, checkout/webhook, seed data, and full type/lint/test verification of the actual application code). Read phase text below as historical design record for _why_ things are shaped the way they are (e.g. "ordered by dependency" build sequencing, the workflow narratives), not as an accurate checklist of current state — the architecture-pivot section above and the code itself are the source of truth for what exists today.

**What's still open from this pass:**

- Nothing lets anyone become an Editor except seeding/direct DB access — there's no in-app "become an Editor" or admin-promotion flow. Worth a decision: invite-only via seed for now (small team), or build a lightweight promotion mechanism later.
- Marketing copy (`how-it-works`, `programs`, `faq`, the homepage) still reads with B2B/"your company"/"HR" framing in places — not rewritten for the individual-Student framing. Functionally harmless, but a copy pass would make the site's story match the product.
- The dev database reset required explicit user confirmation and was run by the user directly (`npx prisma migrate reset -f`) — Claude Code's safety classifier blocks an agent from running destructive DB commands even with consent, by design.

---

---

## Phase 0 — Project Scaffolding

**Goal:** A running, empty Next.js app with the full toolchain wired up, deployed to a staging environment from day one.

- [x] Initialize Next.js (TypeScript, App Router) project.
- [x] Set up Tailwind CSS (or chosen styling approach) and a base UI component set.
- [ ] Create the Neon project; create a `dev` branch for local development and a `staging` branch for the staging deploy — **not done**: only a single (`production`-labeled) branch exists, no dev/staging branch split yet.
- [x] Install and configure Prisma with the Neon serverless driver (`@neondatabase/serverless` + `@prisma/adapter-neon`); connect to the `dev` branch.
- [ ] Connect the Neon Vercel integration so each preview deployment/PR automatically gets its own ephemeral Neon branch — **not done**, no Vercel project linked yet.
- [x] Set up environment variable management (`.env.local`, `.env.example`) for DB URL, auth secrets, Xendit keys, email provider key, S3 credentials.
- [x] Set up linting/formatting (ESLint, Prettier) and a pre-commit hook.
- [x] Create a minimal CI pipeline (typecheck + lint + build on push) — `.github/workflows/ci.yml`.
- [ ] Deploy the empty app to Vercel staging to confirm the pipeline end-to-end — **not done**, no `.vercel` link found.

**Exit criteria:** `main` branch auto-deploys to a staging URL; `npx prisma studio` connects to a real dev database.

---

## Phase 1 — Data Model & Multi-Tenant Foundation

**Goal:** The full schema from PRD §7 exists as Prisma models, and every query is provably tenant-scoped before any feature is built on top of it.

- [x] Write the Prisma schema: `Tenant`, `User` (with `role` enum), `InstructorTenantAssignment`, `Cohort`, `Module`, `Lesson`, `Assignment`, `Submission`, `Grade`, `ProgressRecord`, `ResourceItem`, `Subscription`, `Payment`.
- [x] Run the first migration; seed a dev database with 1–2 fake tenants, users of each role, and sample content for local testing.
- [x] Build the **central authorization layer** (PRD §8.3): a single module/helper that every data-access function routes through, resolving `{ userId, role, tenantId }` from the session and rejecting/scoping queries accordingly. This is the most important file in the codebase — every later phase depends on it being correct and _not bypassed_. **⚠️ Known architecture debt (not fixed this pass):** `getTenantScopedClient` is built and unit-tested, but Phases 5–11's server actions still hand-roll their own `tenantId`/instructor-assignment filters instead of routing through it — each one was individually verified correct, but there's no single enforcement point. Migrating them is a bigger, separate refactor (the helper doesn't yet support `Module`/`Lesson`/`Assignment`/`Submission`/`Grade`/`ProgressRecord`, which don't carry `tenantId` directly) — left for a dedicated follow-up rather than rushed into this fix pass.
- [x] Write automated tests specifically proving tenant isolation: a user from Tenant A can never read/write Tenant B's data, for every entity type.

**Exit criteria:** Tenant-isolation tests pass; schema reviewed against every workflow in PRD §5 to confirm no missing fields/relations.

---

## Phase 2 — Authentication & Role-Based Routing

**Goal:** Users can sign up/log in, land on the correct dashboard for their role, and are blocked from routes outside their role.

- [x] Integrate Better Auth (email/password, self-serve sign-up disabled) per PRD §8.1; sessions carry `userId`, `role`, `tenantId`.
- [x] Build login, password-set (from invite, via the reset-password flow), and logout flows.
- [x] Build route guards per role: `/employee/*`, `/admin/*` (Company Admin), `/instructor/*`, `/super-admin/*` — a `proxy.ts` cookie check plus a DB-backed `requireRole` in each layout.
- [x] Build the four empty dashboard shells (one per role) with role-appropriate nav, using placeholder content.

**Exit criteria:** All four roles can log in and see their own shell; a logged-in Employee cannot reach `/admin/*` etc.

---

## Phase 3 — Marketing Site (Static Content)

**Goal:** The public, unauthenticated site is live with all informational pages from PRD §4.1.

- [x] Build Home (hero + value prop + CTAs), How It Works, Programs/Curriculum, Benefits, Testimonials & Client Logos, FAQ as static/server-rendered pages.
- [x] Build the Pricing page displaying seat-banded tiers (content can be hardcoded/CMS-lite for MVP — no admin UI needed for pricing copy).
- [x] Build the "Book a Consultation" lead form (submits to email/CRM — simplest viable: send a notification email; no CRM integration required for MVP). **✅ Fixed:** all submitted fields are now HTML-escaped (`src/lib/email.ts`'s `escapeHtml`) before going into the notification email.

**Exit criteria:** All marketing pages are live on staging, responsive, and reviewed for the positioning language in PRD §1.1.

---

## Phase 4 — Self-Serve Checkout & Workspace Provisioning

**Goal:** A visitor can pay and land in a fully provisioned workspace, unattended (PRD §5.1).

**Payment provider note:** originally built on Stripe; switched to **Xendit** mid-project at the user's request (both for its Invoices-based checkout and its stronger footing for Indonesian payment methods — cards, e-wallets, bank transfer, QRIS). Xendit has no "Checkout Session"/"Subscription" object, so the design changed: a single Xendit **Invoice** replaces both the checkout session and the first billing event, and renewals/upgrades are additional one-time Invoices rather than Stripe-style metered billing (see Phase 14).

- [x] Integrate Xendit Invoice checkout for the seat-banded packages from the Pricing page — `src/app/api/checkout/route.ts`, `src/lib/xendit.ts`.
- [x] Build the Xendit webhook handler (`src/app/api/xendit/webhook/route.ts`) that creates: `Tenant`, `Subscription`, and a `User` with role `CompanyAdmin` on a `PAID` invoice callback — `src/lib/provisioning.ts` (`provisionTenantFromXenditInvoice`). Auth is a static shared token (`XENDIT_CALLBACK_TOKEN`) in the `x-callback-token` header, Xendit's callback model (no HMAC signature like Stripe). Wrapped in try/catch; a genuinely unrecoverable invoice (missing payer email/tier) is acknowledged instead of retried forever (`PermanentWebhookError`); a race between two concurrent deliveries resolves to "someone else already provisioned this" instead of an unhandled unique-constraint error.
- [x] Send a welcome email (via Resend) with a workspace setup link (set password) — reuses the reset-password flow. On a retried delivery, if the user has never actually signed in, the invite email is resent (`requestPasswordReset` is idempotent) — a first-attempt email failure can no longer permanently lock a paid customer out.
- [ ] Build the minimal workspace-setup flow the welcome email links to (name workspace, upload logo) — **still not done**; the invite link goes straight to set-password → dashboard, no workspace-naming/logo step. Deliberately deprioritized — not blocking, since the tenant already gets a usable name from the checkout invoice's payer email.
- [x] Handle ongoing billing state — **redesigned around Xendit's model rather than ported 1:1**: since there's no Xendit "Subscription" object to sync status from, `Subscription.status`/`renewalDate` are no longer auto-updated by a recurring webhook event; instead each _paid Invoice_ (initial signup or a later seat upgrade, Phase 14) directly updates `Subscription` and records a `Payment` in the same transaction.

**Exit criteria:** ✅ Verified with a real Xendit test-mode Invoice (`checkout-staging.xendit.co`) created via `/api/checkout`, plus a simulated `PAID` webhook callback that correctly provisioned a Tenant/Subscription/CompanyAdmin user end-to-end, including a confirmed working login for the new account.

---

## Phase 5 — Employee Onboarding

**Goal:** A Company Admin can populate their workspace with employees (PRD §5.2).

- [x] Build "Invite Employee" (single, by email) in the Company Admin dashboard.
- [x] Build bulk CSV import (name + email columns; validate and dedupe against existing roster). **✅ Fixed:** the parser now handles quoted fields (including embedded commas and `""` escaping), and each row is isolated in its own try/catch — a single row failing no longer aborts the batch, and the result message reports created/skipped/failed counts by name.
- [x] Invited employees receive an email → set password → land in `/employee` scoped to the correct tenant.
- [x] Build the roster view/list (name, email, invite status, joined date) for Company Admin.

**Note:** this phase's actions don't route through `getTenantScopedClient` (Phase 1) — each one hand-rolls its own `tenantId` filter. Same pattern repeats through Phases 6–11 below; see the code-review notes rather than each phase re-stating it.

**Exit criteria:** A Company Admin can invite 1 employee and bulk-import 10 via CSV; both flows result in working employee logins.

---

## Phase 6 — Cohort Management

**Goal:** Onsite training sessions exist as schedulable objects that content and employees attach to (PRD §7, `Cohort`).

- [x] Build Cohort CRUD (name, onsite date, assigned instructor) — usable by Instructor and Company Admin.
- [x] Allow Company Admin/Instructor to assign employees to a Cohort (individually or bulk from the roster).
- [x] Build the "My Cohort" view for employees (onsite date, instructor name).

**Exit criteria:** A cohort can be created, staffed with employees and an instructor, and is visible to all its members.

---

## Phase 7 — Content Authoring (Instructor)

**Goal:** Instructors can build a curriculum and publish it to specific cohorts (PRD §5.3).

- [x] Build Module CRUD (title, description) in the Instructor dashboard.
- [x] Build Lesson/Material CRUD within a Module (ordered list; text, video embed URL, file attachment via S3 upload).
- [x] Build Assignment CRUD within a Module (instructions, submission type, optional due date).
- [x] Build the "Publish to Cohort(s)" action (creates `ModuleCohortPublication` rows), making a Module visible to its members.

**Exit criteria:** An Instructor can author a 2-lesson Module with 1 Assignment and publish it to a test Cohort; it becomes visible to that cohort's employees (verified in Phase 8).

---

## Phase 8 — Learning Experience (Employee)

**Goal:** Employees can consume published content and track their own progress (PRD §5.4 steps 1).

- [x] Build the Employee "Learning Modules" list (only modules published to their cohort).
- [x] Build Module detail → Lesson viewer, marking each lesson complete as viewed/finished.
- [x] Wire lesson-completion events into `ProgressRecord`.
- [x] Build the Employee "My Progress" view (per-module completion, overall %). **✅ Fixed:** see Phase 10 — completion is now computed from lessons _and_ assignment grading together (`src/lib/progress.ts`).

**Exit criteria:** An employee in the Phase 7 test cohort sees the published Module, completes both lessons, and their progress record updates correctly.

---

## Phase 9 — Assignments & Grading

**Goal:** The submit → grade → feedback loop works end-to-end (PRD §5.4 steps 2–4).

- [x] Build the Assignment submission UI for employees (file upload to S3 / text entry / link, per `submissionType`).
- [x] Build the Instructor Grading Queue (pending submissions across their assigned tenants/cohorts).
- [x] Build the grading action (score/pass-fail + written feedback), writing a `Grade` record and updating the `Submission` status. **✅ Fixed:** the email send is now wrapped in try/catch after the DB writes and `revalidatePath` — a failed notification returns a "graded, but email failed" message instead of a hard error that misleads the instructor into thinking the grade wasn't saved.
- [x] Surface grade + feedback back on the employee's Assignment view; update `ProgressRecord`.
- [x] Notify the employee by email when a submission is graded.

**Exit criteria:** A full submit → grade → feedback-visible cycle works for one assignment, including the email notification.

---

## Phase 10 — Progress Dashboards & Reporting

**Goal:** Company Admins and Instructors can see aggregate adoption data, not just per-employee detail (PRD §5.5).

- [x] Build the Company Admin Team Progress dashboard: roster-wide completion %, submission rates, engagement trend, and a flag for employees with no activity in N days. **✅ Fixed:** completion % is now computed by `src/lib/progress.ts` from lesson completion _and_ assignment grading together (a module with no assignment, or an ungraded one, no longer floors at 0% just because it finished all lessons).
- [x] Build the Instructor's cross-cohort/tenant analytics view (scoped to their `InstructorTenantAssignment`s).
- [ ] Specifically surface **post-training engagement** as a distinct dashboard metric (activity after the cohort's onsite date) — **still not done** as a Company Admin-facing stat. Phase 12 (below) is now built and does distinguish pre-/post-onsite activity for the _nudge_ logic (`src/lib/nudges.ts`) — surfacing that same signal on the admin dashboard is a small follow-up, not a from-scratch build.

**Exit criteria:** Dashboards render correctly against the seeded multi-employee test data from earlier phases, including at least one "post-training" data point.

---

## Phase 11 — AI Resource Library

**Goal:** The always-available tips/templates/guides library exists, browsable by employees and manageable by Instructors (PRD §4.2, §7 `ResourceItem`).

- [x] Build ResourceItem CRUD for Instructors (type: tip/template/guide; title, content, tags; global vs. tenant-specific).
- [x] Build the Employee-facing library view: searchable/filterable by type and tag.

**Exit criteria:** An Instructor publishes a global prompt template; it's visible to employees across multiple tenants.

---

## Phase 12 — Post-Training Habit Loop

**Goal:** The platform proactively re-engages employees after the onsite date, not just on-demand (PRD §5.6).

- [x] Build a scheduled job (cron) that identifies cohorts whose onsite date has passed and employees with low recent activity — `src/lib/nudges.ts` (`sendPostTrainingNudges`), triggered via `src/app/api/cron/nudges/route.ts` (bearer-token protected) and scheduled weekly in `vercel.json`.
- [x] Send periodic nudge emails (new resource highlight, unfinished module/assignment reminder) — cadence resolved as weekly (`NUDGE_INTERVAL_DAYS = 7`), tracked per-user via `User.lastNudgedAt` so a redeployed/rerun job doesn't double-send.
- [x] Add corresponding in-app nudges — a banner on the Employee dashboard (`src/app/employee/page.tsx`) shown when the cohort's onsite date has passed and at least one module is unfinished.

**Exit criteria:** Running the job against seeded "past onsite date" test data produces the expected emails and in-app nudges, without duplicate sends. **Partially verified:** hit the live endpoint with and without the bearer token — runs cleanly (`{"ok":true,"nudged":0,"skipped":0}`) and correctly 401s when unauthorized. Not yet exercised with an actual past-dated cohort in the seed data, so the nudge-selection and `lastNudgedAt` cadence logic itself is unverified end-to-end — worth adding to Phase 16's test suite rather than only manual-checking.

---

## Phase 13 — Super Admin Tools

**Goal:** Platform ops can manage the whole system without touching the database directly (PRD §4.2, §6.5).

- [x] Build Tenant management (list all tenants, view status, suspend/reactivate). **✅ Fixed:** nav now links to `/super-admin/tenants` instead of showing "Soon."
- [x] Build cross-tenant billing oversight (subscriptions, revenue view) — basic version: tier + seats-used/limit per tenant on the main dashboard table, no revenue rollup. Nav item now points at the dashboard rather than a dead "Soon" pill.
- [x] Build Instructor-to-Tenant assignment management. **✅ Fixed two bugs:** the nav now links to `/super-admin/instructors`, _and_ that page didn't actually exist before this pass — `assign-form.tsx`/`actions.ts` had no page to render them on, so the feature was completely unreachable even by direct URL. Built `src/app/super-admin/instructors/page.tsx`.
- [x] Build the Global Content Library view (all `isGlobalTemplate` Modules and global `ResourceItem`s). **Built this pass:** `src/app/super-admin/content/page.tsx`, linked from the nav.
- [x] Audit-log all Super Admin cross-tenant data access per PRD §9 — tenant-suspend, instructor-assign, and now tenant provisioning (`src/lib/provisioning.ts`) are audited. Employee invite/import, cohort creation, and grading were also added this pass (see Phase 15 for what's still not covered). **✅ Fixed:** `AuditLog.actorId` is now `onDelete: Restrict`, not `Cascade` — deleting a user can no longer silently erase their audit trail.

**Exit criteria:** A Super Admin can suspend a tenant (blocking its users from logging in) and reassign an instructor, with both actions audit-logged. **✅ Fixed:** grading and publish-to-cohort actions now check the target tenant's status directly (Instructors don't carry a `tenantId`, so this couldn't be caught by the existing `session.tenantId` check) and reject with "This workspace is suspended" if it's been suspended.

---

## Phase 14 — Billing Self-Service (Company Admin)

**Goal:** Company Admins can manage their own subscription without contacting sales (PRD §6.3).

**Note:** built against Xendit, not Stripe (the whole payment provider was swapped mid-project — see Phase 4). Xendit has no "Billing"/prorated-subscription product; upgrades are a second one-time Invoice, not a metered adjustment.

- [x] Build the Billing page: current plan, seats used/available, upcoming renewal date — `src/app/admin/billing/page.tsx`, linked from the nav (was a disabled "Soon" item before this pass).
- [x] Build "upgrade seats" flow — **not prorated** (no Xendit equivalent to Stripe Billing's proration): Company Admin picks a higher tier, pays its full price via a new Xendit Invoice (`src/app/api/billing/upgrade/route.ts`), and the webhook (`src/lib/billing.ts`, `applySeatUpgradeFromXenditInvoice`) bumps `Subscription.tier`/`seatLimit` on payment. Idempotent against redelivery the same way provisioning is.
- [x] Build invoice history — `Payment` rows for the tenant, listed on the Billing page (date, amount, status). **No download**: Xendit's Invoice API doesn't expose a PDF/receipt endpoint the way Stripe does; this is a table view, not a downloadable file.

**Exit criteria:** ✅ Verified end-to-end against a live Xendit test invoice and a synthetic webhook callback: a tenant's Starter (25-seat) subscription upgraded to Growth (100 seats) on a simulated `PAID` callback, a `Payment` row was recorded, and the action was audit-logged (`subscription.upgrade`) attributed to the tenant's Company Admin.

---

## Phase 15 — Non-Functional Hardening

**Goal:** The platform meets the baseline bar from PRD §9 before launch.

- [ ] Accessibility pass (WCAG 2.1 AA) across marketing site and authenticated platform — **not run**: no Lighthouse/axe pass has been done. The component patterns already in use (semantic form labels, `aria-label`s on icon-only controls, `role="status"` on empty/success states) give a reasonable baseline, but that's not a substitute for an actual audit.
- [ ] Responsive/mobile QA on all authenticated dashboards, not just marketing pages — **not run** as a dedicated pass; every page uses the existing Tailwind responsive utilities consistently with the rest of the app, but hasn't been checked at 320/768/1024/1440px individually.
- [x] Security review of the authorization layer (Phase 1) — reviewed every `actions.ts` file in `src/app` this pass. Findings: all mutating actions correctly gate on `requireRole` and either a `tenantId` filter (Company Admin/Employee actions) or an `InstructorTenantAssignment`-based filter (Instructor actions) — no route/action found that skips tenant scoping. **File-upload access control does not apply**: despite `ContentType.File`/`SubmissionType.File` existing as enum values, no S3 upload was ever actually implemented — "File" lessons/submissions are a URL text field (see `submit-assignment-form.tsx`), not a real file upload. The PRD's "S3 upload" language for Phases 7/9 describes a feature that isn't built; this is a scope gap, not a security bug, and is called out here rather than left silently inaccurate.
- [ ] Performance pass on dashboard queries at realistic seed scale (PRD §9 performance target) — **not run**; the seed data (2 tenants, a handful of users each) is too small to be a meaningful load test. The `Promise.all` parallelization fixes from the earlier pass (Phase 8/10 dashboards) still stand as the only performance work done.
- [x] Confirm audit logging covers grading actions, tenant provisioning, and Super Admin cross-tenant access, **plus this pass**: cohort member add/remove (`src/app/admin/cohorts/actions.ts`), module/lesson/assignment authoring and publish-to-cohort (`src/app/instructor/modules/actions.ts`), resource creation (`src/app/instructor/resources/actions.ts`), and subscription upgrades (`src/lib/billing.ts`). Every mutating action in the app now calls `logAudit`.

**Exit criteria:** Authorization review complete, no unscoped/unguarded data-access path found (documented above). **Still open:** Lighthouse/axe accessibility checks, dedicated responsive QA, and a load/performance pass — none of these have been run; they need either a headed-browser tool run or a larger seed dataset that this pass didn't produce.

---

## Phase 16 — Testing

**Goal:** Confidence to ship and to keep shipping without regressions.

- [x] Unit tests for the authorization layer and progress-calculation logic — `src/lib/__tests__/authz.test.ts` (pre-existing) plus two added this pass: `progress.test.ts` (module/overall completion %, including a regression test for the earlier "floors at 0% on an ungraded assignment" bug) and `checkout-external-id.test.ts` (the signup/upgrade externalId encode-decode the Xendit webhook depends on to route a paid invoice to the right handler). 17 tests total, all passing; wired into CI (`.github/workflows/ci.yml` — `npm test` was previously defined but never actually run in CI).
- [ ] Integration tests for the core workflows in PRD §5 (purchase→provisioning, invite→onboarding, author→publish→learn, submit→grade) — **not built**. These need a real (or containerized) Postgres in CI to exercise Prisma transactions, which this pass didn't set up; the manual smoke tests run throughout this session (curl + live dev server + direct DB checks) covered the same workflows once each, but that's manual verification, not a repeatable CI suite.
- [ ] End-to-end test covering the full happy path — **not built**, same reason: needs Playwright as a CI dependency plus a seeded test database wired into the pipeline, which is a real infrastructure addition, not a quick add. The happy path itself (checkout → provision → invite → publish → learn → submit → grade) has been manually verified in pieces across this session, not as one automated run.

**Exit criteria:** **Partially met.** Unit-test coverage for the highest-silent-bug-risk logic (authz, progress calculation, webhook routing) is real and in CI. The E2E happy-path test does not exist yet — this is the most honest gap in this pass: building it properly needs a CI-provisioned test database and browser automation, which is infrastructure work, not a quick follow-up.

---

## Phase 17 — Deployment & Launch Readiness

**Goal:** Production environment is live, monitored, and safe to point real customers at.

**Status: blocked on real-world resources, not code.** Every item below requires something an AI coding session in this environment cannot provide on its own: a funded Neon/Vercel/Sentry account, a purchased domain, live Xendit production credentials (a `development`-prefixed key is what's configured right now — see Phase 4), and a DNS/domain registrar login. None of these are faked as done; they're accurately left unchecked.

- [ ] Create the Neon `production` branch (sized appropriately — Neon autoscaling/compute settings reviewed, not left on defaults), S3 bucket, and configure production env vars/secrets in Vercel. **Needs:** your Neon/Vercel account access.
- [ ] Configure the production Xendit callback endpoint (`/api/xendit/webhook`) with a real verification token, and set up email domain (SPF/DKIM) for deliverability. **Needs:** a live Xendit business account (not the `xnd_development_...` test key currently in `.env`) and your email-sending domain's DNS.
- [ ] Set up error monitoring (e.g., Sentry) and uptime/log monitoring. **Needs:** a Sentry (or equivalent) account and its DSN.
- [ ] Point the production domain at the deployment; verify SSL. **Needs:** a registered domain and DNS access.
- [ ] Run the Phase 16 E2E happy-path test against production (with a real test purchase in Xendit live mode, then refund/void it). **Blocked on Phase 16's E2E test not existing yet, in addition to the above.**

**Exit criteria:** Not met, and can't be from this environment — this phase is ready to execute once you provide the accounts/credentials above; the application code itself has no known blocker to deploying.

---

## Phase 18 — Launch Checklist

**Status: blocked on business/human actions, not code** — these are decisions and real-world events, not something to build.

- [ ] PRD §12 assumptions log reviewed and resolved (pricing model, cohort semantics, localization, data-isolation requirements, nudge cadence) — no open business assumptions left unconfirmed. **Needs:** your sign-off on the assumptions PRD.md §12 lists; nothing in the code blocks this, it's a decision, not a build task.
- [ ] First real customer/tenant onboarded, with a founder/ops person shadowing the flow live. **Needs:** an actual paying customer and a human to shadow the session — not reproducible in this environment.
- [ ] KPI tracking in place for the metrics in PRD §10 (checkout conversion, module/assignment completion, post-training active usage). **Needs:** an analytics tool decision (e.g., PostHog, Plausible) and its integration — not yet started, and deliberately not guessed at without knowing which tool you want.

---

## Suggested Team Sequencing (if parallelizing)

Phases 0–2 are strictly sequential and blocking for everything else. After that, work can split into two roughly parallel tracks that converge before Phase 15:

- **Track A (buyer-side):** Phase 3 → 4 → 5 → 6 → 14
- **Track B (learning core):** Phase 7 → 8 → 9 → 10 → 11 → 12

Phase 13 (Super Admin) can start any time after Phase 1–2 and run in parallel with both tracks, since it mostly reads/manages data the other tracks produce.
