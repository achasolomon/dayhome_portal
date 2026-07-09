# Sprint 10 â€” Mobile Apps & Polish

**Duration:** Week 21â€“24 (4 weeks)  
**Goal:** React Native (Expo) apps for educators and parents; internationalization (EN/FR); WCAG 2.1 AA accessibility; performance optimization; final QA.

## IN SCOPE

| ID     | Deliverable                                                                  | Backend | Frontend | Tests      |
| ------ | ---------------------------------------------------------------------------- | ------- | -------- | ---------- |
| S10-01 | Educator mobile app (Expo): check-in/out, daily board, activities, incidents | ✅      | ✅       | ✅ BE + FE |
| S10-02 | Parent mobile app (Expo): notifications, child feed, messaging, invoices     | ✅      | ✅       | ✅ BE + FE |
| S10-03 | Offline check-in/out (WatermelonDB)                                          | ✅      | ✅       | ✅ BE + FE |
| S10-04 | i18n: French locale complete (all strings translated)                        | —       | ✅       | ✅ FE      |
| S10-05 | WCAG 2.1 AA accessibility audit + remediation                                | —       | ✅       | ✅ FE      |
| S10-06 | Performance optimization (LCP, FID, API P95)                                 | ✅      | ✅       | ✅ BE + FE |
| S10-07 | Push notification registration (FCM/APNs)                                    | ✅      | ✅       | ✅ BE + FE |

## NOT IN SCOPE

- ❌ Curriculum planning, developmental portfolios, meal plans (deferred to P3)
- ❌ No new backend feature modules — only mobile-optimized endpoints + sync
- ❌ No Android/iOS-specific native modules (Expo managed workflow only)
- ❌ No real SMS gateway (Twilio) â€” mock remains; real integration if time permits
- ❌ No Apple Watch / Android Wear companion apps

## STANDARD PRACTICES (Mandatory)

- **Mobile endpoints**: Lighter response payloads; batch endpoints for offline sync
- **Sync**: `POST /sync` accepts batch of offline records; validates each; returns conflicts
- **Image optimization**: Server-side resize (thumbnail 150px, mobile 600px); WebP format
- **Rate limiting**: Mobile endpoints 300 req/min vs web 100 req/min
- **API versioning**: `/api/v1/` prefix maintained; breaking changes â†’ `/api/v2/`
- **Offline-first**: WatermelonDB cache; sync queue when online; last-write-wins conflict resolution
- **Biometric auth**: `expo-local-authentication` for PIN/FaceID/TouchID login
- **i18n**: `react-i18next` with locale detection; French locale complete; `Intl.*` formatting
- **Accessibility**: Keyboard nav, focus indicators, 4.5:1 contrast, alt text, semantic HTML, aria landmarks, screen reader tested
- **Performance**: LCP < 2.5s, FID < 100ms, API P95 < 300ms, mobile cold start < 2s
- **`C-S-R pattern`**: Controller â†’ Service â†’ Repository (backend)
- **DTOs**: `class-validator` on backend; Zod on frontend
- **i18n**: Every user-visible string uses `useTranslation()` + `t('key')`
- **Migrations**: Every schema change has a migration

### Testing Requirements

- **Framework**: Jest (backend), Jest + React Testing Library (frontend)
- **API tests**: Supertest for all endpoint integration tests
- **Coverage target**: ≥80% line coverage per module
- **Test patterns**: Unit tests for services/repositories; integration tests for controllers/endpoints
- **Per-item expectations**: Each deliverable must have happy-path, validation-error, auth/permission-denial, and edge-case tests
- **CI enforcement**: `pnpm test:cov` must pass before merge; lint + typecheck gates

## User Stories

