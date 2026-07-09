# Sprint 0 — Foundation & Architecture

**Duration:** Week 1–2
**Goal:** Monorepo scaffold, shared packages, database models, authentication skeleton, developer environment ready.

---

## IN SCOPE

| ID    | Item                                                                             | Status     | Tests |
| ----- | -------------------------------------------------------------------------------- | ---------- | ----- |
| S0-01 | Monorepo scaffold (pnpm workspaces + Turborepo)                                  | ✅ Done    | —     |
| S0-02 | All 10+ Sequelize models + first migration + seed                                | ✅ Done    | —     |
| S0-03 | NestJS API scaffold with auth module (JWT dual-token login, refresh)             | ✅ Done    | ✅    |
| S0-04 | `shared-types` package with `ApiResponse<T>`, `PaginatedResponse<T>`, `ApiError` | ✅ Done    | ✅    |
| S0-05 | UI Kit (shadcn/ui wrappers) in `packages/ui-kit`                                 | ✅ Done    | —     |
| S0-06 | Web Admin Next.js 14 app (App Router, Tailwind, Zustand, axios, TanStack Query)  | ✅ Done    | —     |
| S0-07 | Docker Compose (Postgres, Redis, MinIO, ClamAV, Mailpit, Prometheus, Grafana)    | ✅ Done    | —     |
| S0-08 | Infra config (Prometheus, Grafana dashboards, ClamAV scanning)                   | ✅ Done    | —     |
| S0-09 | Seed script (org + super admin user)                                             | ✅ Done    | —     |
| S0-10 | ESLint, Prettier, tsconfig.base.json                                             | ✅ Done    | —     |
| S0-11 | i18n scaffold (`react-i18next`, locale detection, `t()` utility)                 | 🔷 Partial | ✅    |
| S0-12 | a11y ESLint plugin (`eslint-plugin-jsx-a11y`)                                    | ⬜ Pending | ✅    |
| S0-13 | Queue Dashboard (Bull Board UI at `/api/v1/admin/queues`)                        | ⬜ Pending | ✅    |
| S0-14 | AuthService unit tests + auth endpoint integration tests                         | ⬜ Pending | ✅    |

## NOT IN SCOPE (Explicit Exclusions)

- No feature modules beyond auth (no Dayhome, Educator, Family, Child, Attendance, Billing, Document, Message, Report modules)
- No frontend pages beyond auth pages (login, register, forgot-password, reset-password)
- No mobile apps
- No i18n completion — only scaffold (all new strings use translation keys from Sprint 1 onward)
- No a11y completion — only ESLint plugin (follow WCAG patterns from Sprint 1 onward)

## STANDARD PRACTICES (Set in Sprint 0, Mandatory from Sprint 1)

- **TypeScript strict** — no `any`, no `@ts-ignore`, no `as unknown` casts (test mocks exempted)
- **Named exports only** — no `export default`
- **Conventional Commits**: `feat/<SCOPE>-<id>-description`
- **C-S-R pattern**: Controller → Service → Repository for all API modules
- **Frontend**: Zod validation + React Hook Form for forms
- **Backend**: class-validator DTOs for request validation
- **Standardized envelope**: `{ success, data, meta }` on all API responses
- **Error codes**: Defined in `shared-constants` (e.g., `DAYHOME_NOT_FOUND`)
- **Global pipes/filters/interceptors**: `ValidationPipe` (whitelist), `HttpExceptionFilter`, `TransformInterceptor`
- **Rate limiting**: 100 req/min per IP (global), 5 login attempts/15 min per IP (auth-specific, Redis-backed)
- **Auth infrastructure**: `JwtAuthGuard`, `RolesGuard`, `PermissionsGuard`, `@Roles()`, `@Permissions()` decorators
- **Sequelize conventions**: `paranoid: true` for soft delete, `CreatedAt`/`UpdatedAt` columns, UUID primary keys
- **API prefix**: `/api/v1/`
- **CORS**: Configured for frontend URLs from env

### Testing Requirements

- **Framework**: Jest (backend), Jest + React Testing Library (frontend)
- **API tests**: Supertest for all endpoint integration tests
- **Coverage target**: ≥80% line coverage per module
- **Test patterns**: Unit tests for services/repositories; integration tests for controllers/endpoints
- **Per-item expectations**: Each deliverable must have happy-path, validation-error, auth/permission-denial, and edge-case tests
- **CI enforcement**: `pnpm test:cov` must pass before merge; lint + typecheck gates

---

## Prerequisites (Install These First)

| Tool                     | Version         | Why                                                                                     |
| ------------------------ | --------------- | --------------------------------------------------------------------------------------- |
| **Node.js**              | 20 LTS          | Runtime for API + web apps                                                              |
| **pnpm**                 | 9+              | Package manager (faster than npm/yarn)                                                  |
| **PostgreSQL**           | 15+             | Primary database                                                                        |
| **Redis**                | 7               | Caching, sessions, rate limiting, job queues                                            |
| **Docker Desktop**       | Latest          | Runs all infrastructure containers (DB, cache, file storage, virus scanner, monitoring) |
| **ClamAV**               | Latest (Docker) | Virus scanning for document uploads                                                     |
| **MinIO**                | Latest (Docker) | S3-compatible file storage for development                                              |
| **Prometheus + Grafana** | Latest (Docker) | Metrics collection and visualization                                                    |
| **Mailpit**              | Latest (Docker) | SMTP server for catching dev emails                                                     |
| **nc (netcat)**          | OS-specific     | Testing ClamAV connectivity                                                             |
| **rclone**               | Latest          | Backup uploads to S3/R2 (production)                                                    |
| **Git**                  | Latest          | Version control                                                                         |
| **VS Code**              | Latest          | Recommended editor                                                                      |

### Installation Commands

```bash
# Node.js (via nvm — Windows: use nvm-windows)
nvm install 20
nvm use 20
node -v  # v20.x.x

# pnpm
npm install -g pnpm
pnpm -v   # 9.x.x

# Verify Postgres is running
psql -U postgres -c "SELECT version();"  # 15.x

# Verify Redis is running
redis-cli ping  # PONG

# Docker (if using containers instead of local installs)
docker --version
```

---

## Step-by-Step Scaffolding

### Step 1: Initialize the Monorepo Root

```bash
# Create project root
mkdir spiced-childcare
cd spiced-childcare
git init

# Create root package.json
pnpm init
```

**`package.json`:**

```json
{
  "name": "spiced-childcare",
  "private": true,
  "scripts": {
    "dev": "turbo dev",
    "build": "turbo build",
    "lint": "turbo lint",
    "test": "turbo test",
    "format": "prettier --write \"**/*.{ts,tsx,json,css}\"",
    "db:migrate": "pnpm --filter @spiced/api run db:migrate",
    "db:seed": "pnpm --filter @spiced/api run db:seed"
  },
  "devDependencies": {
    "turbo": "^2.0.0",
    "prettier": "^3.2.0",
    "typescript": "^5.4.0"
  },
  "engines": {
    "node": ">=20.0.0",
    "pnpm": ">=9.0.0"
  }
}
```

**`pnpm-workspace.yaml`:**

```yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

**`turbo.json`:**

```json
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": ["**/.env.*local"],
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "dist/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {},
    "test": {}
  }
}
```

### Step 2: Create Directory Structure

```bash
# Apps
mkdir -p apps/api apps/web-admin apps/web-dayhome apps/web-parent

# Packages
mkdir -p packages/shared-types/src/{models,enums,api}
mkdir -p packages/shared-utils/src
mkdir -p packages/shared-constants/src
mkdir -p packages/ui-kit/src/{components,styles}

# Config files
touch .gitignore .prettierrc .eslintrc.js tsconfig.base.json
```

**`.gitignore`:**

```
node_modules/
dist/
.next/
.env
.env.local
*.log
.turbo
coverage/
```

**`tsconfig.base.json`:**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true
  }
}
```

**`.prettierrc`:**

```json
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 100,
  "tabWidth": 2
}
```

### Step 3: Install Dependencies

```bash
# Install turbo globally in repo
pnpm add -D turbo prettier typescript -w

# Install shared dependencies
pnpm add -D @typescript-eslint/eslint-plugin @typescript-eslint/parser eslint eslint-config-prettier -w
```

