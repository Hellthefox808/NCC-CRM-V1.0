# NCC Command Centre Platform — Phase 0 Survey: Test Suite, Build Baseline & Quality Architecture

**Document Version**: 1.0.0  
**Author**: Explorer 3 (Teamwork Quality & Test Architecture Explorer)  
**Date**: 2026-08-21T18:35:00Z  
**Workspace**: `c:\Users\ravir\Desktop\PROJECT\Project\NCC`  
**Milestone**: Phase 0 — Comprehensive Platform Baseline Survey  

---

## 1. Executive Summary

This survey report provides a rigorous empirical analysis of the test infrastructure, build baseline, lint/type-safety baseline, and testing architecture for the 19 Jharkhand Battalion NCC Command Centre platform.

### Core Findings:
1. **Existing Test Suite Baseline**: The test harness uses Node.js native `node:test` runner with `tsx` and `node:assert/strict`. Currently, **12 test files** executing **60 tests** run across **11 suites**, achieving a **100% pass rate (60/60 passing, 0 failures, 0 skipped)** in **782.41ms** (well under the 2.0s platform threshold).
2. **Build Baseline**: `npm run build` compiles cleanly using Vite 8.2.0 and Nitro 3.0.260603-beta SSR, outputting a complete server/client bundle under `.output/` in **823ms** with zero build errors.
3. **Type-Checking Baseline**: `npx tsc --noEmit` reveals **TypeScript compilation errors** in several API routes (`src/routes/api/v1/calendar.*.ts`, `src/routes/api/v1/notifications.$id.read.ts`) and page routes (`cadet-database.tsx`, `cadet.tsx`, `login.tsx`) caused by strict Supabase schema type mismatches and missing properties on session gates (`AdminGate.officerName`).
4. **Linting Baseline**: ESLint 9.32.0 flat config completes with **0 errors and 7 warnings** (all related to React Refresh component export conventions). Root `eslint .` is slow due to scanning unignored workspace dot-directories (`.agents`, `.lovable`, `.wrangler`).
5. **Architectural Gaps**: Critical edge cases identified in requirements R1–R3 are absent from the current test coverage:
   - *Authentication*: OTP brute-force lockout thresholds, activation token race conditions / replay attacks, session expiry boundaries.
   - *Cadet Enrollment*: UIDAI Verhoeff algorithm Aadhaar checksum verification (currently only `\d{12}` regex), 18-digit Application ID high-concurrency collision resistance, Form 1 age boundary conditions (15 vs 28 years).
   - *Caching & Rate Limiting*: L1 LRU capacity ceiling enforcement (currently `L1_MAX_ITEMS = 2000` in `cache.server.ts` vs `MAX_MEMORY_ITEMS = 5000` in requirement), in-memory rate limiter `Map` unbounded growth (missing LRU eviction on `rate-limiter.server.ts`), Redis failover exception resilience, sub-millisecond cache hit microbenchmarks.
   - *Sockets & Prompter*: Socket.IO handshake auth rejection, room isolation (cadet vs officer room leakage prevention), reminder reschedule atomic invalidation, reconnect presence churn.

---

## 2. Test Suite & Build Infrastructure Baseline

### 2.1 Test Runner & Framework Configuration
The repository uses Node's native test runner with TypeScript execution via `tsx`:
- **Runner**: Node.js Native Test Runner (`node:test`)
- **Loader / Transpiler**: `tsx` (`tsx/esm` loader via `--import tsx`)
- **Assertion Framework**: `node:assert/strict`
- **Execution Script**: `"test": "node --import tsx --test backend/tests/*.test.ts"` (defined in `package.json:13`)
- **Isolation & Concurrency**: Tests run in parallel sub-processes managed by `node:test`, with native async-await and promise tracking.

### 2.2 Package Scripts Inventory
| Script | Command | Purpose | Observed Performance | Baseline Status |
|---|---|---|---|---|
| `npm run test` | `node --import tsx --test backend/tests/*.test.ts` | Backend automated unit & integration tests | **782ms - 808ms** total duration | ✅ 100% Pass (60/60) |
| `npm run build` | `vite build` | Production Vite 8.2 + Nitro 3.0 SSR compilation | **823ms** build time | ✅ Clean (0 errors) |
| `npm run build:dev` | `vite build --mode development` | Development bundle build | ~900ms | ✅ Clean |
| `npm run lint` | `eslint .` | ESLint 9.32.0 static code analysis | ~39s (unignored dot-folders) | ⚠️ 0 errors, 7 warnings |
| `npm run format` | `prettier --write .` | Prettier 3.7 code formatting | ~2.5s | ✅ Operational |
| `npm run dev` | `vite dev` | Local development server | Interactive | ✅ Operational |
| `npm run preview` | `vite preview` | Production bundle preview | Interactive | ✅ Operational |

