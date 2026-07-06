# Sprint 1 — Organization Profile & Staff Management

**Duration:** Week 3–4  
**Goal:** Set up the single organization (Spiced agency) profile, invite staff members with specific roles, and establish RBAC.

**Architecture note:** This is a single-tenant system. There is one organization (Spiced/the agency) that manages all dayhomes, educators, families, and children. Organization CRUD (multi-tenant) is not needed — only a single org profile exists.

---

## User Stories

| ID    | Story                                                                                                                         | Acceptance Criteria                                                                                                                               |
| ----- | ----------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| S1-01 | **As a SUPER_ADMIN**, I want to manage the agency profile (name, email, status) so that the organization info is accurate.    | Single org profile at `GET/PATCH /api/v1/organizations/:id`; only SUPER_ADMIN can update; soft delete disabled for the primary org.               |
| S1-02 | **As an ADMIN**, I want to invite staff members with specific roles so that they can access the agency system.                | `POST /api/v1/staff/invite` creates invitation with `PENDING` status; email sent with set-password link; token expires in 7 days.                 |
| S1-03 | **As an ADMIN**, I want to manage roles and permissions for agency staff so that access is controlled.                        | RBAC matrix UI; roles: `ORG_ADMIN`, `ORG_MANAGER`, `BILLING_ONLY`; permissions: granular CRUD per domain.                                         |
| S1-04 | **As a user**, I want to reset my password via email so that I can recover access.                                            | `POST /auth/forgot-password` sends email with reset link; `POST /auth/reset-password` updates hash; token expires in 1h.                          |
| S1-05 | **As an ADMIN**, I want to view audit logs of all actions so that I can track changes.                                        | Every create/update/delete logged: `{ userId, action, entity, entityId, before, after, timestamp }`; filterable by date range, user, entity type. |
| S1-06 | **As an ADMIN**, I want to configure operational settings (holidays, hours, ratios) so that dayhomes follow consistent rules. | Settings: default operating hours, public holidays, province-specific educator:child ratios for different age groups.                             |

---

## Backend Expectations

- **Organization module**: Single org profile (`GET`/`PATCH`), not multi-tenant CRUD. Soft delete disabled for the primary org.
- **Staff invitation flow**: Generate token → store in `invitations` table with 7-day expiry → send transactional email via BullMQ queue → user clicks link → sets password → status becomes `ACTIVE`.
- **Staff module**: Lives under `modules/staff/` with its own controller, service, repository, and DTOs. Endpoints: `POST /api/v1/staff/invite`, `GET /api/v1/staff`.
- **Invitation model**: `email`, `role`, `organizationId`, `token` (unique), `status` (PENDING/ACCEPTED/EXPIRED/CANCELLED), `expiresAt`, `acceptedAt`.
- **RBAC enforcement**: `@Roles(Role.ORG_ADMIN)` decorator on controller methods; `RolesGuard` checks JWT role against allowed roles; `PermissionsGuard` checks fine-grained permissions.
- **Audit logging**: Global interceptor or decorator-based (`@AuditLog('staff.invite')`) that captures before/after state.
- **Soft delete**: `deletedAt` column on entities; Sequelize `paranoid: true` filters out soft-deleted records by default.
- **Validation**: DTOs with class-validator; unique email check at service level.

### Module Structure

```
modules/organization/
├── organization.module.ts
├── organization.controller.ts
├── organization.service.ts
├── organization.repository.ts
├── dto/
│   ├── create-organization.dto.ts
│   ├── update-organization.dto.ts
│   └── organization-response.dto.ts
├── entities/
│   └── organization.entity.ts
└── guards/
    └── organization-access.guard.ts

modules/staff/
├── staff.module.ts
├── staff.controller.ts
├── staff.service.ts
├── staff.repository.ts
├── dto/
│   ├── invite-staff.dto.ts
│   ├── staff-query.dto.ts
│   └── staff-response.dto.ts
└── entities/
    └── staff.entity.ts
```

---

## Frontend Expectations

- **Pages**:
  - `/staff` — Agency staff list with invite drawer, search, role badges, pending invitations
  - `/login`, `/register`, `/forgot-password`, `/reset-password` — Auth pages
  - Settings page already exists at `/settings` for operational config
- **Components**:
  - `InviteStaffSheet` — Email + role dropdown + send button (side drawer)
  - `StaffList` — Staff cards with avatar, name, email, role badge
  - `PendingInvitations` — Dashed-border cards with expiry dates
  - `RoleSelector` — Dropdown for role assignment
- **Navigation**: Staff is a top-level sidebar item. No "Organization" nav item — the org is a backend entity only.

---

## Standard Practices

| Area        | Practice                                                                                         |
| ----------- | ------------------------------------------------------------------------------------------------ |
| API errors  | Return standardized error with code, message, details array                                      |
| Pagination  | `PaginationDto` with `page`, `limit`; default 20, max 100                                        |
| Search      | `?search=` → `{ contains, mode: 'insensitive' }` on name/email fields                            |
| Audit trail | All state-changing actions logged; no audit for GET requests                                     |
| Soft delete | `findMany` filters `deletedAt: null` by default; admin can query with `includeDeleted: true`     |
| RBAC        | Roles checked at controller level; permissions checked at service level for fine-grained control |

---

## Definition of Done

- [ ] Single org profile endpoint (GET/PATCH) with guard
- [ ] Staff invitation email sends via BullMQ queue with invitation link
- [ ] Invited user can complete registration via set-password link
- [ ] RBAC: staff users restricted to their assigned role's permissions
- [ ] Audit logs created for all state changes
- [ ] Org settings saved and applied to dayhome operations
- [ ] Password reset flow works end-to-end
- [ ] Integration tests cover auth failure scenarios (wrong password, expired token, locked account)
- [ ] Frontend: Staff page with invite drawer, search, role badges, pending invitations
- [ ] Accessibility: forms have proper labels, error messages linked via `aria-describedby`