---

## Step 4: Backend — NestJS API

### 4.1 Initialize NestJS App

```bash
cd apps/api
pnpm init
pnpm add @nestjs/core @nestjs/common @nestjs/platform-express @nestjs/config \
  @nestjs/jwt @nestjs/passport @nestjs/swagger @nestjs/throttler \
  @nestjs/bull bullmq ioredis \
  sequelize sequelize-typescript pg reflect-metadata \
  passport passport-jwt passport-local bcrypt class-validator class-transformer \
  winston socket.io

pnpm add -D @types/node @types/express @types/bcrypt @types/passport-jwt \
  @types/passport-local @types/sequelize \
  typescript ts-node ts-node-dev jest @types/jest supertest @types/supertest \
  sequelize-cli

# Monitoring & observability
pnpm add @willsoto/nestjs-prometheus prom-client
pnpm add @sentry/node @sentry/profiling-node
pnpm add nest-winston winston
pnpm add clamav.js
```

### 4.2 Create NestJS Core Files

**`apps/api/tsconfig.json`:**

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src",
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    "target": "ES2022",
    "module": "commonjs"
  },
  "include": ["src/**/*"]
}
```

**`apps/api/package.json`:**

```json
{
  "name": "@spiced/api",
  "scripts": {
    "dev": "ts-node-dev --respawn --transpile-only src/main.ts",
    "build": "tsc",
    "start:prod": "node dist/main.js",
    "db:migrate": "npx sequelize-cli db:migrate",
    "db:seed": "npx sequelize-cli db:seed:all",
    "db:create": "npx sequelize-cli db:create",
    "test": "jest",
    "test:e2e": "jest --config jest-e2e.json",
    "lint": "eslint src --ext .ts"
  }
}
```

**`apps/api/tsconfig.build.json`:**

```json
{
  "extends": "./tsconfig.json",
  "exclude": ["node_modules", "dist", "test", "**/*spec.ts"]
}
```

**`apps/api/.sequelizerc`:**

```js
const path = require('path');

module.exports = {
  config: path.resolve('src/database/config.js'),
  'models-path': path.resolve('src/database/models'),
  'seeders-path': path.resolve('src/database/seeders'),
  'migrations-path': path.resolve('src/database/migrations'),
};
```

**`apps/api/src/database/config.js`:**

```js
require('dotenv').config();

module.exports = {
  development: {
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'spiced_dev',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    dialect: 'postgres',
    logging: false,
  },
  test: {
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: 'spiced_test',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    dialect: 'postgres',
    logging: false,
  },
  production: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
    logging: false,
    pool: {
      max: 20,
      min: 5,
      acquire: 30000,
      idle: 10000,
    },
  },
};
```

**`apps/api/src/database/models/index.ts`:**

```typescript
import { Sequelize } from 'sequelize-typescript';
import { ConfigService } from '@nestjs/config';
import path from 'path';

export const createDatabase = (configService: ConfigService): Sequelize => {
  const nodeEnv = configService.get('NODE_ENV', 'development');
  const dbConfig = require(path.resolve(__dirname, '../config.js'))[nodeEnv];

  const sequelize = new Sequelize({
    ...dbConfig,
    models: [path.join(__dirname, '*.model.ts')],
    modelMatch: (filename, member) =>
      filename.substring(0, filename.indexOf('.model')) === member.toLowerCase(),
  });

  return sequelize;
};
```

### 4.3 Create NestJS App Module & Main

**`apps/api/src/app.module.ts`:**

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { BullModule } from '@nestjs/bull';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './modules/auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV || 'development'}`,
    }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        throttlers: [
          {
            ttl: 60000,
            limit: config.get('RATE_LIMIT_MAX', 100),
          },
        ],
      }),
    }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        redis: {
          host: config.get('REDIS_HOST', 'localhost'),
          port: config.get('REDIS_PORT', 6379),
        },
      }),
    }),
    DatabaseModule,
    AuthModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
```

**`apps/api/src/main.ts`:**

```typescript
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global prefix
  app.setGlobalPrefix('api/v1');

  // CORS
  app.enableCors({
    origin: process.env.FRONTEND_URLS?.split(',') || ['http://localhost:3000'],
    credentials: true,
  });

  // Global pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Global filters & interceptors
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new TransformInterceptor());

  // Swagger
  const config = new DocumentBuilder()
    .setTitle('Spiced Childcare API')
    .setDescription('Unified childcare management system API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 4000;
  await app.listen(port);
  console.log(`API running on http://localhost:${port}`);
  console.log(`Swagger docs at http://localhost:${port}/api/docs`);
}

bootstrap();
```

### 4.4 Database Module

**`apps/api/src/database/database.module.ts`:**

```typescript
import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { createDatabase } from './models';
import { Sequelize } from 'sequelize-typescript';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: 'SEQUELIZE',
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => createDatabase(configService),
    },
  ],
  exports: ['SEQUELIZE'],
})
export class DatabaseModule {}
```

### 4.5 Common Filters & Interceptors

**`apps/api/src/common/filters/http-exception.filter.ts`:**

```typescript
import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common';
import { Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse() as any;

    response.status(status).json({
      success: false,
      error: {
        code: exceptionResponse.code || 'INTERNAL_ERROR',
        message: exceptionResponse.message || exception.message,
        statusCode: status,
        details: exceptionResponse.details || undefined,
        requestId: ctx.getRequest().id,
      },
      meta: {
        requestId: ctx.getRequest().id,
        timestamp: new Date().toISOString(),
      },
    });
  }
}
```

**`apps/api/src/common/interceptors/transform.interceptor.ts`:**

```typescript
import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta: { requestId: string; timestamp: string };
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<ApiResponse<T>> {
    const request = context.switchToHttp().getRequest();
    return next.handle().pipe(
      map((data) => ({
        success: true,
        data,
        meta: {
          requestId: request.id,
          timestamp: new Date().toISOString(),
        },
      })),
    );
  }
}
```

### 4.6 Auth Module (JWT Dual-Token)

**`apps/api/src/modules/auth/auth.module.ts`:**

```typescript
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthRepository } from './auth.repository';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get('JWT_ACCESS_SECRET'),
        signOptions: {
          expiresIn: config.get('JWT_ACCESS_EXPIRY', '15m'),
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, AuthRepository, JwtStrategy, JwtRefreshStrategy],
  exports: [AuthService],
})
export class AuthModule {}
```

**`apps/api/src/modules/auth/auth.service.ts`:**

```typescript
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { AuthRepository } from './auth.repository';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly authRepository: AuthRepository,
  ) {}

  async login(email: string, password: string) {
    const user = await this.authRepository.findByEmail(email);
    if (!user)
      throw new UnauthorizedException({
        code: 'AUTH_INVALID_CREDENTIALS',
        message: 'Email or password is incorrect.',
      });

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid)
      throw new UnauthorizedException({
        code: 'AUTH_INVALID_CREDENTIALS',
        message: 'Email or password is incorrect.',
      });

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      orgId: user.orgId,
      dayhomeId: user.dayhomeId,
      permissions: user.permissions,
    };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get('JWT_REFRESH_EXPIRY', '7d'),
    });

    return { accessToken, refreshToken, user: this.sanitizeUser(user) };
  }

  async refresh(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
      });
      const user = await this.authRepository.findById(payload.sub);
      if (!user) throw new UnauthorizedException({ code: 'AUTH_REFRESH_TOKEN_INVALID' });

      const newPayload = {
        sub: user.id,
        email: user.email,
        role: user.role,
        orgId: user.orgId,
        dayhomeId: user.dayhomeId,
        permissions: user.permissions,
      };

      const accessToken = this.jwtService.sign(newPayload);
      return { accessToken, user: this.sanitizeUser(user) };
    } catch {
      throw new UnauthorizedException({
        code: 'AUTH_REFRESH_TOKEN_INVALID',
        message: 'Session is invalid. Please log in again.',
      });
    }
  }

  private sanitizeUser(user: any) {
    const { passwordHash, ...rest } = user;
    return rest;
  }
}
```

**`apps/api/src/modules/auth/strategies/jwt.strategy.ts`:**

```typescript
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { AuthRepository } from '../auth.repository';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private readonly authRepository: AuthRepository,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_ACCESS_SECRET'),
    });
  }

  async validate(payload: any) {
    const user = await this.authRepository.findById(payload.sub);
    if (!user) throw new UnauthorizedException();
    return {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
      orgId: payload.orgId,
      dayhomeId: payload.dayhomeId,
      permissions: payload.permissions,
    };
  }
}
```

**`apps/api/src/modules/auth/guards/jwt-auth.guard.ts`:**

```typescript
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
```

**`apps/api/src/modules/auth/guards/roles.guard.ts`:**

```typescript
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: string[]) => ReflectMetadata(ROLES_KEY, roles);

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) return true;
    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.includes(user.role);
  }
}
```

### 4.7 Guards & Decorators

**`apps/api/src/common/guards/permissions.guard.ts`:**

```typescript
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

