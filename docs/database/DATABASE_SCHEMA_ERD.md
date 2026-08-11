# Database Relational ERD & Schema Specification (Phase 02)

**Document Standard**: Relational Schema Specification & Entity Relationship Architecture  
**Database System**: Supabase PostgreSQL 15

---

## 1. Relational ERD Diagram

```text
┌─────────────────────────┐           ┌─────────────────────────┐           ┌─────────────────────────┐
│   cadet_enrollments     │           │       cadet_users       │           │account_activation_tokens│
├─────────────────────────┤           ├─────────────────────────┤           ├─────────────────────────┤
│ id (PK)                 │◄──────────│ application_id (FK)     │           │ id (PK)                 │
│ enrollment_no           │           │ id (PK)                 │◄──────────│ user_id (FK)            │
│ full_name               │           │ cadet_id (UNIQUE)       │           │ token_hash (UNIQUE)     │
│ aadhaar_number (masked) │           │ email                   │           │ expires_at              │
│ status (State Machine)  │           │ password_hash           │           │ used_at                 │
│ sbu_roll_no             │           │ account_status          │           │ created_at              │
└─────────────────────────┘           └────────────┬────────────┘           └─────────────────────────┘
                                                   │
                                                   │                        ┌─────────────────────────┐
                                                   │                        │   onboarding_progress   │
                                                   │                        ├─────────────────────────┤
                                                   └───────────────────────►│ user_id (PK, FK)        │
                                                                            │ profile_completed       │
                                                                            │ declaration_accepted    │
                                                                            │ onboarding_completed    │
                                                                            └─────────────────────────┘

┌─────────────────────────┐           ┌─────────────────────────┐           ┌─────────────────────────┐
│    calendar_events      │           │ calendar_event_reminders│           │       email_jobs        │
├─────────────────────────┤           ├─────────────────────────┤           ├─────────────────────────┤
│ id (PK)                 │◄──────────│ event_id (FK)           │           │ id (PK)                 │
│ title                   │           │ trigger_type            │           │ job_type                │
│ event_type              │           │ offset_minutes          │           │ recipient               │
│ start_time / end_time   │           │ scheduled_time          │           │ payload (JSONB)         │
│ location                │           │ channel                 │           │ status (PENDING/SENT)   │
│ status                  │           │ status                  │           │ attempts / scheduled_at │
└────────────┬────────────┘           └─────────────────────────┘           └────────────┬────────────┘
             │                                                                           │
             │                        ┌─────────────────────────┐                        │
             │                        │ calendar_event_attendees│                        ▼
             └───────────────────────►├─────────────────────────┤           ┌─────────────────────────┐
                                      │ id (PK)                 │           │   email_delivery_logs   │
                                      │ event_id (FK)           │           ├─────────────────────────┤
                                      │ cadet_id                │           │ id (PK)                 │
                                      │ status (CONFIRMED/ABS)  │           │ email_job_id (FK)       │
                                      └─────────────────────────┘           │ status (SENT/FAILED)    │
                                                                            └─────────────────────────┘
```

---

## 2. Table Classification & Indexes

### A. Identity & Core User Domain

| Table Name                  | Primary Key      | Foreign Keys / Indexes                                  | Security & RLS Policy                                                 |
| --------------------------- | ---------------- | ------------------------------------------------------- | --------------------------------------------------------------------- |
| `cadet_enrollments`         | `id` (text)      | `idx_status`, `sbu_roll_no`                             | RLS Enabled. Public reads return masked records (`maskPublicRecord`). |
| `cadet_users`               | `id` (uuid)      | `cadet_id` (UNIQUE), `application_id` (FK), `idx_email` | RLS Enabled. Restricted to self and authenticated Officers.           |
| `account_activation_tokens` | `id` (uuid)      | `user_id` (FK), `token_hash` (UNIQUE)                   | RLS Enabled. Single-use cryptographic token hashes.                   |
| `onboarding_progress`       | `user_id` (uuid) | `user_id` (FK)                                          | RLS Enabled. Access restricted to cadet self and Officer dashboard.   |

### B. Operations & Calendar Domain

| Table Name                 | Primary Key | Foreign Keys / Indexes                    | Purpose                                              |
| -------------------------- | ----------- | ----------------------------------------- | ---------------------------------------------------- |
| `calendar_events`          | `id` (uuid) | `idx_calendar_events_start`, `idx_status` | Battalion training parades, drills, and camp events. |
| `calendar_event_attendees` | `id` (uuid) | `event_id` (FK), `cadet_id`               | Cadet participation rosters per event.               |
| `calendar_event_reminders` | `id` (uuid) | `event_id` (FK), `idx_scheduled_time`     | Prompter reminder rules (24h, 2h, 30m, event start). |

### C. Communication & Queue Domain

| Table Name                | Primary Key | Foreign Keys / Indexes                 | Purpose                                           |
| ------------------------- | ----------- | -------------------------------------- | ------------------------------------------------- |
| `notifications`           | `id` (text) | `idx_priority`, `created_at`           | Unit notices and priority alerts.                 |
| `notification_deliveries` | `id` (uuid) | `notification_id` (FK), `recipient_id` | Per-cadet notification read/delivery status.      |
| `email_jobs`              | `id` (uuid) | `idx_status`, `idx_scheduled_at`       | Non-blocking database-backed email queue.         |
| `email_delivery_logs`     | `id` (uuid) | `email_job_id` (FK)                    | Audit log of SMTP delivery attempts and outcomes. |

### D. Audit & Observability Domain

| Table Name   | Primary Key | Foreign Keys / Indexes           | Purpose                                                |
| ------------ | ----------- | -------------------------------- | ------------------------------------------------------ |
| `audit_logs` | `id` (uuid) | `idx_audit_action`, `created_at` | Immutable security and administrative audit log trail. |

---

## 3. Migration Reproducibility

All SQL migrations under [`supabase/migrations/`](file:///c:/Users/ravir/Desktop/PROJECT/Project/NCC/supabase/migrations/) are strictly idempotent (`CREATE TABLE IF NOT EXISTS`, `CREATE INDEX IF NOT EXISTS`) and execute sequentially from zero to production schema without manual SQL interventions.
