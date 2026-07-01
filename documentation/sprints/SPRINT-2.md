# Sprint 2 â€” Dayhome Management

**Duration:** Week 5â€“6  
**Goal:** Dayhome registration, approval workflow, room management, capacity tracking, license management.

---

## User Stories

| ID    | Story                                                                                                                           | Acceptance Criteria                                                                                                                           |
| ----- | ------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| S2-01 | **As a DAYHOME_OWNER**, I want to register my dayhome with details (name, address, capacity, license) so that it can be listed. | Multi-step form: info â†’ address â†’ license upload â†’ review; `POST /api/v1/dayhomes` creates with `PENDING` status.                       |
| S2-02 | **As an ORG_ADMIN**, I want to approve or reject a dayhome application so that only qualified dayhomes operate.                 | `POST /dayhomes/:id/approve` â†’ status to `ACTIVE`; `POST /dayhomes/:id/reject` â†’ status to `REJECTED` with rejection reason.              |
| S2-03 | **As a DAYHOME_OWNER**, I want to suspend my dayhome temporarily so that I can manage closures or renovations.                  | `POST /dayhomes/:id/suspend` â†’ status `SUSPENDED`; children cannot be checked in; parents notified.                                         |
| S2-04 | **As a DAYHOME_OWNER**, I want to manage rooms (name, capacity, age group) so that children can be assigned correctly.          | Full CRUD for rooms; capacity validation (cannot reduce below current enrollment); age group filter (infant, toddler, preschool, school-age). |
| S2-05 | **As an ORG_ADMIN**, I want to view all dayhomes with status filters so that I can monitor my network.                          | List with filters: status, search by name/address, pagination; each item shows child count, capacity %, compliance status.                    |
| S2-06 | **As a DAYHOME_OWNER**, I want to upload my license and insurance documents so that compliance is maintained.                   | Document upload with type (license, insurance, fire inspection), expiry date; stored in R2/S3; status indicator on dashboard.                 |

---

## Backend Expectations

- **Dayhome status machine**: `DRAFT â†’ PENDING â†’ ACTIVE | REJECTED â†’ SUSPENDED | CLOSED`. Transitions validated in service layer.
- **Room capacity enforcement**: Before approving a room capacity change, check that no enrollment exceeds the new limit.
- **Document association**: Dayhome documents linked via `hasMany`/`belongsTo` in Sequelize model associations; document types enum.
- **Events emitted**: `dayhome.registered`, `dayhome.approved`, `dayhome.suspended`, `dayhome.rejected` via `EventEmitter2` for audit logging + notification triggers.
- **License expiry tracking**: License expiry date stored; BullMQ job `license-expiry-check` runs daily.
- **Authorization**: `@OrganizationAccess()` guard ensures user's `orgId` matches the dayhome's `organizationId`.

### Dayhome Module Structure

```
modules/dayhome/
|-- dayhome.module.ts
|-- dayhome.controller.ts
|-- dayhome.service.ts
|-- dayhome.repository.ts
|-- dto/
|   |-- create-dayhome.dto.ts
|   |-- update-dayhome.dto.ts
|   |-- dayhome-query.dto.ts
|   |-- approve-dayhome.dto.ts
|   |__ create-room.dto.ts
|-- entities/
|   |-- dayhome.entity.ts
|   |__ dayhome-status.enum.ts
|__ dayhome.spec.ts
```

---

## Frontend Expectations

- **Pages**:
  - `/dayhomes` â€” Dayhome list (admin) with status filters
  - `/dayhomes/register` â€” Multi-step registration form (owner)
  - `/dayhomes/[id]` â€” Dayhome detail dashboard (owner)
  - `/dayhomes/[id]/rooms` â€” Room management
  - `/dayhomes/[id]/documents` â€” License/document uploads
- **Components**:
  - `DayhomeRegistrationWizard` â€” Step indicator, form sections with validation
  - `DayhomeCard` â€” Summary card with status badge, capacity bar, compliance icon
  - `StatusBadge` â€” Color-coded: PENDING (yellow), ACTIVE (green), SUSPENDED (red), REJECTED (gray)
  - `RoomCard` â€” Name, capacity (X/Y), age group label
  - `DocumentUploader` â€” Drag-and-drop zone, type selector, expiry date picker
- **State**: Dayhome list cached via TanStack Query; mutations invalidate on success with toast feedback.

---

## Standard Practices

| Area               | Practice                                                                                                           |
| ------------------ | ------------------------------------------------------------------------------------------------------------------ |
| Status transitions | Service method validates current status before transitioning; throws `BadRequestException` for invalid transitions |
| File uploads       | Max 10MB; allowed: PDF, JPG, PNG; MIME type validated server-side; scanned for malware                             |
| Capacity display   | Always shown as `enrolled / capacity` with visual bar (green < 80%, yellow 80â€“95%, red â‰¥ 95%)                  |
| Event-driven       | Audit logs and notifications triggered via events, not inline in service methods                                   |
| Soft delete        | Dayhome `deletedAt` cascade soft-deletes related rooms, educators, enrollments                                     |
| Rate limiting      | `POST /dayhomes` limited to 5 per hour per user to prevent spam                                                    |

---

## Definition of Done

- [ ] Dayhome registration flow creates `PENDING` dayhome with documents
- [ ] Admin approval/rejection workflow functional
- [ ] Room CRUD with capacity validation
- [ ] License document upload with expiry date stored
- [ ] Dayhome dashboard shows key metrics (enrolled, capacity %, compliance status)
- [ ] Events emitted on all status transitions
- [ ] Audit logs recorded for all dayhome state changes
- [ ] Integration tests: approve â†’ active, suspend â†’ cannot check-in children
- [ ] Frontend: registration wizard, dayhome list with filters, room management working
- [ ] i18n: strings extracted for EN (FR ready for future)