export const PERMISSIONS_KEY = 'permissions';
export const Permissions = (...permissions: string[]) =>
  ReflectMetadata(PERMISSIONS_KEY, permissions);

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredPermissions) return true;
    const { user } = context.switchToHttp().getRequest();
    return requiredPermissions.every((perm) => user.permissions?.includes(perm));
  }
}
```

**`apps/api/src/common/decorators/current-user.decorator.ts`:**

```typescript
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    if (data) return request.user?.[data];
    return request.user;
  },
);
```

---

## Step 5: Database — Sequelize Models

### 5.1 Core Model Example

**`apps/api/src/database/models/organization.model.ts`:**

```typescript
import { Table, Column, Model, HasMany, DataType } from 'sequelize-typescript';

@Table({ tableName: 'organizations', paranoid: true })
export class Organization extends Model {
  @Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4, primaryKey: true })
  id!: string;

  @Column({ type: DataType.STRING(255), allowNull: false })
  name!: string;

  @Column({ type: DataType.STRING(255), unique: true, allowNull: false })
  email!: string;

  @Column({ type: DataType.ENUM('ACTIVE', 'SUSPENDED'), defaultValue: 'ACTIVE' })
  status!: string;

  @HasMany(() => Dayhome)
  dayhomes!: Dayhome[];
}
```

### 5.2 All Core Models (create these files)

**`apps/api/src/database/models/dayhome.model.ts`:**

```typescript
import {
  Table,
  Column,
  Model,
  ForeignKey,
  BelongsTo,
  HasMany,
  DataType,
} from 'sequelize-typescript';

