# Sprint Roadmap — Spiced Dayhome Unified System

> **Supersedes:** Previous `SPRINT_PLAN.md`  
> **Reference:** `SYSTEM_GUIDE.md` for full system architecture, data model, API map, and workflows

---

## Overview

| Metric             | Value                                |
| ------------------ | ------------------------------------ |
| **Total sprints**  | 10 (11 counting Sprint 0)            |
| **Sprint length**  | 2 weeks                              |
| **Total timeline** | 22 weeks (~5.5 months)               |
| **Budget**         | ~$15,000 CAD                         |
| **Team**           | 1 developer (lead, PM, scrum master) |

### Legend

| Icon | Meaning            |
| ---- | ------------------ |
| ✅   | Completed          |
| 🔷   | In progress        |
| ⬜   | Not started        |
| 🚫   | Blocked            |
| ❌   | Deferred / removed |

---

## Sprint 0 — Foundation & Architecture (Week 1–2)

**Goal:** Monorepo scaffold, database, auth, shared packages, infrastructure, web-admin skeleton.

**Status:** ✅ ~90% Complete

### Remaining Close-Out Items

- [ ] **UI Kit**: Add Modal, Select, DataTable, Tabs, DropdownMenu components to `packages/ui-kit`
- [ ] **shared-utils**: Populate with date formatting, validation helpers, `cn()` (move from ui-kit)
- [ ] **shared-constraints**: Add regex patterns, validation rules, role hierarchy constants
- [ ] **i18n scaffold**: Install `react-i18next`, configure locale detection, create `t()` utility. All new strings use translation keys from Sprint 1 onward
- [ ] **a11y scaffold**: Add `eslint-plugin-jsx-a11y` to ESLint config. Follow WCAG patterns (aria attributes, semantic HTML, keyboard nav, color contrast) on every component from Sprint 1
- [ ] **Queue Dashboard**: Set up Bull Board UI at `/api/v1/admin/queues`
- [ ] **Tests**: AuthService unit tests + auth endpoint integration tests
- [ ] **ESLint**: Ensure zero errors across all packages

---

## Sprint 1 — Organization Profile & Staff Management (Week 3–4)

**Goal:** Set up the single org profile (Spiced agency), invite staff, configure roles, and enable password reset.

**Architecture:** Single-tenant system. One organization (Spiced/the agency) manages all dayhomes. No multi-tenant org CRUD.

**Stories:**

| ID    | Story                                                            | Backend | Frontend |
| ----- | ---------------------------------------------------------------- | ------- | -------- |
| S1-01 | Single org profile (GET/PATCH, no list/create/delete)            | ✅      | —        |
| S1-02 | Staff invitation flow (invite → email → set password → activate) | ✅      | ✅       |
| S1-03 | RBAC: Roles & Permissions UI                                     | ✅      | ✅       |
| S1-04 | Password reset (forgot + reset endpoints)                        | ✅      | ✅       |
| S1-05 | Audit log viewer                                                 | ✅      | ✅       |
| S1-06 | Org operational settings (holidays, hours, ratios)               | ✅      | ✅       |

**Technical tasks:**

- [ ] OrganizationModule: single profile endpoints only (no list/delete)
- [ ] Staff module: `POST /api/v1/staff/invite`, `GET /api/v1/staff`
- [ ] Invitation model with token, expiry, status
- [ ] BullMQ email integration for invitation + password reset emails
- [ ] `POST /auth/forgot-password`, `POST /auth/reset-password`
- [ ] Rate limiting: 5 login attempts / 15 min per IP
- [ ] Web Admin: `/staff` page with invite drawer, search, role badges, pending invitations
- [ ] Web Admin: Forgot/reset password pages

**Definition of Done:**

- [ ] Single org profile endpoint working
- [ ] Staff invitation → email received → set password → account active
- [ ] Password reset: email with link → new password set
- [ ] RBAC enforced in tests (ORG_ADMIN cannot access super admin routes)
- [ ] Audit logs created for every state change
- [ ] Staff page in sidebar with invite flow

---

## Sprint 2 — Dayhome Management & API Intake (Week 5–6)

