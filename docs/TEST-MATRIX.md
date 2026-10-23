# NCC Platform — Automated Test Suite & Quality Matrix

This document tracks all unit, integration, security, and build verification tests in the 19 Jharkhand Battalion NCC Portal codebase.

---

## 1. Test Suite Summary

- **Total Test Suites**: 75
- **Total Executed Tests**: 224
- **Passing Tests**: 224 (100%)
- **Failing / Skipped Tests**: 0
- **Execution Command**: `npm run test`
- **Execution Speed**: ~11.1s across all 224 tests (100% in-memory failover & mock resilience)

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
- `Multi-Purpose OTP Lifecycle & Failover Security`: Verifies OTP issuance, verification, replay protection, and memory fallback across login, onboarding, and password-reset purposes.
- `Transactional Email Template Renderers`: Verifies activation link delivery without cleartext passwords.
- `Onboarding Welcome Email Renderer`: Verifies welcome email includes cadet ID, name, active badge, and unit name.
- `5-Stage Cadet Induction Step Normalization & Completion Evaluation`: Verifies camelCase→snake_case normalization, invalid step rejection, partial progress calculation, and 5-of-5 auto-activation trigger to ACTIVE status.
- `Onboarding Purpose OTP Verification with Replay Protection`: Verifies onboarding-purpose OTP issuance, wrong-code rejection, correct-code validation, and single-use replay blocking.

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

### Suite 13: Multi-Tier Cache & High-Throughput Service Unit Tests

- `getOrSetCache()`: Verifies compute-on-miss and return-from-cache-on-hit semantics.
- `invalidateCache()`: Verifies single-key eviction from L1 cache.
- `invalidateCachePrefix()`: Verifies prefix-based bulk eviction for related cache entries.
- `queueEmailJobsBatch()`: Verifies batch email job queuing with bounded concurrency.
- `invalidateSessionCache()`: Verifies session-specific cache eviction on logout/status change.

### Suite 14: Chart Security Sanitization Unit Tests

- `sanitizeCssIdentifier()`: Verifies safe alphanumeric preservation and strips HTML tags, quotes, brackets, braces, and semicolons from CSS identifiers.
- `sanitizeCssValue()`: Verifies legitimate CSS color/variable preservation while stripping HTML closing style tags, script injection payloads, CSS rule breakout characters, and hazardous function calls (`url()`, `expression()`, `javascript()`).

### Suite 15: Queue Service Job Execution & Error Handling Unit Tests

- `processPendingEmailJobs()`: Verifies job processing lifecycle including success delivery, retry handling, and FAILED status marking when attempts reach max limit (3).
- `queueEmailJob()`: Verifies single email job queuing with correct payload serialization.
- `queueEmailJobsBatch()`: Verifies batch queuing with bounded concurrency and error isolation.

### Suite 16: Onboarding Batch Schema Validation Unit Tests

- `onboardingBatchSchema`: Verifies acceptance of valid 5-step onboarding checklist payloads.
- `onboardingBatchSchema`: Verifies rejection of unknown/invalid step keys in batch submissions.

### Suite 17: Enterprise Data Platform & MongoDB Client Unit Tests

- `DataPlatformError`: Verifies initialization with error code, HTTP status, request correlation ID, and message.
- `getMongoClient()`: Verifies descriptive configuration error thrown when `MONGODB_URI` environment variable is missing.
- `EnterpriseDataPlatform.getOnboardingProgress()`: Verifies API URL construction (`/api/v1/onboarding?cadetId=...`) and payload parsing.
- `EnterpriseDataPlatform.updateOnboardingStep()`: Verifies HTTP PATCH method dispatch and payload serialization to step route.
- `EnterpriseDataPlatform.requestOtp()` and `verifyOtp()`: Verifies multi-purpose OTP dispatch to authentication endpoints.

### Suite 18: NCC Pipeline Repair & High-Throughput System Optimization Tests

