# Sprint 6 â€” Billing & Finance

**Duration:** Week 13â€“14  
**Goal:** Invoice generation from attendance, payment tracking, subsidy management, financial reporting.

---

## User Stories

| ID    | Story                                                                                                                                 | Acceptance Criteria                                                                                                                               |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| S6-01 | **As a DAYHOME_OWNER**, I want invoices auto-generated from attendance records so that billing is accurate and saves time.            | Weekly or monthly job calculates fees based on `days_attended Ã— daily_rate`; invoices sent to parents via email/in-app.                          |
| S6-02 | **As a parent**, I want to view and pay invoices online so that I can manage my payments conveniently.                                | Invoice list with status (unpaid, paid, overdue, cancelled); mock payment integration (Stripe sandbox or manual "mark as paid"); payment history. |
| S6-03 | **As a DAYHOME_OWNER**, I want to manage government subsidies for families so that partial payments are calculated correctly.         | Subsidy CRUD: percentage (e.g., 50%) or fixed amount; auto-applied to invoice line items; subsidy balance tracking.                               |
| S6-04 | **As an ORG_ADMIN**, I want financial reports (revenue, outstanding, subsidies, aging) so that I can analyze organizational finances. | `GET /reports/financial` with date range; metrics: total revenue, outstanding AR, subsidy totals, revenue by dayhome.                             |
| S6-05 | **As a parent**, I want to see payment history for the past 12 months so that I can track childcare expenses for tax purposes.        | Transaction history table with invoice number, date, amount, status; export CSV.                                                                  |
| S6-06 | **As a DAYHOME_OWNER**, I want to apply credits/refunds to a family's account so that billing discrepancies can be resolved.          | `POST /credits` with amount, reason; applied to next invoice; refund requires payment reference.                                                  |

---

## Backend Expectations

- **Billing module**: Invoicing engine, payment records, subsidy calculations, credit/refund management.
- **Invoice generation**: BullMQ job `invoice-generation` runs weekly (configurable); iterates attendance records â†’ calculates fees â†’ creates invoice draft â†’ finalizes.
- **Pricing model**: Daily rate per child (configurable by dayhome, age group, or family); late fee support.
- **Payment tracking**: Mock payment records or Stripe `payment_intent` integration; status: unpaid, paid, partially_paid, overdue, cancelled.
- **Subsidy calculation**: `subsidyAmount = totalAmount Ã— subsidyPercentage` (or fixed deduction); applied before payment.
- **Decimal precision**: All monetary values stored as `Decimal` type in PostgreSQL; never `Float`.
- **Financial reports**: Aggregated queries via materialized views refreshed nightly; cached in Redis (TTL: 1h).
- **Aging report**: `outstandingDays = today - dueDate`; buckets: 0â€“30, 31â€“60, 61â€“90, 90+.

### Billing Module Structure

```
modules/billing/
|-- billing.module.ts
|-- invoice.controller.ts
|-- invoice.service.ts
|-- invoice.repository.ts
|-- payment.controller.ts
|-- payment.service.ts
|-- payment.repository.ts
|-- subsidy.controller.ts
|-- subsidy.service.ts
|-- subsidy.repository.ts
|-- dto/
|   |-- create-invoice.dto.ts
|   |-- invoice-query.dto.ts
|   |-- record-payment.dto.ts
|   |-- create-subsidy.dto.ts
|   |__ apply-credit.dto.ts
|-- entities/
|   |-- invoice.entity.ts
|   |-- invoice-line-item.entity.ts
|   |-- payment.entity.ts
|   |-- subsidy.entity.ts
|   |__ credit.entity.ts
|-- jobs/
|   |-- invoice-generation.job.ts
|   |__ payment-reminder.job.ts
|__ billing.spec.ts
```

---

## Frontend Expectations

- **Pages** (Admin/owner):
  - `/billing/invoices` â€” All invoices with filters (status, date range, dayhome, family)
  - `/billing/invoices/generate` â€” Manually trigger invoice generation
  - `/billing/subsidies` â€” Subsidy management: list, create, edit
  - `/billing/credits` â€” Apply credit/refund to family
  - `/billing/reports` â€” Financial reports dashboard
- **Pages** (Parent):
  - `/invoices` â€” My invoices list
  - `/invoices/[id]` â€” Invoice detail with line items
  - `/payments` â€” Payment history
  - `/payment-methods` â€” Mock payment method management
- **Components**:
  - `InvoiceTable` â€” Sortable, filterable with status badges
  - `InvoiceDetail` â€” Line items: date, description, amount; subtotal, subsidy, total
  - `PaymentForm` â€” Amount, method (credit card, bank transfer, cash), reference
  - `SubsidyForm` â€” Family selector, type (percentage/fixed), value, effective dates
  - `FinancialChart` â€” Revenue line chart, AR bar chart, subsidy pie chart (Recharts)
- **State**: Invoices, payments via TanStack Query; mutations trigger invalidation + toast.

---

## Standard Practices

| Area             | Practice                                                                                                             |
| ---------------- | -------------------------------------------------------------------------------------------------------------------- |
| Decimal handling | `DataTypes.DECIMAL(10, 2)` in Sequelize model; `number` â†’ `toFixed(2)` on frontend                                 |
| Invoice status   | `DRAFT â†’ FINALIZED â†’ SENT â†’ PAID                                                                               | OVERDUE | CANCELLED` |
| Payment matching | Payments matched to invoices via `invoiceId`; partial payments supported                                             |
| Subsidy audit    | All subsidy changes logged with effective date range; retroactive changes only allowed within current billing period |
| Data retention   | Invoices/payments retained 7 years (CRA/IRS requirement)                                                             |
| Security         | Financial data visible only to ORG_ADMIN, DAYHOME_OWNER, and the parent-family; never exposed to other roles         |
| Performance      | Invoice list paginated; financial reports use materialized views for large datasets                                  |

---

## Definition of Done

- [ ] Invoice auto-generation from attendance (BullMQ job)
- [ ] Invoice list + detail view (admin and parent)
- [ ] Payment recording (mock or Stripe)
- [ ] Subsidy CRUD with auto-application to invoices
- [ ] Credit/refund management
- [ ] Financial reports: revenue, AR aging, subsidy totals
- [ ] Overdue invoice detection and status update
- [ ] Integration tests: generate invoice â†’ record payment â†’ verify balance
- [ ] Frontend: invoice flow, payment recording, subsidy management, reports
- [ ] Parent sees only their own invoices (data isolation verified)
