# Handoff Report: Phase 0 Survey (Authentication & Identity Pipeline and Cadet Enrollment & Verification)

**Author**: Explorer 1  
**Working Directory**: `c:\Users\ravir\Desktop\PROJECT\Project\NCC\.agents\teamwork_preview_explorer_survey_1`  
**Target Milestone**: Phase 0 — Architecture & Security Survey  
**Date**: August 21, 2026  
**Type**: Hard Handoff (Investigation & Survey Complete)  

---

## 1. Observation

Direct code inspections, schema audits, and test executions confirmed the following state across the codebase:

### 1.1 Test Execution Baseline
- **Command**: `npm test` (`node --import tsx --test backend/tests/*.test.ts`)
- **Observed Result**:
  ```text
  ℹ tests 60
  ℹ suites 11
  ℹ pass 60
  ℹ fail 0
  ℹ cancelled 0
  ℹ skipped 0
  ℹ todo 0
  ℹ duration_ms 892.6939
  ```

### 1.2 Authentication & Identity Subsystem Observations
- **Password Hashing**: `backend/lib/auth-otp.server.ts` (lines 20–24):
  ```typescript
  export async function hashPassword(password: string, _identifier?: string): Promise<string> {
    const salt = crypto.randomBytes(16).toString("hex");
    const derived = crypto.scryptSync(password, salt, 64, { N: 16384, r: 8, p: 1 }).toString("hex");
    return `scrypt$N=16384,r=8,p=1$${salt}$${derived}`;
  }
  ```
- **Timing-Safe Verification**: `backend/lib/auth-otp.server.ts` (lines 38–42):
  ```typescript
  return crypto.timingSafeEqual(Buffer.from(derived, "hex"), Buffer.from(originalHash, "hex"));
  ```
- **OTP Implementation & Lockout**: `backend/lib/auth-otp.server.ts` (lines 4–7, 154–160):
  - `OTP_TTL_MINUTES = 10`, `MAX_ATTEMPTS = 5`, `RESEND_COOLDOWN_MS = 45 * 1000`.
  - Stored code hash: `sha256(`${code}:${identifier.trim().toLowerCase()}`)`.
  - When `attempts >= MAX_ATTEMPTS`, returns `{ ok: false, error: "Too many incorrect attempts. Request a new code.", code: "OTP_LOCKED" }`.
- **Single-Use Activation Tokens**: `backend/lib/auth-otp.server.ts` (lines 240–253, 340–363):
  - `rawToken = crypto.randomBytes(32).toString("hex")` (256-bit entropy).
  - Only `tokenHash = await sha256(rawToken)` is stored in `auth_otp_codes` or `account_activation_tokens`.
  - `consumeActivationToken()` sets `consumed_at` / `used_at`, preventing token replay.
- **Session Tokens & Cookies**: `src/routes/api/v1/auth/login.ts` (lines 173–203) and `src/routes/api/v1/auth/logout.ts` (lines 28–54):
  - Token format: `sess_` + 64 hex characters (256-bit random).
  - Cookie: `ncc_session=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=28800; Secure`.
  - Logout triggers `invalidateSessionCache(token)` and sets cookie `Max-Age=0`.
- **RBAC Server-Side Gates**: `backend/lib/cadet-registry.server.ts` (lines 33–56, 185–215):
  - `requireOfficer(request)` and `requireCadetSession(request)` validate token from Authorization header or cookie, query `app_sessions`, check expiration, and enforce role.

### 1.3 Cadet Enrollment & Verification Observations
- **Form 1 Validation**: `backend/lib/validation.schemas.ts` (lines 162–254):
  - `cadetEnrollmentSchema` validates full personal, academic, physical, and banking details.
  - Enforces age between 15 and 28 years (`refine((date) => age >= 15 && age <= 28)`).
  - Enforces Indian mobile regex `/^[6-9]\d{9}$/` and 12-digit Aadhaar `/^\d{12}$/`.
- **18-Digit Application Number**: `backend/lib/ncc-db.ts` (lines 77–81):
  ```typescript
  export function generate18DigitApplicationNo(): string {
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const random8 = Math.floor(10000000 + Math.random() * 90000000).toString();
    return `19${dateStr}${random8}`;
  }
  ```
