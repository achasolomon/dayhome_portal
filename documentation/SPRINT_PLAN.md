# Spiced Childcare Unified System â€” Sprint Plan & User Stories

**Project:** Unified Spiced Childcare Management System  
**Timeline:** 4â€“6 months (10 sprints Ã— 2 weeks)  
**Budget:** ~$15,000 CAD  
**Stack:** React 18 / Next.js 14 (web) â†’ React Native / Expo (mobile) | NestJS 10 | Sequelize + PostgreSQL | Redis | Tailwind + shadcn/ui | TanStack Query + Zustand  
**Deployment:** VPS / shared hosting | no CI/CD (manual â†’ GitHub commits)

---

## Sprint 0 â€” Foundation & Architecture (Week 1â€“2)

**Goal:** Monorepo scaffold, shared packages, database, auth skeleton, deployment-ready baseline.

### User Stories

| ID    | Story                                                                                                                                                   | Acceptance Criteria                                                                                                          |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| S0-01 | **As a developer**, I want a monorepo scaffold (pnpm workspaces + Turborepo) so that all apps/packages share configs and types.                         | `pnpm dev` starts all workspaces; shared-types importable cross-package.                                                     |
| S0-02 | **As a developer**, I want Sequelize models for all core entities so that migrations are version-controlled.                                            | All 10+ models defined; first migration runs; seed scripts execute.                                                          |
| S0-03 | **As a developer**, I want the NestJS API scaffold with auth module so that JWT dual-token login works end-to-end.                                      | `POST /auth/login` returns access + refresh tokens; `POST /auth/refresh` rotates tokens; refresh stored in HTTP-only cookie. |
| S0-04 | **As a developer**, I want the shared-types package with `ApiResponse<T>`, `PaginatedResponse<T>`, `ApiError` so that all apps speak the same contract. | Frontend can consume typed API responses without manual interfaces.                                                          |
| S0-05 | **As a developer**, I want the UI kit (shadcn/ui wrappers) in `packages/ui-kit` so that all portals share design primitives.                            | Button, Input, Badge, Card, Modal, DataTable render consistently.                                                            |

### Backend Expectations

- NestJS `main.ts` with global pipes, filters, interceptors
- Sequelize module + `sequelize` injectable
- Auth module: `AuthController`, `AuthService`, `JwtAuthGuard`, `RolesGuard`, `PermissionsGuard`
- JWT secret rotation via env vars
- Rate limiting (Redis-based): 100 req/min per IP, 5 login attempts/15 min

### Frontend Expectations

- Next.js 14 App Router with route groups: `(auth)`, `(dashboard)`
- Axios client with interceptors (attach access token, auto-refresh on 401)
- Zustand `authStore` (user, accessToken, isAuthenticated) â€” no localStorage
- Protected route middleware checking refresh_token cookie

### Standard Practices

- TypeScript strict mode â€” no `any`
- Named exports only (no default exports)
- Conventional Commits: `feat/SCOPE-123-description`
- Integration tests for auth endpoints (Supertest)

---

## Sprint 1 â€” Organization & User Management (Week 3â€“4)

**Goal:** Super admin can create/manage organizations; org admins can manage staff and roles.

### User Stories

| ID    | Story                                                                                                                 | Acceptance Criteria                                                                               |
| ----- | --------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| S1-01 | **As a SUPER_ADMIN**, I want to create, update, suspend, and delete organizations so that I can manage tenants.       | Full CRUD at `POST/PATCH/DELETE /api/v1/organizations`; soft delete with `deletedAt`.             |
| S1-02 | **As an ORG_ADMIN**, I want to invite staff members with specific roles so that they can access the system.           | `POST /api/v1/organizations/staff/invite` sends email; user sets password on first login.         |
| S1-03 | **As an ORG_ADMIN**, I want to manage roles and permissions for my organization's staff so that access is controlled. | RBAC matrix UI; roles: ORG_ADMIN, ORG_MANAGER, DAYHOME_OWNER, EDUCATOR.                           |
| S1-04 | **As a user**, I want to reset my password via email so that I can recover access.                                    | `POST /auth/forgot-password` â†’ email with reset link; `POST /auth/reset-password` updates hash. |
| S1-05 | **As an ORG_ADMIN**, I want to view audit logs of all actions in my organization so that I can track changes.         | Every create/update/delete logged with userId, timestamp, before/after values.                    |