**⚠️ KEY CORRECTION FROM OLD PLAN:** Dayhomes arrive via **API intake webhook** from the external Application Portal (pre-approved, status `ACTIVE`), not via manual registration by `DAYHOME_OWNER`. The `PENDING` status is not used in this system.

**Stories:**

| ID    | Story                                                             | Backend | Frontend |
| ----- | ----------------------------------------------------------------- | ------- | -------- |
| S2-01 | API intake webhook receives approved dayhome from external portal | ✅      | —        |
| S2-02 | Dayhome management (list, detail, status transitions)             | ✅      | ✅       |
| S2-03 | Room management (CRUD, capacity validation)                       | ✅      | ✅       |
| S2-04 | Welcome email + owner account setup flow                          | ✅      | —        |
| S2-05 | Dayhome dashboard with key metrics                                | ✅      | ✅       |

**Technical tasks:**

- [ ] `POST /api/v1/dayhomes/intake` — HMAC signature verification, idempotency key dedup
- [ ] Validate payload → map fields → create dayhome (ACTIVE)
- [ ] Manual review queue for invalid payloads (flag → coordinator resolves)
- [ ] Dayhome status transitions: ACTIVE ↔ SUSPENDED ↔ CLOSED
- [ ] Room capacity validation (cannot reduce below current enrollment)
- [ ] Dayhome events: `dayhome.intaken`, `dayhome.suspended`
- [ ] `@OrganizationAccess()` guard
- [ ] Scaffold `apps/web-dayhome` (Next.js 14, Tailwind, shared ui-kit)
- [ ] Web Admin: dayhome list with status filters, detail page
- [ ] Web Dayhome: dashboard, room management

**Definition of Done:**

- [ ] Intake webhook: invalid signature → 401, duplicate key → 409, bad payload → 422
- [ ] API intake creates dayhome with validated data
- [ ] Invalid payloads flagged for manual review
- [ ] Status transitions work (suspended blocks all operations)
- [ ] Room capacity enforced at API level
- [ ] Welcome email sends to dayhome owner
- [ ] Web Dayhome portal scaffolded and serving pages

---

## Sprint 3 — Educator Management (Week 7–8)

**Goal:** Educator profiles, shift scheduling, PTO, time tracking, certifications.

**Stories:**

| ID    | Story                                             | Backend | Frontend |
| ----- | ------------------------------------------------- | ------- | -------- |
| S3-01 | Educator CRUD with certifications                 | ✅      | ✅       |
| S3-02 | Shift scheduling (weekly patterns with overrides) | ✅      | ✅       |
| S3-03 | PTO request → approval with ratio validation      | ✅      | ✅       |
| S3-04 | Time clock (clock-in/out)                         | ✅      | ✅       |
| S3-05 | Certification tracking with expiry alerts         | ✅      | —        |

**Technical tasks:**

- [ ] EducatorModule with ShiftPattern, PtoRequest, TimeClockEntry entities
- [ ] Ratio calculation engine (province-specific rules from org settings)
- [ ] PTO validation: check remaining educators meet minimum ratio
- [ ] Time clock: prevent double clock-in; daily summary via cron
- [ ] Certification expiry alerts (BullMQ)
- [ ] Web Dayhome: educator list, add form, schedule grid, PTO, time clock widget
- [ ] Web Admin: org-wide educator view

**Definition of Done:**

- [ ] Educator CRUD with certification fields
- [ ] Shift patterns create weekly schedules
- [ ] PTO approval rejects if ratio would be breached
- [ ] Time clock records accurate hours
- [ ] Educator sees only own schedule (role scoping)

---

## Sprint 4 — Family & Child Management (Week 9–10)

**Goal:** Family registration, child profiles, medical info, authorized pickups, enrollment with waitlist.

**Stories:**

| ID    | Story                                          | Backend | Frontend |
| ----- | ---------------------------------------------- | ------- | -------- |
| S4-01 | Family registration with email verification    | ✅      | ✅       |
| S4-02 | Child profile CRUD with encrypted medical info | ✅      | ✅       |
| S4-03 | Authorized pickup management with PIN          | ✅      | ✅       |
| S4-04 | Enrollment with capacity check & waitlist      | ✅      | ✅       |
| S4-05 | Emergency contacts                             | ✅      | ✅       |