### 2.3 Build Verification Baseline (`npm run build`)
Executing `npm run build` generates the full SSR server bundle and client assets under `.output/`:
- **Engine**: Vite 8.2.0 + Nitro 3.0.260603-beta
- **Target**: Cloudflare / Node Nitro SSR Worker (`hellthefox808-ncc-crm-v1-0`)
- **Compilation Time**: **823ms**
- **Output Artifacts**:
  - `.output/server/index.mjs` (19.95 kB, gzip: 5.66 kB)
  - `.output/server/_ssr/router-sTzVi3se.mjs` (522.01 kB, gzip: 94.74 kB)
  - `.output/server/_ssr/routes-C4eGPSya.mjs` (259.68 kB, gzip: 40.98 kB)
  - `.output/server/_ssr/admin-cunPMFPu.mjs` (229.53 kB, gzip: 26.91 kB)
  - `.output/server/_ssr/enroll-D4q7-uzQ.mjs` (164.80 kB, gzip: 22.57 kB)
  - `.output/server/_ssr/cadet-CThxcMr6.mjs` (271.42 kB, gzip: 33.71 kB)
  - Full client manifests and headers generated under `.output/public/` and `.output/nitro.json`.
- **Verdict**: Build succeeds with zero errors, zero warnings.

### 2.4 Type-Checking Baseline (`npx tsc --noEmit`)
Running `npx tsc --noEmit` against `tsconfig.json` identified TypeScript compilation errors in existing route files:
1. `src/routes/api/v1/calendar.$id.cancel.ts`:
   - Line 25: `status` does not exist in type `RejectExcessProperties<...>` for `calendar_events` table update.
   - Lines 28, 65: `Property 'officerName' does not exist on type 'AdminGate'`.
2. `src/routes/api/v1/calendar.$id.publish.ts`:
   - Line 22: `status` excess property error.
   - Lines 25, 57: `Property 'officerName' does not exist on type 'AdminGate'`.
3. `src/routes/api/v1/calendar.$id.reminders.ts`:
   - Line 35: Argument of type `"EMAIL" | "BOTH" | "SOCKET"` is not assignable to parameter of type `"EMAIL" | "SOCKET_IO" | "IN_APP" | "BOTH"`.
4. `src/routes/api/v1/calendar.$id.ts`:
   - Lines 30, 35: PostgREST relation overloads for `"calendar_event_attendees"` and `"calendar_event_reminders"` fail because Supabase schema definitions are missing these child tables.
   - Lines 77, 128, 162: `Property 'officerName' does not exist on type 'AdminGate'`.
   - Line 91: `Record<string, unknown>` type mismatch on update payload.
5. `src/routes/api/v1/calendar.ts`:
   - Line 27: Argument of type `"status"` is not assignable to PostgREST column union.
   - Lines 82, 86-88: Type `'string'` is not assignable to type `'never'`.
6. `src/routes/api/v1/notifications.$id.read.ts`:
   - Line 17: `Record<string, unknown>` excess property mismatch.
7. `src/routes/cadet-database.tsx`, `src/routes/cadet.tsx`, `src/routes/login.tsx`:
   - Argument of type `Record<string, unknown> | UserSessionProfile | undefined` is not assignable to parameter of type `Record<string, unknown> | null`.

*Survey Observation*: The backend test files (`backend/tests/*.test.ts`) are typed correctly and do not import these failing UI/API route files directly, allowing tests to run and pass. However, fulfilling Acceptance Criterion *"Zero ESLint or TypeScript type-checking errors"* will require fixing these route typings during the implementation phase.

### 2.5 Linting Baseline (`npm run lint`)
ESLint 9 with `@typescript-eslint` was evaluated:
- **Execution**: `npx eslint src backend frontend agent`
- **Result**: 0 Errors, 7 Warnings (Exit code 0).
- **Warnings breakdown**:
  - `backend/lib/app-shell.tsx:97` (`react-refresh/only-export-components`)
  - `frontend/components/ui/badge.tsx:32` (`react-refresh/only-export-components`)
  - `frontend/components/ui/button.tsx:49` (`react-refresh/only-export-components`)
  - `frontend/components/ui/form.tsx:163` (`react-refresh/only-export-components`)
  - `frontend/components/ui/navigation-menu.tsx:111` (`react-refresh/only-export-components`)
  - `frontend/components/ui/sidebar.tsx:748` (`react-refresh/only-export-components`)
  - `frontend/components/ui/toggle.tsx:42` (`react-refresh/only-export-components`)
