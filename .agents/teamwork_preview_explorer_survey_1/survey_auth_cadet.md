# Detailed Survey Report: Authentication & Identity Pipeline and Cadet Enrollment & Verification

**Project**: 19 Jharkhand Battalion NCC Command Centre Platform (Sarala Birla University Sub-Unit)  
**Phase**: Phase 0 — Comprehensive Architecture & Security Survey  
**Investigator**: Explorer 1  
**Date**: August 21, 2026  
**Target Repository**: `c:\Users\ravir\Desktop\PROJECT\Project\NCC`

---

## Executive Summary

This report delivers an in-depth architectural and code-level survey of two foundational subsystems of the 19 Jharkhand Battalion NCC platform:

1. **Authentication & Identity Pipeline**: Salted scrypt key derivation, OTP issuance/validation/lockout, single-use activation tokens, session management, multi-tier caching, and Role-Based Access Control (RBAC).
2. **Cadet Enrollment & Verification**: Form 1 validation schema, 18-digit unique Application Number generation, Regimental Cadet ID assignment, multi-channel dispatch (Email, WhatsApp, SMS), Aadhaar checksum evaluation, and PII masking / data sanitization.

All existing automated backend test suites (60 tests across 11 suites) currently pass in ~890ms. This survey catalogues the exact implementations, maps complete evidence chains, identifies edge-case risks and discrepancies (such as the Aadhaar checksum algorithm), and provides targeted recommendations for Phase 1 test expansion and hardening.

---

## Part 1: Authentication & Identity Pipeline

### 1.1 Password Hashing & Key Derivation (scrypt)

#### Implementation Details

- **Primary Source File**: `backend/lib/auth-otp.server.ts` (Lines 20–49)
- **Algorithm**: Salted `scrypt` using Node.js native crypto (`crypto.scryptSync`).
- **Cryptographic Parameters**:
  - CPU/Memory Cost Parameter ($N$): `16384` ($2^{14}$)
  - Block Size Parameter ($r$): `8`
  - Parallelization Parameter ($p$): `1`
  - Derived Key Length: `64` bytes (128 hex characters)
  - Salt: Cryptographically random `16` bytes generated via `crypto.randomBytes(16).toString("hex")` (32 hex characters).
- **Storage Format**:
  ```text
  scrypt$N=16384,r=8,p=1$<salt_hex>$<derived_key_hex>
  ```
- **Constant-Time Verification**:
  In `verifyPasswordHash()` (Lines 26–49), comparison is executed using `crypto.timingSafeEqual(Buffer.from(derived, "hex"), Buffer.from(originalHash, "hex"))`, preventing side-channel timing attacks.
- **Legacy Migration Fallback**:
  For backward compatibility with legacy accounts, `verifyPasswordHash()` falls back to checking `sha256("ncc-portal:<identifier>:<password>")` if the stored hash does not start with `scrypt$`.

#### Password Policy Enforcement

- **Source File**: `backend/lib/validation.schemas.ts` (Lines 29–38, 122–126)
- **Schema**: `strongPasswordSchema` enforces:
  - Minimum 8 characters, maximum 128 characters.
  - At least one lowercase letter (`/[a-z]/`).
  - At least one uppercase letter (`/[A-Z]/`).
  - At least one digit (`/\d/`).
  - At least one special symbol (`/[!@#$%^&*(),.?":{}|<>]/`).
  - Prohibition of character runs with $\ge 3$ consecutive repeats (`!/(.)\1{2,}/`).
  - Blacklist rejection of common prefixes (`!/^(password|123456|qwerty)/i`).

---

### 1.2 OTP Lifecycle, Throttling & Brute-Force Lockout

#### Implementation Details

- **Primary Source File**: `backend/lib/auth-otp.server.ts` (Lines 4–180)
- **Generation**:
  `generateOtp()` uses `crypto.getRandomValues(new Uint32Array(1))[0] % 1_000_000`, producing an unbiased 6-digit numeric string formatted with `.padStart(6, "0")`.
- **Database Storage & Hashing**:
  - Stored in table: `public.auth_otp_codes`.
  - The plaintext OTP is **never** persisted to disk.
  - Hashing formula: `sha256("${code}:${identifier.trim().toLowerCase()}")`.
- **Timing & Expiration Rules**:
  - Time-To-Live (TTL): `OTP_TTL_MINUTES = 10` minutes (`expires_at = now + 10m`).
  - Resend Cooldown Throttling: `RESEND_COOLDOWN_MS = 45000` (45 seconds per identifier). If an unconsumed OTP was generated within 45s, `issueOtp()` returns `null`, prompting HTTP 429 `OTP_THROTTLED`.
