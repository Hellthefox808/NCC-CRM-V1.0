# Architecture Baseline Report (Phase 00)

**Document Overview**: High-Level System Architecture, Domain Boundaries, Data Flows, and Subsystem Integration.

---

## 1. High-Level Architecture Topology

```text
                                  ┌─────────────────────────┐
                                  │   Browser Client UI     │
                                  │ (React + TanStack Start)│
                                  └────────────┬────────────┘
                                               │
                                      HTTP / WebSocket
                                               │
                                               ▼
                                  ┌─────────────────────────┐
                                  │  TanStack Start Gateway │
                                  │ (Server Route Handlers) │
                                  └────────────┬────────────┘
                                               │
             ┌─────────────────────────────────┼─────────────────────────────────┐
             │                                 │                                 │
             ▼                                 ▼                                 ▼
┌─────────────────────────┐       ┌─────────────────────────┐       ┌─────────────────────────┐
│ Auth & Access Control   │       │ Event & Queue Engine    │       │ Real-time Socket.IO     │
│ (Scrypt / Tokens / RLS) │       │ (Mail Queue / Prompter) │       │ (Rooms & Presence)      │
└────────────┬────────────┘       └────────────┬────────────┘       └────────────┬────────────┘
             │                                 │                                 │
             └─────────────────────────────────┼─────────────────────────────────┘
                                               │
                                               ▼
                                  ┌─────────────────────────┐
                                  │ Supabase PostgreSQL DB  │
                                  │ (Service-Role Admin API)│
                                  └─────────────────────────┘
```

---

## 2. Event-Driven Lifecycle Domain Pipeline

```text
APPLICANT SUBMISSION
       │
       ▼
[PENDING_ANO_REVIEW] ─────► Email Queue: sendApplicationAcknowledgement
       │
       ▼
ANO APPROVAL (Officer Session Verified)
       │
       ├─► Account Created (Status: ACTIVATION_PENDING)
       ├─► Single-Use Token Generated (Stored as SHA-256 Hash)
       ├─► Email Queue: sendApplicationApproved (Activation Link)
       └─► Audit Log: APPROVE_CADET_APPLICATION
       │
       ▼
CADET ACTIVATION & SET PASSWORD
       │
       ├─► Token Verified & Invalidated (used_at = now())
       ├─► Salted Scrypt Hash Stored
       ├─► Account Activated (Status: ACTIVE)
       ├─► Onboarding Progress Initialized
       └─► Email Queue: sendOnboardingWelcome
       │
       ▼
ACTIVE CADET ONBOARDING & TRAINING
       │
       ├─► Prompter Reminder Engine (+1d, +2d follow-ups)
       ├─► Real-time Socket.IO Broadcasts (Events, Notices, Attendance)
       └─► Calendar Training Schedules
```

---

## 3. Subsystem Breakdown

### 1. Controlled Cadet Lifecycle

- Manages application submission, ANO approval, single-use activation tokens, password creation, and onboarding progress tracking.

### 2. Nodemailer Email Dispatcher

- Connection-pooled singleton mail transporter with template generators for acknowledgements, approval invitations, welcome notices, event updates, and reminders.

### 3. Prompter Reminder Engine

- Schedule poller evaluating trigger rules (24h, 2h, 30m, event start) and dispatching multi-channel reminders (Email, Socket.IO, DB Notifications).

### 4. Socket.IO Real-time Engine

- Bi-directional event layer broadcasting presence counts, calendar updates, notice alerts, and individual cadet status changes across isolated rooms.
