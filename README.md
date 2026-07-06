# Spiced Dayhome — Unified Childcare Management System

A unified operational backbone for post-approval dayhome lifecycle management — managing dayhomes, educators, families, attendance, billing, documents, messaging, reporting, and compliance for **Spiced Childcare**.

**Timeline:** 22 weeks (11 sprints × 2 weeks)  
**Budget:** ~$15,000 CAD  
**Team:** 5+ developers + 1 PM/scrum master

---

## Architecture

```
┌─────────────┐  ┌──────────────┐  ┌──────────────┐
│  Web Admin   │  │  Web Dayhome  │  │  Web Parent   │
│  (Next.js 14) │  │  (Next.js 14) │  │  (Next.js 14) │
├─────────────┤  ├──────────────┤  ├──────────────┤
│  shared-ui  │  │  shared-ui   │  │  shared-ui   │
└──────┬──────┘  └──────┬───────┘  └──────┬───────┘
       └────────────────┼─────────────────┘
                        │ HTTP / WebSocket
               ┌────────▼────────┐
               │   NestJS API    │
               │  (Controller →  │
               │   Service →     │
               │   Repository)   │
               ├────────────────┤
               │  BullMQ Queues │
               └───┬─────┬─────┘
         ┌─────────┘     └─────────┐
    ┌────▼────┐             ┌──────▼─────┐
    │PostgreSQL│             │    Redis   │
    │   15     │             │     7      │
    └─────────┘             └────────────┘
```

### Monorepo Structure

```
spiced_dayhome/
├── apps/
│   ├── api/              # NestJS backend
│   ├── web-admin/        # Agency admin portal
│   ├── web-dayhome/      # Dayhome owner portal (scaffold)
│   └── web-parent/       # Parent portal (scaffold)
├── packages/
│   ├── shared-types/     # Enums, interfaces, API contracts
│   ├── shared-utils/     # Utility functions (cn, date, number, string, validation)
│   ├── shared-constraints/ # Regex, validation limits, role hierarchy, rate limits
│   └── ui-kit/           # Shared React component library (shadcn/ui + Radix)
├── docker/
│   └── prometheus.yml    # Prometheus scrape config
├── documentation/        # SYSTEM_GUIDE.md, SPRINT_ROADMAP.md, DEVELOPMENT_GUIDE.md
├── docker-compose.yml    # Local dev infrastructure
├── eslint.config.mjs     # Root ESLint flat config
└── turbo.json            # Turborepo pipeline config
```

### Tech Stack

| Layer         | Technology                                  |
| ------------- | ------------------------------------------- |
| Backend       | NestJS 11, TypeScript, Express              |
| Frontend      | Next.js 14 (App Router), React 18           |
| Database      | PostgreSQL 15, Sequelize 6                  |
| Cache / Queue | Redis 7, BullMQ                             |
| UI            | Tailwind CSS, shadcn/ui, Radix UI, Recharts |
| State         | TanStack Query, Zustand                     |
| Forms         | React Hook Form, Zod                        |
| Auth          | Passport.js, JWT (dual-token), bcryptjs     |
| File Storage  | MinIO (dev) / Cloudflare R2 (prod)          |
| Email         | Mailpit (dev) / Resend or SendGrid (prod)   |
| Monitoring    | Prometheus, Grafana, Sentry                 |
| CLI           | pnpm workspaces, Turborepo                  |
| Lint          | ESLint 10, Prettier, Husky, lint-staged     |

---

## Quick Start

### Prerequisites

- Node.js 20 LTS+
- pnpm 9+ (`npm install -g pnpm`)
- Docker Desktop

### Setup

```bash
# 1. Start infrastructure (PostgreSQL, Redis, Mailpit, MinIO, etc.)
docker compose up -d

# 2. Install dependencies
pnpm install

# 3. Create and migrate database
pnpm db:create
pnpm db:migrate

# 4. Seed sample data
pnpm db:seed

# 5. Start development servers (API + web-admin)
pnpm dev
```

### Service URLs

