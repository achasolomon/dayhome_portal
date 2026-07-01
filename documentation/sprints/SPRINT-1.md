# Sprint 1 â€” Organization & User Management

**Duration:** Week 3â€“4  
**Goal:** Super admin creates/manages organizations; org admins manage staff, roles, and permissions.

---

## User Stories

| ID    | Story                                                                                                                                            | Acceptance Criteria                                                                                                                               |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| S1-01 | **As a SUPER_ADMIN**, I want to create, update, suspend, and delete organizations so that I can manage tenants.                                  | Full CRUD at `POST/PATCH/DELETE /api/v1/organizations`; soft delete with `deletedAt`; list with pagination and search.                            |
| S1-02 | **As an ORG_ADMIN**, I want to invite staff members with specific roles so that they can access the system.                                      | `POST /organizations/:id/staff/invite` creates user with `PENDING` status; email sent with set-password link; token expires in 48h.               |
| S1-03 | **As an ORG_ADMIN**, I want to manage roles and permissions for my organization's staff so that access is controlled.                            | RBAC matrix UI; roles: `ORG_ADMIN`, `ORG_MANAGER`, `DAYHOME_OWNER`, `EDUCATOR`; permissions: granular CRUD per domain.                            |
| S1-04 | **As a user**, I want to reset my password via email so that I can recover access.                                                               | `POST /auth/forgot-password` sends email with reset link; `POST /auth/reset-password` updates hash; token expires in 1h.                          |
| S1-05 | **As an ORG_ADMIN**, I want to view audit logs of all actions in my organization so that I can track changes.                                    | Every create/update/delete logged: `{ userId, action, entity, entityId, before, after, timestamp }`; filterable by date range, user, entity type. |
| S1-06 | **As an ORG_ADMIN**, I want to update my organization's operational settings (holidays, hours, ratios) so that dayhomes follow consistent rules. | Settings: default operating hours, public holidays, province-specific educator:child ratios for different age groups.                             |

---

## Backend Expectations

- **OrganizationModule**: Standard CP (Controller â†’ Service â†’ Repository) pattern.
- **Staff invitation flow**: Generate token â†’ store in DB with expiry â†’ send transactional email via BullMQ queue â†’ user clicks link â†’ sets password â†’ status becomes `ACTIVE`.
- **RBAC enforcement**: `@Roles(Role.ORG_ADMIN)` decorator on controller methods; `RolesGuard` checks JWT role against allowed roles; `PermissionsGuard` checks fine-grained permissions.
- **Audit logging**: Global interceptor or decorator-based (`@AuditLog('organization.update')`) that captures before/after state.
- **Soft delete**: `deletedAt` column on all entities; Sequelize `paranoid: true` on model options filters out soft-deleted records by default.
- **Validation**: DTOs with class-validator; unique email check at service level (custom `BadRequestException` with `DUPLICATE_EMAIL` code).

### Organization Module Structure

```
modules/organization/
|-- organization.module.ts
|-- organization.controller.ts
|-- organization.service.ts
|-- organization.repository.ts
|-- dto/
|   |-- create-organization.dto.ts
|   |-- update-organization.dto.ts
|   |-- organization-query.dto.ts
|   |__ invite-staff.dto.ts
|-- entities/
|   |__ organization.entity.ts
|-- guards/
|   |__ organization-access.guard.ts  # Ensures user belongs to this org
|__ organization.spec.ts
```

---

## Frontend Expectations

- **Pages**:
  - `/organization` â€” Organization list (super admin only)
  - `/organization/[id]` â€” Organization detail & settings
  - `/organization/[id]/staff` â€” Staff list with invite button
  - `/organization/[id]/settings` â€” Operational settings form
  - `/login`, `/register`, `/forgot-password`, `/reset-password` â€” Auth pages
- **Components**:
  - `StaffTable` â€” Sortable, filterable staff list with role badges
  - `InviteStaffModal` â€” Email + role dropdown + optional message
  - `RoleSelector` â€” Checkbox/permission grid for role configuration
  - `AuditLogTable` â€” Filterable by date, user, action type
  - `OrgSettingsForm` â€” Holidays picker, hours input, ratio config per age group
- **State**: Organization list cached via TanStack Query; auth state via Zustand.

---

## Standard Practices

| Area        | Practice                                                                                         |
| ----------- | ------------------------------------------------------------------------------------------------ |
| API errors  | Return standardized `ApiError` with code, message, details array                                 |
| Pagination  | `PaginationDto` with `page`, `limit`; default 20, max 100                                        |
| Search      | `?search=` â†’ `{ contains, mode: 'insensitive' }` on name/email fields                          |
| Audit trail | All state-changing actions logged; no audit for GET requests                                     |
| Soft delete | `findMany` filters `deletedAt: null` by default; admin can query with `includeDeleted: true`     |
| RBAC        | Roles checked at controller level; permissions checked at service level for fine-grained control |

---

## Definition of Done

- [ ] Organization CRUD endpoints tested and documented
- [ ] Staff invitation email sends via BullMQ queue
- [ ] Invited user can complete registration via set-password link
- [ ] RBAC: staff users restricted to their assigned role's permissions
- [ ] Audit logs created for all org/state changes
- [ ] Org settings saved and applied to dayhome operations
- [ ] Password reset flow works end-to-end
- [ ] Integration tests cover all auth failure scenarios (wrong password, expired token, locked account)
- [ ] Frontend: invite flow, role management, audit log viewer working
- [ ] Accessibility: forms have proper labels, error messages linked via `aria-describedby`