- **Optimization Note**: `eslint.config.js` currently specifies `ignores: ["dist", ".output", ".vinxi"]`. Adding `.agents`, `.lovable`, `.wrangler`, `.git` to the `ignores` array will reduce lint execution time from ~39s to <5s.

---

## 3. Existing Test Inventory & Execution Baseline

### 3.1 Test Suite Summary
- **Total Test Files**: 12
- **Total Test Suites**: 11 (plus top-level tests in `onboarding-auth.test.ts`)
- **Total Executed Tests**: 60
- **Passing Tests**: 60 (100%)
- **Failing / Cancelled / Skipped**: 0
- **Total Execution Duration**: **782.41ms**

### 3.2 Detailed Test Suite Breakdown

| Suite # | Test File | Suite Title | Test Count | Suite Duration | Key Covered Functionalities |
|---|---|---|---|---|---|
| **1** | `cache.test.ts` | Multi-Tier Cache & High-Throughput Service | 7 | 143.72ms | L1 cache miss/hit, `invalidateCache`, `invalidateCachePrefix`, 20 concurrent readers, `invalidateSessionCache`, `queueEmailJobsBatch`, LRU eviction loop |
| **2** | `data-mapping.test.ts` | Data Mapping & Transformation | 4 | 4.16ms | `mapToCadetRecord`, `buildEnrollmentRow`, `mapCadet` PII masking, `rosterRecords` nominal roll |
| **3** | `ids.test.ts` | Intrusion Detection System (IDS) | 4 | 276.05ms | `getAlertLevelForScore`, `IDS_RULES` mapping, `recordSecurityEvent` cumulative risk & containment |
| **4** | `lifecycle.test.ts` | Controlled Cadet Lifecycle & Activation | 4 | 262.88ms | `buildEnrollmentRow` status defaults, SHA-256 token hashing, scrypt password verify, onboarding progress % |
| **5** | `mailer.test.ts` | Nodemailer Service | 6 | 41.52ms | `renderOtpEmail`, `renderWelcomeEmail`, `renderApplicationApprovedEmail`, `renderEventCreatedEmail`, `renderReminderEmail`, `mailer.sendOtp` mock mode |
| **6** | `multichannel.test.ts` | Multi-Channel Dispatch & 18-Digit Application Number | 6 | 72.20ms | `generate18DigitApplicationNo`, `buildEnrollmentRow` ID prefix `19`, `formatApplicationNo`, `sendMultiChannelApplicationConfirmation`, Zod Form 1 validation & rejection |
| **7** | `onboarding-auth.test.ts` | Onboarding & Authentication Security | 4 | 400.12ms | Salted scrypt hashing/verification, single-use activation token lifecycle (`issue` -> `verify` -> `consume` -> `re-consume rejected`), OTP 6-digit entropy, template renderers |
| **8** | `pipeline-e2e.test.ts` | E2E Pipeline & Data Connection Integration | 4 | 20.51ms | Form 1 -> 18-digit App ID -> DB row -> CadetRecord -> Public masked PII pipeline; RFC 4180 CSV export with UTF-8 BOM; PostgREST filter sanitizer; sliding-window rate limiter |
| **9** | `prompter.test.ts` | Prompter Reminder Engine | 2 | 6.05ms | `DEFAULT_REMINDER_RULES` (1440m, 120m, 30m, 0m offsets), `calculateScheduledTime` subtraction |
| **10** | `redis.test.ts` | Redis Service & Hybrid Rate Limiter | 5 | 15.10ms | `getRedisStatus` memory fallback, `redisSet`/`redisGet`, `redisIncr` atomic, `redisRateLimit`, `checkRateLimitAsync` |
| **11** | `security.test.ts` | Security & Authorization | 9 | 289.43ms | `bearer` extraction from headers/cookies, `requireOfficer`/`requireCadetSession` 401 gate, `maskPublicRecord` PII strip, scrypt verify, PostgREST sanitize, 256-bit token entropy, rate limiter, login schema min 8 chars |
| **12** | `storage.test.ts` | Bucket Tokenisation & Storage Capability | 5 | 235.55ms | `generateStorageToken` 256-bit + SHA-256 hash, `validateMagicBytes` (JPEG, PNG, PDF, ELF/script rejection), `ALLOWED_MIME_TYPES`, `createUploadIntent` opaque keys & limits, invalid MIME / size rejection |

