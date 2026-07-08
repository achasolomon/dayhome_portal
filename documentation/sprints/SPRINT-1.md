# Sprint 1 — Organization Profile & Staff Management

**Duration:** Week 3–4  
**Goal:** Set up the single organization (Spiced agency) profile, invite staff members with specific roles, and establish RBAC.

**Architecture note:** This is a single-tenant system. There is one organization (Spiced/the agency) that manages all dayhomes, educators, families, and children. Organization CRUD (multi-tenant) is not needed — only a single org profile exists.

---

## IN SCOPE

| ID    | Deliverable                                                                            | Backend | Frontend |
| ----- | -------------------------------------------------------------------------------------- | ------- | -------- |
| S1-01 | Single org profile: `GET /api/v1/organizations/:id`, `PATCH /api/v1/organizations/:id` | ✅ ✅   | —        |
| S1-02 | Staff invitation: `POST /api/v1/staff/invite`, `GET /api/v1/staff`, resend, cancel     | ✅      | ✅       |
| S1-03 | RBAC: Roles & Permissions CRUD, `@Permissions()` decorator on staff endpoints          | ✅      | ✅       |
| S1-04 | Password reset: `POST /auth/forgot-password`, `POST /auth/reset-password`              | ✅      | ✅       |
| S1-05 | Audit log viewer (backend endpoints only — frontend out of scope)                      | ✅      | —        |
| S1-06 | Org operational settings (holidays, hours, ratios) — backend only                      | ✅      | —        |

**Backend-specific tasks:**

- [ ] Organization module: `GET /api/v1/organizations/:id`, `PATCH /api/v1/organizations/:id` (no list, no create, no delete)
- [ ] Staff module: invitation model with token + 7-day expiry, `POST /staff/invite`, `GET /staff`, `POST /staff/invitations/:id/resend`, `DELETE /staff/invitations/:id`
- [ ] RBAC module: Role CRUD, permission groups, permission assignment, `@Permissions()` guard on all protected staff endpoints
- [ ] Auth: `POST /auth/forgot-password` (sends email), `POST /auth/reset-password` (updates hash, 1h token expiry)
- [ ] Rate limiting: `LoginThrottleGuard` — 5 attempts / 15 min per IP (Redis-backed)
- [ ] BullMQ email queue integration for invitation + password reset emails
- [ ] Audit logging: global decorator `@AuditLog('action')` capturing before/after on state changes

**Frontend-specific tasks:**

- [ ] `/staff` page: staff list with invite drawer, search, role badges, pending invitations tab
- [ ] `/login` page: email + password with error handling
- [ ] `/forgot-password` page: email input → confirmation screen
- [ ] `/reset-password` page: token from URL → new password → success
- [ ] All strings via `useTranslation()` + `t()` — no hardcoded English

## NOT IN SCOPE (Explicit Exclusions)

- ❌ Multi-tenant organization CRUD (POST, GET list, DELETE) — endpoints exist as commented code only
- ❌ Org settings frontend page — backend API only, no `/settings` page in this sprint
- ❌ Audit log frontend page — backend API only, no `/audit` page in this sprint
- ❌ Dayhome management, Educator management, Family/Child, Attendance, Billing, Documents, Messaging, Reports
- ❌ Mobile apps
- ❌ i18n completion for French — only EN translations required; FR locale populated as time permits
- ❌ Full WCAG audit — follow patterns but no dedicated a11y sprint work

## STANDARD PRACTICES (Mandatory, from Sprint 0 infra)

- **TypeScript strict** — no `any`, no `@ts-ignore`, no `as unknown` casts outside test files
- **`CreationAttributes<Model>`** for Sequelize `create()` calls; **`WhereOptions`** for `where` clauses; avoid `Record<string, unknown>`
- **`@Permissions()` + `PermissionsGuard`** on all protected endpoints (not just `@Roles()`)
- **`C-S-R pattern`**: Controller → Service → Repository for every module
- **DTOs**: `class-validator` on all backend DTOs; Zod schemas on all frontend forms
- **i18n**: Every user-visible string uses `useTranslation()` + `t('key')` — zero hardcoded strings in pages
- **Soft delete**: `paranoid: true` on entities; `deletedAt` queries respect `includeDeleted` param
- **Rate limiting**: Global 100 req/min + auth-specific 5 attempts/15 min per IP via `LoginThrottleGuard`
- **Transactional emails**: Queued via BullMQ (never sent synchronously in request handler)
- **Swagger**: All new endpoints documented with `@ApiOperation`, `@ApiResponse`
- **Migrations**: Every schema change has a corresponding migration file
- **Error codes**: All thrown exceptions use defined error codes from `ERROR_CODES` in `shared-constants`
- **Event-driven**: State-changing actions emit events (not inline audit + notification logic)

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
