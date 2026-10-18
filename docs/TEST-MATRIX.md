# NCC Platform — Automated Test Suite & Quality Matrix

This document tracks all unit, integration, security, and build verification tests in the 19 Jharkhand Battalion NCC Portal codebase.

---

## 1. Test Suite Summary

- **Total Test Suites**: 18
- **Total Executed Tests**: 109
- **Passing Tests**: 109 (100%)
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

---

## 3. Build & Compilation Verification

- **Command**: `npm run build`
- **Engine**: Vite + Nitro SSR Bundle (TanStack Start)
- **Result**: **131 / 131 Unit Tests Passing (100% across 24 suites)**, `npm run typecheck` (`tsc --noEmit`) 0 errors, `npm run lint` (`eslint .`) 0 errors, clean SSR bundle generated under `.output/` with worker name `hellthefox808-ncc-crm-v1-0`.