- `validateVerhoeff()`: Verifies mathematical Verhoeff check over dihedral group $D_5$ with official permutation and inverse tables.
- `generateVerhoeffCheckDigit()`: Verifies accurate generation of check digits for 11-digit numbers.
- `sanitizeAadhaar()`: Verifies format stripping and Verhoeff validation; rejects malformed lengths and bad checksums.
- `getOrSetCache()` Single-Flight deduplication: Verifies 25 simultaneous concurrent requests on cold key execute authoritative fetcher exactly once without stampede.
- `getCacheStats()`: Verifies multi-tier telemetry tracking (L1/L2 hits, misses, hit ratio calculation, and memory sizes).
- `checkRateLimit()` capacity bounds: Enforces `MAX_RATE_LIMITER_ITEMS = 5000` LRU bound under distributed IP floods.
- `recordSecurityEvent()` capacity bounds: Enforces `MAX_IDS_EVENT_HISTORY = 5000` memory ceiling on security event log.
- `redisDelPrefix()`: Verifies non-blocking `SCAN` iteration for prefix invalidation across distributed Redis tiers.

### Suite 19: NCC CRM Communication Hub & Cadre Collaboration Test Suite

- `Battalion Channel Initialization`: Verifies automatic provisioning of official battalion announcement channels and company platoon hubs with appropriate role-based permissions (`isOfficial: true`, read-only for cadets).
- `Direct Messaging Canonical Pair Guarantee`: Verifies that initiating 1-to-1 conversations in either participant order resolves deterministically to the identical canonical conversation room without duplicate creation.
- `Group Conversation & Role Administration`: Verifies group provisioning with custom types (`unit`, `camp`, `training`, `committee`, `event`, `general`), member roles (`creator`, `admin`, `member`, `read_only`), and automatic system event audit message creation.
- `Message Threading, Quoted Replies & CRM Cards`: Verifies root and reply message persistence, reply preview snippet generation, and embedded CRM context card attachment (`training`, `camp`, `event`, `notice`).
- `Message Edit Authorization & Audit Log`: Verifies that only the original author can edit message contents, enforcing `isEdited: true` and `editedAt` audit timestamps while rejecting unauthorized edits.
- `Message Soft-Deletion & Content Masking`: Verifies soft-deletion preserving audit trail while masking content to `"This message was deleted"` and stripping attachments.
- `Emoji Reaction Lifecycle`: Verifies multi-user emoji reactions (`🫡`, `🇮🇳`, `🎖️`, `🔥`), reaction count aggregation, user attribution tracking, and toggle-off removal.
- `Read State Advancement & Unread Tracking`: Verifies member `lastReadMessageId` advancement and automatic unread counter synchronization.
- `Interactive Poll Creation & Voting`: Verifies creation of single-choice and multiple-choice polls, real-time vote casting, toggling, percentage computation, and authorization checks.
- `Message Pinning & Official Orders Drawer`: Verifies message pinning, unpinning, timestamp recording, and pinned orders listing within conversations.
- `Cadre Group Member Administration`: Verifies server-side member addition, member removal, and role promotion/demotion (admin vs member) with authorization barriers.
- `Message-to-Task Conversion`: Verifies converting operational chat instructions into structured CRM follow-up tasks linked to authoritative records with priority and due date.

### Suite 20: NCC Internationalization & Localization Engine Tests

- `Default Locale & Supported Locales`: Verifies default locale is `"en"` and both English and Hindi are registered with valid LTR metadata.
- `English & Hindi Translation Dictionaries`: Verifies resolution of official organization titles, unit names, mottoes, common actions, and navigation modules in both languages.
- `Dynamic Parameter Interpolation`: Verifies runtime placeholder substitution (`{name}`, `{count}`) within localized message strings.
- `Fallback Semantics`: Verifies deterministic fallback to English if a key is missing in a secondary locale, and returning raw key if completely unmapped.
- `Indian Numbering & Date Formatting`: Verifies locale-aware formatting using `Intl.NumberFormat` (Indian numbering system: lakhs/crores) and `Intl.DateTimeFormat`.
- `Locale State Persistence`: Verifies switching active locale state via `setLocale()` and retrieval via `getLocale()`.

