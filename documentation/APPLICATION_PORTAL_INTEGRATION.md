# Application Portal Integration

**Last updated:** 2026-07-08  
**Status:** Agreed (pending staging validation)

---

## Overview

The external Application Portal submits pre-approved dayhomes to our system via an API intake webhook. Our system is the **source of truth** for dayhome data; the portal is the **entry point**. Once a dayhome is intaken, the portal pushes ongoing updates via callback endpoints.

### Architecture Flow

```
Application Portal                    Our System
─────────────────                    ──────────

  POST /api/v1/dayhomes/intake  ──►  HMAC verify signature
  (new dayhome approved)              Idempotency check
                                      Validate & map fields
                                      Create DAYHOME_OWNER user
                                      Create dayhome (ACTIVE)
                                      Download documents
                                      Send welcome email
                                  ◄── 201 Created / 409 / 422

  POST /api/v1/internal/status   ──►  Status transition
  POST /api/v1/internal/compliance──► Compliance record
  PUT /api/v1/internal/educator-profile──► Update operations
  POST /api/v1/internal/documents ──► Document sync
                                  ◄── 200 OK / 422
```

---

## Intake Webhook

### Endpoint

```
POST https://[our-domain]/api/v1/dayhomes/intake
```

### Authentication — HMAC Signature

Every request must include:

```
Signature: sha256=<hmac-hex-digest>
X-Timestamp: <unix-timestamp-seconds>
```

- `Signature` — HMAC-SHA256 of the raw request body signed with the shared secret
- `X-Timestamp` — Unix timestamp; requests older than 5 minutes are rejected (replay protection)
- Mismatched signature → `401 INTAKE_SIGNATURE_INVALID`

The shared secret is configured via env var `INTAKE_WEBHOOK_SECRET`.

### Idempotency

```
Idempotency-Key: <externalId>
```

- We deduplicate by this key
- If a key has already been processed, we return `409 INTAKE_DUPLICATE` with the existing record
- Keys are retained for 30 days

### Payload Schema (from Portal)

#### Envelope

```json
{
  "version": "1.0",
  "externalId": "SPC-250T5K-0001",
  "educator": { ... },
  "dayhome": { ... },
  "operations": { ... },
  "license": { ... },
  "timeline": { ... },
  "finalInspection": { ... },
  "documents": [ ... ],
  "profileItems": [ ... ]
}
```

#### Fields

| Field        | Type   | Required | Notes                                                           |
| ------------ | ------ | -------- | --------------------------------------------------------------- |
| `version`    | string | yes      | Schema version. Currently `"1.0"`. Reject unsupported versions. |
| `externalId` | string | yes      | Portal's internal ID. Used as idempotency key.                  |

**`educator` — Mapped to DAYHOME_OWNER user**

| Field       | Type   | Required | Notes                          |
| ----------- | ------ | -------- | ------------------------------ |
| `firstName` | string | yes      |                                |
| `lastName`  | string | yes      |                                |
| `fullName`  | string | no       | Display name                   |
| `email`     | string | yes      | Used for welcome email + login |
| `phone`     | string | yes      |                                |

> **Note:** The portal calls this `educator` but in our system this person is created as a `DAYHOME_OWNER` user. We maintain separate roles internally (owner vs educator) — the split happens on our side.

**`dayhome` — Property & address info**

| Field                  | Type    | Required | Notes                                      |
| ---------------------- | ------- | -------- | ------------------------------------------ |
| `address.line1`        | string  | yes      |                                            |
| `address.city`         | string  | yes      |                                            |
| `address.province`     | string  | yes      | 2-letter code (AB, BC, etc.)               |
| `address.postalCode`   | string  | yes      |                                            |
| `address.full`         | string  | no       | Formatted full address                     |
| `homeType`             | string  | yes      | `house`, `apartment`, `townhouse`, `other` |
| `homeOwnership`        | string  | yes      | `own`, `rent`, `other`                     |
| `fencedBackyard`       | boolean | no       |                                            |
| `smokingStatus`        | string  | yes      | `yes`, `no`, `outdoor_only`                |
| `hasPets`              | boolean | yes      |                                            |
| `homeResidentsCount`   | integer | no       |                                            |
| `eveningOvernightCare` | boolean | yes      |                                            |

