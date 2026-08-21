# NCC Platform — Database Schema & Data Model

**Engine**: Supabase / PostgreSQL  
**Data Access**: `getAdmin()` privileged server client

---

## 1. Core Entity Relationship Model

```text
┌────────────────────────┐         ┌────────────────────────┐
│   cadet_enrollments    │◄───────┐│      cadet_users       │
├────────────────────────┤        │├────────────────────────┤
│ id (PK)                │        ││ id (PK)                │
│ application_no         │        ││ cadet_id               │
│ sbu_roll_no            │        └┼application_id (FK)     │
│ full_name              │         │ email                  │
│ mobile                 │         │ password_hash          │
│ status                 │         │ account_status         │
└────────────────────────┘         └───────────┬────────────┘
                                               │
                                               ▼
┌────────────────────────┐         ┌────────────────────────┐
│     app_credentials    │         │   onboarding_progress  │
├────────────────────────┤         ├────────────────────────┤
│ identifier (PK)        │         │ user_id (PK, FK)       │
│ email                  │         │ profile_completed      │
│ password_hash (scrypt) │         │ contact_verified       │
│ role (CADET/ANO)       │         │ onboarding_completed   │
└────────────────────────┘         └────────────────────────┘
```

---

## 2. Table Definitions

### `app_credentials`

Stores primary portal authentication credentials for cadets and ANO officers.

- `identifier` (TEXT, PK): Unique login ID (e.g. `NCC2401001` or email).
- `email` (TEXT): Primary contact email.
- `password_hash` (TEXT): Salted scrypt hash (`scrypt$N=16384,r=8,p=1$...`).
- `role` (TEXT): System role (`CADET`, `ANO`, `ADMIN`).
- `updated_at` (TIMESTAMPTZ): Modification timestamp.

### `auth_otp_codes`

Stores temporary verification codes and cryptographic activation tokens.

- `id` (UUID, PK): Auto-generated key.
- `identifier` (TEXT): Target user identifier (lowercase).
- `purpose` (TEXT): `PASSWORD_RESET`, `ACCOUNT_ACTIVATION`, `LOGIN_OTP`.
- `code_hash` (TEXT): `SHA256(rawToken_or_code)`.
- `destination` (TEXT): Masked contact destination.
- `attempts` (INT): Attempt counter (max 5).
- `expires_at` (TIMESTAMPTZ): Expiration cutoff.
- `consumed_at` (TIMESTAMPTZ): Atomic single-use consumption timestamp.

### `audit_logs`

Immutable audit trail of security-sensitive administrative actions.

- `id` (UUID, PK): Event ID.
- `action` (TEXT): Action type (e.g. `SET_PORTAL_PASSWORD`, `APPROVE_APPLICATION`).
- `performed_by` (TEXT): Identifier of actor.
- `target_id` (TEXT): Target resource ID.
- `details` (JSONB): Structured contextual metadata.
- `created_at` (TIMESTAMPTZ): Event creation timestamp.

### `calendar_events` & `calendar_event_reminders`

Battalion training parades, drills, and prompter dispatch rules (24h, 2h, 30m, 0m).

- `calendar_events`: `id` (UUID, PK), `title`, `event_type`, `start_time`, `end_time`, `location`, `status`.
- `calendar_event_reminders`: `id` (UUID, PK), `event_id` (FK), `trigger_type`, `offset_minutes`, `scheduled_time`, `status`.

### `email_jobs` & `email_delivery_logs`

Asynchronous transactional email dispatch queue and delivery audit records.

- `email_jobs`: `id` (UUID, PK), `job_type`, `recipient`, `payload` (JSONB), `status`, `attempts`, `scheduled_at`.
- `email_delivery_logs`: `id` (UUID, PK), `email_job_id` (FK), `status`, `response`, `created_at`.

### `storage_tokens`

Time-limited opaque upload capability vouchers enforcing MIME type and byte size ceilings.

---

## 3. Migration Sequence & History

All migrations are located in `supabase/migrations/` and execute sequentially and idempotently:

1. `20260807173331_2255f582-0bbb-4b6f-8ef0-295e59bfe3e3.sql`: Base schema initialization (`cadet_enrollments`, `cadet_users`).
2. `20260807193603_2061835e-b7a5-40fb-b886-ae7bd487e9ab.sql`: Core tables RLS and constraint enhancements.
3. `20260807194829_40b5a2c3-a158-4c3c-ae46-685b31d950eb.sql`: Credentials, sessions, and OTP schemas.
4. `20260807202408_845b6f7a-3f4f-4e78-8f1b-6a7d00fe01e2.sql`: Onboarding progress tracking table.
5. `20260809143000_audit_logs.sql`: Immutable security audit logs schema.
6. `20260809150000_operations_schema.sql`: Email jobs and delivery logging engine.
7. `20260811000000_calendar_prompter_notifications.sql`: Calendar drills, event reminders, and notification feeds.
8. `20260811100000_cadet_lifecycle_activation_onboarding.sql`: Account activation token tables and scrypt constraints.
9. `20260811120000_bucket_tokenisation_storage_security.sql`: Upload capability tokens and storage security.
10. `20260811130000_intrusion_detection_system.sql`: Intrusion detection rules, scoring, and telemetry.

---

## 4. Concurrency, Atomicity & Data Integrity Rules

1. **Atomic Token Consumption**: Verification and activation tokens are consumed via single-operation conditional queries (`UPDATE auth_otp_codes SET consumed_at = NOW() WHERE code_hash = $1 AND consumed_at IS NULL AND expires_at > NOW()`).
2. **Brute-Force Rate Limiting**: OTP codes are protected by atomic attempt counter increments (`UPDATE auth_otp_codes SET attempts = attempts + 1 WHERE id = $1`). When `attempts >= 5`, the token is invalidated.
3. **Public Data Masking**: The public `/api/v1/enrollments/status` endpoint strictly calls `maskPublicRecord()`, zeroing out Aadhaar, full bank accounts, and contact telephone numbers to prevent PII harvesting.