- **Brute-Force Lockout Defense**:
  - `MAX_ATTEMPTS = 5`.
  - On each invalid code submission, `attempts` column is incremented in DB.
  - Once `attempts >= MAX_ATTEMPTS`, the endpoint immediately returns `{ ok: false, code: "OTP_LOCKED", error: "Too many incorrect attempts. Request a new code." }`.
  - Detailed remaining attempt count is computed and returned to the client (`left = MAX_ATTEMPTS - (attempts + 1)`).
- **Single-Use Atomic Consumption**:
  Upon successful verification in `verifyOtp()` (Lines 119–180), `consumed_at` is set to `new Date().toISOString()`. Any subsequent verification attempt queries `is("consumed_at", null)` and fails with `OTP_NOT_FOUND`.

---

### 1.3 Single-Use Cryptographic Activation & Reset Tokens

#### Implementation Details

- **Primary Source Files**:
  - `backend/lib/auth-otp.server.ts` (Lines 216–364)
  - `src/routes/api/v1/auth/activate.ts` (Lines 1–123)
  - `src/routes/api/v1/auth/set-password.ts` (Lines 1–215)
  - `src/routes/api/v1/ano/applications.$id.approve.ts` (Lines 65–76)
- **Token Generation**:
  - Entropy: 256-bit cryptographically secure raw token generated via `crypto.randomBytes(32).toString("hex")` (64 hex characters).
  - Storage: Server persists only `SHA256(rawToken)` in `account_activation_tokens` (or `auth_otp_codes`).
- **TTL**:
  - Password Reset: 30 minutes.
  - Initial Account Activation (from ANO Approval): 24 hours.
- **Consumption Flow**:
  1. `verifyActivationToken(rawToken)`: Performs a read-only pre-flight validation on the `/activate` route to display cadet name/course without invalidating the token.
  2. `consumeActivationToken(rawToken)` / atomic update: When user submits their new password in `set-password.ts`, `used_at` / `consumed_at` is timestamped.
  3. Replay protection: Re-submitting the same raw token returns `TOKEN_ALREADY_USED` or `TOKEN_NOT_FOUND`.

---

### 1.4 Session Management, Cookies & Caching

#### Implementation Details

- **Primary Source Files**:
  - `src/routes/api/v1/auth/login.ts` (Lines 169–232)
  - `src/routes/api/v1/auth/logout.ts` (Lines 1–59)
  - `src/routes/api/v1/auth/me.ts` (Lines 1–53)
  - `backend/lib/cadet-registry.server.ts` (Lines 16–56, 185–215)
  - `backend/lib/cache.server.ts` (Lines 1–124)
- **Token Construction**:
  `sess_` prefix followed by 64 hex characters generated via `crypto.getRandomValues(new Uint8Array(32))` (256-bit cryptographic strength).
- **Session Duration & Expiration**:
  - Session Lifetime: 8 hours (`Date.now() + 8 * 60 * 60 * 1000`).
  - Cookie Configuration:
    ```http
    Set-Cookie: ncc_session=sess_<token>; Path=/; HttpOnly; SameSite=Lax; Max-Age=28800; Secure
    ```
- **Multi-Tier Session Caching**:
  - In `requireOfficer` and `requireCadetSession`, session lookups are cached via `getOrSetCache("ncc:session:" + token, 300, ...)` with a 300-second (5 min) TTL.
  - L1: Bounded In-Memory LRU Cache (`L1_MAX_ITEMS = 2000`).
  - L2: Redis Distributed Cache (`redis.server.ts`).
  - Cache hit response times: Sub-millisecond on L1 hit.
- **Session Termination & Invalidation**:
  - `logout.ts` deletes the session from `public.app_sessions`.
  - Triggers `invalidateSessionCache(token)`, immediately purging the token from both L1 memory and L2 Redis.
  - Clears browser cookie by sending `Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT`.
- **Expired Session Handling**:
  - Active check in `requireOfficer` and `requireCadetSession`: If `Date.now() > new Date(session.expires_at).getTime()`, returns HTTP 401 `Session expired`.
  - Cleanup in `/api/v1/auth/me`: If expired, explicitly deletes the row from `app_sessions` and returns HTTP 401 `SESSION_EXPIRED`.

---

### 1.5 Role-Based Access Control (RBAC) & Middleware Gates

#### Implementation Details