### Backend Expectations

- Organization module with Controller â†’ Service â†’ Repository
- Staff invitation flow: create user with `PENDING` status, email token
- RBAC: `@Roles()` + `@Permissions()` decorators on all protected routes
- Audit logging middleware/service

### Frontend Expectations

- Pages: Organization list, Organization detail, Staff list, Roles editor
- DataTable component with sorting/pagination
- Invite user modal with role dropdown
- Audit log table (read-only)

---

## Sprint 2 — Dayhome Management & API Intake (Week 5–6)

> **CORRECTED:** The old plan described manual dayhome registration. Dayhomes actually arrive pre-approved via an API intake webhook from the external Application Portal. See `SYSTEM_GUIDE.md` and `SPRINT_ROADMAP.md` for the authoritative plan.

**Goal:** API intake webhook, dayhome/room management, scaffold dayhome owner portal.

### User Stories

| ID    | Story                                                                                                                          | Acceptance Criteria                                                                                                                           |
| ----- | ------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------- |
| S2-01 | **As the Application Portal**, I want to push approved dayhome records via API webhook so that they are created in the system. | `POST /api/v1/dayhomes/intake` validates HMAC signature → checks idempotency key → maps fields → creates dayhome with `ACTIVE` status.        |
| S2-02 | **As an ORG_ADMIN**, I want to view dayhomes with status filters so that I can monitor my network.                             | List with filters: status, search by name/address, pagination; each item shows child count, capacity %, compliance status.                    |
| S2-03 | **As an ORG_ADMIN**, I want to manage dayhome status so that I can suspend or close non-compliant dayhomes.                    | `POST /dayhomes/:id/suspend`, `/activate`, `/close` — transitions validated; suspended dayhomes block check-ins.                              |
| S2-04 | **As an ORG_ADMIN**, I want to assign an agency liaison to a dayhome so that there is a clear point of contact.                | `PATCH /dayhomes/:id` with `liaisonUserId` field; liaison shown on dayhome detail page.                                                       |
| S2-05 | **As a Dayhome Owner**, I want to manage my rooms (name, capacity, age group) so that children can be assigned correctly.      | Full CRUD for rooms; capacity validation (cannot reduce below current enrollment); age group filter (infant, toddler, preschool, school-age). |
| S2-06 | **As a Dayhome Owner**, I want to access my dayhome dashboard and configure rooms after receiving the welcome email.           | Owner clicks welcome email → sets password → logs into dayhome portal → sees dashboard with key metrics → manages rooms.                      |

### Backend Expectations

- API intake webhook (`POST /api/v1/dayhomes/intake`): HMAC signature verification, idempotency key dedup, field mapping, create as `ACTIVE`
- Dayhome status machine: `ACTIVE ↔ SUSPENDED ↔ CLOSED` (no PENDING/DRAFT — dayhomes arrive pre-approved)
- Room capacity enforcement
- Welcome email via BullMQ on successful intake
- Agency liaison assignment
- Events emitted: `dayhome.intaken`, `dayhome.suspended`, `dayhome.activated`, `dayhome.closed`

### Frontend Expectations

- Web Admin: dayhome list with status filters, dayhome detail (liaison, status mgmt), room management, intake log
- Web Dayhome (new portal): scaffold Next.js 14 app, login page, dashboard with metrics, room management
- No registration form (dayhomes arrive via API, not manual entry)
- No approve/reject UI (handled by external portal)

---

## Sprint 3 â€” Educator Management (Week 7â€“8)

**Goal:** Educator profiles, shift scheduling, PTO/leave, work hours tracking.

### User Stories

