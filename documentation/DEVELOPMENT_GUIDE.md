# Development Guide — Spiced Dayhome

**For developers working on the Unified Childcare Management System.**

---

## Table of Contents

1. [Environment Setup](#1-environment-setup)
2. [Project Structure](#2-project-structure)
3. [First-Time Run](#3-first-time-run)
4. [Daily Workflow](#4-daily-workflow)
5. [Creating a New Module](#5-creating-a-new-module)
6. [Database Workflow](#6-database-workflow)
7. [Testing](#7-testing)
8. [Coding Standards](#8-coding-standards)
9. [Git Workflow](#9-git-workflow)
10. [Troubleshooting](#10-troubleshooting)

---

## 1. Environment Setup

### Prerequisites

| Tool | Version | Verification |
|---|---|---|
| Node.js | 20 LTS | `node -v` → v20.x |
| pnpm | 9+ | `pnpm -v` → 9.x |
| Docker Desktop | Latest | `docker --version` |
| Git | Latest | `git --version` |

### Install Steps

```bash
# Node.js via nvm-windows (Windows) or nvm (macOS/Linux)
nvm install 20
nvm use 20

# pnpm
npm install -g pnpm

# Clone
git clone <repo-url>
cd spiced-dayhome

# Install dependencies
pnpm install
```

---

## 2. Project Structure

```
spiced-dayhome/
├── apps/
│   ├── api/                    # NestJS backend (port 4000)
│   ├── web-admin/              # Agency admin portal (port 3000)
│   ├── web-dayhome/            # Dayhome owner portal (port 3001)
│   └── web-parent/             # Parent portal (port 3002)
├── packages/
│   ├── shared-types/           # TS enums, interfaces, API contracts
│   ├── shared-utils/           # Utility functions
│   ├── shared-constraints/     # Constants, regex, validation rules
│   └── ui-kit/                 # Shared React components
├── docker/
│   └── prometheus.yml
├── documentation/
│   ├── SYSTEM_GUIDE.md         # System architecture & workflows
│   ├── SPRINT_ROADMAP.md       # Sprint plan & progress tracking
│   ├── DEVELOPMENT_GUIDE.md    # THIS FILE
│   └── sprints/                # Individual sprint detail docs
├── docker-compose.yml          # All infrastructure services
├── turbo.json                  # Turborepo pipeline
├── pnpm-workspace.yaml
├── tsconfig.base.json
├── eslint.config.mjs
└── .prettierrc
```

### Key Paths

| Path | What's Here |
|---|---|
| `apps/api/src/` | All backend code |
| `apps/api/src/modules/` | Feature modules (auth, users, + future modules) |
| `apps/api/src/database/` | Sequelize models, migrations, seeders, config |
| `apps/web-admin/src/app/` | Next.js App Router pages |
| `apps/web-admin/src/lib/` | API client, stores, utilities |
| `apps/web-admin/src/components/` | React components |
| `packages/shared-types/src/` | `enums.ts`, `models.ts`, `api.ts`, `constants.ts` |
| `packages/ui-kit/src/` | `ui/button.tsx`, `ui/input.tsx`, etc. |

---

## 3. First-Time Run

```bash
# Step 1: Start all infrastructure
docker compose up -d

# Step 2: Wait for ClamAV (first time only - takes ~10 min)
docker compose logs -f clamav
# Wait for: "Database loaded (XXXXXX signatures)"

# Step 3: Create database & run migrations
pnpm db:create
pnpm db:migrate
pnpm db:seed

# Step 4: Start development (all apps via Turborepo)
pnpm dev
```

### What Starts

| Service | URL | Credentials |
|---|---|---|
| NestJS API | http://localhost:4000 | — |
| Swagger Docs | http://localhost:4000/api/docs | — |
| Bull Board | http://localhost:4000/api/v1/admin/queues | — |
| Web Admin | http://localhost:3000 | — |
| PostgreSQL | localhost:5433 | postgres / postgres |
| Redis | localhost:6380 | — |
| MinIO Console | http://localhost:9001 | minioadmin / minioadmin |
| Mailpit UI | http://localhost:8025 | — |
| Grafana | http://localhost:3001 | admin / admin |
| Prometheus | http://localhost:9090 | — |

### Test the Setup

```bash
# Auth test
curl -X POST http://localhost:4000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"super@spiced.ca","password":"Password123!"}'

# Health check
curl http://localhost:4000/api/v1/health

# Unauthenticated (expect 401)
curl -v http://localhost:4000/api/v1/dayhomes
```

---

## 4. Daily Workflow

```bash
# Start infrastructure (if not running)
docker compose up -d

# Start dev servers
pnpm dev

# Run specific app only
pnpm --filter api dev
pnpm --filter web-admin dev

# Run tests
pnpm test                          # All tests
pnpm --filter api test             # API tests only
pnpm --filter web-admin test       # Frontend tests only

# Lint
pnpm lint

# Build
pnpm build
```

### Environment Files

- `apps/api/.env.development` — Active dev config (committed)
- `apps/api/.env.example` — Template for all env vars
- Never commit `.env` or `.env.local` (in `.gitignore`)

---

## 5. Creating a New Module

Every backend module follows a strict pattern. Example — creating an Organization module:

### Step 1: Create Module Structure

```
apps/api/src/modules/organization/
├── organization.module.ts
├── organization.controller.ts
├── organization.service.ts
├── organization.repository.ts
├── dto/
│   ├── create-organization.dto.ts
│   ├── update-organization.dto.ts
│   └── organization-query.dto.ts
├── guards/
│   └── organization-access.guard.ts
└── organization.spec.ts
```

### Step 2: Module File (template)

```typescript
import { Module } from '@nestjs/common';
import { OrganizationController } from './organization.controller';
import { OrganizationService } from './organization.service';
import { OrganizationRepository } from './organization.repository';

@Module({
  controllers: [OrganizationController],
  providers: [OrganizationService, OrganizationRepository],
  exports: [OrganizationService],
})
export class OrganizationModule {}
```

### Step 3: Controller (template)

```typescript
import { Controller, Get, Post, Body, Param, Patch, Delete, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { OrganizationService } from './organization.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { OrganizationQueryDto } from './dto/organization-query.dto';
import { Roles } from '../../common/guards/roles.guard';
import { Role } from '@spiced-dayhome/shared-types';

@ApiTags('Organizations')
@ApiBearerAuth()
@Controller('organizations')
export class OrganizationController {
  constructor(private readonly organizationService: OrganizationService) {}

  @Post()
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Create a new organization' })
  create(@Body() dto: CreateOrganizationDto) {
    return this.organizationService.create(dto);
  }

  @Get()
  @Roles(Role.SUPER_ADMIN, Role.ORG_ADMIN)
  @ApiOperation({ summary: 'List organizations' })
  findAll(@Query() query: OrganizationQueryDto) {
    return this.organizationService.findAll(query);
  }
}
```

### Step 4: Service (template)

```typescript
import { Injectable, NotFoundException } from '@nestjs/common';
import { OrganizationRepository } from './organization.repository';
import { CreateOrganizationDto } from './dto/create-organization.dto';

@Injectable()
export class OrganizationService {
  constructor(private readonly repository: OrganizationRepository) {}

  async create(dto: CreateOrganizationDto) {
    // Business logic here
    return this.repository.create(dto);
  }

  async findAll(query: OrganizationQueryDto) {
    return this.repository.findAll(query);
  }

  async findById(id: string) {
    const org = await this.repository.findById(id);
    if (!org) throw new NotFoundException({ code: 'ORG_NOT_FOUND', message: 'Organization not found' });
    return org;
  }
}
```

### Step 5: Repository (template)

```typescript
import { Injectable, Inject } from '@nestjs/common';
import { Sequelize } from 'sequelize-typescript';
import { Organization } from '../../database/models/organization.model';

@Injectable()
export class OrganizationRepository {
  constructor(@Inject('SEQUELIZE') private readonly sequelize: Sequelize) {}

  get model() {
    return this.sequelize.model(Organization);
  }

  async create(data: any): Promise<Organization> {
    return this.model.create(data);
  }

  async findAll(query: any) {
    const { page = 1, limit = 20, search } = query;
    const where: any = {};
    if (search) where.name = { [Op.iLike]: `%${search}%` };
    return this.model.findAndCountAll({
      where,
      limit,
      offset: (page - 1) * limit,
      order: [['createdAt', 'DESC']],
    });
  }

  async findById(id: string): Promise<Organization | null> {
    return this.model.findByPk(id);
  }
}
```

### Step 6: Register in AppModule

```typescript
// apps/api/src/app.module.ts
import { OrganizationModule } from './modules/organization/organization.module';

@Module({
  imports: [
    // ... existing imports
    OrganizationModule,
  ],
})
export class AppModule {}
```

### Frontend Page Template

```tsx
'use client';

import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api/client';

export default function OrganizationList() {
  const { data, isLoading } = useQuery({
    queryKey: ['organizations'],
    queryFn: () => apiClient.get('/organizations').then(r => r.data.data),
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Organizations</h1>
      {/* DataTable component here */}
    </div>
  );
}
```

---

## 6. Database Workflow

### Migrations

```bash
# Generate a new migration
cd apps/api
npx sequelize-cli migration:generate --name add-health-screening-to-attendance

# Run pending migrations
pnpm db:migrate

# Undo last migration
cd apps/api
npx sequelize-cli db:migrate:undo

# Reset database (undo all + migrate + seed)
pnpm db:reset
```

### Seed Data

Seeds are in `apps/api/src/database/seeders/`. To add new seed data:

```typescript
// 20260703000002-demo-invoices.ts
module.exports = {
  up: async (queryInterface: QueryInterface) => {
    await queryInterface.bulkInsert('invoices', [
      {
        id: 'inv-001',
        familyId: 'fam-001',
        dayhomeId: 'dh-001',
        totalAmount: 1200.00,
        dueDate: new Date('2026-08-01'),
        status: 'PAID',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },
  down: async (queryInterface: QueryInterface) => {
    await queryInterface.bulkDelete('invoices', {}, {});
  },
};
```

### Adding a New Model

1. Create model file in `apps/api/src/database/models/`
2. Add model to `database.module.ts` imports array
3. Add table to migration file (or create new migration)
4. Add interface to `packages/shared-types/src/models.ts`
5. Add any new enums to `packages/shared-types/src/enums.ts`

---

## 7. Testing

### Backend Tests (Jest + Supertest)

```bash
# Run all API tests
pnpm --filter api test

# Watch mode
pnpm --filter api test:watch

# Coverage
pnpm --filter api test:cov

# E2E tests
pnpm --filter api test:e2e
```

**Test file naming:** `<module>.spec.ts` (unit), `<module>.e2e-spec.ts` (integration)

**Unit test example:**
```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthService],
    }).compile();
    service = module.get<AuthService>(AuthService);
  });

  it('should throw on invalid credentials', async () => {
    await expect(service.login('bad@email.com', 'wrong')).rejects.toThrow();
  });
});
```

### Frontend Tests (Vitest + React Testing Library)

```bash
# Run all frontend tests
pnpm --filter web-admin test

# Watch mode
pnpm --filter web-admin test:watch
```

### Test Conventions

- Unit tests: Mock all dependencies, test business logic
- Integration tests: Test endpoints with real DB (test database)
- Coverage target: 80%+ on service/business logic files
- No `describe.only` or `it.only` in committed code

---

## 8. Coding Standards

### TypeScript

```typescript
// ✅ Correct
const user: IUser = await this.repository.findById(id);

// ❌ Wrong
const user: any = await this.repository.findById(id);
const user = await this.repository.findById(id); // implicit any
```

| Rule | Standard |
|---|---|
| `strict: true` | Required in all tsconfig files |
| `any` | **Forbidden** — use `unknown` if type is truly unknown |
| `@ts-ignore` | **Forbidden** — use `@ts-expect-error` with a comment |
| Non-null assertion (`!`) | Avoid — use proper type guards |

### Exports

```typescript
// ✅ Named exports only
export function formatDate() { ... }
export class UserService { ... }

// ❌ Never default exports
export default function() { ... }
export default class UserService { ... }
```

### File & Naming Conventions

| Type | Convention | Example |
|---|---|---|
| Files | `kebab-case` | `organization.service.ts` |
| Classes | `PascalCase` | `OrganizationService` |
| Functions/Variables | `camelCase` | `findByEmail()` |
| Constants | `UPPER_SNAKE_CASE` | `MAX_FILE_SIZE` |
| Enums | `PascalCase` | `DayhomeStatus` |
| Enum values | `UPPER_SNAKE_CASE` | `ACTIVE`, `PENDING` |
| Interfaces | `PascalCase` with `I` prefix | `IUser` |
| Types | `PascalCase` | `ApiResponse<T>` |
| DTOs | `PascalCase` | `CreateOrganizationDto` |

### Component Conventions

- One component per file
- Component files named in `kebab-case`: `organization-list.tsx`
- Components use `'use client'` directive when they need interactivity
- Server components by default (Next.js App Router)

### CSS/Tailwind

- Use Tailwind utility classes directly
- Extract reusable patterns to component classes
- No CSS modules unless absolutely necessary
- Color palette defined in `tailwind.config.ts`

---

## 9. Git Workflow

### Branch Strategy

```
main ──── production (deployed)
  │
  └── develop ──── staging/integration
        │
        ├── feat/SPICED-123-description
        ├── fix/SPICED-456-description
        └── chore/description
```

### Commit Convention

```
feat(SCOPE-123): add organization CRUD endpoints
fix(SCOPE-456): correct rate limit calculation
chore: update dependencies
docs: add API documentation for attendance module
test: add integration tests for auth refresh
```

**Types:** `feat`, `fix`, `chore`, `docs`, `test`, `refactor`, `style`, `perf`

### PR Rules

- Max 400 lines changed per PR
- Self-review before requesting review
- All tests must pass
- No console.log or debug code
- Squash merge to `develop`

---

## 10. Troubleshooting

### ClamAV Not Responding

```bash
# Check if ClamAV is running
docker compose ps clamav

# Check logs for virus DB download
docker compose logs -f clamav

# Manually test connection
echo "PING" | nc localhost 3310
# Expected: PONG

# If still failing, wait or restart:
docker compose restart clamav
```

### Database Connection Issues

```bash
# Check Postgres is running
docker compose ps postgres

# Verify connection
psql -U postgres -h localhost -p 5433 -d spiced_dev

# Reset database
pnpm db:reset
```

### Port Conflicts

If you get `EADDRINUSE`, check if ports are already in use:

```bash
# Check what's using a port
netstat -ano | findstr :4000   # Windows
lsof -i :4000                   # macOS/Linux
```

Ports used by this project:
- 3000: Web Admin
- 3001: Web Dayhome (future)
- 3002: Web Parent (future)
- 3001: Grafana (uses same port — API is 4000)
- 4000: NestJS API
- 5433: PostgreSQL
- 6380: Redis
- 9000: MinIO API
- 9001: MinIO Console
- 8025: Mailpit UI
- 9090: Prometheus
- 3310: ClamAV

### ESLint Errors

```bash
# Check current errors
pnpm lint

# Fix auto-fixable issues
pnpm lint -- --fix
```

### pnpm Issues

```bash
# Clear cache
pnpm store prune

# Reinstall
rm -rf node_modules
pnpm install
```

---

*This guide is a living document. Update it as the project evolves.*