**`operations` — Capacity & operations**

| Field                 | Type     | Required | Notes                                   |
| --------------------- | -------- | -------- | --------------------------------------- |
| `currentCapacity`     | integer  | yes      | Currently enrolled                      |
| `maximumCapacity`     | integer  | yes      | Max licensed capacity                   |
| `operatingHoursStart` | string   | yes      | `HH:mm:ss`                              |
| `operatingHoursEnd`   | string   | yes      | `HH:mm:ss`                              |
| `childcareLevel`      | string   | no       | e.g. `"Level 2"`                        |
| `languagesSpoken`     | string   | no       | Comma-separated                         |
| `childcareEducation`  | text     | no       |                                         |
| `specializations`     | string[] | no       | e.g. `["Special Needs", "Infant Care"]` |

**`license` — Provincial license**

| Field               | Type          | Required | Notes                          |
| ------------------- | ------------- | -------- | ------------------------------ |
| `certificateNumber` | string        | yes      | License reference              |
| `issueDate`         | string (date) | yes      | ISO 8601                       |
| `expiryDate`        | string (date) | yes      | ISO 8601                       |
| `status`            | string        | yes      | `active`, `expired`, `revoked` |

**`timeline` — Key dates**

| Field               | Type              | Required | Notes    |
| ------------------- | ----------------- | -------- | -------- |
| `submittedAt`       | string (datetime) | yes      | ISO 8601 |
| `approvedAt`        | string (datetime) | yes      | ISO 8601 |
| `activatedAt`       | string (datetime) | yes      | ISO 8601 |
| `nextComplianceDue` | string (date)     | no       | ISO 8601 |

**`finalInspection` — Last passed inspection**

| Field              | Type              | Required | Notes                         |
| ------------------ | ----------------- | -------- | ----------------------------- |
| `conductedAt`      | string (datetime) | yes      | ISO 8601                      |
| `result`           | string            | yes      | `pass`, `conditional`, `fail` |
| `score`            | number            | no       | 0–100                         |
| `itemsPassed`      | integer           | no       |                               |
| `itemsFailed`      | integer           | no       |                               |
| `criticalFailures` | integer           | no       |                               |
| `summary`          | text              | no       |                               |
| `inspectorName`    | string            | no       |                               |

**`documents[]` — Uploaded documents**

| Field         | Type          | Required | Notes                                                  |
| ------------- | ------------- | -------- | ------------------------------------------------------ |
| `name`        | string        | yes      | Display name                                           |
| `fileName`    | string        | yes      | Original filename                                      |
| `category`    | string        | yes      | `home_insurance`, `license`, `inspection_report`, etc. |
| `status`      | string        | yes      | `approved`, `pending`, `expired`                       |
| `issueDate`   | string (date) | no       |                                                        |
| `expiryDate`  | string (date) | no       |                                                        |
| `downloadUrl` | string        | yes      | Signed URL, valid 24 hours                             |
| `fileHash`    | string        | no       | `sha256:<hex>`                                         |

> **Document download:** On intake, we download each file from the signed URL immediately and store in R2/MinIO. If a download fails, we log the error, flag for manual retry, and **proceed with the intake** — a failed file download never blocks dayhome creation.

**`profileItems[]` — Certifications & training**

| Field        | Type          | Required | Notes                                   |
| ------------ | ------------- | -------- | --------------------------------------- |
| `title`      | string        | yes      | e.g. `"Standard First Aid"`             |
| `type`       | string        | yes      | `document`, `certification`, `training` |
| `expiryDate` | string (date) | no       | ISO 8601                                |
| `fileName`   | string        | no       |                                         |

