# Sprint 9 â€” Reporting & Analytics

**Duration:** Week 19â€“20  
**Goal:** Operational, financial, compliance, and enrollment reports with interactive dashboards; government read-only access.

---

## IN SCOPE

| ID    | Deliverable                                                 | Backend | Frontend |
| ----- | ----------------------------------------------------------- | ------- | -------- |
| S9-01 | Attendance report (daily/monthly/range) with CSV/PDF export | âœ…     | âœ…      |
| S9-02 | Financial report (revenue, AR aging, subsidy impact)        | âœ…     | âœ…      |
| S9-03 | Compliance report (document status, expiry overview)        | âœ…     | âœ…      |
| S9-04 | Enrollment report (capacity, waitlist trends)               | âœ…     | âœ…      |
| S9-05 | Admin dashboard with KPI cards                              | âœ…     | âœ…      |
| S9-06 | Government read-only endpoints (aggregate data only)        | âœ…     | âœ…      |

## NOT IN SCOPE

- âŒ No mobile apps (Sprint 10)
- âŒ No advanced analytics / ML predictions
- âŒ No custom report builder (pre-defined report types only)
- âŒ No real-time dashboard streaming (polling-based refresh)
- âŒ No third-party BI tool integration (Tableau, PowerBI, Metabase)

## STANDARD PRACTICES (Mandatory)

- **Query performance**: Materialized views for aggregate data; refresh schedule daily at 02:00
- **Caching**: Redis: dashboard data TTL 5 min, detailed reports TTL 1 h
- **Export**: Large CSV exports streamed; PDF generated server-side with pagination
- **Government data**: Only aggregate data exposed (no child names, no parent names, no financial details)
- **Chart rendering**: Recharts with responsive containers; loading skeleton during data fetch
- **Date range**: Default to current month; max range 12 months (performance limit)
- **Permissions**: @Roles(Role.ORG_ADMIN) for internal reports; @Roles(Role.GOVERNMENT) for gov reports
- **No N+1**: All report queries use aggregation with â€” no per-child/per-dayhome loops
- **C-S-R pattern**: Controller â†’ Service â†’ Repository
- **DTOs**: class-validator on backend; Zod on frontend
- **i18n**: Every user-visible string uses useTranslation() + ('key')
- **Migrations**: Materialized views tracked in migrations

## User Stories

| ID    | Story                                                                                                                                             | Acceptance Criteria                                                                                                                              |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| S9-01 | **As an ORG_ADMIN**, I want an attendance report (daily, monthly, custom range) so that I can analyze attendance patterns.                        | `GET /reports/attendance` with filters: date range, dayhome, room, child; metrics: avg daily attendance, absent rate, peak days; export CSV/PDF. |
| S9-02 | **As an ORG_ADMIN**, I want a financial report (revenue by dayhome, outstanding invoices, subsidy impact) so that I can monitor financial health. | Aggregate revenue per period; aging of receivables (0â€“30, 31â€“60, 61â€“90, 90+ days); subsidy amount vs collected amount.                     |
| S9-03 | **As an ORG_ADMIN**, I want a compliance report (document status, expiry overview, inspection history) so that I can prepare for audits.          | All dayhomes compliance %; missing/expired documents flagged; last inspection date and result; export for government submission.                 |
| S9-04 | **As an ORG_ADMIN**, I want an enrollment report (capacity utilization, waitlist length, trend) so that I can plan growth.                        | Capacity % per dayhome/room; waitlist count and average wait time; enrollment trend chart (month-over-month).                                    |
| S9-05 | **As a GOVERNMENT user**, I want read-only access to compliance and enrollment data so that I can fulfill regulatory oversight.                   | Government role with read-only API routes; restricted to: dayhome list, compliance status, enrollment counts, document expiry overview.          |
| S9-06 | **As an ORG_ADMIN**, I want a dashboard with KPI summaries so that I can quickly assess the state of operations.                                  | Dashboard cards: total children enrolled, today's attendance %, active dayhomes, compliance rate, revenue MTD, outstanding AR.                   |

---

## Backend Expectations