| ID    | Story                                                                                                            | Acceptance Criteria                                                                  |
| ----- | ---------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| S3-01 | **As a DAYHOME_OWNER**, I want to add educators with their credentials so that they can be assigned to rooms.    | `POST /api/v1/educators` with profile info, certifications, background check status. |
| S3-02 | **As an EDUCATOR**, I want to view my shift schedule so that I know when to work.                                | `GET /educators/:id/schedule` returns weekly schedule; calendar view on frontend.    |
| S3-03 | **As a DAYHOME_OWNER**, I want to create recurring shift patterns for educators so that scheduling is efficient. | Weekly recurrence patterns; override support for holidays.                           |
| S3-04 | **As an EDUCATOR**, I want to request time off so that my absence is planned.                                    | PTO request â†’ approval flow; auto-checks against minimum educator-child ratio.     |
| S3-05 | **As a DAYHOME_OWNER**, I want to track educator work hours (clock-in/out) so that payroll can be calculated.    | `POST /educators/:id/time-clock` with geolocation or PIN verification.               |

### Backend Expectations

- Educator module: profiles, certifications (document upload), shift assignments
- Schedule conflict detection (same educator cannot be in two rooms)
- Ratio validation: before approving PTO, check if remaining educators meet province ratio
- Time clock with daily summary aggregation

### Frontend Expectations

- Educator profile page with credential management
- Weekly schedule grid (drag-and-drop shifts)
- PTO request form with calendar picker
- Time clock widget (clock-in/out button with timestamp)

---

## Sprint 4 â€” Family & Child Management (Week 9â€“10)

**Goal:** Family registration, child profiles, medical info, authorized pickups, enrollment.

### User Stories

| ID    | Story                                                                                                             | Acceptance Criteria                                                                          |
| ----- | ----------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| S4-01 | **As a parent**, I want to register my family profile so that I can enroll my children.                           | `POST /api/v1/families` creates parent account + family; email verification.                 |
| S4-02 | **As a parent**, I want to add my child's profile with medical info so that the dayhome has necessary details.    | Child profile: name, DOB, gender, allergies, medical notes, doctor info, emergency contacts. |
| S4-03 | **As a parent**, I want to designate authorized pickup persons so that only approved people can collect my child. | `POST /children/:id/authorized-pickups` with name, phone, photo.                             |
| S4-04 | **As an ORG_ADMIN**, I want to enroll a child in a dayhome room so that attendance tracking can begin.            | `POST /enrollments` with room assignment; checks room capacity; optional waitlist.           |
| S4-05 | **As a parent**, I want to view my child's daily information so that I stay informed.                             | Child dashboard: today's meals, naps, activities, diaper changes.                            |

### Backend Expectations

- Family module: parent-child relationship (one family, multiple children)
- Child module: comprehensive profile, medical records (encrypted at rest)
- Enrollment logic: capacity check â†’ enroll or add to waitlist
- Authorized pickup verification via PIN or photo
- Data isolation: parent can ONLY see their own children

### Frontend Expectations

- Family registration wizard
- Child profile form (multi-step with medical info section)
- Authorized pickup management with photo upload
- Enrollment flow (dayhome selection â†’ room â†’ confirm)
- Parent dashboard showing all children status

---

## Sprint 5 â€” Scheduling & Attendance (Week 11â€“12)

**Goal:** Check-in/out, daily board, attendance records, ratio monitoring.

### User Stories

| ID    | Story                                                                                                           | Acceptance Criteria                                                           |
| ----- | --------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| S5-01 | **As an EDUCATOR**, I want to check in a child each morning so that attendance is recorded.                     | `POST /attendance/check-in` records timestamp; parent gets push notification. |
| S5-02 | **As an EDUCATOR**, I want to check out a child when they leave so that the record is complete.                 | `POST /attendance/check-out` records timestamp; validates authorized pickup.  |
| S5-03 | **As an EDUCATOR**, I want to see the daily board so that I know which children are present and ratios are met. | Real-time board: children present/absent/total; current educator:child ratio. |
| S5-04 | **As a DAYHOME_OWNER**, I want to view attendance history by child, room, or date range so that I can report.   | Filterable attendance report with export (CSV/PDF).                           |
| S5-05 | **As a parent**, I want real-time notification when my child is checked in/out so that I feel informed.         | Push/SMS notification within 30 seconds of check-in/out.                      |

