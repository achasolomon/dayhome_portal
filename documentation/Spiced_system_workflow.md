# Workflow for the Unified System of Spiced Childcare

*AlgoTeam Labs — ...making digital life smart*

This workflow illustrates the Unified Ecosystem built for the **agency** to manage the complete post-approval operational life cycle of dayhomes — from active onboarding through daily operations, compliance, family engagement, billing, and reporting.

The agency already operates a separate **Application Portal** where dayhomes submit applications and go through the approval/licensing process. That portal is unchanged and out of scope here. This document covers the system that takes over the moment a dayhome is **approved and activated** — receiving that dayhome via API and managing everything from there.

The system is designed to match and exceed the capability of leading childcare platforms (e.g. Lillio/HiMama) while adding agency-level oversight across many dayhomes at once — something single-center tools don't offer.

---

## System Boundary

```
┌─────────────────────────────┐         ┌──────────────────────────────────────┐
│   APPLICATION PORTAL         │  API    │      UNIFIED SPICED DAYCARE SYSTEM     │
│   (existing, external)       │ ──────▶ │      (this platform)                   │
│                               │         │                                        │
│  - Dayhome applies            │         │  Receives approved dayhome record:     │
│  - Compliance review          │         │  - Business & owner info               │
│  - Approve / Reject           │         │  - License number & expiry             │
│  - Correction loop            │         │  - Approved capacity                   │
│                               │         │  - Insurance info                      │
│  Stays as-is. Not modified.   │         │  - Inspection baseline                 │
└─────────────────────────────┘         └──────────────────────────────────────┘
                                                          │
                                                          ▼
                                          Ongoing monitoring, compliance,
                                          operations, family & child management,
                                          billing, communication, reporting
```

Once a dayhome crosses this boundary, the Application Portal has no further role in its lifecycle — everything after activation lives in the Unified System.

---

## 1. Complete System Working Tree

**UNIFIED SPICED DAYCARE SYSTEM**

### Dayhome Onboarding (API Intake)
- Receive Approved Dayhome Record (via API from Application Portal)
- Validate & Map Incoming Data
- Create Dayhome Profile
- Assign Agency Liaison/Coordinator
- Activation Confirmation

### Dayhome Management

**Dayhome Operations**
- Room Management
- Capacity Management
- Operational Calendar
- Public Holidays
- Attendance Monitoring
- Schedules
- Meal & Menu Planning

**Educator Management**
- Employee Profiles
- Shift Scheduling
- Training Credits
- Professional Development Tracking
- PTO/Leave Management
- Active Time Tracking
- Admin Time Tracking
- Performance Monitoring

**Compliance Monitoring**
- License Tracking
- Expiry Monitoring
- Compliance Alerts
- Inspection Scheduling & History
- Compliance Status
- Corrective Action Tracking
- Suspension/Reinstatement Workflow

### Organization (Agency) Management
- Agency Staff Administration
- Roles & Permissions (granular, e.g. billing-only, coordinator-only, read-only auditor)
- Operational Settings
- Audit Logs & Monitoring
- Multi-Dayhome Rollup Dashboards
- Agency-Wide Analytics & Benchmarking

### Family Management
- Family Registration
- Parent Profiles
- Emergency Contacts
- Authorized Pickups
- Communication Preferences

### Child Management
- Child Profiles
- Medical Information
- Allergies & Special Care
- Guardian Linking
- Attendance Tracking
- Room Assignment
- Activity Logs
- Digital Health Screening (check-in symptom/temperature checks)
- Child Development Portfolios & Assessments (by developmental domain)
- Curriculum & Lesson Planning
- Child Report/Development Tracking

### Scheduling & Engagement
- Family Scheduling
- Educator Scheduling
- Room Scheduling
- Availability Management
- Attendance Engine
- Ratio Monitoring
- Daily Operation Board
- Operational Calendar

### Communication & Engagement
- Parent Messaging
- Staff Messaging
- Announcements
- Newsletters
- Child Activity Updates
- Photo & Video Sharing
- Incident Notifications with Digital E-Signature Acknowledgment
- Email Notification
- SMS/Push Notifications

