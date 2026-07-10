# Spiced Dayhome — Unified Childcare Management System

**Agency:** Spiced Childcare  
**Platform:** Unified operational backbone for post-approval dayhome lifecycle management  
**Lead Engineer / PM / Scrum Master:** [Assigned]

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [System Architecture](#2-system-architecture)
3. [System Boundary & External Integrations](#3-system-boundary--external-integrations)
4. [Core Entities & Data Model](#4-core-entities--data-model)
5. [Roles & Permissions](#5-roles--permissions)
6. [API Design & Conventions](#6-api-design--conventions)
7. [Business Workflows](#7-business-workflows)
8. [Frontend Application Map](#8-frontend-application-map)
9. [Implementation Status](#9-implementation-status)
10. [Sprint Roadmap](#10-sprint-roadmap)
11. [Development Guide](#11-development-guide)
12. [Security & Compliance](#12-security--compliance)
13. [Architecture Decision Records](#13-architecture-decision-records-adrs)
14. [Deployment & Infrastructure](#14-deployment--infrastructure)

---

## 1. Project Overview

### What This System Is

A unified childcare management platform that takes over the **moment a dayhome is approved and activated** by the agency's external Application Portal. It manages the full post-approval lifecycle:

- Dayhome operations (rooms, capacity, scheduling)
- Educator management (profiles, scheduling, time tracking, PTO)
- Family & child management (registration, enrollment, medical, daily updates)
- Attendance tracking (check-in/out, ratio monitoring, daily board)
- Billing & finance (invoice generation, subsidies, payment tracking)
- Document compliance (license/insurance expiry, renewal alerts, audits)
- Messaging & notifications (parent-educator chat, announcements, push)
- Reporting & analytics (operational, financial, compliance, enrollment)
- Government compliance (read-only reporting for regulatory oversight)

### What This System Is NOT

- ❌ The Application Portal — that external system handles dayhome applications, licensing review, and approval/rejection. This system receives the result of that process via API.
- ❌ A single-dayhome tool — this is an agency-wide platform managing multiple dayhomes simultaneously.

### Budget & Timeline

- **Budget:** ~$15,000 CAD
- **Timeline:** 4–6 months (10 sprints × 2 weeks)
- **Team:** 5+ developers, 1 PM/scrum master

---

## 2. System Architecture

### Tech Stack

| Layer              | Technology                                              | Purpose                                          |
| ------------------ | ------------------------------------------------------- | ------------------------------------------------ |
| **Monorepo**       | pnpm workspaces + Turborepo                             | Shared configs, types, utils across all packages |
| **Backend**        | NestJS 10 + TypeScript                                  | REST API with modular architecture               |
| **Database**       | PostgreSQL 15 + Sequelize (with `sequelize-typescript`) | Primary data store                               |
| **Cache / Queue**  | Redis 7 + BullMQ                                        | Caching, rate limiting, job queues               |
| **Web Frontends**  | Next.js 14 App Router + React 18                        | 3 portals (admin, dayhome owner, parent)         |
| **Mobile**         | React Native / Expo SDK 51                              | Educator + Parent mobile apps (Sprint 10)        |
| **UI**             | Tailwind CSS + shadcn/ui + Radix primitives             | Design system shared across portals              |
| **State**          | TanStack Query + Zustand                                | Server state + client state                      |
| **Forms**          | React Hook Form + Zod                                   | Frontend validation                              |
| **Charts**         | Recharts                                                | Reporting dashboards                             |
| **File Storage**   | MinIO (dev) / Cloudflare R2 (prod)                      | S3-compatible document storage                   |
| **Monitoring**     | Prometheus + Grafana                                    | Metrics and visualization                        |
| **Error Tracking** | Sentry                                                  | Production error monitoring                      |
| **Email**          | Mailpit (dev) / Resend or SendGrid (prod)               | Transactional emails                             |

### Monorepo Structure

```
spiced-dayhome/
├── apps/
│   ├── api/                      # NestJS backend
│   ├── web-admin/                # Agency admin portal (Next.js)
│   ├── web-dayhome/              # Dayhome owner portal (Next.js)
│   └── web-parent/               # Parent portal (Next.js)
├── packages/
│   ├── shared-types/             # TypeScript enums, interfaces, API contracts
│   ├── shared-utils/             # Shared utility functions
│   ├── shared-constraints/       # Constants, regex, validation rules
│   └── ui-kit/                   # Shared React component library
├── docker/
│   └── prometheus.yml
├── documentation/
│   ├── SYSTEM_GUIDE.md           # THIS FILE — single source of truth
│   ├── SPRINT_ROADMAP.md         # Corrected sprint plan
│   ├── DEVELOPMENT_GUIDE.md      # Developer setup & conventions
│   └── sprints/                  # Individual sprint definitions
├── docker-compose.yml            # All infrastructure services
├── turbo.json                    # Turborepo pipeline
├── pnpm-workspace.yaml
├── tsconfig.base.json
├── eslint.config.mjs
└── .prettierrc
```

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                        EXTERNAL SYSTEMS                              │
│  ┌──────────────────────┐                                            │
│  │ Application Portal   │── POST /api/v1/dayhomes/intake (webhook) ──│──┐
│  │ (existing, external) │                                            │  │
│  └──────────────────────┘                                            │  │
│  ┌──────────────────────┐                                            │  │
│  │ Stripe (payments)    │── Payment processing                       │  │
│  └──────────────────────┘                                            │  │
│  ┌──────────────────────┐                                            │  │
│  │ SendGrid/Resend      │── Transactional email                      │  │
│  └──────────────────────┘                                            │  │
│  ┌──────────────────────┐                                            │  │
│  │ Twilio               │── SMS notifications                        │  │
│  └──────────────────────┘                                            │  │
└──────────────────────────────────────────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────────────────────────────────┐
│                     UNIFIED SPICED DAYHOME SYSTEM                     │
│                                                                       │
│  ┌──────────────────────────────────────────────────────────────┐    │
│  │                   API GATEWAY (NestJS)                        │    │
│  │  /api/v1/* ─── AuthGuard ─── RolesGuard ─── PermissionsGuard │    │
│  └──────────────────────────────────────────────────────────────┘    │
│           │              │              │              │             │
│  ┌────────▼──┐  ┌────────▼──┐  ┌────────▼──┐  ┌────────▼──┐         │
│  │  Auth     │  │ Dayhome   │  │  Family   │  │  Billing  │         │
│  │  Module   │  │  Module   │  │  Module   │  │  Module   │         │
│  └───────────┘  └───────────┘  └───────────┘  └───────────┘         │
│  ┌────────▼──┐  ┌────────▼──┐  ┌────────▼──┐  ┌────────▼──┐         │
│  │ Educator  │  │ Attendance│  │ Document  │  │ Messaging │         │
│  │  Module   │  │  Module   │  │  Module   │  │  Module   │         │
│  └───────────┘  └───────────┘  └───────────┘  └───────────┘         │
│  ┌────────▼──┐  ┌────────▼──┐  ┌────────▼──┐                        │
│  │  Reports  │  │  Health   │  │  Storage  │                        │
│  │  Module   │  │  Module   │  │  Module   │                        │
│  └───────────┘  └───────────┘  └───────────┘                        │
│                                                                       │
│  ┌──────────────────────────────────────────────────────────────┐    │
│  │                   BACKGROUND JOBS (BullMQ)                    │    │
│  │  invoice-generation │ document-expiry-check │ attendance-summary │
│  │  payment-reminder   │ send-email            │ send-push         │
│  └──────────────────────────────────────────────────────────────┘    │
│                                                                       │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────────────────┐ │
│  │  PostgreSQL  │  │    Redis     │  │  MinIO / R2 (File Storage) │ │
│  └──────────────┘  └──────────────┘  └────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────────────────────────────────┐
│                      FRONTEND APPLICATIONS                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────┐ │
│  │  Web Admin   │  │ Web Dayhome  │  │ Web Parent   │  │  Mobile  │ │
│  │  :3000       │  │  :3001       │  │  :3002       │  │  (Expo)  │ │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────┘ │
└──────────────────────────────────────────────────────────────────────┘
```

---

## 3. System Boundary & External Integrations

### The Dayhome Lifecycle (Full Picture)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                APPLICATION PORTAL (EXTERNAL — OUT OF SCOPE)              │
│                                                                          │
│  Dayhome Applies → Compliance Review → Approved/Rejected                │
│                                           │                             │
│                                    If Approved                          │
│                                           │                             │
│                                           ▼                             │
│                         API Push: Dayhome Record                        │
│                         (license, capacity, owner, insurance)           │
└─────────────────────────────────────────────────────────────────────────┘
                                           │
                                           ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                     UNIFIED SYSTEM (THIS PLATFORM)                       │
│                                                                          │
│  ┌──────────────────┐                                                    │
│  │ API Intake       │── Validate → Map → Create Profile → Assign Liaison│
│  │ Webhook (/intake)│                                                    │
│  └──────────────────┘                                                    │
│                                                                          │
│  Then: Dayhome Owner/Educator invited → Accounts created →               │
│  Rooms configured → Operational                                          │
│                                                                          │
│  Ongoing: Compliance monitoring, families enroll, children attend,        │
│  billing runs, reports generated                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### API Intake Contract

When the external Application Portal approves a dayhome, it sends a POST to:

```
POST /api/v1/dayhomes/intake
```

**Security — this is an externally-callable endpoint that creates real records. Two mandatory protections:**

1. **HMAC Signature Verification**: The Application Portal signs the request body with a shared secret. The Unified System recomputes the HMAC-SHA256 hash on the raw body and rejects the request if it doesn't match. Secret rotated via env var.

```
Signature: sha256=<hex-digest>
```

2. **Idempotency Key**: The Application Portal includes an `Idempotency-Key` header (the `externalId` value, or a UUID per attempt). The Unified System deduplicates by this key — if a record with the same key was already processed, it returns the existing record rather than creating a duplicate. Keys are retained for at least 30 days.

```
Idempotency-Key: <externalId-or-uuid>
```

**Payload fields (expected from external portal):**

| Field                 | Type   | Required | Notes                                                         |
| --------------------- | ------ | -------- | ------------------------------------------------------------- |
| `externalId`          | string | yes      | ID from the Application Portal (also used as idempotency key) |
| `businessName`        | string | yes      | Legal name of dayhome business                                |
| `ownerName`           | string | yes      | Primary owner full name                                       |
| `ownerEmail`          | string | yes      | Owner's email (used for account invitation)                   |
| `ownerPhone`          | string | no       |                                                               |
| `address`             | string | yes      | Physical address                                              |
| `approvedCapacity`    | number | yes      | Max children approved by agency                               |
| `licenseNumber`       | string | yes      | Agency-issued license number                                  |
| `licenseExpiryDate`   | date   | yes      | License expiration                                            |
| `insuranceProvider`   | string | no       |                                                               |
| `insuranceExpiryDate` | date   | no       |                                                               |
| `inspectionDate`      | date   | no       | Most recent inspection date                                   |
| `inspectionResult`    | enum   | no       | PASS / PASS_WITH_CONDITIONS / FAIL                            |

The Unified System validates signature → checks idempotency → maps fields → creates the dayhome with status `ACTIVE` (not `PENDING` — it arrives pre-approved). If validation fails, the record is flagged for manual review by an agency coordinator.

**Error responses:**

| Status | Code                       | Meaning                                                     |
| ------ | -------------------------- | ----------------------------------------------------------- |
| 401    | `INTAKE_SIGNATURE_INVALID` | HMAC signature doesn't match                                |
| 409    | `INTAKE_DUPLICATE`         | Idempotency key already processed (returns existing record) |
| 422    | `INTAKE_VALIDATION_FAILED` | Payload fields invalid (flagged for manual review)          |

### Other External Integrations

| Integration              | Direction | Purpose                                                                                                                                                            |
| ------------------------ | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Cloudflare R2 (S3)       | Outbound  | File storage for documents, photos                                                                                                                                 |
| Stripe                   | Outbound  | Payment processing (Sprint 6) — decision required: mock-only or real Stripe integration. See [Payment Architecture Decision](#payment-architecture-decision) below |
| SendGrid / Resend        | Outbound  | Transactional email                                                                                                                                                |
| Twilio                   | Outbound  | SMS notifications (Sprint 8)                                                                                                                                       |
| Firebase Cloud Messaging | Outbound  | Push notifications (Sprint 10)                                                                                                                                     |

---

## 4. Core Entities & Data Model

### Entity Relationship Summary

```
Organization ──has many──▶ Dayhome
Dayhome ──has many──▶ Room
Dayhome ──has many──▶ Educator
Dayhome ──has many──▶ Document
Organization ──has many──▶ Family
Family ──has many──▶ Child
Child ──has one──▶ Enrollment (→ Room)
Child ──has many──▶ Attendance
Child ──has many──▶ ActivityLog
Child ──has many──▶ IncidentReport
Educator ──has many──▶ ShiftPattern
Educator ──has many──▶ PtoRequest
Educator ──has many──▶ TimeClockEntry
Family ──has many──▶ Invoice
Dayhome ──has many──▶ Message
Dayhome ──has many──▶ Announcement
```

### Entity Reference

| Entity                      | Table                       | Key Fields                                                                                                                   | Sprint         |
| --------------------------- | --------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | -------------- |
| **Organization**            | `organizations`             | id, name, email, status (ACTIVE/SUSPENDED)                                                                                   | S1             |
| **User**                    | `users`                     | id, organizationId, email, role, firstName, lastName, status                                                                 | S0             |
| **Dayhome**                 | `dayhomes`                  | id, organizationId, name, address, capacity, status (ACTIVE/SUSPENDED/CLOSED), licenseNumber, licenseExpiry, externalId      | S2             |
| **Room**                    | `rooms`                     | id, dayhomeId, name, capacity, ageGroup (INFANT/TODDLER/PRESCHOOL/SCHOOL_AGE)                                                | S2             |
| **Educator**                | `educators`                 | id, dayhomeId, firstName, lastName, email, phone, status (ACTIVE/ON_LEAVE/TERMINATED)                                        | S3             |
| **ShiftPattern**            | `shift_patterns`            | id, educatorId, dayOfWeek, startTime, endTime, roomId, effectiveFrom, effectiveTo                                            | S3             |
| **PtoRequest**              | `pto_requests`              | id, educatorId, startDate, endDate, reason, status (PENDING/APPROVED/REJECTED)                                               | S3             |
| **TimeClockEntry**          | `time_clock_entries`        | id, educatorId, clockIn, clockOut, type (WORK/BREAK)                                                                         | S3             |
| **Family**                  | `families`                  | id, organizationId, primaryContactName, email, phone                                                                         | S4             |
| **Child**                   | `children`                  | id, familyId, firstName, lastName, dateOfBirth, gender, allergies, medicalNotes, dietaryRestrictions                         | S4             |
| **AuthorizedPickup**        | `authorized_pickups`        | id, childId, name, phone, relationship, photoUrl, pinHash                                                                    | S4             |
| **EmergencyContact**        | `emergency_contacts`        | id, childId, name, phone, relationship                                                                                       | S4             |
| **Enrollment**              | `enrollments`               | id, childId, dayhomeId, roomId, startDate, endDate, status (ACTIVE/WAITLISTED/WITHDRAWN)                                     | S4             |
| **Attendance**              | `attendance_records`        | id, childId, date, checkInTime, checkOutTime, checkedInBy, checkedOutBy, status (PRESENT/ABSENT/LATE), healthScreeningPassed | S5             |
| **DailyBoard**              | `daily_boards`              | id, dayhomeId, roomId, date, snapshot data                                                                                   | S5             |
| **Invoice**                 | `invoices`                  | id, familyId, dayhomeId, totalAmount, subsidyAmount, paidAmount, dueDate, status (DRAFT/SENT/PAID/OVERDUE/CANCELLED)         | S6             |
| **InvoiceLineItem**         | `invoice_line_items`        | id, invoiceId, childId, date, description, amount                                                                            | S6             |
| **Subsidy**                 | `subsidies`                 | id, familyId, dayhomeId, type (PERCENTAGE/FIXED), value, effectiveFrom, effectiveTo                                          | S6             |
| **Payment**                 | `payments`                  | id, invoiceId, amount, method, reference, paidAt                                                                             | S6             |
| **Document**                | `documents`                 | id, dayhomeId, educatorId, documentType, fileUrl, expiryDate, status (ACTIVE/EXPIRING_SOON/EXPIRED/SUPERSEDED), version      | S7             |
| **Message**                 | `messages`                  | id, threadId, senderEducatorId, senderFamilyId, body, isRead                                                                 | S8             |
| **MessageThread**           | `message_threads`           | id, dayhomeId, subject, participantIds                                                                                       | S8             |
| **Announcement**            | `announcements`             | id, dayhomeId, title, body, priority (INFO/IMPORTANT/URGENT)                                                                 | S8             |
| **ActivityLog**             | `activity_logs`             | id, childId, educatorId, type (MEAL/NAP/DIAPER/MOOD/PHOTO/NOTE), description, timestamp, photoUrls                           | S8             |
| **IncidentReport**          | `incident_reports`          | id, childId, reporterId, type, severity, description, actionTaken, parentAcknowledged                                        | S8             |
| **NotificationPreference**  | `notification_preferences`  | id, userId, channel (PUSH/EMAIL/SMS), type, enabled                                                                          | S8             |
| **AuditLog**                | `audit_logs`                | id, userId, action, entity, entityId, before, after, timestamp                                                               | Cross          |
| **CurriculumPlan**          | `curriculum_plans`          | id, dayhomeId, roomId, title, learningDomain, startDate, endDate, activities                                                 | S10 (deferred) |
| **DevelopmentalAssessment** | `developmental_assessments` | id, childId, domain, score, notes, assessedAt                                                                                | S10 (deferred) |
| **MealPlan**                | `meal_plans`                | id, dayhomeId, weekStarting, dailyMenus                                                                                      | S10 (deferred) |

---

## 5. Roles & Permissions

### Role Hierarchy

```
SUPER_ADMIN           — Full system access, manage organizations
    │
    ▼
ORG_ADMIN             — Manage org settings, all dayhomes, staff, billing, reports
    │
    ├── ORG_MANAGER    — Operational management, no billing/finance access
    ├── DAYHOME_OWNER  — Own dayhome: rooms, educators, children, billing
    │       │
    │       ▼
    │   EDUCATOR       — Daily operations: attendance, activities, messaging
    │
    ├── BILLING_ONLY   — Finance only: invoices, payments, reports (no child data)
    ├── PARENT         — Own family: children, invoices, messages
    └── GOVERNMENT     — Read-only: compliance, enrollment aggregated data
```

### Permissions Matrix

| Domain           | SUPER_ADMIN | ORG_ADMIN | ORG_MANAGER | DAYHOME_OWNER | EDUCATOR    | BILLING_ONLY | PARENT       | GOVERNMENT |
| ---------------- | ----------- | --------- | ----------- | ------------- | ----------- | ------------ | ------------ | ---------- |
| Organizations    | CRUD        | Read      | Read        | —             | —           | —            | —            | —          |
| Dayhomes         | All         | All org   | All org     | Own           | Assigned    | —            | —            | List       |
| Rooms            | —           | —         | —           | Own CRUD      | Read        | —            | —            | —          |
| Educators        | —           | All org   | All org     | Own CRUD      | Read own    | —            | —            | —          |
| Families         | —           | All org   | All org     | Own enrolled  | —           | —            | Own          | —          |
| Children         | —           | All org   | All org     | Own enrolled  | Assigned    | —            | Own          | Aggregated |
| Attendance       | —           | All       | All         | Own           | Assigned    | —            | Own children | Aggregated |
| Billing/Invoices | All         | All org   | —           | Own           | —           | All org      | Own          | —          |
| Documents        | All         | All org   | All org     | Own           | Own certs   | —            | —            | Read-only  |
| Messages         | —           | —         | —           | Own           | Own threads | —            | Own threads  | —          |
| Reports          | All         | All org   | Limited     | Own           | —           | Finance only | —            | Compliance |
| Audit Logs       | All         | All org   | All org     | Own           | —           | —            | —            | —          |

---

## 6. API Design & Conventions

### Base URL

```
/api/v1/
```

### Standard Response Envelope

**Success:**

```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "requestId": "uuid",
    "timestamp": "2026-07-04T12:00:00.000Z"
  }
}
```

**Error:**

```json
{
  "success": false,
  "error": {
    "code": "DAYHOME_NOT_FOUND",
    "message": "Dayhome not found with id xyz",
    "statusCode": 404,
    "details": []
  },
  "meta": {
    "requestId": "uuid",
    "timestamp": "2026-07-04T12:00:00.000Z"
  }
}
```

**Paginated:**

```json
{
  "success": true,
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8,
    "hasNext": true,
    "hasPrev": false
  },
  "meta": { "requestId": "...", "timestamp": "..." }
}
```

### API Route Map

| Module            | Method | Route                                 | Auth    | Roles                    |
| ----------------- | ------ | ------------------------------------- | ------- | ------------------------ |
| **Auth**          | POST   | `/auth/login`                         | Public  | —                        |
|                   | POST   | `/auth/register`                      | Public  | —                        |
|                   | POST   | `/auth/logout`                        | JWT     | All                      |
|                   | POST   | `/auth/refresh`                       | Cookie  | —                        |
|                   | POST   | `/auth/forgot-password`               | Public  | —                        |
|                   | POST   | `/auth/reset-password`                | Public  | —                        |
|                   | GET    | `/auth/me`                            | JWT     | All                      |
| **Dayhome**       | POST   | `/dayhomes/intake`                    | API Key | External Portal          |
|                   | GET    | `/dayhomes`                           | JWT     | ORG_ADMIN+               |
|                   | GET    | `/dayhomes/:id`                       | JWT     | ORG_ADMIN+, OWNER        |
|                   | PATCH  | `/dayhomes/:id`                       | JWT     | ORG_ADMIN, OWNER         |
|                   | POST   | `/dayhomes/:id/suspend`               | JWT     | ORG_ADMIN, OWNER         |
|                   | POST   | `/dayhomes/:id/activate`              | JWT     | ORG_ADMIN                |
|                   | POST   | `/dayhomes/:id/close`                 | JWT     | ORG_ADMIN                |
| **Rooms**         | GET    | `/dayhomes/:id/rooms`                 | JWT     | OWNER+                   |
|                   | POST   | `/dayhomes/:id/rooms`                 | JWT     | OWNER                    |
|                   | PATCH  | `/rooms/:id`                          | JWT     | OWNER                    |
|                   | DELETE | `/rooms/:id`                          | JWT     | OWNER                    |
| **Educator**      | GET    | `/educators`                          | JWT     | OWNER+                   |
|                   | POST   | `/educators`                          | JWT     | OWNER                    |
|                   | GET    | `/educators/:id`                      | JWT     | OWNER, SELF              |
|                   | PATCH  | `/educators/:id`                      | JWT     | OWNER                    |
|                   | GET    | `/educators/:id/schedule`             | JWT     | OWNER, SELF              |
|                   | POST   | `/educators/:id/time-clock/clock-in`  | JWT     | EDUCATOR                 |
|                   | POST   | `/educators/:id/time-clock/clock-out` | JWT     | EDUCATOR                 |
|                   | POST   | `/educators/:id/pto`                  | JWT     | EDUCATOR                 |
|                   | PATCH  | `/pto/:id/approve`                    | JWT     | OWNER                    |
| **Family**        | POST   | `/families`                           | Public  | —                        |
|                   | GET    | `/families/:id`                       | JWT     | PARENT, ORG_ADMIN+       |
|                   | PATCH  | `/families/:id`                       | JWT     | PARENT                   |
| **Child**         | POST   | `/children`                           | JWT     | PARENT                   |
|                   | GET    | `/children/:id`                       | JWT     | PARENT, EDUCATOR, ADMIN  |
|                   | PATCH  | `/children/:id`                       | JWT     | PARENT                   |
|                   | POST   | `/children/:id/pickups`               | JWT     | PARENT                   |
|                   | POST   | `/children/:id/enroll`                | JWT     | ORG_ADMIN                |
| **Attendance**    | POST   | `/attendance/check-in`                | JWT     | EDUCATOR                 |
|                   | POST   | `/attendance/check-out`               | JWT     | EDUCATOR                 |
|                   | GET    | `/attendance`                         | JWT     | OWNER+                   |
|                   | GET    | `/attendance/daily-board/:dayhomeId`  | JWT     | EDUCATOR, OWNER          |
| **Billing**       | POST   | `/invoices/generate`                  | JWT     | OWNER, ORG_ADMIN         |
|                   | GET    | `/invoices`                           | JWT     | OWNER, PARENT, ORG_ADMIN |
|                   | GET    | `/invoices/:id`                       | JWT     | OWNER, PARENT            |
|                   | POST   | `/payments`                           | JWT     | PARENT                   |
|                   | GET    | `/subsidies`                          | JWT     | ORG_ADMIN, BILLING_ONLY  |
|                   | POST   | `/subsidies`                          | JWT     | ORG_ADMIN                |
| **Documents**     | POST   | `/documents/upload`                   | JWT     | OWNER, EDUCATOR          |
|                   | GET    | `/documents`                          | JWT     | ORG_ADMIN+               |
|                   | GET    | `/documents/:id`                      | JWT     | ORG_ADMIN+, OWNER        |
|                   | POST   | `/documents/:id/renew`                | JWT     | OWNER                    |
| **Messaging**     | POST   | `/messages`                           | JWT     | PARENT, EDUCATOR         |
|                   | GET    | `/messages/threads`                   | JWT     | All                      |
|                   | GET    | `/messages/threads/:id`               | JWT     | Participant              |
|                   | POST   | `/announcements`                      | JWT     | OWNER, ORG_ADMIN         |
| **Activities**    | POST   | `/activities`                         | JWT     | EDUCATOR                 |
|                   | GET    | `/activities/child/:id`               | JWT     | PARENT, EDUCATOR         |
| **Incidents**     | POST   | `/incidents`                          | JWT     | EDUCATOR                 |
|                   | GET    | `/incidents/:id`                      | JWT     | PARENT, OWNER            |
|                   | POST   | `/incidents/:id/acknowledge`          | JWT     | PARENT                   |
| **Reports**       | GET    | `/reports/attendance`                 | JWT     | ORG_ADMIN+               |
|                   | GET    | `/reports/financial`                  | JWT     | ORG_ADMIN, BILLING_ONLY  |
|                   | GET    | `/reports/compliance`                 | JWT     | ORG_ADMIN+, GOVERNMENT   |
|                   | GET    | `/reports/enrollment`                 | JWT     | ORG_ADMIN+, GOVERNMENT   |
|                   | GET    | `/dashboard`                          | JWT     | ORG_ADMIN+               |
| **Health**        | GET    | `/health`                             | Public  | —                        |
| **Storage**       | POST   | `/storage/upload`                     | JWT     | All authed               |
| **Notifications** | POST   | `/notifications/register-device`      | JWT     | All                      |
|                   | GET    | `/notifications/preferences`          | JWT     | All                      |
|                   | PATCH  | `/notifications/preferences`          | JWT     | All                      |

### API Conventions

- **Versioning**: URI prefix `/api/v1/`. Breaking changes → `/api/v2/`.
- **HTTP Methods**: GET (read), POST (create), PATCH (partial update), DELETE (soft delete)
- **Status codes**: 200 (success), 201 (created), 400 (validation), 401 (unauth), 403 (forbidden), 404 (not found), 429 (rate limit), 500 (server error)
- **Rate limiting**: 20 req/min globally, 5 login attempts/15 min
- **Soft delete**: All entities have `deletedAt` (paranoid: true). Queries exclude deleted by default.

---

## 7. Business Workflows

### 7.1 Dayhome Onboarding (API Intake)

```
[Application Portal]
    │ Dayhome approved
    ▼
POST /api/v1/dayhomes/intake
    │
    ▼
Validate Payload
    │
    ├── Valid ──▶ Map fields → Create Dayhome (status: ACTIVE)
    │               │
    │               ▼
    │             Assign Agency Coordinator/Liaison
    │               │
    │               ▼
    │             Send Welcome Email to Owner
    │               │
    │               ▼
    │             Owner clicks link → Sets password → Account Active
    │               │
    │               ▼
    │             Owner configures: Rooms, Educators, Schedules, Capacity
    │               │
    │               ▼
    │             Dayhome Fully Operational
    │
    └── Invalid ──▶ Flag for Manual Review
                    │
                    ▼
                  Agency Coordinator Corrects → Approve → Proceed
```

### 7.2 Family Enrollment

```
Parent Creates Account → Family Profile → Add Child → Search Active Dayhomes
    │
    ▼
Submit Enrollment Request to Dayhome
    │
    ▼
Dayhome Owner Reviews
    │
    ├── Capacity Available? ──▶ Enroll → Assign Room → Billing Setup
    │                               │
    │                               ▼
    │                           Child Starts Attendance
    │
    └── No Capacity ──▶ Add to Waitlist (FIFO)
                        │
                        ▼
                      Slot Opens → Notify Parent → Enroll
```

### 7.3 Daily Operations

```
Morning: Digital Health Screening (temperature + symptoms)
    │
    ▼
Educator Checks In Child (PIN verification or name search)
    │
    ▼
Attendance Recorded → Daily Board Updated (real-time via Socket.io)
    │
    ▼
Parent Receives Push Notification: "Child checked in at 8:30 AM"
    │
    ├── Throughout Day:
    │   - Activities logged (meals, naps, diaper, mood, photos)
    │   - Learning activities (tied to curriculum plan if applicable)
    │   - Incident reports (with parent digital signature if needed)
    │
    ▼
Afternoon: Educator Checks Out Child (authorized pickup verified via PIN)
    │
    ▼
Checkout Recorded → Daily Board Updated → Parent Notification
    │
    ▼
17:00: Daily Summary Generated → Sent to Parent
```

### 7.4 Attendance & Ratio Monitoring

```
Each child checked in/out tracked with timestamps
    │
    ▼
Real-time calculation: presentChildren / presentEducators
    │
    ├── Ratio Compliant (green) ──▶ No action
    ├── Approaching Limit (yellow) ──▶ Warning to educator
    └── Breached (red) ──▶ Alert sent to dayhome owner + org admin
                              │
                              ▼
                            Corrective action (adjust rooms, call in staff)
```

### 7.5 Document Compliance

```
Dayhome Owner Uploads Document (license, insurance, inspection, certs)
    │
    ▼
Virus Scan (ClamAV) → Store in R2/S3 → Metadata in DB
    │
    ▼
Monitoring Engine Tracks Expiry Dates
    │
    ├── 60 days before expiry → Email + In-App Alert
    ├── 30 days before expiry → Escalated Reminder
    ├── 14 days before expiry → Urgent Alert (SMS + Email)
    ├── 7 days before expiry → Final Warning
    └── Expired → Status: EXPIRED → Compliance Dashboard Updated
                      │
                      ▼
                  Owner Renews → Upload New Version → Cycle Restarts
```

### 7.6 Billing & Finance

```
Attendance Records (daily)
    │
    ▼
Billing Engine (weekly/monthly job)
    │
    ├── Calculate: days_attended × daily_rate
    ├── Apply subsidy: percentage or fixed deduction
    └── Generate Invoice
    │
    ▼
Invoice Sent to Parent (email + in-app)
    │
    ├── Payment Received → Receipt → Financial Report Updated
    ├── Overdue (30 days) → Reminder → Additional fees
    └── Overdue (60+ days) → Escalation → Dayhome Owner Notified
```

### 7.7 Reporting & Government

```
Operational Data (all active dayhomes)
    │
    ▼
Reporting Engine (aggregated queries, materialized views)
    │
    ├── Attendance Reports ──┐
    ├── Financial Reports   ──┤
    ├── Compliance Reports  ──┤── Agency Dashboard (KPI cards, charts)
    └── Enrollment Reports  ──┘
                                  │
                                  ▼
                            Government Submission
                            (read-only, aggregated data)
                                  │
                                  ▼
                            Audit & Review
```

---

## 8. Frontend Application Map

### 8.1 Web Admin (`apps/web-admin`) — Port 3000

Agency staff portal. Full oversight of all organizations, dayhomes, compliance, billing, and reporting.

| Route                       | Page                           | Sprint            |
| --------------------------- | ------------------------------ | ----------------- |
| `/login`                    | Login                          | S0 ✅             |
| `/register`                 | Register                       | S0 ✅             |
| `/forgot-password`          | Forgot password                | S1                |
| `/reset-password`           | Reset password                 | S1                |
| `/dashboard`                | Main dashboard with KPI cards  | S0 ✅ (stub) → S9 |
| `/organizations`            | Organization list              | S1                |
| `/organizations/[id]`       | Organization detail & settings | S1                |
| `/organizations/[id]/staff` | Staff management & roles       | S1                |
| `/dayhomes`                 | All dayhomes list with filters | S2                |
| `/dayhomes/[id]`            | Dayhome detail                 | S2                |
| `/dayhomes/[id]/rooms`      | Room management                | S2                |
| `/dayhomes/[id]/documents`  | Document compliance            | S7                |
| `/educators`                | All educators (org-wide)       | S3                |
| `/educators/[id]`           | Educator detail                | S3                |
| `/attendance/history`       | Attendance reports             | S5                |
| `/billing/invoices`         | All invoices                   | S6                |
| `/billing/subsidies`        | Subsidy management             | S6                |
| `/billing/reports`          | Financial reports              | S6                |
| `/compliance`               | Compliance dashboard           | S7                |
| `/reports/attendance`       | Attendance analytics           | S9                |
| `/reports/financial`        | Financial analytics            | S9                |
| `/reports/compliance`       | Compliance analytics           | S9                |
| `/reports/enrollment`       | Enrollment analytics           | S9                |
| `/settings`                 | Org settings                   | S1                |
| `/audit-logs`               | Audit log viewer               | S1                |

### 8.2 Web Dayhome Owner (`apps/web-dayhome`) — Port 3001

Dayhome owner portal. Manage their own dayhome operations.

| Route                      | Page                         | Sprint |
| -------------------------- | ---------------------------- | ------ |
| `/login`                   | Login                        | S2     |
| `/dashboard`               | Daily overview               | S2     |
| `/rooms`                   | Room management              | S2     |
| `/educators`               | Staff list management        | S3     |
| `/educators/new`           | Add educator                 | S3     |
| `/scheduling`              | Shift scheduling grid        | S3     |
| `/educators/[id]/schedule` | Educator schedule            | S3     |
| `/educators/[id]/pto`      | PTO management               | S3     |
| `/daily-board`             | Daily attendance board       | S5     |
| `/attendance/history`      | Attendance history           | S5     |
| `/billing/invoices`        | Invoice management           | S6     |
| `/billing/subsidies`       | Family subsidies             | S6     |
| `/billing/reports`         | Financial reports            | S6     |
| `/documents`               | Document upload & compliance | S7     |
| `/documents/upload`        | Upload document              | S7     |
| `/compliance`              | Compliance status            | S7     |
| `/messages`                | Messages & announcements     | S8     |
| `/announcements`           | Send announcements           | S8     |
| `/incidents`               | Incident reports             | S8     |
| `/settings`                | Dayhome settings             | S2     |

### 8.3 Web Parent (`apps/web-parent`) — Port 3002

Parent/family portal. Their children, invoices, messages, daily updates.

| Route                     | Page                        | Sprint |
| ------------------------- | --------------------------- | ------ |
| `/login`                  | Login                       | S4     |
| `/register`               | Family registration         | S4     |
| `/forgot-password`        | Forgot password             | S4     |
| `/dashboard`              | My children overview        | S4     |
| `/children`               | Children list               | S4     |
| `/children/new`           | Add child                   | S4     |
| `/children/[id]`          | Child detail & daily feed   | S4     |
| `/children/[id]/medical`  | Medical info                | S4     |
| `/children/[id]/pickups`  | Authorized pickups          | S4     |
| `/enrollment`             | Browse & enroll in dayhomes | S4     |
| `/invoices`               | My invoices                 | S6     |
| `/invoices/[id]`          | Invoice detail              | S6     |
| `/payments`               | Payment history             | S6     |
| `/messages`               | Messages with educators     | S8     |
| `/activities`             | Child activity feed         | S8     |
| `/incidents`              | Incident history            | S8     |
| `/settings/notifications` | Notification preferences    | S8     |

### 8.4 Mobile Apps (`apps/mobile-educator`, `apps/mobile-parent`) — Sprint 10

React Native (Expo) apps. Core mobile workflows: check-in/out, daily board, notifications, messaging, activity logging.

---

## 9. Implementation Status

### What's Built (Sprint 0 — ~90% Complete)

| Component            | Status      | Details                                                                                        |
| -------------------- | ----------- | ---------------------------------------------------------------------------------------------- |
| Monorepo scaffold    | ✅ Complete | pnpm workspaces, Turborepo, tsconfig.base.json                                                 |
| Docker Compose       | ✅ Complete | PostgreSQL 15, Redis 7, MinIO, ClamAV, Mailpit, Prometheus, Grafana                            |
| NestJS API scaffold  | ✅ Complete | main.ts with global pipes, filters, interceptors, Swagger, Bull Board, Pino logger             |
| Database models (13) | ✅ Complete | All entities defined with Sequelize decorators                                                 |
| Database migration   | ✅ Complete | Full schema with all tables, indexes, foreign keys                                             |
| Seed data            | ✅ Complete | Demo data: org, users, dayhomes, rooms, educators, families, children, enrollments, attendance |
| Auth module          | ✅ Complete | JWT dual-token (access + refresh), login, register, refresh, logout, me                        |
| Auth guards          | ✅ Complete | JwtAuthGuard, RolesGuard, PermissionsGuard, CurrentUser decorator                              |
| Users module         | ✅ Complete | Create, findByEmail, findById                                                                  |
| Health module        | ✅ Complete | Postgres + Redis health checks                                                                 |
| Redis module         | ✅ Complete | ioredis client, set/get/del/exists                                                             |
| Mail module          | ✅ Complete | MailerService with BullMQ queue                                                                |
| Queue infrastructure | ✅ Partial  | BullMQ queues registered (email, dead-letter), email processor exists, dashboard dir is empty  |
| Storage module       | ✅ Partial  | MinIO upload works, but no document management (just raw file upload)                          |
| Web-admin pages      | ✅ Partial  | Login, Register, Dashboard stub (3 placeholder KPI cards), middleware, layout with sidebar     |
| Axios client         | ✅ Complete | Auto-refresh on 401, request queuing                                                           |
| Zustand auth store   | ✅ Complete | user, accessToken, isAuthenticated, setTokens, clearAuth                                       |
| shared-types package | ✅ Complete | Enums, interfaces, API envelope, error codes, constants                                        |
| ui-kit package       | ✅ Partial  | Button, Input, Badge, Card — missing Modal, Select, DataTable, Tabs, DropdownMenu              |
| ESLint + Prettier    | ✅ Complete | Flat config, .prettierrc                                                                       |
| Husky + lint-staged  | ✅ Complete | Git hooks                                                                                      |
| .env files           | ✅ Complete | .env.development, .env.example                                                                 |

### What's NOT Built

| Module                     | Sprint | Backend | Frontend             |
| -------------------------- | ------ | ------- | -------------------- |
| Organization CRUD          | S1     | ❌      | ❌                   |
| Staff invitation flow      | S1     | ❌      | ❌                   |
| Roles & permissions UI     | S1     | ❌      | ❌                   |
| Audit log viewer           | S1     | ❌      | ❌                   |
| Forgot/reset password      | S1     | ❌      | ✅ Stub calls        |
| API intake webhook         | S2     | ❌      | N/A                  |
| Dayhome management         | S2     | ❌      | ❌                   |
| Room management            | S2     | ❌      | ❌                   |
| Dayhome approval workflow  | S2     | ❌      | ❌                   |
| Educator management        | S3     | ❌      | ❌                   |
| Shift scheduling           | S3     | ❌      | ❌                   |
| PTO management             | S3     | ❌      | ❌                   |
| Time clock                 | S3     | ❌      | ❌                   |
| Family registration        | S4     | ❌      | ❌                   |
| Child profiles             | S4     | ❌      | ❌                   |
| Authorized pickups         | S4     | ❌      | ❌                   |
| Enrollment & waitlist      | S4     | ❌      | ❌                   |
| Check-in/out               | S5     | ❌      | ❌                   |
| Daily board (real-time)    | S5     | ❌      | ❌                   |
| Ratio monitoring           | S5     | ❌      | ❌                   |
| Invoice generation         | S6     | ❌      | ❌                   |
| Payment tracking           | S6     | ❌      | ❌                   |
| Subsidy management         | S6     | ❌      | ❌                   |
| Financial reports          | S6     | ❌      | ❌                   |
| Document upload/virus scan | S7     | ❌      | ❌                   |
| Expiry tracking & alerts   | S7     | ❌      | ❌                   |
| Compliance dashboard       | S7     | ❌      | ❌                   |
| Messaging & chat           | S8     | ❌      | ❌                   |
| Announcements              | S8     | ❌      | ❌                   |
| Activity logging           | S8     | ❌      | ❌                   |
| Incident reports           | S8     | ❌      | ❌                   |
| Push notifications         | S8     | ❌      | ❌                   |
| Reporting engine           | S9     | ❌      | ❌                   |
| KPI dashboards             | S9     | ❌      | ❌                   |
| CSV/PDF export             | S9     | ❌      | ❌                   |
| Government read-only       | S9     | ❌      | ❌                   |
| Mobile apps (Expo)         | S10    | ❌      | ❌                   |
| i18n (EN/FR)               | S10    | ❌      | ❌                   |
| WCAG accessibility         | S10    | ❌      | ❌                   |
| Offline support            | S10    | ❌      | ❌                   |
| web-dayhome portal         | All    | N/A     | ❌ (empty directory) |
| web-parent portal          | All    | N/A     | ❌ (empty directory) |
| shared-utils package       | S0     | N/A     | ❌ (empty directory) |
| shared-constraints package | S0     | N/A     | ❌ (empty directory) |

---

## 10. Sprint Roadmap

### Corrected Sprint Plan (Reflecting Actual Architecture)

The following supersedes the previous sprint plan. Key corrections:

- **Sprint 2 changed**: API intake webhook replaces manual dayhome registration
- **Sprint 1 includes**: Password reset backend (currently stubbed)
- **Sprint 5 includes**: Digital health screening at check-in
- **Sprint 7 includes**: Photo/video sharing infrastructure
- **Sprint 10 includes**: Deferred features (curriculum, portfolios, meal plans)

### Sprint 0 — Foundation & Architecture (Week 1–2) ✅ COMPLETE

_Status: ~90% done — close out remaining items_

**Remaining work:**

- [ ] Complete ui-kit: Modal, Select, DataTable, Tabs, DropdownMenu
- [ ] Populate `shared-utils` (date formatting, cn utility, validation helpers)
- [ ] Populate `shared-constraints` (regex patterns, validation rules, role hierarchy)
- [ ] Scaffold `react-i18next` with locale detection and `t()` utility — all new strings use translation keys from Sprint 1 onward (French content populated in Sprint 10)
- [ ] Add `eslint-plugin-jsx-a11y` to ESLint config — enforce aria attributes, alt text, keyboard nav from the first component built
- [ ] Queue dashboard setup (Bull Board UI)
- [ ] Write unit tests for AuthService (currently missing)
- [ ] Write integration tests for auth endpoints
- [ ] Ensure ESLint passes with zero errors

---

### Sprint 1 — Organization & User Management (Week 3–4)

**Goal:** SUPER_ADMIN manages organizations; ORG_ADMIN invites staff, manages roles; password reset works.

**Backend:**

- [ ] Organization CRUD module (Controller → Service → Repository)
- [ ] Staff invitation flow (invite → email → set password → activate)
- [ ] RBAC: Roles & Permissions decorators on all routes
- [ ] Forgot/reset password endpoints (`POST /auth/forgot-password`, `POST /auth/reset-password`)
- [ ] Audit logging middleware (capture before/after on state changes)
- [ ] Organization operational settings (holidays, hours, ratios)
- [ ] Rate limiting: 5 login attempts/15 min per IP

**Frontend (Web Admin):**

- [ ] Organization list page (`/organizations`)
- [ ] Organization detail + settings page
- [ ] Staff list + invite modal
- [ ] Role editor UI (checkbox/permission grid)
- [ ] Forgot/reset password pages
- [ ] Audit log viewer table

**Definition of Done:**

- [ ] Organization CRUD endpoints tested (Supertest)
- [ ] Staff invitation → email → registration flow end-to-end
- [ ] Password reset flow works (token in email → set new password)
- [ ] RBAC enforced: each role sees correct data
- [ ] Audit logs created for all state changes

---

### Sprint 2 — Dayhome Management & API Intake (Week 5–6)

**IMPORTANT:** This sprint differs from the old plan. Dayhomes arrive via API intake webhook from the external Application Portal, NOT via manual registration by DAYHOME_OWNER.

**Backend:**

- [ ] `POST /api/v1/dayhomes/intake` webhook (receive approved dayhome from external portal)
- [ ] Dayhome CRUD (list, detail, update)
- [ ] Status transitions: ACTIVE ↔ SUSPENDED ↔ CLOSED
- [ ] Room CRUD with capacity validation
- [ ] Agency liaison assignment
- [ ] Dayhome events: `dayhome.intaken`, `dayhome.suspended`, `dayhome.activated`
- [ ] Welcome email to dayhome owner (with account setup link)
- [ ] Authorization: `@OrganizationAccess()` guard

**Frontend (Web Admin):**

- [ ] Dayhome list with status filters (`/dayhomes`)
- [ ] Dayhome detail page (`/dayhomes/[id]`)
- [ ] Dayhome status management (suspend/activate/close)
- [ ] Room management page (`/dayhomes/[id]/rooms`)
- [ ] Intake log (audit trail of API-received dayhomes)

**Frontend (Web Dayhome) — FIRST PORTAL BUILD:**

- [ ] Scaffold `apps/web-dayhome` (Next.js 14, same stack as admin)
- [ ] Login page + auth middleware
- [ ] Dashboard with daily snapshot
- [ ] Room management (owner view)

**Definition of Done:**

- [ ] API intake webhook receives, validates, creates dayhome
- [ ] Dayhome status transitions work (suspend blocks check-ins)
- [ ] Room capacity cannot be reduced below current enrollment
- [ ] Welcome email sends to owner on intake
- [ ] Frontend: dayhome list, detail, room management working

---

### Sprint 3 — Educator Management (Week 7–8)

**Backend:**

- [ ] Educator CRUD (profiles, certifications)
- [ ] Shift scheduling (weekly patterns with overrides)
- [ ] PTO request → approval/rejection with ratio validation
- [ ] Time clock (clock-in/out with timestamps)
- [ ] Educator:child ratio calculation engine (province-specific)
- [ ] Certification tracking with expiry alerts

**Frontend (Web Dayhome):**

- [ ] Educator list page
- [ ] Add educator form with certification fields
- [ ] Weekly schedule grid (drag-and-drop shifts)
- [ ] PTO request form + approval UI
- [ ] Time clock widget (clock-in/out button)
- [ ] Hour summary table

**Frontend (Web Admin):**

- [ ] Org-wide educator view
- [ ] Educator detail page

**Definition of Done:**

- [ ] Educator CRUD with certification tracking
- [ ] Shift patterns with weekly recurrence
- [ ] PTO approval checks ratio before approving
- [ ] Time clock prevents double clock-in
- [ ] Hour summary calculated correctly
- [ ] Educator role scoping (educator sees only own schedule)

---

### Sprint 4 — Family & Child Management (Week 9–10)

**Backend:**

- [ ] Family registration module
- [ ] Child profile CRUD with medical info (encrypted at rest)
- [ ] Authorized pickup management (with PIN hashing)
- [ ] Emergency contacts
- [ ] Enrollment with capacity check & waitlist (FIFO)
- [ ] Data isolation: parent scoped to own children only
- [ ] Events: `child.enrolled`, `child.waitlisted`

**Frontend (Web Parent) — SECOND PORTAL BUILD:**

- [ ] Scaffold `apps/web-parent` (Next.js 14)
- [ ] Family registration wizard
- [ ] Child profile form (multi-step: basics → medical → pickups)
- [ ] Authorized pickup management with PIN setup
- [ ] Enrollment flow (search dayhomes → select room → confirm)
- [ ] Child dashboard with daily activity feed (read-only for now)

**Definition of Done:**

- [ ] Family registration with email verification
- [ ] Child CRUD with encrypted medical notes
- [ ] Authorized pickup PIN verified on check-out
- [ ] Enrollment → capacity full → waitlist → slot opens → notify
- [ ] Parent sees ONLY their own children (tested)

---

### Sprint 5 — Attendance & Daily Operations (Week 11–12)

**Backend:**

- [ ] Check-in/out with verification (PIN or name search)
- [ ] Digital health screening (temperature, symptom questionnaire)
- [ ] Real-time daily board via Socket.io
- [ ] Ratio calculation & monitoring (province-specific)
- [ ] Attendance history with filters
- [ ] Daily summary generation (BullMQ, 17:00)
- [ ] Schedule preference submission (parent) + approval (educator)

**Frontend (Web Dayhome):**

- [ ] Daily board page (real-time via Socket.io)
- [ ] Check-in modal (search child → confirm)
- [ ] Check-out modal (authorized pickup PIN verification)
- [ ] Health screening form at check-in
- [ ] Ratio indicator (green/yellow/red)
- [ ] Attendance history table

**Frontend (Web Parent):**

- [ ] Schedule preference form (weekly day checkboxes)
- [ ] Real-time attendance notifications (check-in/out alerts)

**Definition of Done:**

- [ ] Check-in/out with PIN or photo verification
- [ ] Health screening recorded at check-in
- [ ] Daily board updates in real-time via Socket.io
- [ ] Ratio accurate per province rules
- [ ] Parent notification within 30s of check-in/out
- [ ] Attendance exportable (CSV)

---

### Sprint 6 — Billing & Finance (Week 13–14)

**⚠️ Architectural Decision Required Before Sprint 6: Payment Integration**

The invoice engine, payment data model, and reconciliation logic change significantly based on this choice:

| Option                                                    | Effort      | Risk                                  | Recommendation                                              |
| --------------------------------------------------------- | ----------- | ------------------------------------- | ----------------------------------------------------------- |
| **Mock-only** (manual "mark as paid")                     | Low         | Rewrite later if real payments needed | OK only if agency explicitly confirms no Stripe integration |
| **Full Stripe** (PaymentIntent, webhooks, reconciliation) | Medium-High | More upfront but no rewrite           | **Recommended** if there's any chance of real payments      |

Build the data model for Stripe from day one (PaymentIntent ID, webhook events, refund tracking) even if the integration itself is deferred — this avoids a schema migration later.

**Backend:**

- [ ] Invoice generation engine (BullMQ weekly job)
- [ ] Pricing model: daily rate × days attended
- [ ] Subsidy management (percentage or fixed)
- [ ] Payment tracking (confirm mock vs Stripe decision first)
- [ ] Credit/refund management
- [ ] Financial reports: revenue, AR aging, subsidy totals
- [ ] `Decimal` type for all monetary values

**Frontend (Web Dayhome + Web Admin):**

- [ ] Invoice list with status filters
- [ ] Invoice detail with line items
- [ ] Payment recording form
- [ ] Subsidy CRUD forms
- [ ] Financial reports dashboard (Recharts)
- [ ] Credit/refund form

**Frontend (Web Parent):**

- [ ] My invoices list
- [ ] Invoice detail view
- [ ] Payment history
- [ ] Payment method (mock or Stripe Elements)

**Definition of Done:**

- [ ] Invoice auto-generation from attendance
- [ ] Subsidy auto-applied to invoices
- [ ] Payment recording (mock or Stripe)
- [ ] Financial reports: revenue, AR, subsidy
- [ ] Billing-only role: can see finances but NOT child data

---

### Sprint 7 — Document & Compliance Management (Week 15–16)

**Backend:**

- [ ] Document upload with virus scanning (ClamAV)
- [ ] File storage in R2/S3 with signed URLs (15 min expiry)
- [ ] Document type & expiry tracking
- [ ] Renewal workflow (new version, old superseded)
- [ ] Daily expiry check job (BullMQ, 07:00)
- [ ] Compliance status calculation (COMPLIANT / NON_COMPLIANT)
- [ ] Government read-only access

**Frontend (Web Dayhome):**

- [ ] Document upload form (drag-and-drop, type selector, expiry)
- [ ] Document list with expiry progress bars
- [ ] Document renewal flow
- [ ] Compliance status card

**Frontend (Web Admin):**

- [ ] Compliance dashboard (all dayhomes)
- [ ] Expiry calendar view
- [ ] Document preview (read-only)
- [ ] Government view (restricted data set)

**Definition of Done:**

- [ ] Upload → ClamAV scan → R2 storage → metadata saved
- [ ] Expiry alerts at 60/30/14/7 days
- [ ] Renewal creates version history
- [ ] Compliance status accurate per dayhome
- [ ] Government role: read-only, no download

---

### Sprint 8 — Messaging, Activities & Notifications (Week 17–18)

**Backend:**

- [ ] Thread-based messaging (parent ↔ educator)
- [ ] Announcements (owner broadcasts to all parents)
- [ ] Activity logging (meals, naps, diaper, mood, photos)
- [ ] Incident reports with parent e-signature acknowledgment
- [ ] Notification service (BullMQ: email, push, SMS)
- [ ] Push notification registration (FCM tokens)
- [ ] Notification preferences per user
- [ ] Socket.io for real-time chat + badge counts

**Frontend (All Portals):**

- [ ] In-app messaging UI (chat-style)
- [ ] Thread list with unread badges
- [ ] Announcement composer (rich text)
- [ ] Activity log form (educator) with photo upload
- [ ] Activity feed (parent) — timeline per child
- [ ] Incident report form with signature pad
- [ ] Notification preferences page

**Definition of Done:**

- [ ] Thread-based messaging with read receipts
- [ ] Announcements delivered to all enrolled families
- [ ] Activity log with photo upload (max 5 per entry)
- [ ] Incident report → parent acknowledgment (digital signature)
- [ ] Notification routing per user preferences
- [ ] BullMQ queue for all outbound communications

---

### Sprint 9 — Reporting & Analytics (Week 19–20)

**Backend:**

- [ ] Reporting module with aggregated queries
- [ ] Materialized views for complex reports (refresh nightly)
- [ ] Attendance report (daily/monthly/custom range)
- [ ] Financial report (revenue, AR aging, subsidy impact)
- [ ] Compliance report (document status, expiry overview)
- [ ] Enrollment report (capacity %, waitlist, trends)
- [ ] CSV/PDF export service
- [ ] Government read-only reporting endpoints
- [ ] Caching: dashboard data (TTL 5 min), reports (TTL 1 h)

**Frontend (Web Admin):**

- [ ] Dashboard with KPI cards (total children, attendance %, revenue, compliance %)
- [ ] Attendance report with line chart and filters
- [ ] Financial report with revenue by dayhome bar chart
- [ ] Compliance report with dayhome status grid
- [ ] Enrollment report with capacity bars and waitlist table
- [ ] Export buttons (CSV/PDF) for all reports
- [ ] Government view (read-only, restricted data)

**Definition of Done:**

- [ ] All 4 report types functional with filters
- [ ] KPI dashboard with real data (not placeholders)
- [ ] CSV and PDF export working
- [ ] Materialized views created and refreshing
- [ ] Government role restricted to compliance + enrollment only
- [ ] Report data cached in Redis

---

### Sprint 10 — Mobile Apps, i18n & Polish (Week 21–24)

**Backend:**

- [ ] Mobile-specific endpoints (lightweight payloads, batch sync)
- [ ] `POST /sync` for offline records
- [ ] Push notification registration (`POST /devices/register`)
- [ ] Image optimization (resize to thumbnail/mobile/original)
- [ ] Higher rate limits for mobile (300 req/min)

**Mobile (Expo — Educator App):**

- [ ] Daily board with real-time check-in/out
- [ ] Child check-in/out with PIN
- [ ] Activity logging with photo upload
- [ ] Incident reporting
- [ ] Offline check-in queue (WatermelonDB)
- [ ] Biometric login (FaceID/TouchID/PIN)

**Mobile (Expo — Parent App):**

- [ ] Push notifications
- [ ] Child activity feed
- [ ] Messaging
- [ ] Invoice view
- [ ] Attendance history

**Cross-Cutting (Finish — scaffolded in Sprint 0, applied throughout):**

- [ ] i18n audit: verify all user-visible strings use translation keys (no hardcoded English)
- [ ] French locale: complete translation files (EN/FR), locale auto-detection
- [ ] WCAG 2.1 AA final audit: axe DevTools scan passes (0 critical/serious violations)
- [ ] Screen reader testing (VoiceOver + NVDA)
- [ ] Performance: LCP < 2.5s, FID < 100ms, API P95 < 300ms
- [ ] Bundle analysis and code splitting
- [ ] `CurriculumPlan`, `DevelopmentalAssessment`, `MealPlan` models (deferred features)

**Definition of Done:**

- [ ] Both mobile apps build and run via Expo
- [ ] Offline check-in queues and syncs
- [ ] French locale detection and rendering
- [ ] axe DevTools scan passes (0 critical violations)
- [ ] Performance targets met (verified)
- [ ] All critical user journeys end-to-end tested

---

## 11. Development Guide

### Prerequisites

| Tool           | Version | Install                            |
| -------------- | ------- | ---------------------------------- |
| Node.js        | 20 LTS  | `nvm install 20`                   |
| pnpm           | 9+      | `npm install -g pnpm`              |
| Docker Desktop | Latest  | [docker.com](https://docker.com)   |
| Git            | Latest  | [git-scm.com](https://git-scm.com) |

### Quick Start

```bash
# 1. Clone and install
git clone <repo-url>
cd spiced-dayhome
pnpm install

# 2. Start infrastructure
docker compose up -d

# 3. Wait for ClamAV to download virus definitions (first time ~10 min)
docker compose logs -f clamav
# Wait for: "Database loaded (XXXXXX signatures)"

# 4. Initialize database
pnpm db:create
pnpm db:migrate
pnpm db:seed

# 5. Start development
pnpm dev
```

This starts:

- API on `http://localhost:4000`
- Web Admin on `http://localhost:3000`
- Swagger docs at `http://localhost:4000/api/docs`
- Bull Board at `http://localhost:4000/api/v1/admin/queues`
- Mailpit UI at `http://localhost:8025`
- MinIO Console at `http://localhost:9001`
- Grafana at `http://localhost:3001`

### Creating a New Module

Every backend module follows the same pattern:

```
src/modules/<name>/
├── <name>.module.ts
├── <name>.controller.ts
├── <name>.service.ts
├── <name>.repository.ts
├── dto/
│   ├── create-<entity>.dto.ts
│   ├── update-<entity>.dto.ts
│   └── <entity>-query.dto.ts
├── entities/
│   └── <entity>.model.ts
└── <name>.spec.ts
```

### Coding Standards

| Rule            | Standard                                                          |
| --------------- | ----------------------------------------------------------------- |
| TypeScript      | `strict: true` — no `any`, no `@ts-ignore`                        |
| Exports         | Named exports only. No `export default`                           |
| File naming     | `kebab-case` for files                                            |
| Class naming    | `PascalCase` for classes/components                               |
| Variable naming | `camelCase` for variables/functions                               |
| Commits         | Conventional Commits: `feat(SCOPE-123): description`              |
| Branching       | `main` (prod), `develop` (staging), `feat/SPICED-123-description` |
| PR size         | Max 400 lines changed per PR                                      |
| Testing         | Jest for unit tests, Supertest for integration tests              |

### Database Migrations

```bash
# Create migration
npx sequelize-cli migration:generate --name add-child-health-screening

# Run migrations
pnpm db:migrate

# Rollback last migration
npx sequelize-cli db:migrate:undo

# Reset (rollback all + migrate + seed)
pnpm db:reset
```

### Error Handling

Every error must use a standard error code. Add new codes to `packages/shared-types/src/constants.ts`:

```typescript
export const ERROR_CODES = {
  AUTH_INVALID_CREDENTIALS: 'AUTH_INVALID_CREDENTIALS',
  DAYHOME_NOT_FOUND: 'DAYHOME_NOT_FOUND',
  ROOM_AT_CAPACITY: 'ROOM_AT_CAPACITY',
  // Add new codes here
} as const;
```

---

## 12. Security & Compliance

### Authentication

- JWT dual-token: Access (15 min, in memory) + Refresh (7 days, HTTP-only cookie)
- Refresh token rotation on each use
- Rate limiting: 5 login attempts per 15 min per IP

### Authorization

- RBAC: Role-based access at controller level (`@Roles()`)
- Fine-grained: Permission-based at service level (`@Permissions()`)
- Data isolation: Parent scoped to own family/children only
- Organization scoping: Users can only access their organization's data

### Data Protection

- Medical notes encrypted at rest (AES-256)
- Pickup PINs hashed with bcrypt (never returned in API responses)
- Files encrypted in R2/S3 (server-side encryption)
- Signed URLs for file access (15 min expiry)

### File Upload Security

- MIME type validation server-side
- Max file size: 10 MB
- Allowed types: PDF, JPG, PNG only (reject SVG — XSS risk)
- ClamAV virus scan before storage
- Temp file cleanup after upload (success or failure)

### Audit Trail

- All create/update/delete operations logged
- Audit record: `{ userId, action, entity, entityId, before, after, timestamp }`
- Government document views logged
- Financial transactions immutable after 24h

### Regulatory

> **⚠️ Verify with agency compliance contact before finalizing.** The retention periods below are reasonable defaults based on common Canadian childcare regulation, but must be confirmed against the specific province's (e.g. Alberta) Child Care Licensing Regulation and PIPEDA requirements. Provincial variation exists in record-keeping obligations.

| Data                    | Default Retention    | Verification Needed                                    |
| ----------------------- | -------------------- | ------------------------------------------------------ |
| Attendance records      | 7 years              | ✅ Confirm with agency                                 |
| Documents (compliance)  | 7 years after expiry | ✅ Confirm with agency                                 |
| Invoices/payments       | 7 years              | ✅ Confirm with agency (CRA requirement likely aligns) |
| Messages                | 2 years              | ✅ Confirm with agency                                 |
| Activities (daily logs) | 1 year               | ✅ Confirm with agency                                 |
| Incident reports        | 7 years              | ✅ Confirm with agency (likely longest requirement)    |

---

## 13. Architecture Decision Records (ADRs)

Key decisions that must be made explicitly and early, as they affect data model, API contracts, and integration effort.

### ADR-001: Payment Integration — Mock vs Stripe

|                    |                                                                                                                                                                                                                                                     |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Status**         | **⏳ Decision required** before Sprint 6                                                                                                                                                                                                            |
| **Context**        | Invoices are generated from attendance records. Parents need to pay them. Two paths: (a) manual "mark as paid" with no real payment processing, or (b) full Stripe integration with PaymentIntents, webhooks, refunds, and reconciliation.          |
| **Trade-off**      | Mock is cheaper upfront but requires a full rewrite if real payments are needed later. Stripe is more work now but the payment data model (PaymentIntent ID, webhook events, refund status) must be built into the schema from Sprint 6 regardless. |
| **Recommendation** | Build the Invoice/Payment schema to accommodate Stripe fields (nullable if unused), confirm with agency whether real payment processing is a current requirement or a future one.                                                                   |
| **Owner**          | PM to confirm with agency stakeholder                                                                                                                                                                                                               |

### ADR-002: i18n Strategy — Progressive vs Big Bang

|              |                                                                                                                                                                               |
| ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Status**   | **✅ Decided** — Progressive (scaffold in Sprint 0, apply from Sprint 1, French translation completed in Sprint 10)                                                           |
| **Context**  | Retrofitting i18n across 9 sprints of pages is far more expensive than extracting strings as they are written.                                                                |
| **Decision** | `react-i18next` scaffolded in Sprint 0. All new components use `t('key')` for user-visible strings. Sprint 10 audits for missed strings and completes the French locale file. |

### ADR-003: Accessibility — Progressive vs Big Bang

|              |                                                                                                                                                        |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Status**   | **✅ Decided** — Progressive (eslint-plugin-jsx-a11y in Sprint 0, WCAG patterns followed from Sprint 1, final audit in Sprint 10)                      |
| **Context**  | Semantic HTML, aria attributes, keyboard navigation, and color contrast are far cheaper to build correctly the first time than to retrofit.            |
| **Decision** | `eslint-plugin-jsx-a11y` added in Sprint 0. All components follow WCAG patterns from day one. Sprint 10 performs the compliance audit and remediation. |

### ADR-004: Dayhome Onboarding — Manual Registration vs API Intake

|              |                                                                                                                                                                                                             |
| ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Status**   | **✅ Decided** — API Intake Webhook from external Application Portal                                                                                                                                        |
| **Context**  | The agency already operates an Application Portal that handles dayhome applications, licensing review, and approval. Building a second registration flow creates duplication and reconciliation complexity. |
| **Decision** | Dayhomes arrive pre-approved via `POST /api/v1/dayhomes/intake` with HMAC signature verification and idempotency key. No `PENDING` status in this system.                                                   |

### ADR-005: File Storage — MinIO (dev) / Cloudflare R2 (prod)

|              |                                                                                                            |
| ------------ | ---------------------------------------------------------------------------------------------------------- |
| **Status**   | **✅ Decided**                                                                                             |
| **Context**  | S3-compatible storage needed for documents, photos, and compliance files. R2 has no egress fees vs AWS S3. |
| **Decision** | MinIO for local development. Cloudflare R2 for production. Same S3 API, config swap via env vars.          |

### ADR-006: Real-Time Updates — Socket.io

|              |                                                                                                             |
| ------------ | ----------------------------------------------------------------------------------------------------------- |
| **Status**   | **✅ Decided**                                                                                              |
| **Context**  | Daily board, check-in/out notifications, messaging, and badge counts require real-time push.                |
| **Decision** | Socket.io with Redis adapter for horizontal scaling. Fallback to 30s polling if WebSocket connection fails. |

### ADR-007: Retention Periods — Verification Required

|             |                                                                                                                                                                                                                        |
| ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Status**  | **⏳ Decision required** — verify with agency compliance contact                                                                                                                                                       |
| **Context** | Data retention obligations vary by province (Alberta, Ontario, etc.) under childcare licensing regulations and PIPEDA. Assumed defaults of 7 years for financial/compliance records may not match actual requirements. |
| **Owner**   | PM to confirm with agency stakeholder before Sprint 1                                                                                                                                                                  |

---

## 14. Deployment & Infrastructure

### Development (Local)

- Docker Compose: PostgreSQL 15, Redis 7, MinIO, ClamAV, Mailpit, Prometheus, Grafana
- MinIO for S3-compatible file storage (console: `localhost:9001`)
- Mailpit for email capture (UI: `localhost:8025`)

### Production (VPS)

- **Host**: VPS with Docker or bare metal
- **Reverse proxy**: Nginx or Caddy (SSL termination, rate limiting, gzip/brotli)
- **Database**: Managed PostgreSQL or Docker with nightly backups
- **File storage**: Cloudflare R2 (S3-compatible, no egress fees)
- **Monitoring**: Prometheus + Grafana, Sentry for error tracking
- **Backups**: Daily encrypted `pg_dump` → rclone to R2 (30 daily, 12 monthly, 7 yearly)
- **Anti-malware**: ClamAV + maldet on production server
- **No CI/CD** (manual deploy via git pull + build + restart)

### Backup Strategy

| Scenario            | RTO   | RPO | Action                                       |
| ------------------- | ----- | --- | -------------------------------------------- |
| Database corruption | 4h    | 24h | Restore from latest encrypted backup         |
| Server failure      | 2h    | —   | Spin up new VPS from snapshot, deploy latest |
| File storage outage | 1h    | —   | Failover to secondary R2 region              |
| Security breach     | 15min | —   | Rotate secrets, revoke sessions, restore     |
| Accidental deletion | 24h   | 24h | Point-in-time restore                        |

---

_This document is the single source of truth for the Spiced Dayhome Unified System. All other documentation (PDF, DOCX, previous sprint plans) should be considered superseded._
