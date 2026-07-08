# Sprint 3 — Educator Management

**Duration:** Week 7–8  
**Goal:** Educator profiles, shift scheduling, PTO/leave management, work hours tracking, performance monitoring.

---

## IN SCOPE

| ID    | Deliverable                                                        | Backend | Frontend |
| ----- | ------------------------------------------------------------------ | ------- | -------- |
| S3-01 | Educator CRUD with profile info, certifications, background check  | ✅      | ✅       |
| S3-02 | Shift scheduling: weekly patterns with overflow/override support   | ✅      | ✅       |
| S3-03 | PTO request → approval with educator:child ratio validation        | ✅      | ✅       |
| S3-04 | Time clock: clock-in/out with timestamps, daily summary            | ✅      | ✅       |
| S3-05 | Certification tracking with expiry dates and auto-alerts           | ✅      | —        |
| S3-06 | `@OrganizationAccess()` guard implementation on educator endpoints | ✅      | —        |

## NOT IN SCOPE

- ❌ No family, child, attendance, billing, document, messaging, or report features
- ❌ No mobile apps
- ❌ No payroll calculation (hours tracked but not linked to payment)
- ❌ No educator self-service portal beyond schedule view + PTO request
- ❌ No automatic shift generation (patterns set by owner, not AI-suggested)

## STANDARD PRACTICES (Mandatory)

- **TypeScript strict** — no `any`, no `@ts-ignore`, no `as unknown` casts outside test files
- **`CreationAttributes<Model>`** for Sequelize creates; **`WhereOptions`** for where clauses
- **`C-S-R pattern`**: Controller → Service → Repository
- **DTOs**: `class-validator` on backend; Zod on frontend
- **i18n**: Every user-visible string uses `useTranslation()` + `t('key')`
- **Soft delete**: `paranoid: true` on entities
- **Rate limiting**: `/time-clock/clock-in` limited to 1 per 5 seconds
- **Caching**: Current day's schedule cached in Redis (TTL: 5 min)
- **Swagger**: All new endpoints documented
- **Migrations**: Every schema change has a migration
- **Event-driven**: PTO approvals/rejections, schedule changes, time corrections emit events
- **Data isolation**: Educator can only see own schedule (role scoping via `@OrganizationAccess()`)

## User Stories

| ID    | Story                                                                                                                      | Acceptance Criteria                                                                                                                 |
| ----- | -------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| S3-01 | **As a DAYHOME_OWNER**, I want to add educators with their credentials so that they can be assigned to rooms and children. | `POST /api/v1/educators` with profile info (name, email, phone), certifications (first aid, police check), background check status. |
| S3-02 | **As an EDUCATOR**, I want to view my shift schedule so that I know when to work and which room I'm assigned to.           | `GET /educators/:id/schedule` returns weekly/monthly calendar view; shows room assignment per shift.                                |
| S3-03 | **As a DAYHOME_OWNER**, I want to create recurring shift patterns for educators so that scheduling is efficient.           | Weekly recurrence templates (e.g., Monâ€“Fri 8amâ€“4pm); exception/override support for holidays and training days.                 |
| S3-04 | **As an EDUCATOR**, I want to request time off so that my absence is planned and the ratio is maintained.                  | PTO request â†’ approval flow; auto-checks if remaining educators meet minimum educator:child ratio before approving.               |
| S3-05 | **As a DAYHOME_OWNER**, I want to track educator work hours (clock-in/out) so that payroll calculations are accurate.      | `POST /educators/:id/time-clock/clock-in` and `/clock-out` with timestamp; admin can view/export hours.                             |
| S3-06 | **As a DAYHOME_OWNER**, I want to manage educator certifications and get expiry alerts so that compliance is never missed. | Certification tracking with expiry dates; alerts at 60/30/14 days before expiry; re-upload on renewal.                              |

---

## Backend Expectations

- **Educator module**: Profiles, certifications (document links + expiry), shift assignments, time clock.
- **Shift scheduling**: Weekly patterns stored as JSON or separate `ShiftPattern` table; override support via `ScheduleOverride`.
- **PTO validation**: `createPtoRequest()` queries all educators in the same dayhome for the same date range; counts available educators; rejects if ratio would fall below minimum.
- **Time clock**: Simple clock-in/out with timestamps; daily summary aggregated via cron job at midnight; cannot clock in twice without clocking out.
- **Educator:child ratios**: Province-specific rules from organization settings; enforced during scheduling and PTO approval.
- **Soft delete**: Educator soft-deleted; active enrollments prevent deletion.

### Educator Module Structure

```
modules/educator/
|-- educator.module.ts
|-- educator.controller.ts
|-- educator.service.ts
|-- educator.repository.ts
|-- dto/
|   |-- create-educator.dto.ts
|   |-- update-educator.dto.ts
|   |-- shift-pattern.dto.ts
|   |-- pto-request.dto.ts
|   |-- time-clock.dto.ts
|   |__ educator-query.dto.ts
|-- entities/
|   |-- educator.entity.ts
|   |-- shift-pattern.entity.ts
|   |-- pto-request.entity.ts
|   |__ time-clock.entity.ts
|-- guards/
|   |__ educator-access.guard.ts
|__ educator.spec.ts
```

---

## Frontend Expectations

- **Pages**:
  - `/educators` â€” Educator list (dayhome owner); filterable by status (active, on leave, terminated)
  - `/educators/[id]` â€” Educator profile with certifications, schedule, hours
  - `/educators/new` â€” Add educator form
  - `/scheduling` â€” Weekly schedule grid for entire dayhome (owner view)
  - `/educators/[id]/schedule` â€” Personal schedule (educator view)
- **Components**:
  - `ShiftGrid` â€” Weekly calendar; drag-and-drop to assign/override shifts
  - `PtoRequestCard` â€” Request form with date range picker, reason, status badge
  - `TimeClockWidget` â€” Large clock-in/clock-out button with current status indicator
  - `HourSummaryTable` â€” Total regular / overtime hours per week/month
  - `CertificationBadge` â€” Certification name with expiry date and color status
- **State**: Educator list, schedules, time clock data via TanStack Query; real-time clock via Socket.io.

---

## Standard Practices

| Area           | Practice                                                                          |
| -------------- | --------------------------------------------------------------------------------- |
| Shift patterns | Stored as JSON `{ dayOfWeek, startTime, endTime, roomId }`; validated for overlap |
| PTO validation | Ratio check uses `educatorCount - pendingPtoCount > minimumRequired`              |
| Time entries   | Immutable after 24h; corrections require `PATCH` with manager approval            |
| Rate limiting  | `/time-clock/clock-in` limited to 1 per 5 seconds to prevent double-taps          |
| Caching        | Current day's schedule cached in Redis (TTL: 5 min) for fast daily board loading  |
| Audit          | All PTO approvals/rejections, schedule changes, time corrections logged           |

---

## Definition of Done

- [ ] Educator CRUD with certification tracking
- [ ] Shift pattern creation with weekly recurrence
- [ ] Schedule override support
- [ ] PTO request â†’ approval/rejection with ratio validation
- [ ] Time clock clock-in/out functional
- [ ] Hour summary calculated (regular vs overtime)
- [ ] Certification expiry alerts queued (BullMQ)
- [ ] Integration tests: schedule conflict detection, ratio check on PTO
- [ ] Frontend: schedule grid, time clock widget, PTO flow working
- [ ] Educator can only see their own schedule (role scoping)