### Billing & Finance
- Invoice Generation
- Parent Billing
- Subsidy Management
- Payment Tracking
- Credits & Refund
- Financial Report/Revenue Analysis
- Billing-Only Admin Role (restricted access to finance data only)

### Document Management
- Document Uploads
- Verification
- Expiry Tracking
- Renewal Alert
- Secure Storage
- Version History
- Compliance Document/Audit Document

---

## 2. High-Level Business Operation Flow

```
[EXTERNAL — Application Portal]
Dayhome Applies
      │
      ▼
Compliance Review
      │
      ▼
   Approved? ──No──▶ Correction Required ──▶ (back to Dayhome Applies)
      │
     Yes
      │
      ▼
Dayhome Approved & Activated
      │
      ▼  (API push)
┌──────────────────────────────────────┐
│ [UNIFIED SYSTEM — this platform]      │
│ Dayhome Record Received via API       │
└──────────────────────────────────────┘
      │
      ├───────────────┐
      ▼               ▼
Family Registration   Document Monitoring
      │               │
      ▼               ▼
Child Enrollment      Expiry Alerts
      │               │
      ▼               ▼
Schedule Assignment/  Renewal Workflow
Schedule Availability
      │
      ▼
Daily Attendance
      │
      ├───────────────┬───────────────────┐
      ▼               ▼                   ▼
Activity Tracking   Billing Engine     Government/Agency Reports
      │               │                   │
      ▼               ▼                   ▼
Parent Notifications Invoice Generation  Compliance Analytics
                       │
                       ▼
                Financial Analytics
```

---

## 3. User Interaction Ecosystem

**Users:**
- Agency Admin / Compliance Officer
- Dayhome Owner
- Educator
- Parent / Family
- (Government Authority — receives agency-submitted reports, not a direct system user)

All users connect to the **Unified Childcare Platform**, which links to:
- Scheduling System
- Attendance System
- Compliance System
- Billing System
- Messaging System
- Reporting Engine
- Document Management
- Application Portal (external, one-way API intake only)

---

## 4. Dayhome Onboarding Flow (API Intake)

```
[Application Portal]
Dayhome Approved
      │
      ▼  (API call)
Unified System Receives Dayhome Record
      │
      ▼
Validate Payload (license #, capacity, owner info, insurance, inspection baseline)
      │
      ▼
   Data Valid? ──No──▶ Flag for Manual Review ──▶ Agency Coordinator Resolves
      │
     Yes
      │
      ▼
Create Dayhome Profile in Unified System
      │
      ▼
Assign Agency Coordinator/Liaison
      │
      ▼
Dayhome Status: Active
      │
      ▼
Owner/Educator Invited to Set Up Accounts
      │
      ▼
Dayhome Operational (rooms, schedules, capacity configured)
```

---

## 5. Family to Dayhome Flow

```
Parent Creates Account
      │
      ▼
Family Profile Setup
      │
      ▼
Add Child Information
      │
      ▼
Search Available (Active) Dayhomes
      │
      ▼
Submit Enrollment Request
      │
      ▼
Dayhome Reviews Request
      │
      ▼
   Capacity Available? ──No──▶ Waitlist ──▶ (loops back to review)
      │
     Yes
      │
      ▼
Enrollment Approved
      │
      ▼
Schedule Created
      │
      ▼
Billing Setup
      │
      ▼
Child Starts Attendance
```

---

## 6. Daily Operations Flow

```
Digital Health Screening (temperature/symptom check)
      │
      ▼
Child Check-In
      │
      ▼
Attendance Marked
      │
      ├─────────────────────┬───────────────────────────────┐
      ▼                     ▼                                ▼
Room Assignment       Attendance Used For Billing   Attendance Used For
Confirmed                                            Compliance Reporting
      │
      ▼
Educator Activities Logged
      │
      ▼
Meals / Nap / Learning Activities (against Curriculum Plan)
      │
      ▼
Incident Tracking (with parent e-signature acknowledgment, if applicable)
      │
      ▼
Daily Summary Generated
      │
      ▼
Parent Receives Update (photos/video, activity log)
      │
      ▼
Periodic Developmental Assessment Recorded (portfolio update)
```

---

## 7. Document Compliance Flow