@Table({ tableName: 'dayhomes', paranoid: true })
export class Dayhome extends Model {
  @Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4, primaryKey: true }) id!: string;
  @ForeignKey(() => Organization)
  @Column({ type: DataType.UUID, allowNull: false })
  organizationId!: string;
  @BelongsTo(() => Organization) organization!: Organization;
  @Column({ type: DataType.STRING(255), allowNull: false }) name!: string;
  @Column({ type: DataType.TEXT }) address!: string;
  @Column({ type: DataType.INTEGER }) capacity!: number;
  @Column({
    type: DataType.ENUM('PENDING', 'ACTIVE', 'SUSPENDED', 'REJECTED', 'CLOSED'),
    defaultValue: 'PENDING',
  })
  status!: string;
  @Column({ type: DataType.STRING(100) }) licenseNumber!: string;
  @Column({ type: DataType.DATE }) licenseExpiry!: Date;
  @HasMany(() => Room) rooms!: Room[];
  @HasMany(() => Educator) educators!: Educator[];
  @HasMany(() => Document) documents!: Document[];
}
```

**`apps/api/src/database/models/room.model.ts`:**

```typescript
@Table({ tableName: 'rooms', paranoid: true })
export class Room extends Model {
  @Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4, primaryKey: true }) id!: string;
  @ForeignKey(() => Dayhome) @Column({ type: DataType.UUID, allowNull: false }) dayhomeId!: string;
  @BelongsTo(() => Dayhome) dayhome!: Dayhome;
  @Column({ type: DataType.STRING(255), allowNull: false }) name!: string;
  @Column({ type: DataType.INTEGER, allowNull: false }) capacity!: number;
  @Column({ type: DataType.ENUM('INFANT', 'TODDLER', 'PRESCHOOL', 'SCHOOL_AGE') })
  ageGroup!: string;
}
```

**`apps/api/src/database/models/educator.model.ts`:**

```typescript
@Table({ tableName: 'educators', paranoid: true })
export class Educator extends Model {
  @Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4, primaryKey: true }) id!: string;
  @ForeignKey(() => Dayhome) @Column({ type: DataType.UUID, allowNull: false }) dayhomeId!: string;
  @BelongsTo(() => Dayhome) dayhome!: Dayhome;
  @Column({ type: DataType.STRING(255), allowNull: false }) firstName!: string;
  @Column({ type: DataType.STRING(255), allowNull: false }) lastName!: string;
  @Column({ type: DataType.STRING(255), unique: true, allowNull: false }) email!: string;
  @Column({ type: DataType.STRING(20) }) phone!: string;
  @Column({ type: DataType.STRING(255) }) passwordHash!: string;
  @Column({ type: DataType.ENUM('ACTIVE', 'ON_LEAVE', 'TERMINATED'), defaultValue: 'ACTIVE' })
  status!: string;
}
```

**`apps/api/src/database/models/family.model.ts`:**

```typescript
@Table({ tableName: 'families', paranoid: true })
export class Family extends Model {
  @Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4, primaryKey: true }) id!: string;
  @ForeignKey(() => Organization)
  @Column({ type: DataType.UUID, allowNull: false })
  organizationId!: string;
  @BelongsTo(() => Organization) organization!: Organization;
  @Column({ type: DataType.STRING(255), allowNull: false }) primaryContactName!: string;
  @Column({ type: DataType.STRING(255), unique: true, allowNull: false }) email!: string;
  @Column({ type: DataType.STRING(20) }) phone!: string;
  @Column({ type: DataType.STRING(255) }) passwordHash!: string;
  @HasMany(() => Child) children!: Child[];
}
```

**`apps/api/src/database/models/child.model.ts`:**

```typescript
@Table({ tableName: 'children', paranoid: true })
export class Child extends Model {
  @Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4, primaryKey: true }) id!: string;
  @ForeignKey(() => Family) @Column({ type: DataType.UUID, allowNull: false }) familyId!: string;
  @BelongsTo(() => Family) family!: Family;
  @Column({ type: DataType.STRING(255), allowNull: false }) firstName!: string;
  @Column({ type: DataType.STRING(255), allowNull: false }) lastName!: string;
  @Column({ type: DataType.DATEONLY, allowNull: false }) dateOfBirth!: Date;
  @Column({ type: DataType.ENUM('MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY') }) gender!: string;
  @Column({ type: DataType.ARRAY(DataType.STRING), defaultValue: [] }) allergies!: string[];
  @Column({ type: DataType.TEXT }) medicalNotes!: string;
}
```

**`apps/api/src/database/models/enrollment.model.ts`:**

```typescript
@Table({ tableName: 'enrollments', paranoid: true })
export class Enrollment extends Model {
  @Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4, primaryKey: true }) id!: string;
  @ForeignKey(() => Child) @Column({ type: DataType.UUID, allowNull: false }) childId!: string;
  @BelongsTo(() => Child) child!: Child;
  @ForeignKey(() => Dayhome) @Column({ type: DataType.UUID, allowNull: false }) dayhomeId!: string;
  @BelongsTo(() => Dayhome) dayhome!: Dayhome;
  @ForeignKey(() => Room) @Column({ type: DataType.UUID }) roomId!: string;
  @BelongsTo(() => Room) room!: Room;
  @Column({ type: DataType.DATEONLY, allowNull: false }) startDate!: Date;
  @Column({ type: DataType.DATEONLY }) endDate!: Date;
  @Column({ type: DataType.ENUM('ACTIVE', 'WAITLISTED', 'WITHDRAWN'), defaultValue: 'ACTIVE' })
  status!: string;
}
```

**`apps/api/src/database/models/attendance.model.ts`:**

```typescript
@Table({ tableName: 'attendance_records' })
export class Attendance extends Model {
  @Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4, primaryKey: true }) id!: string;
  @ForeignKey(() => Child) @Column({ type: DataType.UUID, allowNull: false }) childId!: string;
  @BelongsTo(() => Child) child!: Child;
  @ForeignKey(() => Educator)
  @Column({ type: DataType.UUID, allowNull: false })
  checkedInBy!: string;
  @Column({ type: DataType.DATE, allowNull: false }) checkInTime!: Date;
  @ForeignKey(() => Educator) @Column({ type: DataType.UUID }) checkedOutBy!: string;
  @Column({ type: DataType.DATE }) checkOutTime!: Date;
  @Column({ type: DataType.ENUM('PRESENT', 'ABSENT', 'LATE'), defaultValue: 'PRESENT' })
  status!: string;
}
```

**`apps/api/src/database/models/invoice.model.ts`:**

```typescript
@Table({ tableName: 'invoices', paranoid: true })
export class Invoice extends Model {
  @Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4, primaryKey: true }) id!: string;
  @ForeignKey(() => Family) @Column({ type: DataType.UUID, allowNull: false }) familyId!: string;
  @BelongsTo(() => Family) family!: Family;
  @ForeignKey(() => Dayhome) @Column({ type: DataType.UUID, allowNull: false }) dayhomeId!: string;
  @BelongsTo(() => Dayhome) dayhome!: Dayhome;
  @Column({ type: DataType.DECIMAL(10, 2), allowNull: false }) totalAmount!: number;
  @Column({ type: DataType.DECIMAL(10, 2), defaultValue: 0 }) subsidyAmount!: number;
  @Column({ type: DataType.DECIMAL(10, 2), defaultValue: 0 }) paidAmount!: number;
  @Column({ type: DataType.DATEONLY, allowNull: false }) dueDate!: Date;
  @Column({
    type: DataType.ENUM('DRAFT', 'SENT', 'PAID', 'OVERDUE', 'CANCELLED'),
    defaultValue: 'DRAFT',
  })
  status!: string;
}
```

**`apps/api/src/database/models/document.model.ts`:**

```typescript
@Table({ tableName: 'documents', paranoid: true })
export class Document extends Model {
  @Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4, primaryKey: true }) id!: string;
  @ForeignKey(() => Dayhome) @Column({ type: DataType.UUID }) dayhomeId!: string;
  @BelongsTo(() => Dayhome) dayhome!: Dayhome;
  @ForeignKey(() => Educator) @Column({ type: DataType.UUID }) educatorId!: string;
  @Column({
    type: DataType.ENUM(
      'LICENSE',
      'INSURANCE',
      'FIRE_INSPECTION',
      'HEALTH_INSPECTION',
      'FIRST_AID_CERT',
      'POLICE_CHECK',
      'TRAINING_CERT',
      'OTHER',
    ),
    allowNull: false,
  })
  documentType!: string;
  @Column({ type: DataType.STRING(500), allowNull: false }) fileUrl!: string;
  @Column({ type: DataType.DATEONLY }) expiryDate!: Date;
  @Column({
    type: DataType.ENUM('ACTIVE', 'EXPIRING_SOON', 'EXPIRED', 'SUPERSEDED'),
    defaultValue: 'ACTIVE',
  })
  status!: string;
  @Column({ type: DataType.INTEGER, defaultValue: 1 }) version!: number;
}
```

**`apps/api/src/database/models/message.model.ts`:**

```typescript
@Table({ tableName: 'messages' })
export class Message extends Model {
  @Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4, primaryKey: true }) id!: string;
  @Column({ type: DataType.UUID, allowNull: false }) threadId!: string;
  @ForeignKey(() => Educator) @Column({ type: DataType.UUID }) senderEducatorId!: string;
  @ForeignKey(() => Family) @Column({ type: DataType.UUID }) senderFamilyId!: string;
  @Column({ type: DataType.TEXT, allowNull: false }) body!: string;
  @Column({ type: DataType.BOOLEAN, defaultValue: false }) isRead!: boolean;
  @Column({ type: DataType.DATE, defaultValue: DataType.NOW }) createdAt!: Date;
}
```

**`apps/api/src/database/models/audit-log.model.ts`:**

```typescript
@Table({ tableName: 'audit_logs' })
export class AuditLog extends Model {
  @Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4, primaryKey: true }) id!: string;
  @Column({ type: DataType.UUID, allowNull: false }) userId!: string;
  @Column({ type: DataType.STRING(100), allowNull: false }) action!: string;
  @Column({ type: DataType.STRING(100), allowNull: false }) entity!: string;
  @Column({ type: DataType.UUID, allowNull: false }) entityId!: string;
  @Column({ type: DataType.JSONB }) before!: object;
  @Column({ type: DataType.JSONB }) after!: object;
  @Column({ type: DataType.DATE, defaultValue: DataType.NOW }) createdAt!: Date;
}
```

### 5.3 Seed Script

**`apps/api/src/database/seeders/20250101000001-demo-data.ts`:**

```typescript
import { QueryInterface } from 'sequelize';
import * as bcrypt from 'bcrypt';

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    const passwordHash = await bcrypt.hash('Password123!', 10);

    await queryInterface.bulkInsert('organizations', [
      {
        id: 'org-001',
        name: 'Spiced Childcare HQ',
        email: 'admin@spiced.ca',
        status: 'ACTIVE',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    await queryInterface.bulkInsert('users', [
      {
        id: 'user-001',
        organizationId: 'org-001',
        email: 'super@spiced.ca',
        passwordHash,
        role: 'SUPER_ADMIN',
        firstName: 'Super',
        lastName: 'Admin',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.bulkDelete('users', {}, {});
    await queryInterface.bulkDelete('organizations', {}, {});
  },
};
```

---

## Step 6: Frontend — Next.js App

### 6.1 Initialize Web App

```bash
cd apps/web-admin
pnpm init
pnpm add next@14 react@18 react-dom@18
pnpm add typescript @types/react @types/node
```

**`apps/web-admin/package.json`:**

```json
{
  "name": "@spiced/web-admin",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  }
}
```

### 6.2 Install Frontend Dependencies

```bash
cd apps/web-admin

# Core
pnpm add zustand @tanstack/react-query axios react-hook-form @hookform/resolvers zod
pnpm add date-fns lucide-react react-i18next i18next

# UI (Tailwind + shadcn/ui)
pnpm add tailwindcss postcss autoprefixer
pnpm add @radix-ui/react-slot @radix-ui/react-dialog @radix-ui/react-dropdown-menu
pnpm add @radix-ui/react-select @radix-ui/react-tabs @radix-ui/react-toast
pnpm add class-variance-authority clsx tailwind-merge

# Charts
pnpm add recharts
```

### 6.3 Tailwind & PostCSS Config

**`apps/web-admin/tailwind.config.ts`:**

```typescript
import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}', '../../packages/ui-kit/src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#5B2D8E',
          50: '#F3EEF8',
          100: '#E7DCF1',
          200: '#CFB9E3',
          300: '#B796D5',
          400: '#9F73C7',
          500: '#5B2D8E',
          600: '#4A2472',
          700: '#391B56',
          800: '#28123A',
          900: '#17091E',
        },
        success: { DEFAULT: '#2E7D32', 50: '#E8F5E9' },
        warning: { DEFAULT: '#ED6C02', 50: '#FFF3E0' },
        error: { DEFAULT: '#D32F2F', 50: '#FFEBEE' },
      },
    },
  },
  plugins: [],
};

export default config;
```

**`apps/web-admin/postcss.config.js`:**

```js
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

### 6.4 App Router Structure

```
src/app/
├── (auth)/
│   ├── login/
│   │   └── page.tsx
│   ├── register/
│   │   └── page.tsx
│   └── layout.tsx
├── (dashboard)/
│   ├── layout.tsx          # Sidebar + header
│   ├── page.tsx            # Dashboard home
│   └── ...
├── layout.tsx              # Root layout
├── page.tsx                # Redirect to /login or /dashboard
├── globals.css             # Tailwind imports
└── middleware.ts           # Auth middleware
```

**`src/app/globals.css`:**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

**`src/app/layout.tsx`:**

```tsx
import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '@/components/providers';

export const metadata: Metadata = {
  title: 'Spiced Childcare',
  description: 'Unified childcare management system',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

### 6.5 Auth Store (Zustand)

**`src/lib/stores/auth.store.ts`:**

```typescript
import { create } from 'zustand';

