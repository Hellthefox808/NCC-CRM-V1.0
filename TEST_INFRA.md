# E2E Test Infra: 19 Jharkhand Battalion NCC Platform

## Test Philosophy
- **Opaque-box & Requirement-driven**: Tests validate system boundaries, APIs, security contracts, data transformations, and cryptographic guarantees independently of internal implementation details.
- **Methodology**: Category-Partition + Boundary Value Analysis + Pairwise Combinatorial Testing + Real-World Workload Testing.
- **Performance Threshold**: All test suites must execute deterministically in memory and complete under **2.0 seconds** total duration.

## Feature Inventory Mapping
| # | Feature | Requirement | Tier 1 | Tier 2 | Tier 3 | Tier 4 | Stress (Tier 5) |
|---|---|---|:---:|:---:|:---:|:---:|:---:|
| 1 | Scrypt Password Hashing & Timing Safety | R1. Auth | 5 | | | | |
| 2 | OTP Lifecycle, Throttling & Lockout | R1. Auth | 5 | | | | |
| 3 | Single-Use Activation Tokens | R1. Auth | 5 | 5 | | | |
| 4 | Session Security & Invalidation | R1. Auth | 5 | 5 | | | |
| 5 | RBAC & Middleware Security Gates | R1. Auth | 5 | 5 | | | |
| 6 | Form 1 Cadet Enrollment Validation | R1. Cadet | 5 | 5 | | 5 | |
| 7 | 18-Digit Unique Application ID | R1. Cadet | 5 | 5 | | 5 | 10k Monte Carlo |
| 8 | UIDAI Verhoeff Aadhaar Checksum | R1. Cadet | 5 | | | | |
| 9 | PII Masking & PostgREST Sanitization | R1. Cadet | 5 | 5 | | 5 | |
| 10 | TypeScript & Lint Type Safety | R3. Quality | ✓ | ✓ | ✓ | ✓ | ✓ |
| 11 | Multi-Tier LRU Cache Bounds (5000) | R2. Cache | | | 5 | | 20k heap test |
| 12 | Rate Limiter LRU Memory Bounds | R2. Cache | | | 5 | | 10k IP burst |
| 13 | Single-Flight Cache Deduplication | R2. Cache | | | 5 | | 100 concurrent |
| 14 | Upstash / Redis Prefix Invalidation | R2. Cache | | | 5 | | |
| 15 | Cache Telemetry & Observability | R2. Cache | | | 5 | | |
| 16 | Batch Queue Draining & Concurrency | R2. Queue | | | 5 | | 500 burst |
| 17 | Batch Queue Dispatchers | R2. Queue | | 5 | 5 | | |
| 18 | Real-Time Sockets & Room Isolation | R1. Sockets | | | | 5 | 50 churn |
| 19 | Prompter Engine Reschedule & Invalidation | R1. Sockets | | 5 | | | |
| 20 | Nginx Failover & Rate Limiting | R2. Infra | | | | 5 | |

## Test Architecture
- **Test Runner**: Node.js Native Test Runner (`node:test`) + `tsx/esm` loader.
- **Assertion Library**: `node:assert/strict`.
- **Invocation Command**: `npm run test` (or `node --import tsx --test backend/tests/*.test.ts`).
- **Test Directory Layout**:
  - `backend/tests/tier1-crypto-auth.test.ts`
  - `backend/tests/tier1-enrollment-validation.test.ts`
  - `backend/tests/tier1-sanitization-ids.test.ts`
  - `backend/tests/tier2-cadet-lifecycle.test.ts`
  - `backend/tests/tier2-storage-capability.test.ts`
  - `backend/tests/tier2-prompter-reminders.test.ts`
  - `backend/tests/tier3-cache-concurrency.test.ts`
  - `backend/tests/tier3-rate-limiter-bounds.test.ts`
  - `backend/tests/tier3-batch-queue.test.ts`
  - `backend/tests/tier4-socket-engine.test.ts`
  - `backend/tests/tier4-pipeline-e2e.test.ts`
  - `backend/tests/stress-boundary.test.ts`

## Coverage Thresholds
- **Tier 1**: $\ge 5$ test cases per feature covering happy-path and boundary condition validation.
- **Tier 2**: $\ge 5$ test cases per state machine and integration workflow.
- **Tier 3**: $\ge 5$ test cases per concurrency and caching component including sub-ms microbenchmark.
- **Tier 4**: $\ge 5$ real-world end-to-end and socket integration scenarios.
- **Stress / Tier 5**: 10,000-iteration ID uniqueness Monte Carlo test and 20,000-operation bounded heap memory leak test.
- **Total Minimum Target**: 100+ automated test cases with 100% pass rate under <2.0s execution time.
