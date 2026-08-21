# Product Requirements Document: Corporate AI Training Platform

**Status:** Draft v1.0
**Owner:** Product/Architecture
**Audience:** Engineering team, AI coding agents, design, founding stakeholders

---

## Table of Contents

1. [Executive Summary & Product Vision](#1-executive-summary--product-vision)
2. [Business Model](#2-business-model)
3. [Users & Roles (RBAC)](#3-users--roles-rbac)
4. [Information Architecture](#4-information-architecture)
5. [Core Workflows](#5-core-workflows)
6. [Feature List — MVP vs Phase 2 vs Future](#6-feature-list--mvp-vs-phase-2-vs-future)
7. [Data Model](#7-data-model)
8. [System Architecture & Recommended Stack](#8-system-architecture--recommended-stack)
9. [Non-Functional Requirements](#9-non-functional-requirements)
10. [Success Metrics / KPIs](#10-success-metrics--kpis)
11. [Roadmap / Phasing](#11-roadmap--phasing)
12. [Risks & Open Assumptions Log](#12-risks--open-assumptions-log)

---

## 1. Executive Summary & Product Vision

### 1.1 The Problem

Companies are spending money sending employees to AI training, but the impact rarely outlasts the training day. Employees attend a workshop, feel inspired for a week, and then slide back into old habits because there's no structured way to practice, no reference material to return to, and no visibility for the company into whether the training actually changed daily behavior.

### 1.2 The Product

A **Corporate AI Training Platform** built around a simple idea: the real training happens onsite, face-to-face, delivered by a human instructor. The platform is not a replacement for that — it's the **digital companion** that makes the training's effects stick. It gives employees a place to revisit material, complete practical assignments, track their own progress, and build a habit of using AI day-to-day. It gives the company (the buyer) visibility into adoption across their workforce.

**Positioning:** _"From AI Awareness to AI Adoption."_ / _"Turn AI from a buzzword into a daily productivity tool for your employees."_

### 1.3 Why Not Just Build Another LMS

Coursera, Udemy, and Moodle solve a different problem: broad, self-serve, asynchronous course delivery at scale, with deep authoring tools, quizzes, certificates, discussion boards, and content marketplaces. This product is deliberately narrower:

- Content is anchored to a **specific onsite cohort and instructor**, not a self-serve course catalog.
- The goal is **behavior change and habit-building**, not credentialing.
- The admin/authoring surface is scoped to what an internal instructor team needs — not a general-purpose course builder.
- Anything that doesn't directly serve "review material → practice → track progress → keep practicing" is explicitly out of scope (see [Section 6](#6-feature-list--mvp-vs-phase-2-vs-future)).

### 1.4 The Two Sides of the Product

| Side                          | Purpose                                                                                      | Audience                                             |
| ----------------------------- | -------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| **Public Marketing Website**  | Sell the onsite training + platform bundle; convert visitors into paying corporate customers | HR/L&D decision-makers, company leadership           |
| **Digital Learning Platform** | Deliver the companion learning experience tied to a company's onsite training engagement     | Employees, company admins, instructors, platform ops |

---

## 2. Business Model

### 2.1 Model

**Multi-tenant B2B SaaS.** Each purchasing company becomes one isolated **workspace (tenant)** on a shared platform. All companies run on the same codebase and infrastructure; their data (employees, cohorts, progress, submissions) is logically isolated from every other tenant.

### 2.2 What a Company Buys

A **Training Package**, which bundles:

- One or more onsite training sessions (delivered in person by a human instructor — scheduled/logged in the platform, not delivered by it)
- Digital platform access for a defined number of employee seats
- A curriculum (a set of Modules assigned to their cohort(s))
- Access to the shared AI Resource Library (tips, prompting templates, guides)
- Progress tracking & reporting for their company admin

### 2.3 Commercial Flow

Two parallel paths to purchase, which is standard for B2B SaaS with both smaller self-serve buyers and larger custom deals:

1. **Self-serve checkout** (primary MVP flow): a company picks a package/tier on the pricing page (typically banded by employee seat count and program length), pays online, and their workspace is **auto-provisioned** immediately.
2. **Book a Consultation**: for larger seat counts, custom curriculum, or multi-site rollouts, a lead form routes to the sales team, who manually creates and configures the workspace after a deal closes.

Both paths converge on the same result: a provisioned workspace with a subscription/plan record attached.

### 2.4 Workspace Lifecycle

```
Visitor → Purchases package (self-serve) OR closes deal via sales (consultation)
        → Tenant/workspace auto-provisioned, Company Admin account created
        → Company Admin invites employees (bulk CSV or individual email invites)
        → Onsite training session(s) scheduled and logged as Cohorts
        → Employees use platform before/during/after onsite sessions
        → Company Admin monitors adoption via progress dashboard
        → Subscription renews / upgrades (more seats, more programs) or lapses
```

### 2.5 Pricing Structure (assumption — confirm before build)

Seat-banded tiers (e.g., Starter / Growth / Enterprise) priced per employee seat per program, billed via subscription (recurring, since ongoing platform access + habit-building resources is part of the value prop) or one-time per cohort. **This PRD assumes a per-seat subscription model**; final pricing packaging is a business decision outside engineering scope but the billing system (see [8.5](#85-payments--billing)) must support seat-based metering and upgrades/downgrades regardless of the final numbers.

---

## 3. Users & Roles (RBAC)

| Role                           | Scope                                            | Key Capabilities                                                                                                                                                                                                                  |
| ------------------------------ | ------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Employee / Learner**         | Single tenant                                    | Browse assigned modules, view materials, submit assignments, view own progress, browse AI resource library & prompt templates, see own cohort/onsite session schedule                                                             |
| **Company Admin**              | Single tenant                                    | Everything an Employee can do, plus: invite/manage employees, view team-wide progress analytics, manage billing/subscription, view cohort schedule for their company                                                              |
| **Instructor / Content Admin** | Platform-side; assignable to one or many tenants | Author modules, lessons, and assignments; publish content to specific cohorts/tenants; grade submissions and leave feedback; manage the shared AI Resource Library (tips, templates, guides); view analytics for assigned tenants |
| **Super Admin**                | Global (all tenants)                             | Manage all tenants (create/suspend/configure), manage billing/subscriptions across tenants, manage global content library, manage instructor assignments, platform-wide configuration and reporting                               |

**Design note:** Instructors are **platform-side staff**, not employees of the purchasing company — they're the people delivering the onsite training and authoring the curriculum. A given instructor may be assigned to multiple company tenants. This differs from typical LMS "teacher" roles that belong to one org; it reflects that this business delivers the training, it doesn't just host a platform for companies to train themselves.

**Auth note:** A single user account is scoped to exactly one tenant for the Employee/Company Admin roles (an employee at Company A cannot see Company B's data). Instructor and Super Admin accounts are platform-side and carry explicit tenant-assignment records rather than belonging to a tenant.

---

## 4. Information Architecture

### 4.1 Public Marketing Website (unauthenticated)

| Page                            | Purpose                                                                                                                                                                                             |
| ------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Home**                        | Hero + value proposition ("From AI Awareness to AI Adoption"), summary of the bundle (onsite + digital + assignments + resources + tracking), primary CTAs: "See Pricing" and "Book a Consultation" |
| **How It Works**                | Explains the onsite training model, then the digital platform's role as companion — sets expectation this is not a self-serve course                                                                |
| **Programs / Curriculum**       | AI topics covered, training methodology, example modules                                                                                                                                            |
| **Pricing**                     | Seat-banded packages, self-serve checkout entry point                                                                                                                                               |
| **Benefits**                    | Split into "For Companies" (adoption metrics, ROI, workforce readiness) and "For Employees" (practical skills, career relevance)                                                                    |
| **Testimonials & Client Logos** | Social proof                                                                                                                                                                                        |
| **FAQ**                         | Common objections/questions                                                                                                                                                                         |
| **Book a Consultation**         | Lead-gen form for custom/enterprise deals                                                                                                                                                           |
| **Checkout**                    | Self-serve package purchase flow (seat count, program selection, payment)                                                                                                                           |
| **Login**                       | Entry point to the authenticated platform                                                                                                                                                           |

### 4.2 Authenticated Platform

One primary dashboard per role, each with role-appropriate navigation:

**Employee**

- Dashboard (progress overview, upcoming onsite session, recently assigned modules)
- Learning Modules (list → module detail → lessons/materials)
- Assignments (list, submission upload/entry, status: not started / submitted / graded)
- My Progress (per-module and overall completion, feedback received)
- AI Resource Library (tips & tricks, prompting templates, curated resources — searchable/filterable)
- My Cohort (onsite session schedule, instructor info)

**Company Admin**

- Everything in Employee, plus:
- Team Roster (invite, remove, bulk import employees)
- Team Progress Dashboard (completion rates, assignment status, engagement over time, at-risk/low-engagement flags)
- Billing (current plan, seats used/available, invoices, upgrade seats)

**Instructor / Content Admin**

- Content Library (create/edit Modules → Lessons/Materials → Assignments)
- Publishing (assign content to specific Cohorts/tenants)
- Grading Queue (pending submissions across assigned tenants, grade + feedback)
- Resource Library management (tips, templates, guides — global or tenant-specific)
- Tenant Analytics (progress/engagement for assigned tenants)

**Super Admin**

- Tenant Management (create/suspend/configure workspaces, view all subscriptions)
- Billing Oversight (all tenants, revenue, plan changes)
- Instructor Assignment (map instructors to tenants)
- Global Content Library
- Platform Configuration

---

## 5. Core Workflows

### 5.1 Purchase → Workspace Provisioning

1. Visitor selects a package on the Pricing page and completes Checkout (Stripe).
2. On successful payment, the system creates: a `Tenant`, a `Subscription` record linked to the Stripe subscription/customer, and a `User` with role `CompanyAdmin` for the person who checked out.
3. Company Admin receives a welcome email with a link to set up their workspace (name, logo) and invite employees.
4. _(Consultation path: Sales manually creates the Tenant, Subscription, and initial Company Admin account after a deal closes — same downstream state, different entry point.)_

### 5.2 Employee Onboarding

1. Company Admin invites employees individually or via CSV bulk upload (name + email).
2. Each invited employee receives an email to set a password / accept the invite and lands in role `Employee`, scoped to that tenant.
3. Employee is optionally assigned to a `Cohort` (tied to a scheduled onsite session) by the Company Admin or Instructor.

### 5.3 Content Authoring & Publishing

1. Instructor creates a `Module` (title, description, ordered `Lessons`/materials — text, video embed, file attachments).
2. Instructor creates one or more `Assignments` attached to a Module (instructions, submission type: file upload / text / link).
3. Instructor publishes the Module (with its assignments) to one or more `Cohorts`, making it visible to the employees in those cohorts.

### 5.4 Learning & Assignment Submission

1. Employee opens an assigned Module, progresses through Lessons (progress recorded per lesson).
2. Employee opens an Assignment, submits work (file/text/link) as a `Submission`.
3. Instructor sees the submission in their Grading Queue, grades it (score and/or pass/fail) with written feedback.
4. Employee sees grade + feedback on the Assignment; their `ProgressRecord` for that Module updates.

### 5.5 Progress Tracking & Reporting

1. Every Lesson-completed and Assignment-graded event updates a `ProgressRecord` for that employee/module.
2. Company Admin dashboard aggregates `ProgressRecord`s across their roster: completion %, submission rates, engagement trend, and flags employees with no activity in N days.
3. Instructor sees the same aggregation scoped to the cohorts/tenants they're assigned to.

### 5.6 Post-Training Habit Loop

Because the core value proposition is that AI adoption continues _after_ the onsite session ends, the platform surfaces the Resource Library (tips, prompting templates) proactively rather than only on-demand:

1. After a cohort's onsite session date has passed, the system begins surfacing periodic nudges (email + in-app) pointing employees to new tips/templates or an unfinished module/assignment.
2. Company Admin's progress dashboard specifically highlights **post-training engagement** (activity after the onsite date) as a distinct metric from pre-training completion, since that's the behavior-change signal the business is selling.

---

## 6. Feature List — MVP vs Phase 2 vs Future

### 6.1 Marketing Site

| Feature                                                                            | MVP | Phase 2 | Future |
| ---------------------------------------------------------------------------------- | :-: | :-----: | :----: |
| Static marketing pages (Home, How It Works, Programs, Benefits, Testimonials, FAQ) | ✅  |         |        |
| Self-serve checkout (Stripe)                                                       | ✅  |         |        |
| Book a Consultation lead form                                                      | ✅  |         |        |
| Pricing page with seat-banded tiers                                                | ✅  |         |        |
| Interactive ROI/savings calculator                                                 |     |   ✅    |        |
| Localization (multi-language marketing site)                                       |     |         |   ✅   |

### 6.2 Employee Platform

| Feature                                              | MVP | Phase 2 | Future |
| ---------------------------------------------------- | :-: | :-----: | :----: |
| Module/lesson viewing with progress tracking         | ✅  |         |        |
| Assignment submission (file/text/link)               | ✅  |         |        |
| Grades + written feedback view                       | ✅  |         |        |
| AI Resource Library (tips, prompt templates, guides) | ✅  |         |        |
| Personal progress dashboard                          | ✅  |         |        |
| Cohort/onsite session schedule view                  | ✅  |         |        |
| Post-training nudges (email/in-app)                  | ✅  |         |        |
| Discussion/Q&A per module                            |     |   ✅    |        |
| Gamification (streaks, badges)                       |     |   ✅    |        |
| Mobile native app                                    |     |         |   ✅   |

### 6.3 Company Admin

| Feature                                                  | MVP | Phase 2 | Future |
| -------------------------------------------------------- | :-: | :-----: | :----: |
| Employee roster management (invite, bulk import, remove) | ✅  |         |        |
| Team progress dashboard                                  | ✅  |         |        |
| Billing/subscription self-management (upgrade seats)     | ✅  |         |        |
| Exportable adoption reports (CSV/PDF)                    |     |   ✅    |        |
| Custom branding/theming per tenant                       |     |   ✅    |        |
| SSO (SAML/OIDC) for enterprise tenants                   |     |   ✅    |        |

### 6.4 Instructor / Content Admin

| Feature                                      | MVP | Phase 2 | Future |
| -------------------------------------------- | :-: | :-----: | :----: |
| Module/lesson authoring                      | ✅  |         |        |
| Assignment creation                          | ✅  |         |        |
| Publishing content to cohorts                | ✅  |         |        |
| Grading queue with feedback                  | ✅  |         |        |
| Resource Library management                  | ✅  |         |        |
| Content templates/duplication across tenants |     |   ✅    |        |
| Rubric-based grading                         |     |   ✅    |        |

### 6.5 Super Admin

| Feature                                      | MVP | Phase 2 | Future |
| -------------------------------------------- | :-: | :-----: | :----: |
| Tenant management (create/suspend/configure) | ✅  |         |        |
| Cross-tenant billing oversight               | ✅  |         |        |
| Instructor-to-tenant assignment              | ✅  |         |        |
| Global content library                       | ✅  |         |        |
| Platform-wide analytics/reporting            |     |   ✅    |        |

### 6.6 Explicitly Out of Scope for MVP (and why)

- **Certification/badging marketplace** — credentialing isn't the value prop; adoption is.
- **SCORM/xAPI content import** — this isn't a general-purpose course host.
- **Gamification (leaderboards, points, streak competitions)** — nice-to-have engagement mechanic, not core.
- **Discussion forums/social learning** — training is onsite/human-led; async social features add LMS-style complexity the brief explicitly wants to avoid.
- **Native mobile apps** — responsive web is sufficient for MVP.
- **Multi-language platform UI** — single-language (assume English, or the company's primary language) for MVP.
- **SSO/SAML** — standard email/password + invite flow is sufficient until an enterprise customer requires it.

---

## 7. Data Model

High-level entities and relationships. All tenant-scoped tables carry a `tenantId` foreign key used for row-level data isolation (see [8.2](#82-multi-tenancy-strategy)).

```
Tenant (Company Workspace)
 ├─ id, name, logoUrl, createdAt, status (active/suspended)
 └─ has many: Users, Cohorts, Subscriptions

User
 ├─ id, tenantId (nullable for Instructor/SuperAdmin), name, email, passwordHash, role
 └─ role ∈ {Employee, CompanyAdmin, Instructor, SuperAdmin}

InstructorTenantAssignment
 ├─ instructorId, tenantId   // many-to-many: instructors can serve multiple tenants

Cohort (an onsite training batch)
 ├─ id, tenantId, name, onsiteDate, instructorId
 └─ has many: CohortMembers (Users), assigned Modules

Module
 ├─ id, title, description, createdByInstructorId, isGlobalTemplate (bool)
 └─ has many: Lessons, Assignments
 └─ published to: many Cohorts (join table: ModuleCohortPublication)

Lesson / Material
 ├─ id, moduleId, title, contentType (text/video/file), content/url, order

Assignment
 ├─ id, moduleId, instructions, submissionType (file/text/link), dueDate (optional)

Submission
 ├─ id, assignmentId, userId, content/fileUrl, submittedAt, status (pending/graded)

Grade
 ├─ id, submissionId, gradedByInstructorId, score/passFail, feedbackText, gradedAt

ProgressRecord
 ├─ id, userId, moduleId, lessonsCompletedCount, assignmentStatus, lastActivityAt

ResourceItem (AI tips / prompt templates / guides)
 ├─ id, type (tip/template/guide), title, content, tags, isGlobal (bool), tenantId (nullable if global)

Subscription / Plan
 ├─ id, tenantId, stripeSubscriptionId, tier, seatLimit, seatsUsed, status, renewalDate

Payment / Invoice
 ├─ id, tenantId, subscriptionId, amount, status, stripeInvoiceId, createdAt
```

**Notes for implementers:**

- `ModuleCohortPublication` is the join that lets one authored Module be reused across multiple cohorts/tenants (supports Instructors publishing the same curriculum to several companies).
- `ResourceItem.isGlobal` distinguishes the shared platform-wide resource library from any tenant-specific customization, should that be needed later.
- `ProgressRecord` is a derived/aggregate table, recomputed (or incrementally updated) from Lesson-completion and Grade events — don't make callers compute progress on the fly from raw events everywhere.

---

## 8. System Architecture & Recommended Stack

### 8.1 Recommended Stack

| Layer               | Choice                                                                | Rationale                                                                                                                                                                                                       |
| ------------------- | --------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Frontend + Backend  | **Next.js (React + TypeScript)**, single full-stack app               | One codebase for marketing site + authenticated app; server components for the marketing pages (SEO-friendly), API routes/server actions for the platform; large ecosystem AI coding agents are well-trained on |
| Database            | **Neon (PostgreSQL)**                                                 | Relational data fits well; managed Postgres platform                                                                                                                                                            |
| ORM                 | **Prisma**                                                            | Type-safe schema matches the data model above almost 1:1; good AI-agent codegen support                                                                                                                         |
| Auth                | **Better Auth**, backed by the same Neon Postgres database via Prisma | Self-hosted, framework-agnostic auth library (email/password now, social/SSO later) — not Neon's own bundled "Neon Auth" product, which this project doesn't use                                                |
| Payments/Billing    | **Stripe** (Checkout + Billing/Subscriptions)                         | Handles self-serve checkout, seat-based subscriptions, invoicing, upgrades — avoid building billing logic from scratch                                                                                          |
| File Storage        | **S3-compatible object storage** (e.g., AWS S3, Cloudflare R2)        | Learning materials and assignment submission files                                                                                                                                                              |
| Transactional Email | **Resend** (or SendGrid)                                              | Invites, grading notifications, post-training nudges                                                                                                                                                            |
| Hosting             | **Vercel** (app) + managed Postgres (**Neon**)                        | Low-ops deployment matched to the Next.js stack                                                                                                                                                                 |

### 8.2 Multi-Tenancy Strategy

**Shared database, `tenantId` row-level scoping.** Every tenant-owned table carries a `tenantId` column; all queries are scoped by the authenticated user's tenant (enforced centrally — e.g., a Prisma middleware or a repository-layer guard, not left to individual query call-sites). This is the standard, lowest-overhead approach for this scale (dozens–hundreds of corporate tenants) and keeps operations simple (one database, one schema, one deploy).

_Escape hatch:_ if a future enterprise customer contractually requires physical data isolation, the architecture should support migrating that single tenant to a dedicated schema or database without a full rewrite — keep tenant-scoping logic centralized (not scattered) specifically so this migration stays feasible. Neon's branching model makes a dedicated-branch-per-tenant variant of this escape hatch cheap to provision if it's ever needed, without standing up separate database infrastructure.

### 8.3 Role/Tenant-Aware Access Control

- Session carries `userId`, `role`, and `tenantId` (null for Instructor/SuperAdmin, who instead carry their tenant-assignment list).
- A single authorization layer checks role + tenant on every data access — never trust a client-supplied tenantId.
- Instructors query across their _assigned_ tenants (via `InstructorTenantAssignment`); Super Admin bypasses tenant scoping entirely (with all such access audit-logged).

### 8.4 High-Level Component Flow

```
                    ┌─────────────────────┐
                    │   Public Marketing   │  (Next.js, server-rendered)
                    │   Site + Checkout     │
                    └──────────┬───────────┘
                               │ Stripe Checkout
                               ▼
                    ┌─────────────────────┐
                    │   Provisioning       │  (creates Tenant, Subscription,
                    │   Service             │   CompanyAdmin user)
                    └──────────┬───────────┘
                               ▼
┌─────────────────────────────────────────────────────────┐
│                Authenticated Platform (Next.js)           │
│  Employee UI │ Company Admin UI │ Instructor UI │ Super   │
│              │                  │                │ Admin  │
└───────┬─────────────┬─────────────────┬───────────┬──────┘
        │             │                 │           │
        ▼             ▼                 ▼           ▼
   ┌─────────────────────────────────────────────────────┐
   │       Authorization Layer (role + tenant scoping)     │
   └───────────────────────┬───────────────────────────────┘
                            ▼
   ┌─────────────────────────────────────────────────────┐
   │   Neon Postgres (Prisma)  │  S3 (files)  │  Stripe  │ Email │
   └─────────────────────────────────────────────────────┘
```

### 8.5 Payments & Billing

- Stripe Checkout for initial self-serve purchase; Stripe Billing for ongoing subscription management (seat count changes, renewals, invoices).
- Webhook handler updates `Subscription`/`Payment` records on Stripe events (`checkout.session.completed`, `invoice.paid`, `customer.subscription.updated`, etc.) — this is also the trigger for tenant provisioning (5.1).

---

## 9. Non-Functional Requirements

- **Tenant data isolation:** No query path may return data across tenants except for Instructor (scoped to assignments) and Super Admin (audit-logged) roles.
- **RBAC enforcement:** Every server-side route/action must verify role + tenant, not just authentication.
- **Responsive design:** Full functionality on desktop and mobile web — employees may check assignments/resources on the go; no native app required for MVP.
- **Accessibility:** WCAG 2.1 AA baseline for the authenticated platform and marketing site.
- **Performance:** Marketing pages server-rendered/statically generated for fast load and SEO; authenticated dashboards should load core data (progress, roster) in well under 2s at expected scale (tens of tenants, hundreds of employees each, for MVP).
- **Branding:** Tenant logo displayed in the authenticated platform header (lightweight personalization); full custom theming deferred to Phase 2.
- **Auditability:** Grading actions, tenant provisioning, and Super Admin cross-tenant access should be logged for accountability.

---

## 10. Success Metrics / KPIs

**Marketing site**

- Checkout conversion rate (visitor → paid package)
- Consultation-to-close rate for the sales-assisted path

**Platform engagement (the actual product thesis)**

- Module completion rate per cohort
- Assignment submission rate per cohort
- **Post-training active usage**: % of employees with platform activity 2/4/8 weeks _after_ their cohort's onsite date — this is the core "did adoption stick" signal the business is selling
- Company Admin dashboard views (proxy for whether the buyer perceives value)

**Business health**

- Net seat expansion within existing tenants (upsell signal)
- Subscription renewal rate

---

## 11. Roadmap / Phasing

**Phase 1 — MVP** (all ✅ items in [Section 6](#6-feature-list--mvp-vs-phase-2-vs-future)): marketing site with self-serve checkout + consultation path, full employee/company-admin/instructor/super-admin platform with content authoring, assignments, grading, progress tracking, and the resource library.

**Phase 2:** Exportable reports, tenant custom branding, SSO for enterprise tenants, discussion/Q&A per module, gamification, rubric-based grading, content templating across tenants, ROI calculator on the marketing site.

**Phase 3 (Future):** Native mobile app, multi-language support, deeper analytics/BI, certification options if the business model evolves toward it.

---

## 12. Risks & Open Assumptions Log

These are assumptions made in this PRD that should be confirmed with the business/stakeholders before or during build:

1. **Pricing model** is assumed to be per-seat subscription; actual packaging (one-time vs. recurring, per-cohort vs. per-seat) is a business decision that affects the billing integration design.
2. **Cohorts are tied to a single onsite date** per training engagement; if a company runs recurring/rolling onsite sessions, the Cohort model may need to support multiple sessions per tenant over time (the current model already allows multiple Cohorts per Tenant, so this should be fine, but confirm whether cohorts ever need to _span_ multiple onsite dates).
3. **Instructors are platform-side staff**, not client employees — confirmed design choice, but flagged since it's a deviation from typical LMS "teacher" patterns.
4. **Language/localization**: assumed English-only for MVP; confirm target markets.
5. **Enterprise data-isolation requirements**: shared-DB multi-tenancy is assumed sufficient for MVP; confirm no early customer contractually requires a dedicated database.
6. **Post-training nudge cadence** (how often, via what channel) is not yet specified — needs a concrete rule (e.g., weekly digest email) before implementation.