### 3.3 Test Execution Environment Observations
- When tests execute in an environment without live Supabase credentials, the integration layers (`supabaseAdmin`, `queue.service.ts`, `storage.service.ts`) gracefully fall back or bypass database writes with logged notices (`[Supabase] Missing Supabase environment variable(s)...`).
- All 60 tests execute deterministically in memory without requiring external Redis, SMTP, or PostgreSQL servers, ensuring high reliability in CI/CD environments.

---

## 4. Gap Analysis Against Acceptance Criteria & Requirements

### 4.1 Requirement R1: Deep Codebase Stress Testing & Edge-Case Validation

#### A. Authentication & Identity Pipeline
- **Current State**: Covers happy-path scrypt verification, single-thread token issue/consume, basic 6-digit OTP generation, and 401 unauthenticated gates.
- **Identified Gaps**:
  1. *OTP Brute-Force & Lockout*: No test simulates rapid consecutive incorrect OTP submissions (e.g. 5 failures within 10 minutes) to verify lockout enforcement, risk score accumulation, and IP rate-limiting containment.
  2. *Single-Use Activation Token Concurrency*: No race-condition test verifies that parallel requests (`Promise.all` with 10 concurrent requests) attempting to consume the same activation token simultaneously result in exactly 1 success and 9 rejections.
  3. *Session TTL & Corrupted Tokens*: No test exercises expired session tokens (`expiresAt < Date.now()`), corrupted HMAC signatures, or token reuse after logout.
  4. *Password Complexity Boundaries*: No boundary tests for passwords with exactly 8 characters, maximum 128 characters, multi-byte UTF-8 / Emoji characters, and whitespace stripping.

#### B. Cadet Enrollment & Verification
- **Current State**: Validates Form 1 fields against Zod schema, generates 18-digit IDs, masks PII for public status.
- **Identified Gaps**:
  1. *Aadhaar Verhoeff Checksum Validation*: `backend/lib/validation.schemas.ts` currently verifies Aadhaar using `z.string().refine((val) => /^\d{12}$/.test(val))` (length and numeric format only). It does **not** validate UIDAI Verhoeff dihedral D5 checksum algorithms. Tests are needed for Verhoeff algorithm validation and rejection of invalid checksums and dummy numbers (e.g., `000000000000`, `123456789012`).
  2. *18-Digit Application Number Collision Resistance*: `generate18DigitApplicationNo()` generates `19${YYYYMMDD}${8 random digits}`. Under high-throughput registration bursts, collision probability must be verified via Monte Carlo simulation (e.g., 10,000 unique IDs generated concurrently with 0 collisions).
  3. *Form 1 Age & Numeric Boundaries*: Missing boundary tests for age calculation (exactly 15th birthday vs 14 years 364 days; exactly 28th birthday vs 28 years 1 day), marks percentages (`0.0%`, `100.0%`, `100.1%`, `-1%`), and height/weight extremes.
  4. *Input Fuzzing & Injection*: Missing fuzz tests for XSS payloads (`<script>`, `javascript:`, `onerror=`) and SQL/PostgREST injection in address, remarks, and name fields.

#### C. Multi-Tier Caching & Invalidation
- **Current State**: Validates basic L1 get/set, prefix invalidation, and a 20-reader concurrent get.
- **Identified Gaps**:
  1. *L1 LRU Ceiling Compliance*: In `backend/lib/cache.server.ts:19`, `L1_MAX_ITEMS` is hardcoded to `2000`, whereas requirement R2 specifies `MAX_MEMORY_ITEMS = 5000`. Tests must verify capacity capping and FIFO/LRU eviction under 10,000 insertions.
  2. *Sub-Millisecond Cache Hit Latency*: Acceptance Criteria requires cache hit times to remain sub-millisecond. A dedicated high-precision microbenchmark (`performance.now()` over 1,000 hits) is required to assert median latency < 0.2ms and 99th percentile < 1.0ms.
  3. *Cache Stampede (Thundering Herd)*: No test simulates 100 concurrent requests hitting an expired cache key to verify single-flight calculation without stampeding the underlying fetcher.
  4. *Rate Limiter Memory Bounds*: In `backend/lib/rate-limiter.server.ts:28`, `store = new Map<string, RateLimitEntry>()` does not enforce a maximum item cap. Under a DDoS attack with 50,000 unique IP addresses, memory will grow unboundedly until the 5-minute prune interval. A test must expose and verify strict LRU capacity bounds on the rate limiter store.
  5. *Redis Failover & Error Resilience*: No test simulates Redis socket errors / timeouts during `redisGet`/`redisSet` to verify fallback to L1 in-memory caching without throwing unhandled promise rejections.