### Backend Expectations

- Attendance module: daily records, check-in/out with timestamps
- Ratio calculation engine (province-specific rules)
- Notification queue (BullMQ) for check-in/out alerts
- Daily summary aggregation (background job at 17:00)
- Schedule availability/booking engine for families

### Frontend Expectations

- Daily Board page (real-time via Socket.io)
- Child check-in/out modal with authorized pickup verification
- Attendance history table with date range picker
- Ratio indicator (color-coded: green/yellow/red)
- Parent attendance feed (real-time updates)

---

## Sprint 6 â€” Billing & Finance (Week 13â€“14)

**Goal:** Invoice generation from attendance, payment tracking, subsidy management, financial reports.

### User Stories

| ID    | Story                                                                                                               | Acceptance Criteria                                                                           |
| ----- | ------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| S6-01 | **As a DAYHOME_OWNER**, I want invoices auto-generated from attendance records so that billing is accurate.         | Weekly/monthly job calculates fees based on days attended; `POST /invoices/generate`.         |
| S6-02 | **As a parent**, I want to view and pay invoices online so that I can manage my payments.                           | Invoice list with status (unpaid/paid/overdue); mock payment integration (or Stripe sandbox). |
| S6-03 | **As a DAYHOME_OWNER**, I want to manage government subsidies for families so that partial payments are calculated. | Subsidy management: percentage/fixed amount; auto-applied to invoices.                        |
| S6-04 | **As an ORG_ADMIN**, I want financial reports (revenue, outstanding, subsidies) so that I can analyze finances.     | `GET /reports/financial` with date range; chart dashboard.                                    |
| S6-05 | **As a parent**, I want to see payment history for the past 12 months so that I can track expenses.                 | Transaction history with invoice references.                                                  |

### Backend Expectations

- Billing module: invoicing engine, payment records, subsidy calculations
- Background job: `invoice-generation` (weekly)
- Payment tracking (mock or Stripe integration)
- Audit trail for all financial transactions
- Decimal precision: use `Decimal` type (not float) for monetary values

### Frontend Expectations

- Invoice list view (parent and admin)
- Invoice detail with line items
- Payment history table
- Subsidy management form (admin)
- Revenue dashboard with Recharts (line chart, bar chart)

---

## Sprint 7 â€” Document & Compliance Management (Week 15â€“16)

**Goal:** Document upload, expiry tracking, compliance monitoring, alerts.

### User Stories

| ID    | Story                                                                                                                               | Acceptance Criteria                                                                      |
| ----- | ----------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| S7-01 | **As a DAYHOME_OWNER**, I want to upload compliance documents (license, insurance, certifications) so that records are centralized. | `POST /documents/upload` with document type, expiry date; stored in R2/S3.               |
| S7-02 | **As an ORG_ADMIN**, I want to view all documents with expiry dates so that I can ensure compliance.                                | Document list sorted by expiry; color-coded (green/amber/red).                           |
| S7-03 | **As an ORG_ADMIN**, I want automated alerts when documents are expiring so that renewals happen on time.                           | Alerts at 60/30/14/7 days before expiry via email + in-app.                              |
| S7-04 | **As a DAYHOME_OWNER**, I want to renew a document by uploading a new version so that I stay compliant.                             | `POST /documents/:id/renew` expires old version, creates new; version history preserved. |
| S7-05 | **As an ORG_ADMIN**, I want to view inspection history and compliance status per dayhome so that I can audit.                       | Compliance status dashboard; inspection report uploads.                                  |

### Backend Expectations

- Documents module: upload, expiry tracking, versioning
- Background job: `document-expiry-check` daily at 07:00
- File validation: MIME type check server-side, max 10MB, allowed types: PDF, JPG, PNG
- Secure file storage with access control (only authorized roles)
- Encryption at rest for sensitive documents (SIN, licenses)

### Frontend Expectations

- Document upload form with type/expiry date
- Document list with expiry progress bars
- Compliance dashboard (per dayhome)
- Renewal alert banners
- Version history panel