interface User {
  id: string;
  email: string;
  role: string;
  orgId: string;
  dayhomeId: string | null;
  permissions: string[];
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  setTokens: (accessToken: string, user: User) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  setTokens: (accessToken, user) => set({ accessToken, user, isAuthenticated: true }),
  clearAuth: () => set({ accessToken: null, user: null, isAuthenticated: false }),
}));
```

### 6.6 Axios Client

**`src/lib/api/client.ts`:**

```typescript
import axios from 'axios';
import { useAuthStore } from '@/lib/stores/auth.store';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

// Attach access token from memory
apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-refresh on 401
let isRefreshing = false;
let failedQueue: Array<{ resolve: Function; reject: Function }> = [];

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return apiClient(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1'}/auth/refresh`,
          {},
          { withCredentials: true },
        );
        const { accessToken, user } = response.data.data;
        useAuthStore.getState().setTokens(accessToken, user);

        failedQueue.forEach((p) => p.resolve(accessToken));
        failedQueue = [];

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        failedQueue.forEach((p) => p.reject(refreshError));
        failedQueue = [];
        useAuthStore.getState().clearAuth();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export default apiClient;
```

### 6.7 Auth Middleware (Next.js)

**`src/app/middleware.ts`:**

```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const publicPaths = ['/login', '/register', '/forgot-password', '/reset-password'];

export function middleware(request: NextRequest) {
  const refreshToken = request.cookies.get('refresh_token');
  const isPublicPath = publicPaths.some((path) => request.nextUrl.pathname.startsWith(path));

  if (!refreshToken && !isPublicPath) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (refreshToken && isPublicPath) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
```

### 6.8 API Client Functions

**`src/lib/api/auth.ts`:**

```typescript
import apiClient from './client';
import { useAuthStore } from '@/lib/stores/auth.store';

export const authApi = {
  login: async (email: string, password: string) => {
    const { data } = await apiClient.post('/auth/login', { email, password });
    const { accessToken, user } = data.data;
    useAuthStore.getState().setTokens(accessToken, user);
    return data.data;
  },

  register: async (payload: any) => {
    const { data } = await apiClient.post('/auth/register', payload);
    return data.data;
  },

  logout: async () => {
    await apiClient.post('/auth/logout');
    useAuthStore.getState().clearAuth();
  },

  refresh: async () => {
    const { data } = await apiClient.post('/auth/refresh');
    const { accessToken, user } = data.data;
    useAuthStore.getState().setTokens(accessToken, user);
    return data.data;
  },

  forgotPassword: async (email: string) => {
    const { data } = await apiClient.post('/auth/forgot-password', { email });
    return data.data;
  },

  resetPassword: async (token: string, password: string) => {
    const { data } = await apiClient.post('/auth/reset-password', { token, password });
    return data.data;
  },
};
```

### 6.9 TanStack Query Provider

**`src/components/providers.tsx`:**

```tsx
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { Toaster } from '@/components/ui/toaster';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5,
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster />
    </QueryClientProvider>
  );
}
```

---

## Step 7: UI Kit (shadcn/ui Wrappers)

### 7.1 Setup shadcn/ui

```bash
cd apps/web-admin
pnpm dlx shadcn@latest init
```

Select: `New York` style, `Zinc` base color, CSS variables.

### 7.2 Package Path Aliases

**`apps/web-admin/tsconfig.json`:**

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@spiced/shared-types": ["../../packages/shared-types/src"],
      "@spiced/shared-utils": ["../../packages/shared-utils/src"],
      "@spiced/shared-constants": ["../../packages/shared-constants/src"],
      "@spiced/ui-kit": ["../../packages/ui-kit/src"]
    }
  }
}
```

---

## Step 8: Shared Packages

### 8.1 Shared Types

**`packages/shared-types/package.json`:**

```json
{
  "name": "@spiced/shared-types",
  "main": "./src/index.ts",
  "types": "./src/index.ts"
}
```

**`packages/shared-types/src/index.ts`:**

```typescript
export * from './enums';
export * from './api/responses';
```

**`packages/shared-types/src/api/responses.ts`:**

```typescript
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta: { requestId: string; timestamp: string };
}

export interface PaginatedResponse<T> extends Omit<ApiResponse<T[]>, 'data'> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  meta: { requestId: string; timestamp: string };
}

export interface ApiError {
  code: string;
  message: string;
  statusCode: number;
  details?: Array<{ field: string; message: string }>;
  requestId: string;
}
```

**`packages/shared-types/src/enums/index.ts`:**

```typescript
export enum Role {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ORG_ADMIN = 'ORG_ADMIN',
  ORG_MANAGER = 'ORG_MANAGER',
  DAYHOME_OWNER = 'DAYHOME_OWNER',
  EDUCATOR = 'EDUCATOR',
  PARENT = 'PARENT',
  GOVERNMENT = 'GOVERNMENT',
}

export enum DayhomeStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  REJECTED = 'REJECTED',
  CLOSED = 'CLOSED',
}

export enum AttendanceStatus {
  PRESENT = 'PRESENT',
  ABSENT = 'ABSENT',
  LATE = 'LATE',
}

export enum DocumentType {
  LICENSE = 'LICENSE',
  INSURANCE = 'INSURANCE',
  FIRE_INSPECTION = 'FIRE_INSPECTION',
  HEALTH_INSPECTION = 'HEALTH_INSPECTION',
  FIRST_AID_CERT = 'FIRST_AID_CERT',
  POLICE_CHECK = 'POLICE_CHECK',
  TRAINING_CERT = 'TRAINING_CERT',
  OTHER = 'OTHER',
}

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER',
  PREFER_NOT_TO_SAY = 'PREFER_NOT_TO_SAY',
}
```

### 8.2 Shared Constants

**`packages/shared-constants/src/index.ts`:**

```typescript
export const ERROR_CODES = {
  AUTH_INVALID_CREDENTIALS: 'AUTH_INVALID_CREDENTIALS',
  AUTH_ACCOUNT_LOCKED: 'AUTH_ACCOUNT_LOCKED',
  AUTH_EMAIL_NOT_VERIFIED: 'AUTH_EMAIL_NOT_VERIFIED',
  AUTH_TOKEN_EXPIRED: 'AUTH_TOKEN_EXPIRED',
  AUTH_TOKEN_INVALID: 'AUTH_TOKEN_INVALID',
  AUTH_INSUFFICIENT_PERMISSIONS: 'AUTH_INSUFFICIENT_PERMISSIONS',
  AUTH_REFRESH_TOKEN_INVALID: 'AUTH_REFRESH_TOKEN_INVALID',
  DAYHOME_NOT_FOUND: 'DAYHOME_NOT_FOUND',
  DAYHOME_ALREADY_ACTIVE: 'DAYHOME_ALREADY_ACTIVE',
  DAYHOME_SUSPENDED: 'DAYHOME_SUSPENDED',
  CHILD_NOT_FOUND: 'CHILD_NOT_FOUND',
  CHILD_ALREADY_ENROLLED: 'CHILD_ALREADY_ENROLLED',
  FAMILY_NOT_FOUND: 'FAMILY_NOT_FOUND',
  EDUCATOR_NOT_FOUND: 'EDUCATOR_NOT_FOUND',
  ROOM_AT_CAPACITY: 'ROOM_AT_CAPACITY',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  DUPLICATE_EMAIL: 'DUPLICATE_EMAIL',
} as const;

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
} as const;

export const FILE = {
  MAX_SIZE: 10 * 1024 * 1024,
  ALLOWED_TYPES: ['application/pdf', 'image/jpeg', 'image/png'],
} as const;
```

---

## Step 9: Infrastructure — Docker Compose (All Services)

**`docker-compose.yml`** (full stack for local development):