#### D. Real-Time Sockets & Prompter Engine
- **Current State**: Validates prompter rule offsets (1440m, 120m, 30m, 0m) and timestamp subtraction.
- **Identified Gaps**:
  1. *Socket.IO Connection & Authentication*: `backend/services/socket/socket.server.ts` has no automated unit/integration tests verifying socket handshake authentication, room joins (`user:id`, `role:role`, `calendar`), and rejection of malformed tokens.
  2. *Room Isolation & Access Control*: No test asserts that a Cadet socket cannot receive messages broadcast to Officer-only rooms (`role:SUPER_ADMIN`, `role:OFFICER`).
  3. *Presence State & Reconnect Churn*: No test validates presence counters (`PRESENCE_UPDATE`) under rapid client connect/disconnect/reconnect churn.
  4. *Prompter Engine State Machine*: No test validates `updateEventReminders` (atomically marking old reminders `CANCELLED` and creating new ones when an event is rescheduled) or `cancelEventReminders`.

---

### 4.2 Requirement R2: High-Throughput & Concurrency Optimization
- **Current State**: `queueEmailJobsBatch` signature tested with 2 items; rate limiter tested with 7 sequential attempts.
- **Identified Gaps**:
  1. *Batch Queueing Burst Testing*: Testing `queueEmailJobsBatch` with 500+ jobs to measure ingestion throughput, memory overhead, and batch insert efficiency.
  2. *Sliding Window Burst Precision*: Testing parallel requests hitting rate limiters concurrently to verify thread-safe counter increments without race condition over-allowance.
  3. *Memory Bounds & Leak Detection*: Automated heap usage differential testing (`process.memoryUsage().heapUsed`) across 10,000 operations to verify zero memory leaks.

---

### 4.3 Requirement R3 & Acceptance Criteria Compliance Matrix

| Acceptance Criterion | Target Requirement | Current Baseline Status | Gap Description & Action Needed |
|---|---|---|---|
| **100% Test Pass Rate** | `npm run test` exits code 0 with 0 failures | ✅ **100% Pass** (60/60 passing) | Maintain 100% pass rate as suite expands from 60 to 120+ tests |
| **Execution Duration < 2s** | All test suites execute cleanly in <2.0s | ✅ **782ms** total runtime | Ensure expanded Tier 1-4 suites remain deterministic and sub-2.0s |
| **0 Unhandled Rejections / Leaks** | Clean event loop exit without unhandled promise rejections | ✅ **0 Unhandled Rejections** | Verify async timers (`queue.service.ts`, `rate-limiter.server.ts`) clean up on teardown |
| **Sub-Millisecond Cache Hit** | L1 cache hits execute in <1.0ms | ⚠️ **Not formally asserted** in microbenchmark | Implement high-precision microbenchmark asserting L1 hit < 0.2ms |
| **Bounded In-Memory Stores** | Strict LRU ceilings (`MAX_MEMORY_ITEMS = 5000`) | ⚠️ **Partial**: `redis.server.ts` has 5000, `cache.server.ts` has 2000, `rate-limiter.server.ts` has no bound | Align constants to 5000 and implement LRU cap in `rate-limiter.server.ts` |
| **Production Build Clean** | `npm run build` exits 0 with zero errors | ✅ **Clean** (823ms build time) | Keep build verified across changes |
| **Zero ESLint / TS Errors** | `npm run lint` and `tsc --noEmit` exit 0 | ⚠️ **Lint**: 0 errors, 7 warnings<br>❌ **TS**: Type errors in calendar/cadet routes | Fix calendar/cadet route type mismatches; optimize eslint ignore rules |

---

## 5. Proposed Test Architecture: Tier 1 – Tier 4 & Stress Suites

To achieve full verification coverage across all subsystems while maintaining sub-2-second total execution time, we propose structuring the expanded test suite into a 4-Tier Test Pyramid plus a dedicated Stress & Boundary Suite.