---

### Responses

| Status | Error Code                 | Body                                 | When                                      |
| ------ | -------------------------- | ------------------------------------ | ----------------------------------------- |
| 201    | —                          | Created dayhome object               | Success                                   |
| 401    | `INTAKE_SIGNATURE_INVALID` | `{ error, message }`                 | HMAC mismatch                             |
| 409    | `INTAKE_DUPLICATE`         | `{ error, message, existingRecord }` | Idempotency key already processed         |
| 422    | `INTAKE_INVALID_PAYLOAD`   | `{ error, message, details: [...] }` | Validation failure or unsupported version |

---

## Callback Endpoints (Our System)

Portal pushes ongoing updates to these HMAC-signed endpoints. All use the same shared secret, `Signature` header, and `X-Timestamp` replay protection as the intake webhook.

### Status Update

```
POST /api/v1/internal/status
```

**Payload:**

```json
{
  "externalId": "SPC-250T5K-0001",
  "newStatus": "suspended",
  "reason": "...",
  "effectiveDate": "2026-03-01T10:00:00Z"
}
```

**Status mapping (portal → our internal):**

| Portal Value                      | Our Status | Description                  |
| --------------------------------- | ---------- | ---------------------------- |
| `active`                          | ACTIVE     | Dayhome activated/reinstated |
| `suspended`                       | SUSPENDED  | License suspended            |
| `terminated`                      | CLOSED     | Permanently closed           |
| `compliance_inspection_due`       | ACTIVE     | Compliance overdue           |
| `compliance_inspection_scheduled` | ACTIVE     | Inspection scheduled         |
| `compliance_inspection_completed` | ACTIVE     | Inspection done              |
| `remediation_required`            | ACTIVE     | Issues found, needs fixes    |
| `under_review`                    | ACTIVE     | Under investigation          |

Our internal status machine uses `ACTIVE`, `SUSPENDED`, and `CLOSED` only. The portal's granular statuses are stored alongside for compliance tracking and reporting. `SUSPENDED` and `CLOSED` block check-in operations.

**Response:** `200 OK` on success, `422` on validation failure.

### Compliance Update

```
POST /api/v1/internal/compliance
```

**Payload:**

```json
{
  "externalId": "SPC-250T5K-0001",
  "inspectionDate": "2026-06-20T09:00:00Z",
  "result": "PASS",
  "notes": "...",
  "nextDueDate": "2026-12-20"
}
```

**Response:** `200 OK` on success, `422` on validation failure.

### Educator Profile Update

```
PUT /api/v1/internal/educator-profile
```

**Payload:**

```json
{
  "externalId": "SPC-250T5K-0001",
  "currentCapacity": 7,
  "maximumCapacity": 8,
  "operatingHoursStart": "07:00:00",
  "operatingHoursEnd": "18:00:00",
  "specializations": ["Special Needs"],
  "professionalBio": "..."
}
```

**Response:** `200 OK` on success, `422` on validation failure.

### Document Update

```
POST /api/v1/internal/documents
```

**Payload:**

```json
{
  "externalId": "SPC-250T5K-0001",
  "documents": [
    {
      "originalName": "first_aid.pdf",
      "status": "expired",
      "expiryDate": "2026-01-15",
      "replacedBy": {
        "name": "First Aid Renewal",
        "fileName": "first_aid_2026.pdf",
        "expiryDate": "2028-01-15",
        "downloadUrl": "https://portal.example.com/files/..."
      }
    }
  ]
}
```

**Response:** `200 OK` on success, `422` on validation failure.

---

## HMAC Signature Implementation

### Signing (Outbound — our requests to portal)