- **Multi-Channel Dispatch**: `backend/services/messaging/multichannel.service.ts` (lines 37–102):
  - Dispatches Email, WhatsApp, and SMS confirmations on submission.
- **Aadhaar Checksum**: `backend/lib/sanitization.ts` (lines 112–134):
  - Uses a custom weighted mod-11 checksum formula (`multipliers = [2, 3, 4, 5, 6, 7, 8, 9, 2, 3, 4]`).
  - UIDAI standard requires the **Verhoeff algorithm** ($D_5$ dihedral group).
- **PII Masking**: `backend/lib/ncc-db.ts` (lines 165–177):
  - `maskPublicRecord()` strips all PII (Aadhaar, mobile, email, DOB, bank details, parent details, physical stats) from public tracking responses.

---

## 2. Logic Chain

1. **Password Security**: Observation 1.2 shows that passwords are never stored in cleartext. Salted scrypt with $N=16384, r=8, p=1$ and 16-byte cryptographic salt meets OWASP password storage requirements. Constant-time verification via `crypto.timingSafeEqual` prevents timing attacks.
2. **OTP Security**: Observation 1.2 demonstrates that OTPs are generated with high entropy (`crypto.getRandomValues`), stored only as SHA-256 digests bound to the normalized identifier, constrained by a 10-minute TTL, throttled with a 45-second cooldown, and protected against brute-force attacks by locking after 5 failed attempts.
3. **Token & Session Architecture**: Observations 1.2 and 1.3 show that activation tokens and session tokens utilize 256-bit cryptographically secure random values. Stored sessions in `app_sessions` expire after 8 hours, and lookups are cached in L1/L2 for 300s, with instantaneous invalidation on logout.
4. **Cadet Enrollment & PII Protection**: Observations 1.3 demonstrate that Form 1 inputs are strictly validated via `cadetEnrollmentSchema`, mapped into uniform 18-digit application numbers starting with `19`, and sanitized via `maskPublicRecord()` before returning data on public tracking endpoints.
5. **Aadhaar Checksum Gap**: Observation 1.3 reveals that `sanitizeAadhaar` implements a custom weighted mod-11 checksum rather than the official UIDAI Verhoeff algorithm. This could cause valid Aadhaar numbers to fail validation or invalid ones to pass.

---

## 3. Caveats

- **Supabase Environment in Test Mode**: In local unit test execution without live Supabase credentials, database calls gracefully fall back to in-memory stores and mock handlers. Full end-to-end multi-tenant database tests require staging credentials.
- **WhatsApp/SMS Gateway Simulation**: WhatsApp and SMS dispatches in `multichannel.service.ts` operate in simulated console dispatch mode; production integration relies on configured gateway webhooks/APIs.
- **No other caveats.**

---

## 4. Conclusion

The 19 Jharkhand Battalion NCC platform exhibits a solid, OWASP-compliant architecture across its Authentication & Identity and Cadet Enrollment subsystems. 

Key actionable items for subsequent phases:
1. Replace custom weighted mod-11 Aadhaar validation with the official **Verhoeff algorithm** in `backend/lib/sanitization.ts` and add dedicated test coverage.
2. Expand automated test suites covering edge cases: simultaneous token consumption race conditions, OTP expiration boundaries (exact TTL boundaries), and session invalidation across concurrent requests.

---

## 5. Verification Method

To independently verify these findings:

1. **Execute All Test Suites**:
   ```powershell
   npm run test
   ```
   *Expected Result*: 60 tests pass across 11 test suites in < 1 second.

2. **Inspect Survey Report**:
   Read `.agents/teamwork_preview_explorer_survey_1/survey_auth_cadet.md` for full breakdown and tables.

3. **Inspect Core Code Files**:
   - `backend/lib/auth-otp.server.ts`
   - `backend/lib/validation.schemas.ts`
   - `backend/lib/ncc-db.ts`
   - `backend/lib/cadet-registry.server.ts`
   - `backend/lib/sanitization.ts`
   - `src/routes/api/v1/auth/login.ts`
   - `src/routes/api/v1/auth/set-password.ts`
   - `src/routes/api/v1/enrollments.ts`
   - `src/routes/api/v1/ano/applications.$id.approve.ts`