```
                  ┌───────────────────────────────┐
                  │    Stress & Boundary Suite    │ (Heap bounds, 10k ID uniqueness, fuzzing)
                  ├───────────────────────────────┤
                  │  Tier 4: Sockets & E2E Flow   │ (Socket.IO auth/rooms, pipeline integration)
                  ├───────────────────────────────┤
                  │  Tier 3: Concurrency & Cache  │ (L1/L2 cache, sub-ms bench, burst batch queue)
                  ├───────────────────────────────┤
                  │  Tier 2: State Machine & Int. │ (Lifecycle transitions, prompter, storage tokens)
                  ├───────────────────────────────┤
                  │  Tier 1: Unit & Crypto Core   │ (scrypt, OTP, Verhoeff Aadhaar, Zod, IDS)
                  └───────────────────────────────┘
```

---

### 5.1 Tier 1: Unit & Cryptographic Integrity Suites (Deterministic, Zero I/O, <150ms)

#### File 1: `backend/tests/tier1-crypto-auth.test.ts`
- **T1.1**: *Salted Scrypt Hashing & Timing Safety*: Verifies scrypt hash output format (`scrypt$N$r$p$...`), key derivation consistency, and rejection of invalid passwords.
- **T1.2**: *OTP Generation Entropy & Distribution*: Generates 1,000 OTP codes, verifying uniform digit distribution, exactly 6 numeric digits, and zero leading-zero truncation bugs.
- **T1.3**: *OTP Brute-Force Lockout Simulation*: Simulates 5 sequential invalid OTP attempts on a cadet account, asserting lockout trigger and TTL countdown.
- **T1.4**: *Cryptographic Activation & Session Token Entropy*: Asserts that `issueActivationToken` and `crypto.getRandomValues` produce 256-bit high-entropy strings without repetition across 1,000 generations.
- **T1.5**: *Password Boundary & UTF-8 Handling*: Tests boundary lengths (7 rejected, 8 accepted, 128 accepted, 129 rejected), unicode/emoji passwords, and leading/trailing whitespace handling.

#### File 2: `backend/tests/tier1-enrollment-validation.test.ts`
- **T2.1**: *Aadhaar UIDAI Verhoeff Algorithm Checksum*: Tests valid 12-digit Aadhaar numbers against the Verhoeff multiplication table; rejects invalid checksum digits and dummy sequences (`000000000000`, `111111111111`).
- **T2.2**: *18-Digit Application Number Structure*: Validates format `^19\d{4}\d{2}\d{2}\d{8}$` matching Battalion Code (`19`), Year/Month/Day (`YYYYMMDD`), and 8 random digits.
- **T2.3**: *Cadet Form 1 Age Boundary Checks*: Tests date of birth boundaries for exactly 15 years 0 days, 28 years 0 days, 14 years 364 days (rejected), and 28 years 1 day (rejected).
- **T2.4**: *Cadet Form 1 Academic & Physical Boundaries*: Tests percentage ranges (`0.0%` to `100.0%`), height (120cm - 220cm), weight (30kg - 150kg), IFSC code regex (`^[A-Z]{4}0[A-Z0-9]{6}$`).
- **T2.5**: *Strict Public PII Masking*: Asserts that `maskPublicRecord` strips `aadhaarNumber`, `mobile`, `email`, `bankName`, `accountNumber`, `ifscCode`, `presentAddress`, and `guardianMobile` from all public tracking outputs.

#### File 3: `backend/tests/tier1-sanitization-ids.test.ts`
- **T3.1**: *PostgREST Filter Injection Prevention*: Tests `sanitizePostgrestQuery` against complex SQL/PostgREST injection payloads (e.g. `192026%(),.\\"or(1=1)`), asserting complete stripping of illegal characters.
- **T3.2**: *XSS Input Sanitization*: Tests `sanitizeString` stripping `<script>`, `<iframe>`, `javascript:`, `onerror=` tags while preserving valid names.
- **T3.3**: *IDS Risk Accumulation & Containment Triggers*: Asserts risk score weighting for `AUTH_FAILURE` (+15), `IDOR_ATTEMPT` (+35), `UNAUTHORIZED_EXPORT` (+50), and verifies automated triggers (`RATE_LIMIT_IP`, `REVOKE_SESSION`).

---

### 5.2 Tier 2: Integration & State Machine Suites (<300ms)

#### File 4: `backend/tests/tier2-cadet-lifecycle.test.ts`
- **T4.1**: *Enrollment State Machine Transition Flow*: Verifies valid state progression:
  `PENDING_ANO_REVIEW` ➔ `PHYSICAL_SCHEDULED` ➔ `MEDICAL_CLEARED` ➔ `SELECTED` ➔ `ENROLLED`.
