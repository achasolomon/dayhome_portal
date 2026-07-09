# Sprint 7 — Document & Compliance Management

**Duration:** Week 15–16  
**Goal:** Document upload and storage, expiry tracking, automated renewal alerts, compliance monitoring and audit support.

## IN SCOPE

| ID    | Deliverable                                                    | Backend | Frontend | Tests      |
| ----- | -------------------------------------------------------------- | ------- | -------- | ---------- |
| S7-01 | Document upload with ClamAV virus scanning, stored in R2/S3    | ✅      | ✅       | ✅ BE + FE |
| S7-02 | Expiry tracking with color-coded status (green/amber/red)      | ✅      | ✅       | ✅ BE + FE |
| S7-03 | Automated expiry alerts via BullMQ (60/30/14/7 days)           | ✅      | —        | ✅ BE      |
| S7-04 | Document renewal with version history                          | ✅      | ✅       | ✅ BE + FE |
| S7-05 | Compliance dashboard per dayhome                               | ✅      | ✅       | ✅ BE + FE |
| S7-06 | Government read-only access (watermarked preview, no download) | ✅      | ✅       | ✅ BE + FE |

## NOT IN SCOPE

- ❌ No messaging or announcements (Sprint 8)
- ❌ No reporting & analytics (Sprint 9)
- ❌ No mobile apps (Sprint 10)
- ❌ No real document signing / e-signature (incident reports use checkbox acknowledgment)
- ❌ No OCR or document content analysis

## STANDARD PRACTICES (Mandatory)

- **File validation**: MIME type checked server-side (not just extension); max 10MB; allowed: PDF, JPG, PNG
- **Virus scanning**: ClamAV scan on upload (fail-open for dev); quarantined if infected
- **Encryption**: Files encrypted at rest in R2; access URLs time-limited (signed URLs, 15 min expiry)
- **Document status machine**: `ACTIVE → EXPIRING_SOON → EXPIRED | SUPERSEDED | REJECTED`
- **Compliance rules**: Configurable per organization (which document types are "required")
- **Data retention**: Documents retained 7 years after expiry; hard-delete after retention period
- **Government role**: Read-only; no download without audit trail; watermarked preview
- **`C-S-R pattern`**: Controller → Service → Repository
- **DTOs**: `class-validator` on backend; Zod on frontend
- **i18n**: Every user-visible string uses `useTranslation()` + `t('key')`
- **Migrations**: Every schema change has a migration
- **Event-driven**: `document.expiring`, `document.expired`, `document.uploaded` emitted

---

## User Stories

| ID    | Story                                                                                                                                                     | Acceptance Criteria                                                                                                              |
| ----- | --------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| S7-01 | **As a DAYHOME_OWNER**, I want to upload compliance documents (license, insurance, fire inspection, first aid certs) so that all records are centralized. | `POST /documents/upload` accepts file + type + expiry date; stored in R2/S3 with access-controlled URL; metadata saved in DB.    |
| S7-02 | **As an ORG_ADMIN**, I want to view all documents with expiry dates so that I can monitor compliance across dayhomes.                                     | Document list sorted by expiry date; color-coded: green (>60 days), amber (14â€“60 days), red (<14 days or expired).             |
| S7-03 | **As an ORG_ADMIN**, I want automated alerts when documents are expiring so that renewals happen before deadlines.                                        | BullMQ job `document-expiry-check` daily at 07:00; alerts sent at 60/30/14/7 days before expiry via email + in-app notification. |
| S7-04 | **As a DAYHOME_OWNER**, I want to renew a document by uploading a new version so that compliance status is updated.                                       | `POST /documents/:id/renew` expires old version (status: SUPERSEDED), creates new version; full version history preserved.       |
| S7-05 | **As an ORG_ADMIN**, I want to view inspection history and compliance status per dayhome so that I can prepare for government audits.                     | Compliance dashboard: last inspection date, findings, status (pass/fail/pending); all documents status summary.                  |
| S7-06 | **As a GOVERNMENT user**, I want read-only access to compliance documents and reports for a given dayhome so that I can fulfill regulatory oversight.     | Government role: read-only endpoints for compliance data; document viewer (no download without audit trail).                     |

---

## Backend Expectations

