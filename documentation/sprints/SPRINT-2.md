# Sprint 2 — Dayhome Management & API Intake

**Duration:** Week 5–6  
**Goal:** Full dayhome intake lifecycle — webhook receives pre-approved dayhomes from the external Application Portal, stores documents, syncs via callback endpoints; dayhome and room management in web-admin; scaffold dayhome owner portal.

---

## IN SCOPE

| ID    | Deliverable                                                                                                               | Backend | Frontend | Tests      |
| ----- | ------------------------------------------------------------------------------------------------------------------------- | ------- | -------- | ---------- |
| S2-01 | Dayhome model restructure — expanded schema to match portal payload + raw JSON storage + migration                        | ✅      | —        | ✅ BE      |
| S2-02 | API intake webhook: `POST /api/v1/dayhomes/intake` with HMAC sig, idempotency, field mapping, DAYHOME_OWNER user creation | ✅      | —        | ✅ BE      |
| S2-03 | Document download + storage — intake fetches files from signed URLs, stores in R2/MinIO, creates document records         | ✅      | —        | ✅ BE      |
| S2-04 | Callback endpoints (portal → system): status, compliance, educator-profile, documents updates via HMAC                    | ✅      | —        | ✅ BE      |
| S2-05 | Dayhome list + detail: `GET /api/v1/dayhomes`, `GET /api/v1/dayhomes/:id` with status filters, search, pagination         | ✅      | ✅       | ✅ BE + FE |
| S2-06 | Dayhome status transitions: `POST /dayhomes/:id/suspend`, `/activate`, `/close` + status callback handler                 | ✅      | ✅       | ✅ BE + FE |
| S2-07 | Agency liaison assignment: `PATCH /dayhomes/:id` with `liaisonUserId`                                                     | ✅      | ✅       | ✅ BE + FE |
| S2-08 | Room CRUD: full CRUD for rooms under a dayhome with capacity validation                                                   | ✅      | ✅       | ✅ BE + FE |
| S2-09 | Welcome email + owner account setup flow via BullMQ                                                                       | ✅      | —        | ✅ BE      |
| S2-10 | Web Dayhome portal scaffold (Next.js 14, Tailwind, ui-kit, Zustand, TanStack Query, login, dashboard)                     | —       | ✅       | ✅ FE      |

## NOT IN SCOPE

- ❌ No manual dayhome registration form (dayhomes arrive pre-approved via webhook only)
- ❌ No `PENDING` or `DRAFT` dayhome status — dayhomes arrive as `ACTIVE`
- ❌ No educator, family, child, attendance, billing, messaging, or report features
- ❌ No mobile apps
- ❌ No multi-tenant organization changes (single-tenant remains)
- ❌ No `@OrganizationAccess()` guard implementation (Sprint 3)
- ❌ No outbound callbacks to portal beyond status/compliance/educator-profile/document endpoints

## STANDARD PRACTICES (Mandatory)

- **TypeScript strict** — no `any`, no `@ts-ignore`, no `as unknown` casts outside test files
- **`CreationAttributes<Model>`** for Sequelize creates; **`WhereOptions`** for where clauses
- **`C-S-R pattern`**: Controller → Service → Repository
- **DTOs**: `class-validator` on backend; Zod on frontend
- **i18n**: Every user-visible string uses `useTranslation()` + `t('key')`
- **Soft delete**: `paranoid: true` on entities
- **Rate limiting**: 20 req/min globally (all endpoints share global throttle)
- **Transactional emails**: Queued via BullMQ
- **Swagger**: All new endpoints documented
- **Migrations**: Every schema change has a migration
- **Error codes**: All thrown exceptions use defined error codes from `ERROR_CODES` in `shared-types`
- **Event-driven**: State changes emit events for audit logging + notification triggers
- **HMAC webhook security**: Signature verification on intake endpoint + callback endpoints; reject mismatches with 401
- **Idempotency**: `Idempotency-Key` header deduplication on intake; keys retained 30 days
- **Payload source-of-truth**: Raw intake JSON stored alongside extracted fields for audit

### Testing Requirements