### Suite 21: Tier 1 Cryptographic Pipeline, Authentication & Token Security Tests

- `Salted Scrypt Derivation`: Verifies N=16384, r=8, p=1 parameters, constant-time validation, and tampered hash rejections.
- `OTP Lifecycle & Lockout`: Verifies uniform 6-digit generation, single-use token consumption, replay blocking, and 5-attempt brute-force lockout.
- `Activation Tokens`: Verifies 256-bit entropy raw tokens, expiration tracking, and atomic single-use consumption.
- `Session Bearer Extraction`: Verifies Authorization header and cookie extraction with HTTP 401 gate rejection for unauthenticated requests.

### Suite 22: Tier 1 Form 1 Validation & Indian PII Constraints Tests

- `Indian Mobile Format`: Validates strict 10-digit format starting with [6-9].
- `Aadhaar Normalization`: Validates space stripping and Verhoeff checksum calculation.
- `SBU Academic Validation`: Validates roll numbers (`SBU2401888`) and required academic courses.
- `Physical Fitness Boundaries`: Validates height (120-250cm), weight (30-150kg), pushups count, and 1600m run timings (`MM:SS`).

### Suite 23: Tier 1 Data Sanitization & UIDAI Verhoeff Checksum Tests

- `Dihedral Group D5`: Tests mathematical vectors, check digit generation, and tampered check digit rejection.
- `18-Digit Application Number`: Verifies `19` + `YYYYMMDD` + 8 random digits with 1,000-iteration collision resistance.
- `PII Masking`: Tests `maskPublicRecord()` PII stripping and `mapCadet()` partial tail-masking (`•••• 9012`).
- `Query Injection Protection`: Tests `sanitizePostgrestQuery()` and `sanitizeSearchQuery()` character neutralization.

### Suite 24: Tier 2 Cadet State Machine & Induction Lifecycle Tests

- `Initial Enrollment State`: Verifies `PENDING_ANO_REVIEW` status and identifier mapping.
- `ANO Review State Transitions`: Simulates transitions to `APPROVED` or `REJECTED` with required rejection reason.
- `Account Provisioning & Activation`: Verifies activation token generation, consumption, and password creation.
- `5-Stage Induction Progress`: Tests partial completion (20%, 60%) and 100% auto-activation trigger to `ACTIVE` status.

### Suite 25: Tier 2 Storage Capability & Magic-Byte Security Tests

- `256-Bit Storage Capability Tokens`: Verifies opaque token issuance, SHA-256 storage hash, and collision resistance.
- `Magic-Byte Validation (OWASP ASVS 5.0 V12)`: Validates real file headers for PDF (`%PDF`), PNG (`\x89PNG`), JPEG (`\xFF\xD8\xFF`), and rejects ELF, PE MZ, and HTML scripts.
- `Upload Intent Size & MIME Ceilings`: Validates 10MB file ceilings and rejects unapproved MIME types.

### Suite 26: Tier 2 Prompter Reminder Engine & Rescheduling Tests

- `Default Schedule`: Verifies 24h, 2h, 30m, and event start notification offsets.
- `Offset Calculation`: Verifies accurate trigger dates with month/year rollover boundaries.
- `Rescheduling & Invalidation`: Tests dynamic recalculation on event rescheduling and payload delivery.

### Suite 27: Tier 3 Multi-Tier Cache Concurrency & Benchmark Tests

- `Single-Flight Deduplication`: Validates 50 simultaneous concurrent requests on cold key execute fetcher exactly once.
- `Sub-Millisecond Benchmark`: Measures 100 cache hits validating average response time strictly `< 1.0ms`.
- `Telemetry Accuracy`: Validates hits, misses, size, and hit ratio percentage tracking.
- `Prefix Invalidation & Memory Bounds`: Validates prefix purging and `L1_MAX_ITEMS = 5000` ceiling under rapid insertion.

### Suite 28: Tier 3 Rate Limiter Memory Bounds & Burst Shielding Tests

