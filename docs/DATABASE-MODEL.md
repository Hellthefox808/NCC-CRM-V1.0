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