- **Reporting module**: Aggregated queries using Sequelize raw queries or materialized views for performance.
- **Materialized views**: Refresh nightly via cron; keeps reporting queries fast (sub-second for most reports).
- **Caching**: Report data cached in Redis (TTL: 1 hour for dashboards, 6 hours for detailed reports).
- **CSV/PDF export**: Server-side generation using a library (e.g., `pdfkit` or `jspdf`); streamed response.
- **Government role**: Read-only API key or JWT; endpoints scoped to `GET /reports/compliance` and `GET /reports/enrollment` only.
- **Report builder pattern**: Accepts `{ groupBy, dateRange, filters, metrics }` and returns structured data; frontend renders charts.
- **No N+1**: All report queries use aggregation with `GROUP BY`; no per-child/per-dayhome loops in application code.

### Reporting Module Structure

```
modules/reporting/
|-- reporting.module.ts
|-- attendance-report.controller.ts
|-- attendance-report.service.ts
|-- financial-report.controller.ts
|-- financial-report.service.ts
|-- compliance-report.controller.ts
|-- compliance-report.service.ts
|-- enrollment-report.controller.ts
|-- enrollment-report.service.ts
|-- dashboard.controller.ts
|-- dashboard.service.ts
|-- dto/
|   |-- report-query.dto.ts
|   |-- date-range.dto.ts
|   |__ export-format.enum.ts
|-- export/
|   |-- csv-export.service.ts
|   |-- pdf-export.service.ts
|   |__ export.module.ts
|-- guards/
|   |__ government.guard.ts  # Read-only access restriction
|__ reporting.spec.ts
```

---

## Frontend Expectations

- **Pages**:
  - `/dashboard` â€” Main admin dashboard with KPI cards and charts
  - `/reports/attendance` â€” Attendance report with filters and chart
  - `/reports/financial` â€” Financial report with revenue chart, AR aging table
  - `/reports/compliance` â€” Compliance report with dayhome status grid
  - `/reports/enrollment` â€” Enrollment report with capacity bars, waitlist table
  - `/reports/government` â€” Government view (read-only, restricted data)
- **Components**:
  - `KpiCard` â€” Metric label, value, trend arrow, icon; color-coded (positive/negative)
  - `ReportFilterBar` â€” Date range picker, dayhome dropdown, room dropdown, metric selectors
  - `LineChart` â€” Attendance trend over time (Recharts)
  - `BarChart` â€” Revenue by dayhome (Recharts)
  - `ComplianceGrid` â€” Dayhome cards with compliance % and color status
  - `CapacityBar` â€” Horizontal bar showing used capacity vs total; per dayhome/room
  - `ExportButton` â€” Dropdown: CSV, PDF; triggers download
  - `DashboardGrid` â€” Draggable/responsive grid of KPI cards and charts
- **State**: Dashboard/Report data via TanStack Query; auto-refresh interval (5 min for dashboard); chart data memoized.

---

## Standard Practices

| Area              | Practice                                                                                                             |
| ----------------- | -------------------------------------------------------------------------------------------------------------------- |
| Query performance | Materialized views for aggregate data; refresh schedule: daily at 02:00                                              |
| Caching           | Redis: dashboard data TTL 5 min, detailed reports TTL 1 h                                                            |
| Export            | Large CSV exports streamed; PDF generated server-side with pagination                                                |
| Government data   | Only aggregate data exposed (no child names, no parent names, no financial details)                                  |
| Chart rendering   | Recharts with responsive containers; loading skeleton during data fetch                                              |
| Date range        | Default to current month; max range: 12 months (performance limit)                                                   |
| Permissions       | Report endpoints guarded by `@Roles(Role.ORG_ADMIN)` for internal reports; `@Roles(Role.GOVERNMENT)` for gov reports |

---

## Definition of Done

- [ ] Attendance report with date range filter and line chart
- [ ] Financial report with revenue by dayhome, AR aging
- [ ] Compliance report with dayhome status and expiry overview
- [ ] Enrollment report with capacity % and waitlist data
- [ ] Admin dashboard with KPI cards (revenue, attendance, compliance, enrollment)
- [ ] CSV and PDF export for all reports
- [ ] Government role: read-only compliance and enrollment endpoints
- [ ] Materialized views created and refreshing on schedule
- [ ] Integration tests: report query returns correct aggregated data
- [ ] Frontend: interactive charts, export, filter bar, dashboard grid working
- [ ] Report data cached in Redis