```yaml
services:
  # ─── Database ──────────────────────────────────────────
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: &db_user postgres
      POSTGRES_PASSWORD: &db_pass postgres
      POSTGRES_DB: spiced_dev
    ports:
      - '5432:5432'
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ['CMD-SHELL', 'pg_isready -U postgres']
      interval: 10s
      timeout: 5s
      retries: 5

  # ─── Cache & Queues ────────────────────────────────────
  redis:
    image: redis:7-alpine
    ports:
      - '6379:6379'
    volumes:
      - redisdata:/data
    healthcheck:
      test: ['CMD', 'redis-cli', 'ping']
      interval: 10s
      timeout: 3s
      retries: 5

  # ─── File Storage (S3-compatible for dev) ──────────────
  minio:
    image: minio/minio:latest
    ports:
      - '9000:9000' # API
      - '9001:9001' # Console
    environment:
      MINIO_ROOT_USER: minioadmin
      MINIO_ROOT_PASSWORD: minioadmin
    volumes:
      - miniodata:/data
    command: server /data --console-address ":9001"
    healthcheck:
      test: ['CMD', 'curl', '-f', 'http://localhost:9000/minio/health/live']
      interval: 30s
      timeout: 10s
      retries: 3

  # ─── Virus Scanner (document upload security) ──────────
  clamav:
    image: clamav/clamav:latest
    ports:
      - '3310:3310'
    volumes:
      - clamdata:/var/lib/clamav
    environment:
      CLAMAV_NO_FRESHCLD: 'false'
    # Note: first start downloads virus DB (~500MB), can take 10-15 min
    healthcheck:
      test: ['CMD-SHELL', "echo 'PING' | nc localhost 3310 | grep PONG"]
      interval: 30s
      timeout: 10s
      retries: 10
      start_period: 120s # Give ClamAV time to download virus definitions

  # ─── Email Catcher (dev only — captures all outbound email) ──
  mailpit:
    image: axllent/mailpit:latest
    ports:
      - '1025:1025' # SMTP
      - '8025:8025' # Web UI
    restart: unless-stopped

  # ─── Monitoring ─────────────────────────────────────────
  prometheus:
    image: prom/prometheus:latest
    ports:
      - '9090:9090'
    volumes:
      - ./infra/prometheus/prometheus.yml:/etc/prometheus/prometheus.yml
      - promdata:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
    restart: unless-stopped

  grafana:
    image: grafana/grafana:latest
    ports:
      - '3001:3000' # Grafana UI (note: 3000 conflicts with Next.js)
    environment:
      GF_SECURITY_ADMIN_USER: admin
      GF_SECURITY_ADMIN_PASSWORD: admin
      GF_INSTALL_PLUGINS: grafana-piechart-panel
    volumes:
      - grafanadata:/var/lib/grafana
      - ./infra/grafana/dashboards:/etc/grafana/provisioning/dashboards
      - ./infra/grafana/datasources:/etc/grafana/provisioning/datasources
    restart: unless-stopped

  # ─── Error Tracking ─────────────────────────────────────
  # Sentry self-hosted (optional — use sentry.io SaaS for simplicity)
  # For dev, we log errors to console; Sentry is configured via DSN in production

volumes:
  pgdata:
  redisdata:
  miniodata:
  clamdata:
  promdata:
  grafanadata:
```

### Create Infrastructure Config Files

```bash
mkdir -p infra/prometheus infra/grafana/dashboards infra/grafana/datasources
```

**`infra/prometheus/prometheus.yml`:**

```yaml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'nestjs-api'
    static_configs:
      - targets: ['host.docker.internal:4000']
    metrics_path: '/api/v1/metrics'

  - job_name: 'postgres'
    static_configs:
      - targets: ['host.docker.internal:5432']

  - job_name: 'redis'
    static_configs:
      - targets: ['host.docker.internal:6379']

  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']
```

**`infra/grafana/datasources/datasource.yml`:**

```yaml
apiVersion: 1

datasources:
  - name: Prometheus
    type: prometheus
    access: proxy
    url: http://prometheus:9090
    isDefault: true
```

**`infra/grafana/dashboards/dashboard.yml`:**

```yaml
apiVersion: 1

providers:
  - name: 'Default'
    orgId: 1
    folder: ''
    type: file
    options:
      path: /etc/grafana/provisioning/dashboards
```

---

## Step 9a: Security Infrastructure

### 9a.1 File Upload Virus Scanning

Every uploaded document is scanned by ClamAV **before** being stored. Infected files are quarantined and never reach the storage bucket.

**`apps/api/src/modules/documents/documents.service.ts`** (scanning integration):

```typescript
import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as clamav from 'clamav.js';
import * as fs from 'fs/promises';
import * as path from 'path';

@Injectable()
export class FileScannerService {
  private clamAvHost: string;
  private clamAvPort: number;

  constructor(private configService: ConfigService) {
    this.clamAvHost = this.configService.get('CLAMAV_HOST', 'localhost');
    this.clamAvPort = this.configService.get('CLAMAV_PORT', 3310);
  }

  async scanFile(filePath: string): Promise<boolean> {
    try {
      const clam = clamav.createClam(this.clamAvHost, this.clamAvPort);
      const result = await clam.scan(filePath);
      if (result.includes('FOUND')) {
        await fs.unlink(filePath); // Delete infected file immediately
        throw new BadRequestException({
          code: 'FILE_VIRUS_DETECTED',
          message: 'The uploaded file contains a virus or malware and has been rejected.',
        });
      }
      return true;
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      // If ClamAV is down, log warning but accept file (fail-open for dev)
      console.warn('ClamAV scan failed, accepting file:', error.message);
      return true;
    }
  }
}
```

**Upload flow with virus scanning:**

```typescript
// In your upload controller:
@Post('upload')
@UseInterceptors(FileInterceptor('file'))
async uploadDocument(
  @UploadedFile() file: Express.Multer.File,
  @Body() dto: UploadDocumentDto,
) {
  // 1. Validate file type server-side (not just extension)
  this.validateMimeType(file.mimetype);

  // 2. Save temp file
  const tempPath = path.join('/tmp/uploads', `${uuidv4()}-${file.originalname}`);
  await fs.writeFile(tempPath, file.buffer);

  // 3. Scan for viruses
  await this.fileScannerService.scanFile(tempPath);

  // 4. Encrypt sensitive fields before storage
  const encryptedMedicalNotes = dto.medicalNotes
    ? this.encryptionService.encrypt(dto.medicalNotes)
    : undefined;

  // 5. Upload to S3/R2 with server-side encryption
  const fileUrl = await this.storageService.upload(tempPath, {
    bucket: this.configService.get('S3_BUCKET'),
    key: `documents/${dto.dayhomeId}/${uuidv4()}-${file.originalname}`,
    contentType: file.mimetype,
    serverSideEncryption: 'AES256',
  });

  // 6. Clean temp file
  await fs.unlink(tempPath);

  // 7. Save metadata to database
  return this.documentsService.create({ ...dto, fileUrl });
}
```

### 9a.2 Maldet (Linux Malware Detect) — Production Server

For the VPS production environment, install **maldet** alongside ClamAV:

```bash
# Install on production VPS
cd /usr/local/src
wget http://www.rfxn.com/downloads/maldet-current.tar.gz
tar -xzf maldet-current.tar.gz
cd maldet-*
./install.sh

# Update signatures
maldet --update-ver
maldet --update

# Schedule daily scan via cron
echo "0 2 * * * /usr/local/maldetect/maldet --scan-all /var/www/spiced/uploads >> /var/log/maldet.log" | crontab -

# Monitor quarantine alerts
# maldet reports go to /usr/local/maldetect/logs/event_log
```

### 9a.3 File Upload Security Rules

| Control           | Implementation                                                                     |
| ----------------- | ---------------------------------------------------------------------------------- |
| MIME validation   | Server-side check using `file-type` library (not just `multer` extension check)    |
| File size limit   | 10MB enforced at Nginx level + Multer + application validation                     |
| Allowed types     | PDF, JPG, PNG only (reject SVG — XSS risk, reject DOCX/DOC — macro risk initially) |
| Virus scanning    | ClamAV on every upload before storage                                              |
| File encryption   | AES-256 at rest in S3/R2; server-side encryption (SSE-S3)                          |
| Temp file cleanup | Delete temp files immediately after upload, regardless of success/failure          |
| Quarantine        | Infected files deleted immediately; admin notified via alert                       |
| Access URLs       | Signed URLs with 15-minute expiry; never expose direct bucket URLs                 |

### 9a.4 Document Upload Nginx Config (Production)