- **T4.2**: *Illegal State Transition Rejection*: Asserts that transitioning directly from `PENDING_ANO_REVIEW` to `ENROLLED` (bypassing ANO physical/medical boards) is rejected.
- **T4.3**: *Single-Use Activation Token Lifecycle & Re-consumption Guard*: Verifies that an activation token can be verified multiple times, but once consumed (`consumeActivationToken`), all subsequent consumption attempts fail with `TOKEN_NOT_FOUND`.
- **T4.4**: *Multi-Channel Confirmation Dispatch*: Verifies simultaneous dispatch formatting for Email, WhatsApp, and SMS templates with matching 18-digit IDs.

#### File 5: `backend/tests/tier2-storage-capability.test.ts`
- **T5.1**: *Bucket Tokenisation & Opaque Intent Issuance*: Tests `createUploadIntent` generating 256-bit opaque tokens, SHA-256 hash storage, and hashed path structure (`cadets/{hash}/...`).
- **T5.2**: *Magic Bytes Binary Header Verification*: Asserts validation of JPEG (`FF D8 FF`), PNG (`89 50 4E 47`), PDF (`25 50 44 46`), and rejection of ELF/executable/HTML files masquerading as images.
- **T5.3**: *MIME Whitelist & Size Ceiling Enforcement*: Rejects unauthorized MIME types (`application/javascript`, `text/html`) and payloads exceeding the 10MB limit.

#### File 6: `backend/tests/tier2-prompter-reminders.test.ts`
- **T6.1**: *Prompter Engine Rule Calculation*: Asserts reminder scheduling at T-24h (1440m), T-2h (120m), T-30m (30m), and T-0m (0m) from event start time.
- **T6.2**: *Event Reschedule Invalidation Cascade*: Verifies that updating an event start time automatically marks all previous `PENDING` reminders as `CANCELLED` and generates new reminder records.
- **T6.3**: *Event Cancellation Trigger*: Verifies that cancelling an event marks all associated pending reminders as `CANCELLED`.

---

### 5.3 Tier 3: High-Throughput, Concurrency & Caching Suites (<500ms)

#### File 7: `backend/tests/tier3-cache-concurrency.test.ts`
- **T7.1**: *Sub-Millisecond L1 Cache Hit Latency Benchmark*: Executes 1,000 sequential L1 cache hits with `performance.now()`, asserting that median hit latency is `< 0.1ms` and maximum latency is `< 1.0ms`.
- **T7.2**: *L1 LRU Bounded Capacity (5,000 Ceiling)*: Inserts 6,000 distinct items into cache, verifying that memory store size never exceeds `MAX_MEMORY_ITEMS = 5000` and oldest items are properly evicted.
- **T7.3**: *Cache Stampede / Thundering Herd Prevention*: Dispatches 50 concurrent `getOrSetCache` requests for an unseeded key, asserting that the authoritative fetcher is executed exactly once.
- **T7.4**: *Prefix Invalidation Consistency*: Sets 100 keys across 3 distinct prefixes (`ncc:cadet:*`, `ncc:calendar:*`, `ncc:session:*`), invalidates one prefix, and verifies isolated purging without affecting sibling prefixes.
- **T7.5**: *Redis Error & Failover Resilience*: Simulates Redis connection failures and ensures `getOrSetCache`, `redisGet`, and `redisSet` seamlessly fall back to L1 memory cache without throwing unhandled rejections.

#### File 8: `backend/tests/tier3-rate-limiter-bounds.test.ts`
- **T8.1**: *Sliding-Window High-Concurrency Burst*: Dispatches 20 concurrent requests against a 5-request limit, verifying that exactly 5 are allowed and 15 are rate-limited with accurate `retryAfterMs`.
- **T8.2**: *In-Memory Rate Limiter Capacity Bound*: Injects 10,000 distinct IP keys into `rate-limiter.server.ts` and asserts that store size is strictly bounded, preventing unbounded memory growth.
- **T8.3**: *Rate Limiter Reset & Expiration*: Verifies counter reset on explicit `resetRateLimit` and auto-expiration after sliding window passes.

#### File 9: `backend/tests/tier3-batch-queue.test.ts`
- **T9.1**: *High-Volume Batch Email Queue Ingestion*: Tests `queueEmailJobsBatch` with 500 email jobs, asserting atomic insert structure, non-blocking execution, and zero unhandled rejections.
- **T9.2**: *Empty & Malformed Batch Handling*: Handles empty arrays (`[]`), null elements, and oversized batches gracefully with structured return status.
- **T9.3**: *Background Worker Error Containment*: Verifies that worker exceptions in `processPendingEmailJobs` are caught and logged without crashing the parent process.

