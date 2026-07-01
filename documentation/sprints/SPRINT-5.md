# Sprint 5 â€” Scheduling & Attendance

**Duration:** Week 11â€“12  
**Goal:** Child check-in/out, daily attendance board, real-time ratio monitoring, parent notifications, schedule management.

---

## User Stories

| ID    | Story                                                                                                                          | Acceptance Criteria                                                                                                                                          |
| ----- | ------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| S5-01 | **As an EDUCATOR**, I want to check in a child each morning so that attendance is recorded accurately.                         | `POST /attendance/check-in` with childId + verification method (PIN, photo lookup, name search); records timestamp; marks child present.                     |
| S5-02 | **As an EDUCATOR**, I want to check out a child when they leave so that the attendance record is complete.                     | `POST /attendance/check-out` with childId + authorized pickup verification (PIN or photo confirmation); records departure timestamp; calculates total hours. |
| S5-03 | **As an EDUCATOR**, I want to see the daily board so that I know which children are present and current educator:child ratios. | Real-time board: children present/absent/total per room; current ratio displayed with color coding; recent check-in/out activity feed.                       |
| S5-04 | **As a DAYHOME_OWNER**, I want to view attendance history by child, room, or date range so that I can generate reports.        | Filterable attendance report; export CSV/PDF; shows check-in time, check-out time, total hours, late/early flags.                                            |
| S5-05 | **As a parent**, I want real-time notification when my child is checked in/out so that I feel connected and informed.          | Push notification + in-app alert within 30 seconds of check-in/out; includes timestamp and photo if available.                                               |
| S5-06 | **As an ORG_ADMIN**, I want to monitor attendance ratios across all dayhomes so that I can ensure regulatory compliance.       | Dashboard with ratio status per room/dayhome; color-coded (compliant, warning, breached); historical ratio data.                                             |

---

## Backend Expectations

- **Attendance module**: Daily attendance records; one record per child per day; check-in and check-out timestamps.
- **Verification**: Authorized pickup verified by PIN match (hashed) or photo confirmation; verification logged in audit.
- **Ratio calculation engine**: Configurable per province (e.g., Alberta: infants 1:3, toddlers 1:5, preschoolers 1:8); calculated in real-time from `presentChildren / presentEducators`.
- **Real-time updates**: Socket.io gateway emits `attendance.updated` event on check-in/out â†’ daily board updates instantly.
- **Notification queue**: Check-in/out events pushed to BullMQ `notifications` queue â†’ dispatches to push/email/SMS channels.
- **Daily summary**: BullMQ job `attendance-summary` runs at 17:00 daily; generates summary per child â†’ sends to parents.
- **Schedule availability**: Families can submit weekly schedule preferences (e.g., Mon/Wed/Fri); educator approves or adjusts.

### Attendance Module Structure

```
modules/attendance/
|-- attendance.module.ts
|-- attendance.controller.ts
|-- attendance.service.ts
|-- attendance.repository.ts
|-- attendance.gateway.ts  # Socket.io for real-time board
|-- dto/
|   |-- check-in.dto.ts
|   |-- check-out.dto.ts
|   |-- attendance-query.dto.ts
|   |__ schedule-preference.dto.ts
|-- entities/
|   |-- attendance-record.entity.ts
|   |-- daily-board.entity.ts
|   |__ schedule.entity.ts
|__ attendance.spec.ts
```

---

## Frontend Expectations

- **Pages**:
  - `/daily-board` â€” Real-time attendance board (educator view); per-room tabs
  - `/attendance/history` â€” Filterable attendance records (owner/admin)
  - `/scheduling` â€” Schedule preference submission (parent) and approval (educator)
  - `/ratios` â€” Ratio monitoring dashboard (admin)
- **Components**:
  - `DailyBoard` â€” Real-time grid: child photo, name, check-in time, status badge; auto-updates via Socket.io
  - `CheckInModal` â€” Search/find child â†’ select â†’ confirm â†’ success animation
  - `CheckOutModal` â€” Show authorized pickup options â†’ PIN entry or photo select â†’ confirm
  - `RatioIndicator` â€” Color-coded bar: green (good), yellow (approaching limit), red (breached)
  - `AttendanceTable` â€” Sortable/filterable with date range, child name, room filters
  - `SchedulePreferenceForm` â€” Weekly day checkboxes, time slots, recurring toggle
- **State**: Daily board data via Socket.io subscription; attendance queries via TanStack Query; real-time state managed in Zustand.

---

## Standard Practices

| Area                | Practice                                                                                  |
| ------------------- | ----------------------------------------------------------------------------------------- |
| Check-in validation | Cannot check in child if already checked in; cannot check out if not checked in           |
| Pickup verification | PIN: verify hash; Photo: educator visually confirms and taps "confirm"                    |
| Ratio enforcement   | Alert if check-in would cause ratio breach; warn but allow (configurable in org settings) |
| Real-time           | Socket.io for daily board; fallback to polling every 30s if WebSocket fails               |
| Data retention      | Attendance records retained 7 years (regulatory requirement)                              |
| Caching             | Today's attendance cached in Redis (TTL: end of day); invalidated on check-in/out         |
| Audit               | Every check-in/out logged with method (PIN, photo, manual) and verifying educator ID      |

---

## Definition of Done

- [ ] Check-in/check-out functional with PIN verification
- [ ] Daily board updates in real-time via Socket.io
- [ ] Ratio calculation accurate per province rules
- [ ] Parent push notifications on check-in/out (within 30s)
- [ ] Attendance history queryable with filters and CSV export
- [ ] Ratio dashboard for org admin
- [ ] Schedule preference submission and approval flow
- [ ] Integration tests: check-in â†’ check-out â†’ total hours calculation
- [ ] Ratio breach alert and edge cases tested
- [ ] Frontend: real-time board, check-in/out modals, ratio indicators working