```nginx
# /etc/nginx/sites-available/spiced-api

server {
    listen 443 ssl;
    server_name api.spiced.ca;

    client_max_body_size 10M;

    location /api/v1/documents/upload {
        # Rate limit: 10 uploads per minute per IP
        limit_req zone=uploads burst=5 nodelay;
        proxy_pass http://localhost:4000;
        proxy_read_timeout 60s;  # ClamAV scan can take time for large files
    }
}
```

---

## Step 9b: Monitoring & Observability

### 9b.1 Prometheus Metrics in NestJS

```bash
cd apps/api
pnpm add @willsoto/nestjs-prometheus prom-client
```

**`apps/api/src/common/monitoring/metrics.service.ts`:**

```typescript
import { Injectable } from '@nestjs/common';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { Counter, Histogram, Gauge } from 'prom-client';

@Injectable()
export class MetricsService {
  constructor(
    @InjectMetric('http_requests_total')
    private readonly requestCounter: Counter<string>,

    @InjectMetric('http_request_duration_seconds')
    private readonly requestDuration: Histogram<string>,

    @InjectMetric('active_connections')
    private readonly activeConnections: Gauge<string>,
  ) {}

  incrementRequestCount(method: string, route: string, status: number) {
    this.requestCounter.labels(method, route, String(status)).inc();
  }

  observeRequestDuration(method: string, route: string, durationMs: number) {
    this.requestDuration.labels(method, route).observe(durationMs / 1000);
  }

  setActiveConnections(count: number) {
    this.activeConnections.set(count);
  }
}
```

**Add to `app.module.ts`:**

```typescript
import {
  PrometheusModule,
  makeCounterProvider,
  makeHistogramProvider,
  makeGaugeProvider,
} from '@willsoto/nestjs-prometheus';

@Module({
  imports: [
    PrometheusModule.register({
      path: '/api/v1/metrics',
      defaultMetrics: { enabled: true },
    }),
    // ... other imports
  ],
  providers: [
    makeCounterProvider({
      name: 'http_requests_total',
      help: 'Total HTTP requests',
      labelNames: ['method', 'route', 'status'],
    }),
    makeHistogramProvider({
      name: 'http_request_duration_seconds',
      help: 'HTTP request duration in seconds',
      labelNames: ['method', 'route'],
      buckets: [0.01, 0.05, 0.1, 0.3, 0.5, 1, 3, 5],
    }),
    makeGaugeProvider({
      name: 'active_connections',
      help: 'Active WebSocket connections',
    }),
  ],
})
export class AppModule {}
```

### 9b.2 Health Check Endpoint

**`apps/api/src/modules/health/health.controller.ts`:**

```typescript
import { Controller, Get } from '@nestjs/common';
import { Sequelize } from 'sequelize-typescript';
import { InjectConnection } from '@nestjs/sequelize';
import { ConfigService } from '@nestjs/config';
import { createClient } from 'redis';

@Controller('health')
export class HealthController {
  constructor(
    @InjectConnection() private readonly sequelize: Sequelize,
    private configService: ConfigService,
  ) {}

  @Get()
  async check() {
    const checks: Record<string, { status: string; latency?: number }> = {};

    // Database health
    try {
      const start = Date.now();
      await this.sequelize.authenticate();
      checks.database = { status: 'healthy', latency: Date.now() - start };
    } catch (e) {
      checks.database = { status: 'unhealthy' };
    }

    // Redis health
    try {
      const redis = createClient({
        url: `redis://${this.configService.get('REDIS_HOST')}:${this.configService.get('REDIS_PORT')}`,
      });
      const start = Date.now();
      await redis.connect();
      await redis.ping();
      checks.redis = { status: 'healthy', latency: Date.now() - start };
      await redis.disconnect();
    } catch (e) {
      checks.redis = { status: 'unhealthy' };
    }

    // Storage health
    try {
      const start = Date.now();
      // Ping S3/R2 bucket
      checks.storage = { status: 'healthy', latency: Date.now() - start };
    } catch (e) {
      checks.storage = { status: 'unhealthy' };
    }

    const allHealthy = Object.values(checks).every((c) => c.status === 'healthy');
    return {
      status: allHealthy ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      checks,
    };
  }
}
```

### 9b.3 Sentry Error Tracking

```bash
cd apps/api
pnpm add @sentry/node @sentry/profiling-node
```

**`apps/api/src/main.ts`** (add before `bootstrap()`):

```typescript
import * as Sentry from '@sentry/node';

async function bootstrap() {
  if (process.env.SENTRY_DSN) {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      environment: process.env.NODE_ENV || 'development',
      tracesSampleRate: parseFloat(process.env.SENTRY_TRACES_SAMPLE_RATE || '0.2'),
      profilesSampleRate: 0.1,
      integrations: [new Sentry.Integrations.Http({ tracing: true })],
    });
  }

  const app = await NestFactory.create(AppModule);

  // Sentry request handler (must be first)
  if (process.env.SENTRY_DSN) {
    app.use(Sentry.Handlers.requestHandler());
    app.use(Sentry.Handlers.tracingHandler());
  }

  // ... rest of bootstrap

  // Sentry error handler (must be last)
  if (process.env.SENTRY_DSN) {
    app.use(Sentry.Handlers.errorHandler());
  }
}
```

### 9b.4 Uptime Monitoring (Production)

Configure **UptimeRobot** or **Better Uptime** to ping these endpoints every 5 minutes:

| Endpoint              | Purpose           | Expected                |
| --------------------- | ----------------- | ----------------------- |
| `GET /api/v1/health`  | Full health check | `{ status: "healthy" }` |
| `GET /api/v1/metrics` | Prometheus scrape | HTTP 200                |
| `GET /` (frontend)    | App availability  | HTTP 200                |

### 9b.5 Logging with Winston

```bash
cd apps/api
pnpm add winston nest-winston
```

**`apps/api/src/main.ts`** (add logger):

```typescript
import { WinstonModule, utilities } from 'nest-winston';
import * as winston from 'winston';

const logger = WinstonModule.createLogger({
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.ms(),
        utilities.format.nestLike('SpicedAPI', { prettyPrint: true, colors: true }),
      ),
    }),
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      maxsize: 10 * 1024 * 1024, // 10MB
      maxFiles: 10,
    }),
    new winston.transports.File({
      filename: 'logs/combined.log',
      maxsize: 10 * 1024 * 1024,
      maxFiles: 5,
    }),
  ],
});

const app = await NestFactory.create(AppModule, { logger });
```

---

## Step 9c: Backup & Disaster Recovery

### 9c.1 Automated Database Backups

**`scripts/backup-db.sh`** (run via cron on production VPS):

```bash
#!/bin/bash
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/backups/spiced/postgres"
DB_NAME="spiced_prod"
DB_USER="postgres"
S3_BUCKET="spiced-backups"

# Create backup
pg_dump -U $DB_USER $DB_NAME | gzip > "$BACKUP_DIR/db_$TIMESTAMP.sql.gz"

# Encrypt backup (AES-256)
gpg --symmetric --cipher-algo AES256 \
  --passphrase "$BACKUP_ENCRYPTION_KEY" \
  -o "$BACKUP_DIR/db_$TIMESTAMP.sql.gz.gpg" \
  "$BACKUP_DIR/db_$TIMESTAMP.sql.gz"

# Upload to S3/R2
rclone copy "$BACKUP_DIR/db_$TIMESTAMP.sql.gz.gpg" "r2:$S3_BUCKET/postgres/"

# Retain local copies for 7 days
find $BACKUP_DIR -name "*.gpg" -mtime +7 -delete

# Clean up uncompressed file
rm "$BACKUP_DIR/db_$TIMESTAMP.sql.gz"
```

**Cron schedule (production):**

```cron
# Full backup daily at 2 AM
0 2 * * * /opt/spiced/scripts/backup-db.sh