---

## Sprint 8 â€” Messaging & Notifications (Week 17â€“18)

**Goal:** In-app messaging, announcements, push notifications, email/SMS infrastructure.

### User Stories

| ID    | Story                                                                                                                     | Acceptance Criteria                                                                               |
| ----- | ------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| S8-01 | **As a parent**, I want to send a direct message to my child's educator so that I can communicate privately.              | Thread-based messaging; `POST /messages` creates thread or adds to existing.                      |
| S8-02 | **As a DAYHOME_OWNER**, I want to broadcast announcements to all parents so that I share important news.                  | `POST /announcements` sends to all parents of enrolled children.                                  |
| S8-03 | **As a parent**, I want to receive push notifications for check-ins, incidents, and announcements so that I stay updated. | FCM for mobile; browser push for web; Socket.io for in-app real-time.                             |
| S8-04 | **As an EDUCATOR**, I want to send daily activity updates (photos, meals, naps) to parents so that they feel connected.   | Activity log per child; photos uploaded; parents notified.                                        |
| S8-05 | **As a parent**, I want to receive incident reports with details so that I am informed of any issues.                     | Incident report form; mandatory fields: type, description, action taken; parent signed digitally. |

### Backend Expectations

- Messaging module: threads, messages, read receipts
- Notification service: BullMQ queue â†’ channel router (in-app, email, push, SMS)
- Activity log entries with photo attachments
- Incident report workflow with parent acknowledgment
- Announcements with delivery tracking

### Frontend Expectations

- In-app messaging UI (chat-style)
- Announcement composer (rich text)
- Activity log form (educator) with photo upload
- Incident report form with signature pad
- Notification preferences page

---

## Sprint 9 â€” Reporting & Analytics (Week 19â€“20)

**Goal:** Operational, financial, compliance, and enrollment reports with dashboards.

### User Stories

| ID    | Story                                                                                                                           | Acceptance Criteria                                                 |
| ----- | ------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| S9-01 | **As an ORG_ADMIN**, I want an attendance report (daily/monthly/range) so that I can analyze patterns.                          | `GET /reports/attendance` with filters; export CSV/PDF.             |
| S9-02 | **As an ORG_ADMIN**, I want a financial report (revenue by dayhome, outstanding invoices) so that I can monitor finances.       | Aggregate revenue; aging of receivables; subsidy impact analysis.   |
| S9-03 | **As an ORG_ADMIN**, I want a compliance report (document status, expiry overview) so that I can prepare for audits.            | All dayhomes compliance status; missing/expired documents flagged.  |
| S9-04 | **As an ORG_ADMIN**, I want an enrollment report (capacity utilization, waitlist) so that I can plan growth.                    | Capacity % per dayhome/room; waitlist length; trend charts.         |
| S9-05 | **As a GOVERNMENT user**, I want read-only access to compliance and enrollment data so that I can fulfill regulatory oversight. | Government role with read-only API routes; restricted data visible. |

### Backend Expectations

- Reporting module: aggregated queries (no N+1), materialized views for complex reports
- CSV/PDF export service
- Government read-only endpoints with restricted scope
- Cached report data in Redis (TTL: 1 hour)
- Background report generation for large datasets

### Frontend Expectations

- Dashboard with KPI cards (total children, attendance %, revenue, compliance %)
- Interactive charts (Recharts): line, bar, pie
- Report builder with date range, filters, export button
- Government view: read-only dashboard with limited data set
- Drill-down from summary KPI to detail table

---

## Sprint 10 â€” Mobile Apps & Polish (Week 21â€“24)

**Goal:** React Native (Expo) apps for educators and parents; i18n (EN/FR); accessibility audit; performance optimization.

### User Stories