```
Document Uploaded
      │
      ▼
Expiry Date Registered
      │
      ▼
Monitoring Engine ◀─────────────────────────────┐
      │                                          │
      ▼                                          │
  Expiry Near? ──No──▶ (back to Monitoring Engine)│
      │                                          │
     Yes                                         │
      │                                          │
      ▼                                          │
Reminder Sent                                    │
      │                                          │
      ▼                                          │
  Renewed? ──Yes──▶ Update Record ──▶ (back to Monitoring Engine)
      │
      No
      │
      ▼
Escalation
      │
      ▼
Compliance Review
      │
      ▼
Suspend Dayhome? ──No──▶ (back to Monitoring Engine)
      │
     Yes
      │
      ▼
Temporary Restriction
      │
      ▼
Corrective Action Plan
      │
      ▼
Reinstatement Review ──▶ (back to Monitoring Engine, if resolved)
```

---

## 8. Billing & Payment Flow

```
Attendance Records
      │
      ▼
Billing Engine
      │
      ▼
Subsidy Calculation
      │
      ▼
Invoice Generation
      │
      ▼
Parent Invoice Sent
      │
      ▼
  Payment Received? ──Yes──▶ Receipt Generated ──▶ Financial Reporting
      │
      No
      │
      ▼
Reminder Notification
      │
      ▼
Outstanding Balance Tracking
```

---

## 9. Reporting & Government Flow

```
Operational Data (across all active dayhomes)
      │
      ▼
Reporting Engine
      │
      ├───────────────┬──────────────────┬──────────────────┐
      ▼               ▼                  ▼                  ▼
Attendance Reports  Financial Reports  Compliance Reports  Enrollment Reports
      │               │                  │                  │
      └───────────────┴──────────────────┴──────────────────┘
                       │
                       ▼
           Agency-Wide Rollup Dashboard
                       │
                       ▼
              Government Submission
                       │
                       ▼
                  Audit & Review
```

---

## 10. Complete System Relationship Map

**Stakeholders:**
Families · Children · Dayhomes · Educators · Agency Staff · Government · Finance · Compliance

**External Source:**
Application Portal (one-way API feed of approved dayhomes)

All connect to the **Unified Platform Core**, which drives:
Scheduling · Attendance · Messaging · Billing · Reporting · Compliance · Documents · Analytics · Curriculum & Development Tracking

---

## Feature Benchmarking Notes

To be as robust as, or more capable than, established childcare platforms (e.g. Lillio/HiMama), this system adds the following on top of the original feature set:

| Area | Addition | Why |
|---|---|---|
| Child Management | Digital health screening at check-in | Standard safety practice in modern childcare apps |
| Child Management | Developmental portfolios & assessments by domain | Moves beyond activity logs to structured progress tracking |
| Child Management | Curriculum & lesson planning | Ties daily activities to learning outcomes |
| Communication | Digital incident reports with e-signature | Legal acknowledgment trail, removes paper forms |
| Communication | Native photo/video sharing (fast upload) | Addresses a known weak point in competitor tools |
| Billing & Finance | Billing-only admin role | Restricts sensitive child data from finance staff |
| Organization Mgmt | Agency-wide rollup dashboards & benchmarking | Multi-dayhome oversight — a gap in single-center tools |
| Dayhome Management | Meal & menu planning as a distinct module | Commonly requested, currently folded into "activities" |
| Educator Management | Professional development tracking | Parallels training-hub style offerings elsewhere |

---

## Conclusion

The Unified Spiced Childcare Management Ecosystem is designed to become the central operational backbone of the agency, picking up every approved dayhome the moment it goes active and managing its full operational life cycle from there.

By consolidating dayhome operations, compliance management, financial systems, reporting, family engagement, and educator/child development tools into a single ecosystem — cleanly separated from the agency's existing Application Portal via a one-way API handoff — the platform will:

- Reduce operational complexity
- Improve compliance management across many dayhomes at once
- Enhance communication between agency, dayhomes, educators, and families
- Increase reporting accuracy
- Improve decision-making with agency-wide analytics
- Support organizational growth
- Provide a scalable long-term digital foundation that matches or exceeds established childcare platforms

---

*Contact: +234 816 3645 640 · teamx@algolabs.com, vincentkalu02@gmail.com*
*Opposite ECWA Gospel Church, Pyakasa, Lugbe, FCT, Abuja*