| ID     | Story                                                                                                                                                   | Acceptance Criteria                                                                                                                 |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| S10-01 | **As an EDUCATOR**, I want a mobile app to check children in/out, view daily board, and log activities so that I can work from anywhere in the dayhome. | Expo app: check-in/out with PIN scanning; daily board per room; activity logging with photo; incident reporting.                    |
| S10-02 | **As a parent**, I want a mobile app to receive notifications, view my child's updates, and manage invoices so that I stay connected on the go.         | Expo app: push notifications; child activity feed; messaging; invoice view/pay; attendance history.                                 |
| S10-03 | **As a French-speaking user**, I want the interface in French so that I can use the system in my preferred language.                                    | All user-visible strings through `react-i18next`; French locale file complete; locale auto-detected from device/browser settings.   |
| S10-04 | **As a user with disabilities**, I want the system to be WCAG 2.1 AA compliant so that I can access all features.                                       | ax DevTools passes; keyboard navigable; screen reader tested (VoiceOver/NVDA); color contrast AA minimum; focus indicators visible. |
| S10-05 | **As an ORG_ADMIN**, I want the mobile app to work offline for check-in/out so that connectivity issues don't block operations.                         | WatermelonDB offline cache; check-ins queued locally; sync when online; conflict resolution (last-write-wins with timestamp).       |
| S10-06 | **As a user**, I want the system to load fast and feel responsive so that I can work efficiently.                                                       | LCP < 2.5s; FID < 100ms; API P95 < 300ms; mobile app cold start < 2s.                                                               |

---

## Backend Expectations

- **Mobile-specific endpoints**: Lighter response payloads (omit unnecessary fields); batch endpoints for offline sync.
- **Sync endpoint**: `POST /sync` accepts batch of offline-created records (check-ins, activities); validates each; returns conflicts for resolution.
- **Push notification registration**: `POST /notifications/register-device` with platform (ios/android/web), token, deviceId.
- **Image optimization**: Server-side image resizing for mobile (thumbnail 150px, mobile 600px); WebP format where supported.
- **Rate limiting**: Mobile endpoints have higher limits (300 req/min) vs web (100 req/min).
- **API versioning**: `/api/v1/` prefix maintained; backward-compatible changes only; breaking changes â†’ `/api/v2/`.

### Mobile API Additions

```
// Additional endpoints for mobile
POST /api/v1/sync           // Batch sync offline records
POST /api/v1/devices/register  // Push notification token
GET  /api/v1/me/summary     // Lightweight dashboard for app home
GET  /api/v1/me/activities?since=<timestamp>  // New activities since last sync
```

---

## Frontend (Mobile) Expectations

- **Framework**: React Native via Expo SDK 51; Expo Router for file-based navigation.
- **Shared packages**: Reuse `packages/shared-types`, `packages/shared-utils`, `packages/shared-constants` from web.
- **UI**: React Native Paper or custom components matching web design system (limited to mobile patterns).
- **Navigation**: Tab navigator (Home, Activities, Messages, Profile) + Stack screens.
- **Offline first**: WatermelonDB or MMKV for local cache; sync queue in background when connectivity returns.
- **Biometric auth**: `expo-local-authentication` for quick PIN/FaceID/TouchID login.
- **Push notifications**: Expo Notifications + FCM (Android) + APNs (iOS).
- **Shared Zustand stores**: Auth state, notification preferences shared between web and mobile via monorepo packages.

### Mobile App Structure

```
apps/mobile-educator/
|-- app/                    # Expo Router pages
|   |-- (tabs)/
||   |--  index.tsx       # Daily board
||   |--  activities.tsx  # Activity logging
||   |--  messages.tsx    # Inbox
||   |__  profile.tsx     # Settings, clock in/out
|   |-- check-in.tsx
|   |-- check-out.tsx
|   |__ incident.tsx
|-- components/
|   |-- DailyBoard.tsx
|   |-- CheckInModal.tsx
|   |-- ActivityForm.tsx
|   |__ ...
|-- hooks/
|   |-- useSync.ts
|   |__ useNotifications.ts
|-- stores/
|   |__ offline-store.ts    # WatermelonDB sync state
|__ app.json
```

---

## i18n (Internationalization)

- **Library**: `react-i18next` with `i18next-browser-languagedetector`.
- **Locale files**: `public/locales/en/common.json`, `public/locales/fr/common.json`.
- **Translation keys**: All user-visible strings use `t('key')` pattern; no hardcoded English.
- **Locale detection**: Browser/device language â†’ 3-letter locale â†’ fallback to EN.
- **French (Canadian)**: Required for Canadian market; include all compliance, billing, and child-care specific terms.
- **Number/date formatting**: `Intl.DateTimeFormat` and `Intl.NumberFormat` with locale.
- **RTL support**: Not required (EN/FR are LTR); layout system should not break if RTL needed later.

### Translation File Structure

```
public/locales/
|-- en/
|   |-- common.json       # Shared strings
|   |-- auth.json         # Login, register, reset
|   |-- dayhome.json      # Dayhome management
|   |-- child.json        # Child profiles
|   |-- billing.json      # Invoices, payments
|   |-- compliance.json   # Documents, expiry
|   |__ errors.json       # Error messages by code
|-- fr/
|   |-- common.json
|   |-- auth.json
|   |__ ...
```

