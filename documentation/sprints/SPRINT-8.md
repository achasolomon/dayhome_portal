# Sprint 8 â€” Messaging & Notifications

**Duration:** Week 17â€“18  
**Goal:** In-app messaging, announcements, push/email/SMS notifications, activity logs, incident reports.

---

## User Stories

| ID    | Story                                                                                                                                                              | Acceptance Criteria                                                                                                                     |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------- |
| S8-01 | **As a parent**, I want to send a direct message to my child's educator so that I can communicate privately.                                                       | Thread-based messaging; `POST /messages` creates or continues thread; read receipts (seen/unseen); message history paginated.           |
| S8-02 | **As a DAYHOME_OWNER**, I want to broadcast announcements to all parents so that I share important news quickly.                                                   | `POST /announcements` with title, body, priority (info/important/urgent); delivered to all enrolled families via in-app + push + email. |
| S8-03 | **As a parent**, I want to receive push notifications for check-ins, incidents, announcements, and messages so that I never miss updates.                          | FCM for mobile; browser push for web (if permission granted); Socket.io for in-app real-time badge count.                               |
| S8-04 | **As an EDUCATOR**, I want to send daily activity updates (photos, meals, naps, diaper changes, mood) to parents so that they feel connected to their child's day. | `POST /activities` per child with type, description, timestamp, photo(s); parents receive notification.                                 |
| S8-05 | **As a parent**, I want to receive incident reports with full details so that I am informed of any issues immediately.                                             | Incident report form: type (injury, illness, behavioral, other), description, action taken, witnesses; parent digitally acknowledges.   |
| S8-06 | **As a parent**, I want to configure my notification preferences so that I control which alerts I receive.                                                         | Preferences: channels (push, email, SMS), types (check-in, activities, incidents, billing, announcements), quiet hours.                 |

---

## Backend Expectations

- **Messaging module**: Thread-based with support for 1-on-1 and group (educator + multiple parents).
- **Notification service**: Central `NotificationService` that routes to channels based on preferences; all notifications queued via BullMQ (never sent synchronously).
- **Activity logs**: `ActivityLog` model: childId, type enum (meal, nap, diaper, mood, photo, note), description, timestamp, educatorId, photo URLs.
- **Incident reports**: `IncidentReport` model: childId, type, severity (low/medium/high/critical), description, action taken, witness IDs, parentAcknowledged (boolean), acknowledgedAt.
- **Push notifications**: FCM for Android, APNs for iOS via Expo Notifications; browser push via Web Push API.
- **Email**: Transactional via Resend/SendGrid; templates for: welcome, password reset, invoice, incident, announcement.
- **SMS**: Twilio for urgent notifications (check-in confirm, incident alerts, overdue invoices).
- **Real-time**: Socket.io gateway for in-app notifications, unread badge counts, message delivery.

### Messaging & Notifications Structure

```
modules/messaging/
|-- messaging.module.ts
|-- message.controller.ts
|-- message.service.ts
|-- message.gateway.ts  # Socket.io for real-time chat
|-- announcement.controller.ts
|-- announcement.service.ts
|-- notification.controller.ts
|-- notification.service.ts  # Central channel router
|-- activity.controller.ts
|-- activity.service.ts
|-- incident.controller.ts
|-- incident.service.ts
|-- dto/
|   |-- send-message.dto.ts
|   |-- create-announcement.dto.ts
|   |-- create-activity.dto.ts
|   |-- create-incident.dto.ts
|   |__ notification-preference.dto.ts
|-- entities/
|   |-- message.entity.ts
|   |-- message-thread.entity.ts
|   |-- announcement.entity.ts
|   |-- notification.entity.ts
|   |-- activity-log.entity.ts
|   |-- incident-report.entity.ts
|   |__ notification-preference.entity.ts
|-- jobs/
|   |-- send-email.job.ts
|   |-- send-push.job.ts
|   |__ send-sms.job.ts
|__ messaging.spec.ts
```

---

## Frontend Expectations

- **Pages**:
  - `/messages` â€” Inbox with thread list (unread badge count)
  - `/messages/[threadId]` â€” Thread view with chat-style messages
  - `/announcements` â€” Announcement list; composer (admin/owner only)
  - `/activities` â€” Activity log form (educator); activity feed (parent)
  - `/incidents` â€” Incident report form (educator); incident history (parent)
  - `/settings/notifications` â€” Notification preferences toggles
- **Components**:
  - `ChatThread` â€” Message bubble UI with timestamps, read receipts, attachment support
  - `ThreadList` â€” Sorted by last message time; unread indicator dot
  - `AnnouncementComposer` â€” Rich text editor, priority selector, target audience picker
  - `ActivityForm` â€” Type selector (meal/nap/diaper/mood/photo), description textarea, image upload
  - `ActivityFeed` â€” Timeline-style per child; grouped by day
  - `IncidentForm` â€” Type radio group, severity slider, description, action taken, witness input
  - `NotificationPrefPanel` â€” Channel toggle per notification type
- **State**: Messages via TanStack Query (polling every 15s for new messages); notifications badge via Socket.io subscription; unread count in Zustand store.

---

## Standard Practices

| Area                         | Practice                                                                                      |
| ---------------------------- | --------------------------------------------------------------------------------------------- |
| Message delivery             | All messages go through BullMQ queue; retry 3 times with exponential backoff                  |
| Notification channel routing | Check user's `NotificationPreference` before sending; fallback to in-app if no preference set |
| Photo in activities          | Upload â†’ resize (3 sizes) â†’ store in R2 â†’ return URLs; max 5 photos per activity entry  |
| Incident severity            | Critical incidents trigger SMS to all emergency contacts + dayhome owner immediately          |
| Parent acknowledgment        | Incident reports require parent digital acknowledgment (signature or checkbox + timestamp)    |
| Data retention               | Messages retained 2 years; activities retained 1 year; incidents retained 7 years             |
| Privacy                      | Parents can only message educators of their enrolled dayhome; cross-dayhome messaging blocked |
| Rate limit                   | Messaging: 50 messages per user per hour; announcements: 5 per day per dayhome                |

---

## Definition of Done

- [ ] Thread-based messaging with read receipts
- [ ] Announcement broadcast to all families
- [ ] Push notifications via FCM/APNs/Web Push
- [ ] Activity log creation per child with photo support
- [ ] Incident report creation with parent acknowledgment flow
- [ ] Notification preferences: channel and type toggles
- [ ] BullMQ job queue for all outbound communications
- [ ] Socket.io real-time badge count and message delivery
- [ ] Integration tests: message â†’ notification â†’ delivered
- [ ] Frontend: chat UI, activity form, incident form, notification settings working