- **Framework**: Jest (backend), Jest + React Testing Library (frontend)
- **API tests**: Supertest for all endpoint integration tests
- **Coverage target**: ≥80% line coverage per module
- **Test patterns**: Unit tests for services/repositories; integration tests for controllers/endpoints
- **Per-item expectations**: Each deliverable must have happy-path, validation-error, auth/permission-denial, and edge-case tests
- **CI enforcement**: `pnpm test:cov` must pass before merge; lint + typecheck gates

---

## User Stories

| ID    | Story                                                                                                                          | Acceptance Criteria                                                                                                                                                   |
| ----- | ------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| S2-01 | **As a developer**, I want a Dayhome model that matches the Application Portal payload so that data maps accurately.           | Model covers all intake payload fields; raw JSON stored for audit; migration created.                                                                                 |
| S2-02 | **As the Application Portal**, I want to push approved dayhome records via API webhook so that they are created in the system. | HMAC signature validated → idempotency key checked → fields mapped → user created as `DAYHOME_OWNER` → dayhome created with `ACTIVE` status. Invalid records flagged. |
| S2-03 | **As the system**, I want to download documents from signed URLs automatically so that they persist in our storage.            | Intake endpoint fetches each `downloadUrl`, stores file in R2/MinIO, creates document record with correct category.                                                   |
| S2-04 | **As the Application Portal**, I want to push status/compliance/profile/document updates so that the system stays in sync.     | 4 callback endpoints accept HMAC-signed requests; validate payload → update dayhome accordingly; return 200 on success.                                               |
| S2-05 | **As an ORG_ADMIN**, I want to view dayhomes with status filters so that I can monitor my network.                             | List with filters: status, search by name/address, pagination; each item shows child count, capacity %, compliance status.                                            |
| S2-06 | **As an ORG_ADMIN**, I want to manage dayhome status so that I can suspend or close non-compliant dayhomes.                    | `POST /dayhomes/:id/suspend`, `/activate`, `/close` — transitions validated; suspended dayhomes block check-ins.                                                      |
| S2-07 | **As an ORG_ADMIN**, I want to assign an agency liaison to a dayhome so that there is a clear point of contact.                | `PATCH /dayhomes/:id` with `liaisonUserId` field; liaison shown on dayhome detail page.                                                                               |
| S2-08 | **As a Dayhome Owner**, I want to manage my rooms so that children can be assigned correctly.                                  | Full CRUD for rooms; capacity validation (cannot reduce below current enrollment); age group filter.                                                                  |
| S2-09 | **As a Dayhome Owner**, I want to access my dayhome dashboard after receiving the welcome email.                               | Owner clicks welcome email → sets password → logs into dayhome portal → sees dashboard with key metrics → manages rooms.                                              |

---

## Backend Expectations

### Dayhome Model Restructure (S2-01)

Current `dayhome.model.ts` is flat. New schema mirrors the portal payload:

**Dayhome table additions:**