| ID     | Story                                                                                                                           | Acceptance Criteria                                                    |
| ------ | ------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| S10-01 | **As an EDUCATOR**, I want a mobile app to check children in/out and log activities so that I can work from anywhere.           | Expo app: check-in/out, daily board, activity logging, photo upload.   |
| S10-02 | **As a parent**, I want a mobile app to receive notifications and view my child's updates so that I stay connected.             | Expo app: notifications, child feed, messaging, invoices, attendance.  |
| S10-03 | **As a French-speaking user**, I want the interface in French so that I can use the system in my preferred language.            | i18next integration; all strings translated (EN/FR); locale detection. |
| S10-04 | **As a user with disabilities**, I want the system to be WCAG 2.1 AA compliant so that I can access it.                         | axe DevTools passes; keyboard navigable; screen reader tested.         |
| S10-05 | **As an ORG_ADMIN**, I want the mobile app to work offline for check-in/out so that connectivity issues don't block operations. | WatermelonDB offline cache; sync queue when online.                    |

### Backend Expectations

- Mobile-specific API endpoints optimized for low-bandwidth
- Offline sync endpoint with conflict resolution (last-write-wins with timestamp)
- Push notification registration (FCM/APNs tokens)
- Image optimization/resizing for mobile uploads

### Frontend (Mobile) Expectations

- Expo Router for navigation
- Shared Zustand stores with web (via monorepo packages)
- Offline-first architecture: cache check-ins locally, sync when online
- Biometric authentication (expo-local-authentication)
- Shared UI components from `packages/ui-kit` adapted for React Native

### Cross-Cutting (All Sprints)

- **i18n:** All user-visible strings through react-i18next from Sprint 1 (add FR locale progressively)
- **Accessibility:** Semantic HTML, aria attributes, keyboard navigation from Sprint 0
- **Security:** Input validation (frontend Zod + backend class-validator), rate limiting, audit logs
- **Testing:** Unit tests (Jest) for services; integration tests (Supertest) for API; component tests (RTL) for UI
- **Docs:** Swagger/OpenAPI auto-generated; README per module; env documented in `.env.example`

---

## Priority Matrix (P0â€“P3)

| Priority            | Definition                         | Sprints                          |
| ------------------- | ---------------------------------- | -------------------------------- |
| **P0 â€” Critical** | System cannot operate without this | S0â€“S5, parts of S6             |
| **P1 â€” High**     | Core value for end users           | S6â€“S8                          |
| **P2 â€” Medium**   | Important but not blocking launch  | S9â€“S10                         |
| **P3 â€” Low**      | Nice to have; defer if needed      | Mobile offline, advanced reports |

---

## Definition of Done (DoD)

- [ ] Code follows engineering guide patterns (Controller â†’ Service â†’ Repository)
- [ ] TypeScript strict â€” no `any`, no `@ts-ignore`
- [ ] Frontend: Zod validation + React Hook Form
- [ ] Backend: class-validator DTOs
- [ ] All API endpoints return standardized envelope (`{ success, data, meta }`)
- [ ] Error responses use defined error codes (e.g., `DAYHOME_NOT_FOUND`)
- [ ] Unit tests pass (80%+ coverage on business logic)
- [ ] Integration tests pass for new endpoints
- [ ] PR < 400 lines changed
- [ ] Swagger docs updated for new routes
- [ ] No console.log / debug code committed
- [ ] Accessibility: axe DevTools passes
- [ ] All user-visible strings use translation keys
- [ ] Migration created for schema changes
- [ ] Audit log entries created for state-changing actions

---

## DEPRECATION NOTICE

**This sprint plan is superseded.** It contained architectural assumptions (manual dayhome registration) that do not match the actual system requirements.

### Replacement Documents

| Document                        | File                   |
| ------------------------------- | ---------------------- |
| System Architecture & Workflows | `SYSTEM_GUIDE.md`      |
| Corrected Sprint Roadmap        | `SPRINT_ROADMAP.md`    |
| Developer Setup Guide           | `DEVELOPMENT_GUIDE.md` |

### Key Corrections

1. Dayhome onboarding: **API intake webhook** from external Application Portal (not manual registration)
2. Status machine: No `PENDING` — dayhomes arrive pre-approved as `ACTIVE`
3. Digital health screening added to check-in flow
4. Billing-only role added to RBAC
5. Government submission flow added to reporting
6. Curriculum/portfolios/meal plans deferred to P3

_This file retained for reference only._