- **Primary Source Files**:
  - `backend/lib/cadet-registry.server.ts` (Lines 33–56, 185–215)
  - `backend/lib/ncc-db.ts` (Lines 184–192)
  - `backend/integrations/supabase/auth-middleware.ts` (Lines 34–109)
- **Role Hierarchy**:
  - `SUPER_ADMIN` / `ADMIN` / `ANO`: Full administrative authority over all applications, nominal rolls, events, and audit logs.
  - `CTO` / `PI_STAFF` / `INSTRUCTOR`: Training, drill, attendance, and activity coordination.
  - `CADET`: Access restricted strictly to own profile, documents, events, and attendance records.
  - `VIEW_ONLY`: Read-only reporting access.
- **Middleware Enforcement**:
  - `requireOfficer(request)`: Extracts bearer token from `Authorization` header or `ncc_session` cookie; validates session exists, is not expired, and has `role === "admin"`.
  - `requireCadetSession(request)`: Validates session and resolves `cadet_enrollment_id`.
  - Zero frontend-only privilege boundaries; all API routes enforce gates server-side prior to executing database queries.

---

## Part 2: Cadet Enrollment & Verification

### 2.1 Form 1 Validation Schema

#### Implementation Details

- **Primary Source File**: `backend/lib/validation.schemas.ts` (Lines 161–255)
- **Schema Name**: `cadetEnrollmentSchema` (Zod object validation).
- **Field Validations & Boundaries**:
  1. **Personal Information**:
     - `fullName`: String, length [2, 100], regex `/^[a-zA-Z\s.]+$/` (letters, spaces, dots only).
     - `gender`: Enum `["SD", "SW", "Male", "Female", "Other"]` (Senior Division / Senior Wing).
     - `dob`: ISO Date `YYYY-MM-DD`, with dynamic age verification: strictly between **15 and 28 years**.
     - `mobile`: Sanitized to 10 digits; validated with regex `/^[6-9]\d{9}$/` (valid Indian mobile series).
     - `email`: Normalized lowercase; validated against RFC email spec, disallows consecutive dots `..` and HTML/script injection characters.
     - `bloodGroup`, `identificationMark`, `fatherName`, `motherName`: Optional sanitized strings.
  2. **Academic Information**:
     - `sbuRollNo`: Required, length [1, 50] (e.g. `SBU2401211` or `SBU/BTECH/2024/042`).
     - `sbuCourse`: Required course name (e.g., "B.Tech CSE", "BCA", "BBA").
     - `sbuDepartment`, `branch`, `sbuYear`, `sbuSemester`, `semester`: Structured academic mapping.
     - `marksPercentage10th`, `marksPercentage12th`: Union number/string converted to numeric percentages.
  3. **Physical & Sports Details**:
     - `heightCm`: Numeric height in centimeters (standard baseline 150–210 cm).
     - `weightKg`: Numeric weight in kilograms.
     - `run1600mTime`: Formatted timing string (e.g., `05:45`).
     - `pushupsCount`: Integer count.
     - `hasJuniorCertificate`, `juniorCertificateNo`: Junior Division/Wing certificate tracking.
     - `sportsLevel`, `sportsDetails`: Categorized athletics/games proficiency.
  4. **Bank DBT & Residence Details**:
     - Direct Benefit Transfer (DBT) fields: `bankName`, `accountNumber`, `ifscCode`.
     - Address fields: `presentAddress`, `permanentAddress`, `pinCode`.
     - Next-of-Kin / Guardian: `guardianName`, `guardianRelation`, `guardianMobile`.
     - Consent & Declarations: `declarationAccepted`, `parentConsentAccepted`.
  5. **Identity Verification**:
     - `aadhaarNumber`: 12-digit numeric transformation and regex check `/^\d{12}$/`.

---

### 2.2 18-Digit Cadet Application Number & Regimental ID Rules

#### Generation & Structure

- **Primary Source Files**:
  - `backend/lib/ncc-db.ts` (Lines 76–82)
  - `backend/services/messaging/multichannel.service.ts` (Lines 24–32)
- **18-Digit Application Number Anatomy**:
  ```text
  19  +  YYYYMMDD  +  8 Random Digits
  │          │               │
  │          │               └─ Math.floor(10000000 + Math.random() * 90000000)
  │          └───────────────── Current UTC/IST date (8 digits)
  └──────────────────────────── 19 Jharkhand Battalion unit prefix (2 digits)
  ```
  - Total Length: Exactly 18 digits (`/^19\d{16}$/`).
  - Example: `192026082176714345`.
