# Sprint 2 — Dayhome Management & API Intake

**Duration:** Week 5–6
**Goal:** API intake webhook receives pre-approved dayhomes from the external Application Portal; dayhome and room management; scaffold dayhome owner portal.

---

## User Stories

| ID    | Story                                                                                                                          | Acceptance Criteria                                                                                                                                             |
| ----- | ------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| S2-01 | **As the Application Portal**, I want to push approved dayhome records via API webhook so that they are created in the system. | `POST /api/v1/dayhomes/intake` validates HMAC signature → checks idempotency key → maps fields → creates dayhome with `ACTIVE` status. Invalid records flagged. |
| S2-02 | **As an ORG_ADMIN**, I want to view dayhomes with status filters so that I can monitor my network.                             | List with filters: status, search by name/address, pagination; each item shows child count, capacity %, compliance status.                                      |
| S2-03 | **As an ORG_ADMIN**, I want to manage dayhome status so that I can suspend or close non-compliant dayhomes.                    | `POST /dayhomes/:id/suspend`, `/activate`, `/close` — transitions validated; suspended dayhomes block check-ins.                                                |
| S2-04 | **As an ORG_ADMIN**, I want to assign an agency liaison to a dayhome so that there is a clear point of contact.                | `PATCH /dayhomes/:id` with `liaisonUserId` field; liaison shown on dayhome detail page.                                                                         |
| S2-05 | **As a Dayhome Owner**, I want to manage my rooms (name, capacity, age group) so that children can be assigned correctly.      | Full CRUD for rooms; capacity validation (cannot reduce below current enrollment); age group filter (infant, toddler, preschool, school-age).                   |
| S2-06 | **As a Dayhome Owner**, I want to access my dayhome dashboard and configure rooms after receiving the welcome email.           | Owner clicks welcome email → sets password → logs into dayhome portal → sees dashboard with key metrics → manages rooms.                                        |

---

## Backend Expectations

- **API intake webhook** (`POST /api/v1/dayhomes/intake`):
  - **HMAC signature verification**: `Signature: sha256=<hex-digest>` header; recompute HMAC-SHA256 on raw body using shared secret; reject mismatches with 401 `INTAKE_SIGNATURE_INVALID`.
  - **Idempotency key**: `Idempotency-Key: <externalId-or-uuid>` header; deduplicate by key; return existing record with 409 `INTAKE_DUPLICATE` if key already processed; keys retained 30+ days.
  - **Payload fields**: externalId, businessName, ownerName, ownerEmail, ownerPhone, address, approvedCapacity, licenseNumber, licenseExpiryDate, insuranceProvider, insuranceExpiryDate, inspectionDate, inspectionResult.
  - **Validation**: Validate required fields; map to internal model; create dayhome with `ACTIVE` status. Invalid payloads → flagged for manual review (not rejected).
- **Dayhome status machine**: `ACTIVE ↔ SUSPENDED ↔ CLOSED`. No `DRAFT` or `PENDING` — dayhomes arrive pre-approved. Transitions validated in service layer.
- **Room capacity enforcement**: Before approving a room capacity change, check that no enrollment exceeds the new limit.
- **Welcome email**: Sent via BullMQ queue on successful intake; contains account setup link for owner.
- **Agency liaison**: Optional `liaisonUserId` on dayhome; authorized staff member assigned as point of contact.
- **Events emitted**: `dayhome.intaken`, `dayhome.suspended`, `dayhome.activated`, `dayhome.closed` via `EventEmitter2` for audit logging + notification triggers.
- **Authorization**: `@OrganizationAccess()` guard ensures user's `orgId` matches the dayhome's `organizationId`.

### Dayhome Module Structure

