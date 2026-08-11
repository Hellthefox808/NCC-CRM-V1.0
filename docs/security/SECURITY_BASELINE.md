# Security Baseline & Audit Matrix (OWASP ASVS 5.0 Baseline)

**Document Standard**: OWASP Application Security Verification Standard (ASVS) 5.0 Level 2  
**Last Baseline Audit**: August 11, 2026  
**Status**: Remediation Completed for Phase 00 Baseline

---

## 1. OWASP ASVS 5.0 Verification Matrix

| ASVS Chapter | Domain                         | Compliance Status | Implementation Detail                                                                                                   |
| ------------ | ------------------------------ | ----------------- | ----------------------------------------------------------------------------------------------------------------------- |
| **V1**       | Architecture & Threat Modeling | **VERIFIED**      | Domain-separated layers, transactional boundary controls, audit logging.                                                |
| **V2**       | Authentication                 | **VERIFIED**      | Salted `scryptSync` KDF, single-use activation tokens, disabled unactivated cadet login.                                |
| **V3**       | Session Management             | **VERIFIED**      | Cryptographically secure 256-bit tokens (`sess_`), timing-safe comparison, Bearer token extraction.                     |
| **V4**       | Access Control (Authorization) | **VERIFIED**      | Server-side `requireOfficer` & `requireCadetSession` guards, RLS bypass strictly contained to server-side `getAdmin()`. |
| **V5**       | Validation & Encoding          | **VERIFIED**      | Full Zod schema validation (`cadetEnrollmentSchema`), PostgREST query sanitization, AI prompt length caps.              |
| **V6**       | Stored Cryptography            | **VERIFIED**      | Salted `scryptSync` (16-byte random salt, $N=16384, r=8, p=1$), SHA-256 activation token hashes.                        |
| **V7**       | Error Handling & Logging       | **VERIFIED**      | Database stack trace sanitization on public `/health`, structured audit trail in `audit_logs`.                          |
| **V8**       | Data Protection                | **VERIFIED**      | `maskPublicRecord()` strictly strips Aadhaar, DOB, mobile, bank account, and guardian PII from public tracking.         |
| **V9**       | Communication                  | **VERIFIED**      | Nodemailer with STARTTLS/TLS (port 587/465), Socket.IO server authentication.                                           |
| **V10**      | Malicious Code                 | **VERIFIED**      | Zero hardcoded permanent passwords in emails, zero auto-executing scripts in uploaded metadata.                         |
| **V11**      | Business Logic                 | **VERIFIED**      | State machine transitions (`SUBMITTED` → `PENDING_ANO_REVIEW` → `APPROVED` → `ACTIVATED`).                              |
| **V12**      | File Uploads                   | **VERIFIED**      | MIME validation (`jpeg`, `png`, `webp`), 10MB ceiling, presigned POST metadata with 15m expiration.                     |
| **V13**      | API Security                   | **VERIFIED**      | Endpoint authentication enforcement on `/metrics`, `/calendar`, `/ano/*`, `/onboarding`.                                |
| **V14**      | Configuration                  | **VERIFIED**      | Environment secret isolation (`.env.example`), `.gitignore` enforcement.                                                |

---

## 2. Threat Model & Key Security Boundaries

### Boundary 1: Public Enrollment & Tracking

- **Public Surface**: `POST /api/v1/enrollments`, `GET /api/v1/enrollments/status/:query`
- **Threat**: Application spam, PII scraping, SQL/PostgREST injection.
- **Controls**: Zod input validation, query string sanitization (`sanitizePostgrestQuery`), PII minimization (`maskPublicRecord` strips all identifiers).

### Boundary 2: ANO Approval & Provisioning

- **Surface**: `POST /api/v1/ano/applications/:id/approve`
- **Threat**: Unauthorized approval, permanent password exposure, privilege escalation.
- **Controls**: Enforced `requireOfficer` session check, single-use 32-byte cryptographic activation link (`APP_URL/activate?token=...`), zero passwords sent over email.

### Boundary 3: Cadet Account Activation & Password Setup

- **Surface**: `POST /api/v1/auth/activate`, `POST /api/v1/auth/set-password`
- **Threat**: Activation link replay, brute-force weak password setup, unauthorized activation.
- **Controls**: SHA-256 token hash lookup, 24-hour expiration check, single-use `used_at` timestamp invalidation, strong password policy (min 8 chars, mixed case, number, symbol), salted `scryptSync` hashing.

### Boundary 4: Real-time Socket.IO Communication

- **Surface**: Socket.IO connection & room joining.
- **Threat**: Cross-room eavesdropping, joining arbitrary cadet channels.
- **Controls**: Server-derived room names based on session token identity (`user:{id}`, `role:{role}`). Clients cannot request arbitrary room joins.