| Service              | URL                                       | Credentials             |
| -------------------- | ----------------------------------------- | ----------------------- |
| NestJS API           | http://localhost:4000                     | —                       |
| Swagger Docs         | http://localhost:4000/api/v1/docs         | —                       |
| Bull Queue Dashboard | http://localhost:4000/api/v1/admin/queues | —                       |
| Web Admin            | http://localhost:3000                     | —                       |
| PostgreSQL           | `localhost:5433`                          | `postgres` / `postgres` |
| Redis                | `localhost:6380`                          | —                       |
| MinIO Console        | http://localhost:9001                     | `admin` / `password123` |
| Mailpit UI           | http://localhost:8025                     | —                       |
| Prometheus           | http://localhost:9090                     | —                       |
| Grafana              | http://localhost:3002                     | `admin` / `admin`       |
| ClamAV               | `localhost:3310`                          | —                       |

---

## Docker Services

| Service      | Image                | Purpose                    |
| ------------ | -------------------- | -------------------------- |
| `postgres`   | postgres:15          | Primary database           |
| `redis`      | redis:7              | Cache, queues, sessions    |
| `mailpit`    | axllent/mailpit      | Email capture (dev)        |
| `minio`      | minio/minio          | S3-compatible file storage |
| `prometheus` | prom/prometheus      | Metrics collection         |
| `grafana`    | grafana/grafana      | Metrics dashboards         |
| `clamav`     | clamav/clamav:latest | File upload virus scanning |

---

## Available Commands

```bash
# Development
pnpm dev              # Start all workspaces in dev mode
pnpm build            # Build all workspaces
pnpm lint             # Lint all workspaces
pnpm test             # Run all tests

# Database (from root or apps/api)
pnpm db:create        # Create databases
pnpm db:migrate       # Run pending migrations
pnpm db:seed          # Seed sample data
pnpm db:reset         # Drop → create → migrate → seed

# Filtered (run in specific workspace)
pnpm --filter api test
pnpm --filter web-admin dev
```

---

## Project Status — Sprint 0 Complete

The foundation is built and Sprint 0 deliverables are done:

- Monorepo scaffold with Turborepo + pnpm workspaces
- Docker Compose with 7 services
- NestJS API with auth, users, health, Redis, mail, queue, storage modules
- 13 database models seeded (organizations, dayhomes, rooms, educators, families, children, enrollments, attendance, invoices, documents, messages, audit logs, users)
- Web admin portal with login/register, dashboard layout, Axios client, Zustand store
- Shared packages: types, utils, constraints, ui-kit
- i18n scaffold (English + French locale files)
- a11y rules enabled in ESLint
- 25 unit/integration tests passing
- ESLint clean across all packages

### Sprint Roadmap

| Sprint       | Focus                                      |
| ------------ | ------------------------------------------ |
| **Sprint 0** | ✅ Foundation, scaffold, DB, auth, testing |
| Sprint 1     | Organization & user management             |
| Sprint 2     | Dayhome management & API intake webhook    |
| Sprint 3     | Educator management                        |
| Sprint 4     | Family & child management                  |
| Sprint 5     | Attendance & daily operations              |
| Sprint 6     | Billing & finance (Stripe/mock decision)   |
| Sprint 7     | Document & compliance management           |
| Sprint 8     | Messaging, activities & notifications      |
| Sprint 9     | Reporting & analytics                      |
| Sprint 10    | Mobile apps, i18n & polish                 |

---

## Key Conventions

- **Pattern:** Controller → Service → Repository (C-S-R)
- **Exports:** Named exports only
- **Files:** kebab-case (`auth.service.ts`)
- **Classes:** PascalCase
- **Commits:** [Conventional Commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `chore:`, etc.)
- **DB:** Sequelize migrations + seeders, soft deletes via `deletedAt`
- **API:** `/api/v1/` prefix, standard envelope `{ success, data, meta }`
- **Testing:** Jest + Supertest (backend), Vitest + React Testing Library (frontend)
- **PRs:** Max 400 lines, squash merge to `develop`

---

## Documentation

| Document                             | Description                                                                                     |
| ------------------------------------ | ----------------------------------------------------------------------------------------------- |
| `documentation/SYSTEM_GUIDE.md`      | Single source of truth — architecture, data model, 80+ API routes, 7 workflows, 3 portals, ADRs |
| `documentation/SPRINT_ROADMAP.md`    | Sprint-by-sprint plan with user stories, tasks, DoD checklists                                  |
| `documentation/DEVELOPMENT_GUIDE.md` | Developer onboarding, daily workflow, module templates, testing, troubleshooting                |

Detailed documentation for data model (40+ entities), API routes, role hierarchy, province child ratios, compliance rules, and security decisions lives in `SYSTEM_GUIDE.md`.