```typescript
import { createHmac } from 'crypto';

function signBody(body: string, secret: string): string {
  return createHmac('sha256', secret).update(body).digest('hex');
}

// Usage
const body = JSON.stringify(payload);
const signature = signBody(body, INTAKE_WEBHOOK_SECRET);
const timestamp = Math.floor(Date.now() / 1000);

headers: {
  'Signature': `sha256=${signature}`,
  'X-Timestamp': `${timestamp}`,
  'Content-Type': 'application/json',
}
```

### Verification (Inbound — portal requests to us)

```typescript
function verifySignature(rawBody: string, signatureHeader: string, secret: string): boolean {
  const expected = `sha256=${createHmac('sha256', secret).update(rawBody).digest('hex')}`;
  return timingSafeEqual(Buffer.from(signatureHeader), Buffer.from(expected));
}

function verifyTimestamp(timestampHeader: string, maxAgeMs: number = 5 * 60 * 1000): boolean {
  const now = Date.now();
  const then = parseInt(timestampHeader, 10) * 1000;
  return !isNaN(then) && now - then < maxAgeMs && now - then >= 0;
}
```

Use `crypto.timingSafeEqual` to prevent timing attacks.

---

## Rate Limiting

| Endpoint Group                        | Rate Limit           |
| ------------------------------------- | -------------------- |
| `POST /api/v1/dayhomes/intake`        | 30 req/min per IP    |
| `POST /api/v1/internal/*` (callbacks) | 60 req/min per IP    |
| All other dayhome endpoints           | 100 req/min per user |

---

## Data Model Mapping

### Dayhome Entity

The Dayhome model is expanded to include all intake payload fields. See `apps/api/src/database/models/dayhome.model.ts` for the full schema.

Key storage decisions:

- Fields are extracted into typed columns (address, capacity, license, etc.)
- `rawPayload` stores the complete intake JSON for audit trail
- `specializations` and `profileItems` are stored as JSONB
- Portal's granular status is stored as `portalStatus` alongside our internal `status` field

### IntakeLog Entity

Every intake request is logged in the `intake_logs` table for audit:

| Column               | Type            | Notes                                     |
| -------------------- | --------------- | ----------------------------------------- |
| `id`                 | UUID            | PK                                        |
| `externalId`         | string          | From payload                              |
| `idempotencyKey`     | string          | From header                               |
| `status`             | enum            | `success`, `flagged_for_review`, `failed` |
| `signatureValid`     | boolean         |                                           |
| `validationErrors`   | JSONB           | Array of validation messages              |
| `rawRequestBody`     | JSONB           | Full request body                         |
| `responseStatusCode` | integer         | HTTP status returned                      |
| `dayhomeId`          | UUID (nullable) | FK if created                             |
| `createdAt`          | datetime        |                                           |

---

## Error Codes

Defined in `packages/shared-types/src/constants.ts`:

| Code                       | HTTP Status | Description                               |
| -------------------------- | ----------- | ----------------------------------------- |
| `INTAKE_SIGNATURE_INVALID` | 401         | HMAC signature doesn't match              |
| `INTAKE_DUPLICATE`         | 409         | Idempotency key already processed         |
| `INTAKE_INVALID_PAYLOAD`   | 422         | Validation failure or unsupported version |

---

## Staging Testing Checklist

### Portal to Validate

- [ ] HMAC signature verification on `/dayhomes/intake`
- [ ] Replay protection via `X-Timestamp` (5 min window)
- [ ] Idempotency deduplication (same key → 409)
- [ ] Required field validation (missing fields → 422)
- [ ] Document download from signed URLs
- [ ] `DAYHOME_OWNER` user creation
- [ ] Welcome email sent via BullMQ

### Portal Callback Validation

- [ ] `POST /api/v1/internal/status` — status transitions
- [ ] `POST /api/v1/internal/compliance` — compliance record
- [ ] `PUT /api/v1/internal/educator-profile` — operations update
- [ ] `POST /api/v1/internal/documents` — document sync