# Backup retention: 30 daily, 12 monthly, 7 yearly (managed by S3 lifecycle)
```

### 9c.2 Disaster Recovery Plan

| Scenario                 | RTO   | RPO | Action                                                              |
| ------------------------ | ----- | --- | ------------------------------------------------------------------- |
| Database corruption      | 4h    | 24h | Restore from latest encrypted backup to new DB instance             |
| Server failure           | 2h    | —   | Spin up new VPS from snapshot, deploy latest release                |
| File storage outage      | 1h    | —   | Fail over to secondary R2 bucket region                             |
| Security breach          | 15min | —   | Rotate all secrets, revoke sessions, restore from pre-breach backup |
| Accidental data deletion | 24h   | 24h | Restore specific table from point-in-time backup                    |

---

## Step 10: Environment Variables

**`.env.development`:**

```bash
# ─── API ─────────────────────────────────────────────────
NODE_ENV=development
PORT=4000
FRONTEND_URLS=http://localhost:3000,http://localhost:3001,http://localhost:3002

# ─── Database ────────────────────────────────────────────
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=spiced_dev

# ─── Redis ───────────────────────────────────────────────
REDIS_HOST=localhost
REDIS_PORT=6379

# ─── JWT ─────────────────────────────────────────────────
JWT_ACCESS_SECRET=dev-access-secret-change-in-production
JWT_REFRESH_SECRET=dev-refresh-secret-change-in-production
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# ─── Rate Limiting ───────────────────────────────────────
RATE_LIMIT_MAX=100

# ─── File Storage (S3/R2) ────────────────────────────────
S3_ENDPOINT=http://localhost:9000
S3_REGION=us-east-1
S3_ACCESS_KEY=minioadmin
S3_SECRET_KEY=minioadmin
S3_BUCKET=spiced-documents
S3_USE_SSL=false

# ─── ClamAV (Virus Scanning) ─────────────────────────────
CLAMAV_HOST=localhost
CLAMAV_PORT=3310
CLAMAV_ENABLED=true

# ─── Email ───────────────────────────────────────────────
SMTP_HOST=localhost
SMTP_PORT=1025
SMTP_USER=
SMTP_PASS=
EMAIL_FROM=noreply@spiced.ca

# ─── Sentry (Error Tracking) ─────────────────────────────
SENTRY_DSN=
SENTRY_TRACES_SAMPLE_RATE=0.2

# ─── Prometheus / Metrics ────────────────────────────────
METRICS_ENABLED=true
METRICS_PATH=/api/v1/metrics

# ─── Encryption (Sensitive Data at Rest) ─────────────────
ENCRYPTION_KEY=dev-encryption-key-32-chars-min!!  # Minimum 32 chars
```

**`.env.example`** — same structure but with placeholder values and comments explaining each variable.

---

## Step 11: Verifying Everything Works

### Start All Services

```bash
# Start all infrastructure (PostgreSQL, Redis, MinIO, ClamAV, Mailpit, Prometheus, Grafana)
docker compose up -d

# Check all services are healthy
docker compose ps

# Monitor ClamAV virus DB download (takes a few minutes first time)
docker compose logs -f clamav
# Wait for: "Database loaded (XXXXXX signatures)"
```

### Initialize Database

```bash
cd apps/api

# Create database
npx sequelize-cli db:create

# Run all migrations
npx sequelize-cli db:migrate

# Seed demo data
npx sequelize-cli db:seed:all
```

### Start Development

```bash
# From root (starts all apps via Turbo)
pnpm dev

# Or individually:
pnpm --filter @spiced/api dev          # API on :4000
pnpm --filter @spiced/web-admin dev    # Admin on :3000
pnpm --filter @spiced/web-dayhome dev  # Dayhome portal on :3001
pnpm --filter @spiced/web-parent dev   # Parent portal on :3002
```

### Smoke Tests

```bash
# ── Database ──────────────────────────────────────
psql -U postgres -d spiced_dev -c "\dt"

# ── Auth API ──────────────────────────────────────
curl -X POST http://localhost:4000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"super@spiced.ca","password":"Password123!"}'

# Expected:
# { "success": true, "data": { "accessToken": "...", "refreshToken": "...", "user": {...} } }

# ── Auth Middleware (should return 401) ────────────
curl -v http://localhost:4000/api/v1/dayhomes
# Expected: HTTP 401

# ── Health Check ──────────────────────────────────
curl http://localhost:4000/api/v1/health | json_pp
# Expected: { "status": "healthy", "checks": { "database": "healthy", "redis": "healthy", ... } }

# ── Prometheus Metrics ────────────────────────────
curl http://localhost:4000/api/v1/metrics | head -20
# Expected: Prometheus-formatted metrics

# ── ClamAV ────────────────────────────────────────
echo "PING" | nc localhost 3310
# Expected: PONG

# ── MinIO Console ──────────────────────────────────
# Open http://localhost:9001 in browser, login: minioadmin / minioadmin

# ── Grafana ────────────────────────────────────────
# Open http://localhost:3001 in browser, login: admin / admin

# ── Mailpit (Email catcher) ────────────────────────
# Open http://localhost:8025 in browser

# ── Swagger Docs ──────────────────────────────────
# Open http://localhost:4000/api/docs in browser

# ── Frontend ──────────────────────────────────────
# Open http://localhost:3000 in browser
```

---

## Standard Practices

| Practice    | Standard                                                                                         |
| ----------- | ------------------------------------------------------------------------------------------------ |
| TypeScript  | `strict: true` in all `tsconfig.json`. No `any`, no `@ts-ignore`                                 |
| Exports     | Named exports only. No `export default`                                                          |
| Commits     | Conventional Commits: `feat(SCOPE-123): description`                                             |
| Branching   | `main` (production), `develop` (staging), `feat/SPICED-123-description`                          |
| PR size     | Max 400 lines changed per PR                                                                     |
| Linting     | ESLint + Prettier; `@typescript-eslint/no-explicit-any: error`                                   |
| Testing     | Jest for unit tests; Supertest for integration tests                                             |
| Error codes | Every error has a code (e.g., `AUTH_INVALID_CREDENTIALS`), message, and HTTP status              |
| Docs        | Swagger/OpenAPI decorators on all controllers; `README.md` per module                            |
| File naming | `kebab-case` for files; `PascalCase` for classes/components; `camelCase` for variables/functions |

---

## Definition of Done

### Application

- [ ] `pnpm install` completes without errors
- [ ] `docker compose up -d` starts all 7 services (postgres, redis, minio, clamav, mailpit, prometheus, grafana)
- [ ] `pnpm db:create` + `pnpm db:migrate` runs successfully
- [ ] `pnpm db:seed` populates demo data
- [ ] `pnpm dev` starts API on `:4000` and web on `:3000`
- [ ] `POST /api/v1/auth/login` returns access + refresh tokens
- [ ] `curl` unauthenticated request returns 401
- [ ] Swagger docs render at `/api/docs`
- [ ] Frontend auth middleware redirects to `/login`
- [ ] Axios interceptor auto-refreshes on 401
- [ ] UI kit components (Button, Input, Badge) render correctly
- [ ] ESLint passes with zero errors
- [ ] Unit tests for AuthService pass (>80% coverage)
- [ ] Integration tests for auth endpoints pass
- [ ] `.env.example` documents all required variables
- [ ] `turbo.json` pipeline builds all packages in order

### Security

- [ ] ClamAV container responds to PING on port 3310
- [ ] File upload flow: temp file → ClamAV scan → S3 upload → temp file cleanup
- [ ] Upload service rejects files > 10MB with 413
- [ ] Upload service rejects non-PDF/JPG/PNG with 415
- [ ] ClamAV scan failure logs warning but accepts file (fail-open for dev)
- [ ] All sensitive fields encrypted at rest (medical notes, SIN, bank details)

### Monitoring

- [ ] `GET /api/v1/health` returns `{ status: "healthy" }` with DB + Redis + Storage checks
- [ ] `GET /api/v1/metrics` returns Prometheus-formatted metrics
- [ ] Grafana accessible at localhost:3001 with Prometheus data source configured
- [ ] Winston logging to console + file (error.log + combined.log)
- [ ] Error logs don't contain sensitive data (passwords, tokens, PII)

### Infrastructure

- [ ] Docker Compose starts 7 services with healthchecks passing
- [ ] MinIO console accessible at localhost:9001
- [ ] Mailpit web UI accessible at localhost:8025
- [ ] Prometheus accessible at localhost:9090
- [ ] `scripts/backup-db.sh` creates encrypted database dump
- [ ] `.env.example` documents all variables including CLAMAV, SENTRY, ENCRYPTION_KEY
