# Sprint 4 — Family & Child Management

**Duration:** Week 9–10  
**Goal:** Family registration, child profiles, medical info, authorized pickups, enrollment with capacity/waitlist logic.

---

## IN SCOPE

| ID    | Deliverable                                            | Backend | Frontend |
| ----- | ------------------------------------------------------ | ------- | -------- |
| S4-01 | Family registration with email verification            | ✅      | ✅       |
| S4-02 | Child profile CRUD with encrypted medical info         | ✅      | ✅       |
| S4-03 | Authorized pickup management with PIN (hashed)         | ✅      | ✅       |
| S4-04 | Enrollment with capacity check + FIFO waitlist         | ✅      | ✅       |
| S4-05 | Emergency contacts: min 1 required per child           | ✅      | ✅       |
| S4-06 | Parent portal scaffold (`apps/web-parent`, Next.js 14) | —       | ✅       |

## NOT IN SCOPE

- ❌ No attendance, billing, document, messaging, or report features
- ❌ No mobile apps
- ❌ No child check-in/out (Sprint 5)
- ❌ No daily activity feed for parents (Sprint 5)
- ❌ No subsidy or invoice generation (Sprint 6)
- ❌ Medical notes are encrypted at rest but no HL7/FHIR integration

## STANDARD PRACTICES (Mandatory)

- **TypeScript strict** — no `any`, no `@ts-ignore`, no `as unknown` casts
- **Medical data**: Encrypted at rest (AES-256); accessible only to authorized roles
- **Pickup PIN**: Hashed with bcrypt; never returned in API responses
- **Data isolation**: `FamilyAccessGuard` ensures parent sees only own children
- **`C-S-R pattern`**: Controller → Service → Repository
- **DTOs**: `class-validator` on backend; Zod on frontend
- **i18n**: Every user-visible string uses `useTranslation()` + `t('key')`
- **Soft delete**: `paranoid: true` on entities
- **Migrations**: Every schema change has a migration
- **Event-driven**: `child.enrolled`, `child.medical-updated`, `child.waitlist-added` emitted
- **Waitlist**: FIFO ordering; `notifyNextInQueue()` triggered when slot opens
- **Enrollment**: Validate child age matches room age group

---

## User Stories

| ID    | Story                                                                                                                           | Acceptance Criteria                                                                                                                                     |
| ----- | ------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| S4-01 | **As a parent**, I want to register my family profile so that I can enroll my children in a dayhome.                            | `POST /api/v1/families` creates parent account + family; email verification required; can add spouse/partner as co-guardian.                            |
| S4-02 | **As a parent**, I want to add my child's profile with full medical information so that the dayhome has necessary care details. | Child profile: name, DOB, gender, allergies (with severity), medical conditions, medications, doctor info, dietary restrictions, sleep/nap preferences. |
| S4-03 | **As a parent**, I want to designate authorized pickup persons so that only approved people can collect my child.               | `POST /children/:id/authorized-pickups` with name, phone, relationship, photo; can set pickup PIN (4–6 digits).                                         |
| S4-04 | **As an ORG_ADMIN**, I want to enroll a child in a dayhome room so that attendance tracking can begin.                          | `POST /enrollments` with childId, dayhomeId, roomId, startDate; checks room capacity; optional waitlist if full.                                        |
| S4-05 | **As a parent**, I want to view my child's daily information (meals, naps, activities, diaper changes) so that I stay informed. | Child dashboard within parent portal: today's activity feed; timeline view with timestamps and photos.                                                  |
| S4-06 | **As a parent**, I want to update emergency contacts and medical info at any time so that records stay current.                 | `PATCH /children/:id/medical` and `PATCH /families/:id/emergency-contacts`; changes logged for audit.                                                   |

---

## Backend Expectations

