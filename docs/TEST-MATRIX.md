# NCC Platform — Automated Test Suite & Quality Matrix

This document tracks all unit, integration, security, and build verification tests in the 19 Jharkhand Battalion NCC Portal codebase.

---

## 1. Test Suite Summary

- **Total Test Suites**: 12
- **Total Executed Tests**: 65
- **Passing Tests**: 65 (100%)
- **Failing / Skipped Tests**: 0
- **Execution Command**: `npm run test`

---

## 2. Test Suite Breakdown

### Suite 1: Data Mapping & Transformation Unit Tests

- `mapToCadetRecord()`: Verifies DB rows map accurately to frontend CadetRecord interface.
- `buildEnrollmentRow()`: Verifies ID generation and default status assignments.
- `mapCadet()`: Verifies PII masking rules.
- `rosterRecords()`: Verifies nominal roll data structure.

### Suite 2: Intrusion Detection System (IDS) Unit Tests

- `getAlertLevelForScore()`: Verifies numerical threat score to alert level mapping.
- `IDS_RULES`: Verifies coverage for unauthorized exports and privilege escalation attempts.
- `recordSecurityEvent()`: Verifies cumulative risk calculations and alert dispatch.

### Suite 3: Controlled Cadet Lifecycle & Activation Unit Tests

- `buildEnrollmentRow()`: Verifies default status `PENDING_ANO_REVIEW`.
- Activation tokens: Verifies cryptographic randomness and SHA-256 hashing.
- Password hashes: Verifies salted scrypt implementation.
- Onboarding progress: Verifies percentage calculation accuracy.

### Suite 4: Nodemailer Service Unit Tests

- Email renderers: Tests HTML & plain-text output for OTP, Welcome, Application Approved, Event Created, and Reminder emails.
- Dev mailer: Verifies simulated dispatch mode when SMTP credentials are unconfigured.

### Suite 5: Onboarding & Authentication Security Tests

- `Salted Scrypt Password Hashing & Verification`: Verifies scrypt hashing and timing-safe comparison.
- `Single-use Cryptographic Activation Token Workflow`: Verifies single-use consumption and token invalidation.
- `OTP Generator Security Properties`: Verifies 6-digit random numeric properties.
- `Transactional Email Template Renderers`: Verifies activation link delivery without cleartext passwords.

### Suite 6: Prompter Reminder Engine Unit Tests

- `DEFAULT_REMINDER_RULES`: Verifies 24h, 2h, 30m, and start triggers.
- `calculateScheduledTime()`: Verifies offset calculations from event start times.

### Suite 7: Redis Service & Hybrid Rate Limiter Unit Tests

- `getRedisStatus()`: Verifies fallback to in-memory mode when Redis URL is unconfigured.
- `redisSet()` / `redisGet()` / `redisIncr()`: Verifies key storage and atomic operations.
- `checkRateLimitAsync()`: Verifies rate limiter enforcement.

### Suite 8: Security & Authorization Unit Tests

- `bearer()`: Verifies token extraction from headers and HttpOnly cookies.
- `requireOfficer()` / `requireCadetSession()`: Verifies 401 unauthorized rejection.
- `maskPublicRecord()`: Verifies PII stripping for public tracking endpoints.
- `sanitizePostgrestQuery()`: Verifies SQL/filter injection prevention.
- `loginRequestSchema`: Enforces minimum 8-character password requirement.

### Suite 9: Multi-Channel Dispatch & 18-Digit Application Number Unit Tests

- `generate18DigitApplicationNo()`: Verifies generation of 18-digit numeric application numbers.
- `buildEnrollmentRow()`: Verifies assignment of 18-digit application numbers starting with 19.
- `formatApplicationNo()`: Verifies clean string formatting (`192026-0812-98471625`).
- `sendMultiChannelApplicationConfirmation()`: Verifies Email, WhatsApp, and SMS dispatches.
- `cadetEnrollmentSchema (SD & SW)`: Verifies full Form 1 payload validation with academic, physical, and bank DBT details.
- `cadetEnrollmentSchema (Rejections)`: Verifies rejection of malformed phone numbers, invalid names, and short identifiers.

### Suite 10: E2E Pipeline & Data Connection Integration Tests

- `Complete Enrollment Form 1 -> 18-Digit App ID -> DB Row Pipeline`: Tests full payload ingestion, row conversion, and public status PII stripping.
- `RFC 4180 CSV Export generation with UTF-8 BOM`: Tests character escaping and native Excel compatibility.
- `Sanitizes PostgREST query inputs preventing filter injection`: Verifies special filter character stripping.
- `Rate Limiter sliding window handles burst requests`: Verifies sliding-window boundary enforcement under burst traffic.

### Suite 11: Security Hardening & Vulnerability Remediation Unit Tests

- `CSV formula injection neutralization handles spreadsheet command payloads`: Verifies prefixes `=`, `@`, `\t`, `\r`, `+`, `-` are safely neutralized to prevent Excel formula execution (CWE-1236).
- `sanitizePostgrestQuery strips dangerous filter injection tokens`: Verifies `.eq.`, `()`, `,`, and quote characters are stripped before PostgREST query interpolation.
- `Dual-layer rate limiter enforces both IP ceiling and account brute-force threshold`: Verifies sliding window defense against distributed credential stuffing and targeted account brute-forcing.
- `Timing-safe OTP hash comparison correctly validates matching hashes`: Verifies constant-time hash equality using `crypto.timingSafeEqual` to prevent side-channel timing attacks.
- `Memory token structure caps growth and supports state cleanup`: Verifies bounded in-memory token map (`MAX_MEMORY_TOKENS = 1000`) and automatic pruning to prevent memory exhaustion DoS.

### Suite 12: Bucket Tokenisation & Storage Capability Unit Tests

- `generateStorageToken()`: Verifies 256-bit secure token generation and valid SHA-256 hashes.
- `validateMagicBytes()`: Verifies MIME type validation against file header magic bytes.
- `ALLOWED_MIME_TYPES`: Restricts dangerous file uploads to whitelisted formats.
- `createUploadIntent()`: Enforces file size ceilings and server-side opaque object keys.
- `createUploadIntent()`: Rejects invalid MIME types and oversized requests.

---

## 3. Build & Compilation Verification

- **Command**: `npm run build`
- **Engine**: Vite 8.2 + Nitro 3.0 SSR Bundle
- **Result**: Zero TypeScript errors, clean bundle generated under `.output/`.