---

### 5.4 Tier 4: Real-Time Sockets & System E2E Suites (<400ms)

#### File 10: `backend/tests/tier4-socket-engine.test.ts`
- **T10.1**: *Socket.IO Server Initialization & Handshake*: Tests `initSocketServer` initialization, CORS configuration, ping/pong RTT heartbeat.
- **T10.2**: *Strict Room Authorization & Derivation*: Verifies that connecting sockets are automatically joined to `user:${id}`, `role:${role}`, `calendar`, and `notification:global`.
- **T10.3**: *Room Message Isolation*: Asserts that `CALENDAR_EVENT_CREATED` broadcasts reach the `calendar` room, while targeted notifications reach only `notification:user:${id}`.
- **T10.4**: *Presence Counter Accuracy Under Churn*: Simulates 50 rapid client connections and disconnections, asserting that `activeCadetsCount` in `PRESENCE_UPDATE` remains perfectly consistent and never drops below 0.

#### File 11: `backend/tests/tier4-pipeline-e2e.test.ts`
- **T11.1**: *Full Enrollment End-to-End Pipeline*: Form 1 payload ingestion ➔ Zod schema validation ➔ 18-digit App ID generation ➔ DB row transformation ➔ Public PII masking verification ➔ Multi-channel confirmation dispatch.
- **T11.2**: *RFC 4180 CSV / Excel Export Security*: Verifies UTF-8 BOM (`\uFEFF`), character escaping for quotes and commas, and formula injection prevention (stripping `=+-\@` prefixes in export cells).

---

### 5.5 Stress & Boundary Test Suite (<600ms)

#### File 12: `backend/tests/stress-boundary.test.ts`
- **S1**: *10,000 Application ID Uniqueness Monte Carlo Test*: Generates 10,000 18-digit Application Numbers in a tight loop, inserting them into a `Set`, asserting `set.size === 10000` (zero collisions).
- **S2**: *Memory Bounded Ceiling & Leak Check*: Measures Node process heap used (`process.memoryUsage().heapUsed`), performs 20,000 cache and rate limit operations, runs garbage collection / prune cycles, and asserts that heap memory remains strictly bounded.
- **S3**: *Malformed & Boundary Input Fuzzing*: Fuzzes API validation schemas with extreme inputs (10MB JSON strings, null bytes `\0`, unicode boundary characters, negative numbers, nested objects) asserting clean structured rejection without unhandled exceptions.

---

## 6. Actionable Implementation Roadmap for Subsequent Phases

```
┌────────────────────────────────────────────────────────────────────────────┐
│ Phase 1: Core Platform Verification & Defect Remediation                  │
│ 1. Fix TypeScript type errors in calendar/cadet route files.               │
│ 2. Add .agents, .lovable, .wrangler to eslint.config.js ignores.           │
│ 3. Implement Verhoeff Aadhaar checksum helper in validation.schemas.ts.   │
│ 4. Unify MAX_MEMORY_ITEMS = 5000 and add LRU bounds to rate-limiter.      │
├────────────────────────────────────────────────────────────────────────────┤
│ Phase 2: Tier 1 & Tier 2 Test Suite Implementation                        │
│ 1. Implement Tier 1 Crypto & Validation suites (T1.1 - T3.3).              │
│ 2. Implement Tier 2 Lifecycle, Storage, & Prompter suites (T4.1 - T6.3).   │
├────────────────────────────────────────────────────────────────────────────┤
│ Phase 3: Tier 3 & Tier 4 Concurrency, Cache & Socket Suites               │
│ 1. Implement Tier 3 Cache benchmark, LRU bounds, & Batch Queue suites.     │
│ 2. Implement Tier 4 Socket.IO engine and E2E pipeline suites.              │
├────────────────────────────────────────────────────────────────────────────┤
│ Phase 4: Stress / Boundary Verification & Final Acceptance Sign-off        │
│ 1. Execute 10,000-iteration ID uniqueness and heap memory leak tests.      │
│ 2. Run full test suite (`npm run test`), lint (`npm run lint`), build.     │
│ 3. Validate complete 100% pass rate under <2.0s execution duration.       │
└────────────────────────────────────────────────────────────────────────────┘
```

---
*End of Survey Report.*