- **Formatted Display Representation**:
  `formatApplicationNo("192026082176714345")` produces `192026-0821-76714345` (grouped as Unit+Year - Month+Day - UniqueTail).
- **Regimental Cadet ID Generation (Post-Approval)**:
  - Implemented in `src/routes/api/v1/ano/applications.$id.approve.ts` (Line 40).
  - Format: `JH/<YY>/<WING>/<6-DIGIT-RANDOM>` (e.g., `JH/26/SD/104512`, `JH/26/SW/104513`).
  - Stored in `cadet_enrollments.enrollment_no` and `cadet_users.cadet_id`.

---

### 2.3 Multi-Channel Dispatch Integration

#### Implementation Details

- **Primary Source File**: `backend/services/messaging/multichannel.service.ts` (Lines 34–102)
- Upon Form 1 submission via `POST /api/v1/enrollments`, the server automatically initiates a multi-channel broadcast:
  1. **Email Confirmation**: Branded HTML acknowledgement email via Nodemailer (`sendApplicationAcknowledgement`).
  2. **WhatsApp Notification**: Formatted WhatsApp message with unit branding, 18-digit App ID, and direct status tracking link (`https://ncc.sbu.ac.in/?track=<ID>`).
  3. **SMS Gateway Dispatch**: DLT-compliant transaction SMS (`[19 JHR BN NCC] Dear <Name>, your NCC enrollment application is submitted. 18-digit App No: <ID>. Track status: https://ncc.sbu.ac.in/?track=<ID> - Jai Hind!`).

---

### 2.4 Aadhaar Checksum Algorithms Analysis (Verhoeff vs. Weighted Mod-11)

#### Current Implementations in Codebase

1. **Schema Check (`validation.schemas.ts:233`)**:
   Checks length (12 digits) and numeric format only (`/^\d{12}$/`).
2. **Sanitizer Check (`sanitization.ts:112-134`)**:
   ```typescript
   export function sanitizeAadhaar(input: string): string {
     const cleaned = input.replace(/\D/g, "");
     if (cleaned.length !== 12) throw new Error("Aadhaar number must be exactly 12 digits");

     // Custom weighted mod-11 checksum calculation
     const digits = cleaned.split("").map(Number);
     const multipliers = [2, 3, 4, 5, 6, 7, 8, 9, 2, 3, 4];
     const sum = digits
       .slice(0, 11)
       .reduce((acc, digit, index) => acc + digit * multipliers[index], 0);
     const checksum = sum % 11;
     const expectedCheckDigit = checksum < 2 ? checksum : 11 - checksum;
     if (digits[11] !== expectedCheckDigit) throw new Error("Invalid Aadhaar number checksum");
     return cleaned;
   }
   ```

#### Critical Gap & UIDAI Alignment Finding

- **UIDAI Specification**: Real Indian Aadhaar numbers use the **Verhoeff algorithm** based on the dihedral group $D_5$ (a non-commutative group of order 10 using multiplication table $d$, permutation table $p$, and inverse table $inv$).
- **Discrepancy**: The custom weighted mod-11 algorithm in `sanitizeAadhaar` does not match the official UIDAI Verhoeff check and may reject valid Aadhaar numbers or accept invalid ones.
- **Actionable Recommendation**:
  Implement the standard Verhoeff algorithm in `sanitization.ts` and provide full test cases with known UIDAI test vectors during Phase 1.

---

### 2.5 PII Masking & Data Sanitization

#### Implementation Details

- **Primary Source Files**:
  - `backend/lib/ncc-db.ts` (Lines 164–177)
  - `backend/lib/cadet-registry.server.ts` (Lines 58–128)
  - `backend/lib/auth-otp.server.ts` (Lines 57–69)
  - `backend/lib/sanitization.ts` (Lines 1–243)
- **Public Status Tracking Sanitization (`maskPublicRecord`)**:
  - When applicants or external users query `/api/v1/enrollments/status/:query`, `maskPublicRecord()` strictly strips all sensitive fields.
  - Stripped fields: `aadhaarNumber`, `accountNumber`, `ifscCode`, `bankName`, `mobile`, `email`, `dob`, `presentAddress`, `permanentAddress`, `guardianName`, `guardianMobile`, `guardianRelation`, `heightCm`, `weightKg`, `pushupsCount`, `run1600mTime`.
  - Returned fields: Only `id`, `fullName`, `enrollmentNo`, `status`, `applicationDate`, `officerRemarks`, `selectionRank`, `sbuCourse`, `sbuDepartment`.