- `Sliding Window Semantics`: Validates burst allowance and rate limit enforcement.
- `Capacity Ceiling`: Validates `MAX_RATE_LIMITER_ITEMS = 5000` strict LRU boundary under 10,000 unique IP bursts without memory leaks.

### Suite 29: Tier 3 Batch Queueing & Worker Execution Tests

- `Atomic Batch Enqueueing`: Tests `queueEmailJobsBatch` enqueuing 100+ email jobs atomically in a single operation.
- `Worker Draining Loop`: Tests job processing, status progression, and retry threshold bounds.

### Suite 30: Tier 4 Real-Time Socket.IO Engine & Room Isolation Tests

- `CORS Shielding`: Validates environment-based CORS origins, credentials, and ping timing (15s interval, 10s timeout).
- `Room Isolation`: Validates user, role, calendar, and cadre broadcast room derivation.
- `Operational Broadcasts`: Tests `emitStatusUpdated`, `emitNotification`, and `emitCalendarEventCreated` dispatching.

### Suite 31: Tier 4 End-to-End Operational Pipeline & Cadet Lifecycle Tests

- `Complete Cadet Journey`: Tests Form 1 submission, Zod schema validation, 18-digit ID generation, DB ingestion, PII masking, transactional email queueing, ANO approval, activation token issuance, scrypt password setup, and bearer session authorization.

### Suite 32: Fuzzing, Boundary Conditions & Anti-Bot Security Tests

- `Boundary Constraints`: Tests unicode inputs, 5,000-character payloads, SQL injection fuzz vectors, PostgREST filter neutralizing, and CSV formula injection protection (`=cmd`, `@SUM`, `-2+3`, `+4-5`).

### Suite 33: Tier 3 Database Connections, Reliability & Security Tests

- `Prisma 7 Driver Adapter Initialization`: Validates Prisma 7 configuration structure, `@prisma/adapter-pg` driver adapter wiring, pool size bounds (`max: 10`), connection timeouts (5000ms), and idle timeouts (30000ms).
- `Database URL Redaction`: Validates regex masking of database credentials in PostgreSQL and MongoDB connection strings preventing log exposure.
- `Prisma Connection Reuse & Concurrent Deduplication`: Validates singleton client caching and deduplication of concurrent cold-cache initialization requests.
- `Prisma Health Check Probes & Clean Teardown`: Tests ping latency measurement and deterministic connection pool draining (`disconnectPrisma`).
- `MongoDB Dynamic Environment Validation`: Verifies graceful failure and descriptive error handling when `MONGODB_URI` is unconfigured.
- `MongoDB Connection Options & Timeouts`: Validates 8000ms serverSelectionTimeout, 10000ms connectTimeout, 45000ms socketTimeout, retryWrites, and pool size bounds.
- `MongoDB Rejected-Promise Recovery`: Validates promise cache eviction upon connection failure, allowing subsequent operations to retry rather than returning a dead rejected promise.
- `MongoDB Health Check Probes & Disconnect`: Validates `admin.ping` latency probe and clean client teardown.
- `MongoDB Windows DNS SRV Fallback`: Validates automated fallback to `MONGODB_DIRECT_URI` when SRV lookup fails.
- `Supabase Server Key Isolation`: Validates that `VITE_SUPABASE_SERVICE_ROLE_KEY` is not read by server clients, keeping administrative secrets out of client bundles.
- `Supabase Admin Client Health Probe`: Tests administrative ping check with query latency reporting.
- `Unified Multi-Database Health Endpoint`: Tests `/api/v1/health` JSON payload aggregating Supabase PostgreSQL, Prisma ORM, MongoDB Atlas, and Redis cache statuses.

---

## 3. Build & Compilation Verification

- **Command**: `npm run build`
- **Engine**: Vite + Nitro SSR Bundle (TanStack Start)
- **Result**: **224 / 224 Unit & Integration Tests Passing (100% across 75 suites)**, `npm run typecheck` (`tsc --noEmit`) 0 errors, `npm run lint` (`eslint src backend frontend`) 0 errors, clean SSR bundle generated under `.output/` with worker name `hellthefox808-ncc-crm-v1-0`.