---

## Accessibility (WCAG 2.1 AA)

| Requirement         | Implementation                                                                    |
| ------------------- | --------------------------------------------------------------------------------- |
| Keyboard navigation | All interactive elements focusable, activatable via Enter/Space                   |
| Focus indicators    | Visible `:focus-visible` styles; never `outline: none` without alternative        |
| Color contrast      | 4.5:1 for normal text, 3:1 for large text; automated checks in CI                 |
| Alt text            | All images have `alt`; decorative images use `alt=""`                             |
| Form labels         | Visible labels associated via `htmlFor`/`aria-labelledby`; not placeholders alone |
| Error messages      | Linked to field via `aria-describedby`; list of errors at top of form             |
| Semantic HTML       | `<nav>`, `<main>`, `<section>`, `<button>`, not `<div>` soup                      |
| Screen reader       | Tested with VoiceOver (macOS/iOS) and NVDA (Windows)                              |
| ARIA landmarks      | Regions labelled: navigation, main, complementary, contentinfo                    |
| Skip links          | "Skip to content" link as first focusable element                                 |

---

## Performance Optimization

| Metric             | Target                        | Verification               |
| ------------------ | ----------------------------- | -------------------------- |
| LCP (web)          | < 2.5s                        | Lighthouse CI              |
| FID (web)          | < 100ms                       | Lighthouse CI              |
| API P95            | < 300ms list / < 150ms single | K6 or autocannon load test |
| DB query time      | < 100ms with indexes          | Sequelize query logging    |
| Mobile cold start  | < 2s                          | Expo profiling             |
| API response size  | < 50KB for list endpoints     | Response size middleware   |
| File upload (10MB) | < 5s                          | Manual timing              |

### Performance Actions

- **Bundle analysis**: Use `@next/bundle-analyzer` for web; `expo-analyze` for mobile; eliminate large dependencies.
- **Code splitting**: `React.lazy()` + `Suspense` for route-level chunks; dynamic imports for heavy chart libraries.
- **Image optimization**: Next.js `<Image>` component with remote patterns; WebP format; responsive sizes.
- **API compression**: gzip/brotli enabled on VPS reverse proxy (nginx/Caddy).
- **Database indexes**: Composite indexes on all foreign keys + date range fields; analyze slow queries with `EXPLAIN ANALYZE`.
- **Redis caching**: Cache frequently accessed data; cache invalidation on relevant mutations.
- **CDN**: Cloudflare or similar for static assets (JS bundles, images, uploaded files).

---

## Final QA Checklist

- [ ] All 3 web portals (admin, dayhome, parent) render and function
- [ ] Both mobile apps (educator, parent) build and run via Expo
- [ ] Authentication flow works: login, register, forgot/reset password, refresh
- [ ] RBAC enforced: each role sees correct data and routes; data isolation verified
- [ ] Check-in/out works with authorized pickup PIN verification
- [ ] Invoice generation from attendance data
- [ ] Document upload, expiry tracking, alert delivery
- [ ] i18n: all pages render in French when locale set to `fr`
- [ ] Accessibility: axe DevTools scan passes (0 critical/serious violations)
- [ ] API performance: P95 < 300ms under expected load (500 concurrent users)
- [ ] Offline check-in queues and syncs when connectivity returns
- [ ] Error states handled: network failure, empty states, server errors
- [ ] Audit logs recorded for all create/update/delete actions
- [ ] Rate limiting functional and returns 429 with Retry-After header
- [ ] Environment variables documented in `.env.example`; no secrets in code
- [ ] Sequelize migrations all applied; seed scripts create test data

---

## Definition of Done

- [ ] Educator mobile app: check-in/out, daily board, activity logging
- [ ] Parent mobile app: notifications, child feed, messaging, invoices
- [ ] Offline check-in/out with WatermelonDB queue
- [ ] French locale: all strings translated; locale detection working
- [ ] WCAG 2.1 AA: automated + manual screen reader test passed
- [ ] Performance: LCP < 2.5s, FID < 100ms, API P95 < 300ms (verified)
- [ ] All iOS and Android push notifications working (via Expo)
- [ ] Biometric login (FaceID/TouchID/PIN) on mobile
- [ ] Cross-platform: shared types, utils, constants, auth stores
- [ ] Final end-to-end tests: critical user journeys pass