- **Nominal Roll PII Masking (`mapCadet`)**:
  - Unless `revealSensitive=true` (which requires verified officer role), bank account and Aadhaar numbers are masked retaining only the last 4 digits (e.g. `••••••••6541`).
- **Contact Masking (`maskDestination`)**:
  - Used in OTP issuance to confirm destination without exposing contact details (e.g. `ra••••@sbu.ac.in` or `••••••4551`).
- **PostgREST Filter Injection Prevention (`sanitizePostgrestQuery`)**:
  - Strips `%`, `,`, `.`, `(`, `)`, `\\` from user queries to prevent filter bypasses and query injection on Supabase / PostgREST endpoints.
- **XSS & HTML Sanitization (`sanitizeString`, `detectSuspiciousPatterns`)**:
  - Strips `<` and `>`, escapes `&`, `"`, `'`, removes non-printable ASCII control characters.

---

## Part 3: Architecture & Security Evaluation Matrix

| Subsystem Component           | Specification / Standard        | Current Implementation Status                                                    | Risk Level                  |
| :---------------------------- | :------------------------------ | :------------------------------------------------------------------------------- | :-------------------------- |
| **Password Hashing**          | OWASP Password Storage (scrypt) | Salted scrypt ($N=16384, r=8, p=1, 64B$, 16B salt) + `timingSafeEqual`           | 🟢 LOW / COMPLIANT          |
| **Password Policy**           | OWASP ASVS 2.1                  | Minimum 8 chars, mixed case, digit, special, repeat filter                       | 🟢 LOW / COMPLIANT          |
| **OTP Issuance & Validation** | 6-digit numeric, SHA-256 hashed | 10m TTL, 45s cooldown, 5-attempt brute-force lockout, single-use                 | 🟢 LOW / COMPLIANT          |
| **Activation Tokens**         | Single-use 256-bit token        | `crypto.randomBytes(32)`, SHA-256 stored, 30m/24h TTL, atomic consume            | 🟢 LOW / COMPLIANT          |
| **Session Security**          | 256-bit token, HttpOnly cookie  | `sess_<64hex>`, 8h expiry, SameSite=Lax, Secure, instant multi-tier invalidation | 🟢 LOW / COMPLIANT          |
| **Session Cache Tier**        | L1 LRU + L2 Redis               | 300s TTL, 2000 max items bounded LRU, Redis failover                             | 🟢 LOW / COMPLIANT          |
| **RBAC Boundaries**           | Server-side gate middleware     | `requireOfficer`, `requireCadetSession` on all restricted API routes             | 🟢 LOW / COMPLIANT          |
| **Form 1 Enrollment**         | Zod Schema Validation           | Full coverage for SD/SW, academic, DBT bank, physical metrics                    | 🟢 LOW / COMPLIANT          |
| **Cadet App Number**          | 18-digit unique ID              | `19` + `YYYYMMDD` + 8 random digits                                              | 🟢 LOW / COMPLIANT          |
| **Multi-Channel Dispatch**    | Email + WhatsApp + SMS          | Unified dispatch on Form 1 submission                                            | 🟢 LOW / COMPLIANT          |
| **Aadhaar Validation**        | Verhoeff $D_5$ algorithm        | 12-digit regex in schema; custom mod-11 in sanitizer (Verhoeff needed)           | 🟡 MEDIUM / ACTION REQUIRED |
| **PII Data Protection**       | NIST SP 800-122 / OWASP         | `maskPublicRecord`, `mapCadet` masking, `sanitizePostgrestQuery`                 | 🟢 LOW / COMPLIANT          |

---

## Part 4: Recommendations for Phase 1 Hardening & Test Expansion

1. **Implement UIDAI Verhoeff Checksum**:
   - Create a dedicated `verhoeffCheck(aadhaar: string): boolean` utility in `backend/lib/sanitization.ts`.
   - Wire Verhoeff validation into `cadetEnrollmentSchema` as a refinement.
   - Add unit tests with valid/invalid UIDAI Aadhaar test vectors.
2. **Expand Edge-Case Stress Testing**:
   - Concurrency tests for simultaneous activation token consumption (race condition verification).
   - OTP expiration boundary tests (e.g. at 9m59s vs 10m01s).
   - Rate limiter boundary tests under simulated multi-threaded bursts.
   - Invalid session token injection and malformed cookie header edge cases.
3. **Session Cache Invalidation Stress**:
   - Verify that logging out on one device instantaneously revokes cached session responses across all concurrent API routes.