**Technical tasks:**

- [ ] FamilyModule + ChildModule
- [ ] Medical notes encrypted at rest (AES-256)
- [ ] Pickup PIN hashed with bcrypt
- [ ] Enrollment: capacity check → enroll or add to FIFO waitlist
- [ ] `FamilyAccessGuard` — parent can ONLY see own children
- [ ] Events: `child.enrolled`, `child.waitlisted`, `slot.available`
- [ ] Scaffold `apps/web-parent` (Next.js 14)
- [ ] Web Parent: registration wizard, child form, pickups, enrollment flow

**Definition of Done:**

- [ ] Family registration → email verification → active
- [ ] Child profile with encrypted medical data
- [ ] Authorized pickup PIN verified on check-out
- [ ] Enrollment: full room → waitlist → slot opens → parent notified
- [ ] Data isolation verified in tests

---

## Sprint 5 — Attendance & Daily Operations (Week 11–12)

**Goal:** Check-in/out, daily board (real-time), ratio monitoring, health screening.

**Stories:**

| ID    | Story                                               | Backend | Frontend |
| ----- | --------------------------------------------------- | ------- | -------- |
| S5-01 | Child check-in with health screening                | ✅      | ✅       |
| S5-02 | Child check-out with authorized pickup verification | ✅      | ✅       |
| S5-03 | Real-time daily board (Socket.io)                   | ✅      | ✅       |
| S5-04 | Ratio monitoring dashboard                          | ✅      | ✅       |
| S5-05 | Parent check-in/out notifications                   | ✅      | —        |

**Technical tasks:**

- [ ] Health screening: temperature + symptom questionnaire at check-in
- [ ] Check-out: verify PIN or photo confirmation
- [ ] Socket.io gateway: `attendance.updated` events
- [ ] Ratio calculation: `presentChildren / presentEducators` per room
- [ ] BullMQ: `attendance-summary` job at 17:00
- [ ] Web Dayhome: daily board, check-in/out modals, ratio indicator
- [ ] Web Admin: ratio monitoring, attendance history with CSV export

**Definition of Done:**

- [ ] Check-in with health screening recorded
- [ ] Check-out with PIN verification
- [ ] Daily board updates in real-time (< 1s)
- [ ] Ratio accurate, alerts when breached
- [ ] Parent notified within 30s of check-in/out

---

## Sprint 6 — Billing & Finance (Week 13–14)

**Goal:** Invoice generation from attendance, payments, subsidies, financial reports.

**Stories:**

| ID    | Story                                            | Backend | Frontend |
| ----- | ------------------------------------------------ | ------- | -------- |
| S6-01 | Invoice auto-generation from attendance (BullMQ) | ✅      | ✅       |
| S6-02 | Payment tracking (mock or Stripe)                | ✅      | ✅       |
| S6-03 | Subsidy management (percentage/fixed)            | ✅      | ✅       |
| S6-04 | Financial reports                                | ✅      | ✅       |
| S6-05 | Credits & refunds                                | ✅      | ✅       |

**Technical tasks:**

- [ ] BillingModule: Invoice, InvoiceLineItem, Payment, Subsidy, Credit entities
- [ ] Invoice generation: BullMQ weekly job
- [ ] `Decimal(10,2)` for all monetary values (no float)
- [ ] Subsidy auto-application to invoices
- [ ] Financial reports: revenue, AR aging, subsidy totals (materialized views)
- [ ] Web Admin + Dayhome: invoice list, subsidy forms, reports dashboard
- [ ] Web Parent: my invoices, payment history

**Definition of Done:**

- [ ] Invoices generated from attendance with correct amounts
- [ ] Subsidies applied before payment calculation
- [ ] Payment recorded (mock), invoice status updated
- [ ] Financial reports accurate (tested with seed data)
- [ ] Billing-only role: sees finance, NOT child data

---

## Sprint 7 — Document & Compliance Management (Week 15–16)