```
modules/dayhome/
|-- dayhome.module.ts
|-- dayhome.controller.ts
|-- dayhome.service.ts
|-- dayhome.repository.ts
|-- dto/
|   |-- intake-dayhome.dto.ts
|   |-- update-dayhome.dto.ts
|   |-- dayhome-query.dto.ts
|   |-- status-transition.dto.ts
|   |-- create-room.dto.ts
|   |__ update-room.dto.ts
|-- entities/
|   |-- dayhome.entity.ts
|   |-- room.entity.ts
|   |__ dayhome-status.enum.ts
|-- guards/
|   |__ intake-signature.guard.ts
|__ dayhome.spec.ts
```

---

## Frontend Expectations

### Web Admin (`apps/web-admin`)

- **Pages**:
  - `/dayhomes` — Dayhome list with status filters, search, pagination
  - `/dayhomes/[id]` — Dayhome detail (info, metrics, liaison assignment, status management)
  - `/dayhomes/[id]/rooms` — Room management (CRUD, capacity bars)
  - `/dayhomes/intake-log` — Audit trail of API-received dayhomes (successful + flagged records)
- **Components**:
  - `DayhomeCard` — Summary card with status badge, capacity bar, compliance icon
  - `StatusBadge` — Color-coded: ACTIVE (green), SUSPENDED (orange), CLOSED (red)
  - `RoomCard` — Name, capacity (X/Y), age group label
  - `IntakeLogTable` — Filterable list of intake webhook requests
  - `StatusTransitionModal` — Confirm suspend/activate/close with reason
- **State**: Dayhome list cached via TanStack Query; mutations invalidate on success with toast feedback.

### Web Dayhome (`apps/web-dayhome`) — First Portal Build

- Scaffold Next.js 14 app with same stack (Tailwind, ui-kit, Zustand, TanStack Query, React Hook Form + Zod)
- **Pages**:
  - `/login` — Dayhome owner login
  - `/dashboard` — Daily snapshot (enrolled count, capacity %, upcoming expiries)
  - `/rooms` — Room management (owner view)
- **Components**:
  - `DashboardMetricCard` — KPI card for key metrics
  - `RoomCard` — Room summary with enrolled/capacity bar
- **Auth**: JWT middleware, Zustand auth store, axios client with auto-refresh

---

## Standard Practices

| Area               | Practice                                                                                                                                         |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| Webhook security   | HMAC-SHA256 signature verification on intake endpoint; reject without valid signature                                                            |
| Idempotency        | `Idempotency-Key` deduplication; keys retained 30+ days; returns existing record on duplicate                                                    |
| Status transitions | Service method validates current status before transitioning; throws `BadRequestException` for invalid transitions (e.g., SUSPENDED → SUSPENDED) |
| Capacity display   | Always shown as `enrolled / capacity` with visual bar (green < 80%, yellow 80–95%, red >= 95%)                                                   |
| Event-driven       | Audit logs and notifications triggered via events, not inline in service methods                                                                 |
| Soft delete        | Dayhome `deletedAt` cascade soft-deletes related rooms, educators, enrollments                                                                   |
| Rate limiting      | `POST /dayhomes/intake` limited to 60 req/min per IP (external system); other dayhome endpoints 100 req/min per user                             |

---

## Definition of Done

- [ ] API intake webhook: invalid signature → 401, duplicate key → 409 (returns existing), bad payload → 422 (flagged for review)
- [ ] Valid intake creates dayhome as `ACTIVE` with proper field mapping
- [ ] Invalid payloads flagged for manual review (visible in intake log)
- [ ] Dayhome status transitions: ACTIVE ↔ SUSPENDED ↔ CLOSED (no PENDING/DRAFT)
- [ ] Room CRUD with capacity validation (cannot reduce below enrollment)
- [ ] Welcome email sends via BullMQ on successful intake
- [ ] Agency liaison assignable on dayhome
- [ ] Events emitted on all status transitions
- [ ] Audit logs recorded for all dayhome state changes
- [ ] Web Dayhome portal scaffolded with login, dashboard, room management
- [ ] Web Admin: dayhome list, detail, room management, intake log working
- [ ] Integration tests: valid intake → dayhome created; suspend → blocks child check-in
- [ ] i18n: strings extracted for EN (FR ready for future)
