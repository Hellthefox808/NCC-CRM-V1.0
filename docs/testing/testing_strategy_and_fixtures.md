# Testing Strategy, Test Fixtures & Quality Gates

**Platform:** 19 Jharkhand Battalion NCC Command Centre  
**Test Harness:** Native Node.js Test Runner (`node:test`, `node:assert/strict`)  
**Coverage Standard:** 100% of critical authentication, sanitization, concurrency, and lifecycle paths.  

---

## 1. Testing Hierarchy & Architectural Philosophy

The testing harness follows a 4-Tier stratified approach with dedicated stress and boundary fuzzing:

```text
┌────────────────────────────────────────────────────────┐
│           Stress & Boundary Fuzzing (Tier 5)           │ 10k ID Collision, Heap Bounds, Injection Neutralization
├────────────────────────────────────────────────────────┤
│     Tier 4: Real-Time Sockets & E2E Pipeline Tests     │ Room Isolation, Event Broadcasting, Full Cadet Lifecycle
├────────────────────────────────────────────────────────┤
│  Tier 3: Concurrency, Caching & Performance Benchmark  │ Single-Flight Stampede Prevention, Sub-ms Benchmark
├────────────────────────────────────────────────────────┤
│   Tier 2: Cadet State Machine & Domain Service Tests   │ Induction Progress, Magic-Byte ASVS 5.0, Prompter Rules
├────────────────────────────────────────────────────────┤
│ Tier 1: Cryptographic Pipeline, Auth & Security Tests  │ Salted Scrypt, OTP Lockout, Verhoeff Checksum, PII Masking
└────────────────────────────────────────────────────────┘
```

---

## 2. Test Execution Command & Flags

Run all test suites with node:test:

```bash
# Execute full suite across all tiers
npm run test
```

Command configuration in `package.json`:
```json
"test": "node --no-warnings --loader ts-node/esm --test backend/tests/*.test.ts"
```

---

## 3. Test Suites Breakdown

### Tier 1: Cryptographic Pipeline & Data Validation
1. **`backend/tests/tier1-crypto-auth.test.ts`**:
   - Salted scrypt key derivation ($N=16384, r=8, p=1$, 64-byte key).
   - Uniform 6-digit numeric OTP generation, cooldown enforcement, and 5-attempt brute-force lockout.
   - 256-bit activation token issuance, atomic single-use consumption, and replay rejection.
   - Bearer session token extraction from `Authorization` header and cookie with 401 gate rejection for unauthenticated requests.
2. **`backend/tests/tier1-enrollment-validation.test.ts`**:
   - Strict Indian mobile format validation (`[6-9]\d{9}`).
   - Aadhaar number space stripping and UIDAI Verhoeff checksum validation.
   - SBU roll number format and course requirements.
   - Physical boundary validations: height (120–250cm), weight (30–150kg), 1600m run timings (`MM:SS`).
3. **`backend/tests/tier1-sanitization-ids.test.ts`**:
   - Mathematical Dihedral Group $D_5$ Verhoeff algorithm verification against official test vectors.
   - 18-digit unique application ID generation with `19` + `YYYYMMDD` + 8 random digits.
   - PII data masking: public lookup stripping (`maskPublicRecord`) and partial tail masking (`mapCadet`).
   - Query injection protection: `sanitizePostgrestQuery()` and `sanitizeSearchQuery()`.

### Tier 2: State Machines & Domain Services
4. **`backend/tests/tier2-cadet-lifecycle.test.ts`**:
   - Initial enrollment state initialization with `PENDING_ANO_REVIEW`.
   - ANO approval and rejection state transitions with mandatory rejection remarks.
   - 5-stage cadet induction progress tracking and automatic transition to `ACTIVE` upon 5/5 completion.
5. **`backend/tests/tier2-storage-capability.test.ts`**:
   - Opaque 256-bit bearer capability storage tokens with SHA-256 resting token hashes.
   - Magic-byte file header verification (OWASP ASVS 5.0 V12) for PDF, PNG, JPEG.
   - Rejection of disguised ELF, PE MZ, and HTML script payloads attempting extension spoofing.
   - Upload intent creation with 10MB size limits.
6. **`backend/tests/tier2-prompter-reminders.test.ts`**:
   - Default reminder schedule (24h, 2h, 30m, 0m start offsets).
   - Dynamic schedule recalculation and atomic invalidation on event rescheduling.

### Tier 3: Concurrency, Caching & Performance
7. **`backend/tests/tier3-cache-concurrency.test.ts`**:
   - Single-flight in-flight promise deduplication: 50 simultaneous concurrent cold cache requests execute the authoritative fetcher exactly once.
   - Sub-millisecond response time benchmark (<1.0ms on L1 cache hits).
   - Telemetry accuracy: hits, misses, size, and hit ratio percentage tracking.
   - Prefix invalidation and strict `L1_MAX_ITEMS = 5000` LRU capacity bounds.
8. **`backend/tests/tier3-rate-limiter-bounds.test.ts`**:
   - Sliding-window rate limiting semantics.
   - Capacity bound verification under 10,000 unique IP bursts without memory leaks.
9. **`backend/tests/tier3-batch-queue.test.ts`**:
   - Atomic batch email job enqueueing (100+ jobs in single operation).
   - Worker draining loop with retry threshold ceilings.

### Tier 4: Real-Time Sockets & End-to-End Pipeline
10. **`backend/tests/tier4-socket-engine.test.ts`**:
    - Socket.IO server initialization with environment-controlled CORS and ping timings.
    - Strict room derivation: `user:id`, `role:role`, `calendar`, `cadre:enrollments`.
    - Broadcast methods: `emitStatusUpdated`, `emitNotification`, `emitCalendarEventCreated`.
11. **`backend/tests/tier4-pipeline-e2e.test.ts`**:
    - Full cadet journey: Form 1 submission -> Zod validation -> 18-digit ID generation -> DB ingestion -> PII masking -> transactional email queueing -> ANO review -> activation token -> scrypt password setup -> authenticated bearer session.

### Stress, Boundary & Anti-Bot Track
12. **`backend/tests/stress-boundary.test.ts`**:
    - 10,000 ID generation collision resistance Monte Carlo verification.
    - Heap memory stability under 10,000 rapid cache insertions.
    - Malicious fuzz vector sanitization against PostgREST injection.
    - CSV formula injection protection (`=cmd`, `@SUM`, `-2+3`, `+4-5`).