| Column                       | Type                                            | Notes                                       |
| ---------------------------- | ----------------------------------------------- | ------------------------------------------- |
| `externalId`                 | `STRING(50)`                                    | Unique, from portal                         |
| `rawPayload`                 | `JSONB`                                         | Full intake payload for audit               |
| `educatorFirstName`          | `STRING(100)`                                   | Mapped to `DAYHOME_OWNER` user              |
| `educatorLastName`           | `STRING(100)`                                   |                                             |
| `educatorEmail`              | `STRING(255)`                                   |                                             |
| `educatorPhone`              | `STRING(20)`                                    |                                             |
| `addressLine1`               | `STRING(255)`                                   |                                             |
| `addressCity`                | `STRING(100)`                                   |                                             |
| `addressProvince`            | `STRING(2)`                                     |                                             |
| `addressPostalCode`          | `STRING(7)`                                     |                                             |
| `addressFull`                | `TEXT`                                          |                                             |
| `homeType`                   | `ENUM('house','apartment','townhouse','other')` |                                             |
| `homeOwnership`              | `ENUM('own','rent','other')`                    |                                             |
| `fencedBackyard`             | `BOOLEAN`                                       |                                             |
| `smokingStatus`              | `ENUM('yes','no','outdoor_only')`               |                                             |
| `hasPets`                    | `BOOLEAN`                                       |                                             |
| `homeResidentsCount`         | `INTEGER`                                       |                                             |
| `eveningOvernightCare`       | `BOOLEAN`                                       |                                             |
| `currentCapacity`            | `INTEGER`                                       |                                             |
| `maximumCapacity`            | `INTEGER`                                       |                                             |
| `operatingHoursStart`        | `TIME`                                          |                                             |
| `operatingHoursEnd`          | `TIME`                                          |                                             |
| `childcareLevel`             | `STRING(100)`                                   |                                             |
| `languagesSpoken`            | `STRING(255)`                                   |                                             |
| `childcareEducation`         | `TEXT`                                          |                                             |
| `specializations`            | `JSONB`                                         | Array of strings                            |
| `certificateNumber`          | `STRING(100)`                                   | License certificate #                       |
| `licenseIssueDate`           | `DATE`                                          |                                             |
| `licenseExpiryDate`          | `DATE`                                          |                                             |
| `licenseStatus`              | `STRING(20)`                                    |                                             |
| `submittedAt`                | `DATE`                                          | Timeline                                    |
| `approvedAt`                 | `DATE`                                          |                                             |
| `activatedAt`                | `DATE`                                          |                                             |
| `nextComplianceDue`          | `DATE`                                          |                                             |
| `inspectionConductedAt`      | `DATE`                                          | Final inspection                            |
| `inspectionResult`           | `ENUM('pass','conditional','fail')`             |                                             |
| `inspectionScore`            | `DECIMAL(5,1)`                                  |                                             |
| `inspectionItemsPassed`      | `INTEGER`                                       |                                             |
| `inspectionItemsFailed`      | `INTEGER`                                       |                                             |
| `inspectionCriticalFailures` | `INTEGER`                                       |                                             |
| `inspectionSummary`          | `TEXT`                                          |                                             |
| `inspectionInspectorName`    | `STRING(255)`                                   |                                             |
| `profileItems`               | `JSONB`                                         | Array of profile items with expiry tracking |

**IntakeLog table:**

| Column               | Type                                            | Notes                      |
| -------------------- | ----------------------------------------------- | -------------------------- |
| `id`                 | `UUID`                                          | PK                         |
| `externalId`         | `STRING(50)`                                    | From request               |
| `idempotencyKey`     | `STRING(255)`                                   | From header                |
| `status`             | `ENUM('success','flagged_for_review','failed')` |                            |
| `signatureValid`     | `BOOLEAN`                                       |                            |
| `validationErrors`   | `JSONB`                                         | Array of errors if flagged |
| `rawRequestBody`     | `JSONB`                                         | Full request body          |
| `responseStatusCode` | `INTEGER`                                       |                            |
| `dayhomeId`          | `UUID (nullable)`                               | FK if created              |
| `createdAt`          | `DATE`                                          |                            |

### API Intake Webhook (S2-02)

- **HMAC verification**: `Signature: sha256=<hex-digest>` header; recompute HMAC-SHA256 on raw body using shared secret; reject mismatches with 401 `INTAKE_SIGNATURE_INVALID`.
- **Replay protection**: `X-Timestamp` header; reject requests older than 5 minutes.
- **Idempotency**: `Idempotency-Key: {externalId}` header; deduplicate by key; return existing with 409 `INTAKE_DUPLICATE`; keys retained 30 days.
- **Payload mapping**: `educator` block → create `User` with `DAYHOME_OWNER` role + `WelcomeEmail` job; remaining fields → dayhome record.
- **Validation**: Required fields validated; invalid payloads → flagged for manual review (status `flagged_for_review`, not rejected).
- **Response**: 201 on success, 401 bad signature, 409 duplicate, 422 validation error.

### Document Download + Storage (S2-03)