- **Documents module**: Upload, versioning, expiry tracking, access control.
- **File storage**: Cloudflare R2 (S3-compatible); files stored under `/{orgId}/{dayhomeId}/{documentType}/{versionId}/`.
- **Document types enum**: `LICENSE`, `INSURANCE`, `FIRE_INSPECTION`, `HEALTH_INSPECTION`, `FIRST_AID_CERT`, `POLICE_CHECK`, `TRAINING_CERT`, `OTHER`.
- **Versioning**: Each document has version history; only latest active version counts towards compliance.
- **Expiry check job**: `document-expiry-check` daily at 07:00; queries `documents WHERE expiryDate BETWEEN NOW() AND NOW() + INTERVAL '60 days'` â†’ sends alerts grouped by dayhome.
- **Compliance status**: Computed from all required document types for the dayhome; status = `COMPLIANT` if all required docs are active and not expiring within 30 days.
- **Government access**: Read-only API key or JWT with `GOVERNMENT` role; rate limited (50 req/min); all access logged.
- **Audit trail**: Every document view by government role logged with timestamp and viewer ID.

### Documents Module Structure

```
modules/documents/
|-- documents.module.ts
|-- documents.controller.ts
|-- documents.service.ts
|-- documents.repository.ts
|-- dto/
|   |-- upload-document.dto.ts
|   |-- document-query.dto.ts
|   |__ renew-document.dto.ts
|-- entities/
|   |-- document.entity.ts
|   |-- document-version.entity.ts
|   |__ document-type.enum.ts
|-- jobs/
|   |__ document-expiry-check.job.ts
|-- guards/
|   |__ document-access.guard.ts  # Owner can see own, admin can see all, gov read-only
|__ documents.spec.ts
```

---

## Frontend Expectations

- **Pages**:
  - `/documents` â€” Document list with filters (type, status, dayhome, date range)
  - `/documents/upload` â€” Upload form with file dropzone, type selector, expiry date
  - `/documents/[id]` â€” Document detail with version history, preview
  - `/compliance` â€” Compliance dashboard with dayhome cards showing overall status
  - `/compliance/[dayhomeId]` â€” Detailed compliance view per dayhome
- **Components**:
  - `DocumentDropzone` â€” Drag-and-drop file upload with progress bar; max 10MB; file type validation
  - `DocumentTable` â€” Sortable with expiry progress bar column
  - `ExpiryCalendar` â€” Mini calendar view showing upcoming expiry dates
  - `ComplianceCard` â€” Dayhome summary: status badge, % compliant, next expiry
  - `DocumentPreview` â€” Inline PDF/image viewer (read-only for government)
  - `VersionTimeline` â€” Vertical timeline of document versions with upload date, status
- **State**: Document list cached via TanStack Query; expiry data refreshed on page focus.

---

## Standard Practices

| Area             | Practice                                                                                    |
| ---------------- | ------------------------------------------------------------------------------------------- |
| File validation  | MIME type checked server-side (not just extension); max 10MB; allowed: PDF, JPG, PNG        |
| File scanning    | ClamAV scan on upload (if available); quarantined if infected                               |
| Encryption       | Files encrypted at rest in R2; access URLs time-limited (signed URLs, 15 min expiry)        |
| Document status  | `ACTIVE`, `EXPIRING_SOON`, `EXPIRED`, `SUPERSEDED`, `REJECTED`                              |
| Compliance rules | Configurable per organization: which document types are "required"                          |
| Data retention   | Documents retained 7 years after expiry (regulatory); hard-delete after retention period    |
| Government role  | Read-only; cannot download original files without audit trail; can view watermarked preview |

### Testing Requirements

- **Framework**: Jest (backend), Jest + React Testing Library (frontend)
- **API tests**: Supertest for all endpoint integration tests
- **Coverage target**: ≥80% line coverage per module
- **Test patterns**: Unit tests for services/repositories; integration tests for controllers/endpoints
- **Per-item expectations**: Each deliverable must have happy-path, validation-error, auth/permission-denial, and edge-case tests
- **CI enforcement**: `pnpm test:cov` must pass before merge; lint + typecheck gates

---

## Definition of Done

- [ ] Document upload with type, expiry date â†’ stored in R2
- [ ] Document list with expiry progress and color coding
- [ ] Document renewal with version history
- [ ] Daily expiry check job sends alerts at 60/30/14/7 days
- [ ] Compliance dashboard per dayhome
- [ ] Government role: read-only access to compliance data
- [ ] Document access control: role-based scoping verified
- [ ] Integration tests: upload â†’ expire â†’ alert sent â†’ renew â†’ version created
- [ ] Frontend: upload flow, compliance dashboard, expiry calendar working
- [ ] Watermark on government document preview