**Goal:** Document upload, expiry tracking, alerts, compliance dashboard, government access.

**Stories:**

| ID    | Story                                   | Backend | Frontend |
| ----- | --------------------------------------- | ------- | -------- |
| S7-01 | Document upload with virus scanning     | ✅      | ✅       |
| S7-02 | Expiry tracking with color-coded status | ✅      | ✅       |
| S7-03 | Automated expiry alerts (BullMQ)        | ✅      | —        |
| S7-04 | Document renewal with version history   | ✅      | ✅       |
| S7-05 | Compliance dashboard per dayhome        | ✅      | ✅       |
| S7-06 | Government read-only access             | ✅      | ✅       |

**Technical tasks:**

- [ ] DocumentsModule: upload, versioning, expiry tracking
- [ ] ClamAV scan before storage (fail-open for dev)
- [ ] R2 storage with signed URLs (15 min expiry)
- [ ] BullMQ: `document-expiry-check` daily at 07:00
- [ ] Compliance status: COMPLIANT / NON_COMPLIANT per dayhome
- [ ] Government role: read-only endpoints, watermarked preview
- [ ] Web Dayhome: document upload, expiry list, renewal
- [ ] Web Admin: compliance dashboard, government view

**Definition of Done:**

- [ ] Upload → ClamAV scan → R2 → metadata saved
- [ ] Expiry alerts at 60/30/14/7 days (tested)
- [ ] Renewal preserves version history
- [ ] Compliance status accurate
- [ ] Government: read-only, no download, watermarked preview

---

## Sprint 8 — Messaging, Activities & Notifications (Week 17–18)

**Goal:** In-app messaging, announcements, activity logging, incident reports, push notifications.

**Stories:**

| ID    | Story                                      | Backend | Frontend |
| ----- | ------------------------------------------ | ------- | -------- |
| S8-01 | Thread-based messaging (parent ↔ educator) | ✅      | ✅       |
| S8-02 | Announcement broadcasts                    | ✅      | ✅       |
| S8-03 | Activity logging with photo upload         | ✅      | ✅       |
| S8-04 | Incident reports with e-signature          | ✅      | ✅       |
| S8-05 | Push notifications (FCM/APNs/Web)          | ✅      | ✅       |
| S8-06 | Notification preferences                   | ✅      | ✅       |

**Technical tasks:**

- [ ] MessagingModule: threads, messages, read receipts
- [ ] NotificationService: BullMQ queue → channel router (in-app, email, push, SMS)
- [ ] ActivityLog: type enum (meal, nap, diaper, mood, photo, note), max 5 photos
- [ ] IncidentReport: severity, e-signature acknowledgment
- [ ] Socket.io: real-time chat + badge counts
- [ ] All portals: messaging UI, activity forms, incident forms, notification settings

**Definition of Done:**

- [ ] Thread-based messaging with read receipts
- [ ] Announcements reach all enrolled families
- [ ] Activity log with photo upload, visible to parents
- [ ] Incident → parent acknowledges → record locked
- [ ] Notification preferences respected per channel/type

---

## Sprint 9 — Reporting & Analytics (Week 19–20)

**Goal:** KPI dashboard, attendance/financial/compliance/enrollment reports, CSV/PDF export, government reporting.

**Stories:**

| ID    | Story                                         | Backend | Frontend |
| ----- | --------------------------------------------- | ------- | -------- |
| S9-01 | Attendance report (daily/monthly/range)       | ✅      | ✅       |
| S9-02 | Financial report (revenue, AR aging, subsidy) | ✅      | ✅       |
| S9-03 | Compliance report (document status, expiry)   | ✅      | ✅       |
| S9-04 | Enrollment report (capacity, waitlist trends) | ✅      | ✅       |
| S9-05 | KPI dashboard                                 | ✅      | ✅       |
| S9-06 | CSV/PDF export                                | ✅      | ✅       |

**Technical tasks:**

- [ ] ReportingModule: 4 controller/service pairs
- [ ] Materialized views refreshed nightly (02:00)
- [ ] CSV export (streamed for large datasets)
- [ ] PDF export (server-side with pagination)
- [ ] Redis caching: dashboard (TTL 5 min), reports (TTL 1 h)
- [ ] Government endpoints: read-only, aggregated only (no child names)
- [ ] Web Admin: report pages with Recharts, filter bar, export buttons