- **Family module**: Parent–child relationship model (one family, multiple children); parent is the primary contact.
- **Child profile**: Encrypted medical notes at rest (AES-256); allergies stored as array with severity enum.
- **Authorized pickups**: `AuthorizedPickup` model with name, phone, photo URL, PIN (hashed), relationship enum.
- **Enrollment logic**: Check room capacity → if space → enroll; if full → `createOrAddToWaitlist()` with position number.
- **Data isolation**: Parent queries automatically scoped to `familyId` from JWT; `FamilyAccessGuard` ensures parent can only see own children.
- **Emergency contacts**: Contact name, phone, relationship; at least 1 required per child.
- **Events**: `child.enrolled`, `child.medical-updated`, `child.waitlist-added` emitted for notifications.

### Family & Child Module Structure

```
modules/family/
|-- family.module.ts
|-- family.controller.ts
|-- family.service.ts
|-- family.repository.ts
|-- dto/
|   |-- create-family.dto.ts
|   |-- add-child.dto.ts
|   |-- update-medical.dto.ts
|   |-- add-pickup.dto.ts
|   |__ enroll-child.dto.ts
|-- guards/
|   |__ family-access.guard.ts
|__ family.spec.ts

modules/child/
|-- child.module.ts
|-- child.controller.ts
|-- child.service.ts
|-- child.repository.ts
|-- dto/
|   |-- create-child.dto.ts
|   |-- update-child.dto.ts
|   |__ child-query.dto.ts
|-- entities/
|   |-- child.entity.ts
|   |-- enrollment.entity.ts
|   |-- authorized-pickup.entity.ts
|   |__ emergency-contact.entity.ts
|__ child.spec.ts
```

---

## Frontend Expectations

- **Pages** (Parent portal):
  - `/family/register` — Family registration wizard
  - `/family/children` — List of children with quick status (today's attendance)
  - `/family/children/new` — Add child form (multi-step: profile → medical → pickups)
  - `/family/children/[id]` — Child detail dashboard with daily activity feed
  - `/family/children/[id]/medical` — Medical info view/edit
  - `/family/children/[id]/pickups` — Authorized pickup management
  - `/enrollment` — Browse dayhomes, select room, enroll
- **Components**:
  - `ChildProfileForm` — Multi-step with sections for basics, medical, dietary, emergency contacts
  - `AuthorizedPickupCard` — Person card with photo, phone, PIN setup
  - `EnrollmentWizard` — Dayhome selection → room selection → review → confirm
  - `DailyActivityFeed` — Timeline-style feed with meal, nap, activity, diaper entries
  - `WaitlistBadge` — Position number indicator for waitlisted children
- **State**: Family context in Zustand; child data via TanStack Query with query keys scoped to family.

---

## Standard Practices

| Area           | Practice                                                                                              |
| -------------- | ----------------------------------------------------------------------------------------------------- |
| Medical data   | Encrypted at rest; accessible only to authorized roles (educator, admin, parent-of-child)             |
| Pickup PIN     | Hashed with bcrypt; never returned in API responses; parent can reset                                 |
| Enrollment     | Validate child age matches room age group; throw `VALIDATION_ERROR` with details if mismatch          |
| Waitlist       | FIFO ordering; `waitlistPosition` computed on insert; `notifyNextInQueue()` triggered when slot opens |
| Data isolation | `where: { familyId: user.familyId }` applied to all child queries for parent role                     |
| Photo upload   | Resized to 3 sizes (thumbnail 150px, medium 600px, original) on upload; CDN URL returned              |

---

## Definition of Done

- [ ] Family registration with email verification
- [ ] Child profile CRUD with medical info encryption
- [ ] Authorized pickup management with PIN
- [ ] Enrollment flow with capacity check and waitlist
- [ ] Parent can view only their own children (data isolation verified in tests)
- [ ] Medical info update triggers audit log
- [ ] Integration tests: enroll → capacity full → waitlist → slot opens → notify
- [ ] Frontend: child profile wizard, pickup management, enrollment flow working
- [ ] Emergency contacts: min 1 required per child on enrollment