- On successful intake, iterate `documents[]` array.
- For each document with a valid `downloadUrl`:
  1. HTTP fetch the file (signed URL, 24h validity).
  2. Store in R2/MinIO via `StorageService`.
  3. Create `Document` record with metadata + file reference.
  4. Handle failures gracefully (log + flag for manual retry, don't fail the intake).

### Callback Endpoints (S2-04)

All callbacks are HMAC-signed (same shared secret, `X-Timestamp` for replay protection):

| Endpoint                                | Purpose                              | Key action                                        |
| --------------------------------------- | ------------------------------------ | ------------------------------------------------- |
| `POST /api/v1/internal/status`          | Status change from portal            | Update dayhome status, emit event                 |
| `POST /api/v1/internal/compliance`      | Compliance inspection completed      | Store inspection result, update nextComplianceDue |
| `PUT /api/v1/internal/educator-profile` | Capacity/hours/specialization change | Update dayhome operational fields                 |
| `POST /api/v1/internal/documents`       | Document expired/renewed/replaced    | Update document status, upload new file           |

### Status Machine

`ACTIVE ↔ SUSPENDED ↔ CLOSED` — transitions validated in service layer via `DAYHOME_STATUS_TRANSITIONS` from `shared-constraints`.

### Dayhome Module Structure

```
modules/dayhome/
├── dayhome.module.ts
├── dayhome.controller.ts
├── dayhome.service.ts
├── dayhome.repository.ts
├── dto/
│   ├── intake-dayhome.dto.ts
│   ├── update-dayhome.dto.ts
│   ├── dayhome-query.dto.ts
│   ├── status-transition.dto.ts
│   ├── callback-status.dto.ts
│   ├── callback-compliance.dto.ts
│   ├── callback-educator-profile.dto.ts
│   ├── callback-documents.dto.ts
│   ├── create-room.dto.ts
│   └── update-room.dto.ts
├── entities/
│   ├── dayhome.entity.ts
│   ├── room.entity.ts
│   ├── intake-log.entity.ts
│   └── dayhome-status.enum.ts
├── guards/
│   ├── intake-signature.guard.ts
│   └── callback-signature.guard.ts
└── dayhome.spec.ts
```

---

## Frontend Expectations

### Web Admin (`apps/web-admin`)

- **Pages**:
  - `/dayhomes` — Dayhome list with status filters, search, pagination
  - `/dayhomes/[id]` — Dayhome detail (full info, metrics, liaison assignment, status management)
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

| Area               | Practice                                                                                                           |
| ------------------ | ------------------------------------------------------------------------------------------------------------------ |
| Webhook security   | HMAC-SHA256 signature verification on intake + callback endpoints; reject without valid signature                  |
| Replay protection  | `X-Timestamp` header; reject requests older than 5 minutes                                                         |
| Idempotency        | `Idempotency-Key` deduplication; keys retained 30 days; returns existing record on duplicate                       |
| Status transitions | Service method validates current status before transitioning; throws `BadRequestException` for invalid transitions |
| Capacity display   | Always shown as `enrolled / capacity` with visual bar (green < 80%, yellow 80–95%, red >= 95%)                     |
| Event-driven       | Audit logs and notifications triggered via events, not inline in service methods                                   |
| Soft delete        | Dayhome `deletedAt` cascade soft-deletes related rooms, educators, enrollments                                     |
| Rate limiting      | 20 req/min globally (all endpoints share global throttle)                                                          |
| Document storage   | Files fetched from signed URLs within 24h; stored in R2/MinIO via StorageService                                   |
| Source of truth    | Our system stores authoritative dayhome data; raw payload preserved for audit                                      |

---

## Definition of Done

- [ ] Dayhome model expanded with all intake payload fields + raw JSON storage
- [ ] Migration created for model changes + intake_logs table
- [ ] API intake webhook: invalid signature → 401, duplicate key → 409 (returns existing), bad payload → 422 (flagged for review)
- [ ] Valid intake creates dayhome as `ACTIVE` + user as `DAYHOME_OWNER`
- [ ] Documents downloaded from signed URLs and stored in R2/MinIO
- [ ] 4 callback endpoints accepting HMAC-signed updates
- [ ] Dayhome status transitions: ACTIVE ↔ SUSPENDED ↔ CLOSED
- [ ] Room CRUD with capacity validation (cannot reduce below enrollment)
- [ ] Welcome email sends via BullMQ on successful intake
- [ ] Agency liaison assignable on dayhome
- [ ] Events emitted on all status transitions
- [ ] Audit logs recorded for all dayhome state changes
- [ ] Web Dayhome portal scaffolded with login, dashboard, room management
- [ ] Web Admin: dayhome list, detail, room management, intake log working
- [ ] Integration tests: valid intake → dayhome created; suspend → blocks child check-in
- [ ] i18n: strings extracted for EN (FR ready for future)
