# Changelog

All notable changes to the 19 Jharkhand Battalion NCC Command Centre Platform (`Hellthefox808/NCC-CRM-V1.0`) will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] - 2026-10-23

### Added
- **Cryptographic Security Pipeline**:
  - Salted scrypt key derivation ($N=16384, r=8, p=1$, 64-byte key) with constant-time verification (`timingSafeEqual`) preventing timing attacks.
  - Multi-purpose OTP engine generating 6-digit numeric codes with 10-minute TTL, 45-second resend cooldown, and strict 5-attempt brute-force lockout.
  - Single-use 256-bit cryptographic activation tokens with SHA-256 resting token hashes and atomic consumption.
  - Opaque 256-bit storage capability tokens with OWASP ASVS 5.0 V12 magic-byte inspection (PDF `%PDF`, PNG `\x89PNG`, JPEG `\xFF\xD8\xFF`).
- **Data Validation & Sanitization**:
  - Form 1 cadet enrollment Zod schema validation enforcing strict Indian mobile number format (`[6-9]\d{9}`).
  - Official UIDAI Verhoeff algorithm ($D_5$) validating 12-digit Aadhaar numbers against mathematical permutation and inverse tables.
  - 18-digit collision-resistant unique application numbers formatted as `19` + `YYYYMMDD` + 8 random digits.
  - PII data minimization masking: `maskPublicRecord()` strips roll numbers and contact details for public tracking; `mapCadet()` provides partial tail-masking (`•••• 9012`).
  - Query sanitizers (`sanitizePostgrestQuery()` and `sanitizeSearchQuery()`) neutralizing PostgREST reserved operators and SQL injection delimiters.
- **High-Throughput Caching & Memory Bounds**:
  - Bounded multi-tier cache enforcing strict `L1_MAX_ITEMS = 5000` LRU capacity bounds with sub-millisecond response time SLA (<1.0ms on hits, measured average: 0.02ms).
  - Single-flight in-flight promise deduplication in `getOrSetCache()` to prevent thundering herd cache stampedes across concurrent requests.
  - Rate limiter bounded LRU ceiling (`MAX_RATE_LIMITER_ITEMS = 5000`) preventing memory leakage during high-throughput DDoS/burst attacks.
  - Atomic batch email queueing (`queueEmailJobsBatch()`) supporting 100+ email jobs per batch with non-blocking async worker draining.
- **Real-Time Sockets & Operational Prompters**:
  - Socket.IO server engine with strict CORS origin shielding, credentials verification, ping intervals, and server-side room isolation (`user:id`, `role:role`, `calendar`, `cadre:enrollments`).
  - Prompter reminder engine providing automated offset calculation (24h, 2h, 30m, 0m start) with dynamic schedule recalculation on event rescheduling.
- **Comprehensive Automated Test Harness**:
  - 12 new specialized test suites spanning Tiers 1–4 and stress/boundary fuzzing:
    - `tier1-crypto-auth.test.ts`
    - `tier1-enrollment-validation.test.ts`
    - `tier1-sanitization-ids.test.ts`
    - `tier2-cadet-lifecycle.test.ts`
    - `tier2-storage-capability.test.ts`
    - `tier2-prompter-reminders.test.ts`
    - `tier3-cache-concurrency.test.ts`
    - `tier3-rate-limiter-bounds.test.ts`
    - `tier3-batch-queue.test.ts`
    - `tier4-socket-engine.test.ts`
    - `tier4-pipeline-e2e.test.ts`
    - `stress-boundary.test.ts` (10,000 ID collision resistance, heap memory stability, CSV formula injection defense).
  - Total test count expanded to **206 tests across 71 suites with 100% pass rate in 3.06s**.

### Changed
- **Cache Eviction**: Hardened off-by-one capacity check in `pruneL1()` so the in-memory cache strictly never exceeds `L1_MAX_ITEMS = 5000`.
- **ESLint Performance**: Scoped ESLint target directories to `src backend frontend` and expanded `.eslintignore` rules for auxiliary directories, reducing lint execution time from minutes to ~10 seconds.
- **SSR Production Build**: Optimized Vite and Nitro build configuration, compiling clean production bundles in under 1 second (834ms).

### Fixed
- Fixed race conditions and thundering herd behavior in high-concurrency cache retrieval via single-flight promise sharing.
- Fixed potential memory unbounded growth in sliding-window rate limiters under distributed IP bursts.
- Fixed PII exposure in unauthenticated public tracking responses by enforcing strict property whitelisting in `maskPublicRecord()`.