**Definition of Done:**

- [ ] All 4 report types functional with filters
- [ ] Dashboard KPI cards show real data (not placeholders)
- [ ] CSV + PDF exports generate correct files
- [ ] Materialized views refresh on schedule
- [ ] Government sees only permitted data

---

## Sprint 10 — Mobile Apps, i18n & Polish (Week 21–24)

**Goal:** React Native (Expo) apps for educators + parents, i18n completion & audit, WCAG 2.1 AA final audit, deferred features.

**Stories:**

| ID     | Story                                                                  | Backend | Frontend |
| ------ | ---------------------------------------------------------------------- | ------- | -------- |
| S10-01 | Educator mobile app (check-in/out, daily board, activities, incidents) | ✅      | ✅       |
| S10-02 | Parent mobile app (notifications, child feed, messaging, invoices)     | ✅      | ✅       |
| S10-03 | Offline check-in/out (WatermelonDB)                                    | ✅      | ✅       |
| S10-04 | i18n: French locale (all strings translated)                           | —       | ✅       |
| S10-05 | WCAG 2.1 AA accessibility                                              | —       | ✅       |
| S10-06 | Performance optimization (LCP, FID, API P95)                           | ✅      | ✅       |
| S10-07 | Curriculum planning, developmental portfolios, meal plans (deferred)   | ❌      | ❌       |

**Technical tasks:**

- [ ] Mobile-specific endpoints: lightweight payloads, batch sync
- [ ] `POST /sync` for offline records
- [ ] Image optimization (resize: thumbnail 150px, mobile 600px, original)
- [ ] Educator Expo app: tab navigator, daily board, check-in/out, activities
- [ ] Parent Expo app: child feed, messages, invoices, notifications
- [ ] i18n completion: audit all pages for hardcoded strings, complete French locale file
- [ ] WCAG final audit: axe DevTools scan, screen reader testing (VoiceOver + NVDA), remediation
- [ ] Performance targets: LCP < 2.5s, FID < 100ms, API P95 < 300ms
- [ ] **Deferred**: `CurriculumPlan`, `DevelopmentalAssessment`, `MealPlan` models (P3)

**Definition of Done:**

- [ ] Both mobile apps build and run via Expo
- [ ] Offline check-in syncs when online
- [ ] French locale auto-detected, all strings translated
- [ ] axe DevTools: 0 critical/serious violations
- [ ] Performance targets met (verified with Lighthouse CI)
- [ ] All critical user journeys end-to-end tested

---

## Priority Matrix

| Priority          | Definition                         | Sprints                                              |
| ----------------- | ---------------------------------- | ---------------------------------------------------- |
| **P0 — Critical** | System cannot operate without this | S0–S5, parts of S6                                   |
| **P1 — High**     | Core value for end users           | S6–S9                                                |
| **P2 — Medium**   | Important but not blocking launch  | S10 (mobile, i18n, a11y)                             |
| **P3 — Low**      | Nice-to-have; defer if needed      | Curriculum, portfolios, meal plans, advanced reports |

## Definition of Done (All Sprints)

- [ ] Code follows C-S-R pattern (Controller → Service → Repository)
- [ ] TypeScript strict — no `any`, no `@ts-ignore`
- [ ] Frontend: Zod validation + React Hook Form
- [ ] Backend: class-validator DTOs
- [ ] All endpoints return standardized envelope (`{ success, data, meta }`)
- [ ] Error codes defined (e.g., `DAYHOME_NOT_FOUND`)
- [ ] Unit tests: 80%+ coverage on business logic
- [ ] Integration tests: new endpoints covered
- [ ] PR < 400 lines
- [ ] Swagger docs updated for new routes
- [ ] No console.log / debug code committed
- [ ] Accessibility: axe DevTools passes
- [ ] All user-visible strings use translation keys (from S1 onward)
- [ ] Migration created for schema changes
- [ ] Audit log entries created for state-changing actions
