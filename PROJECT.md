# Project: 19 Jharkhand Battalion NCC Command Centre Platform Verification & Optimization

## Architecture
The 19 Jharkhand Battalion NCC Command Centre platform is a mission-critical web and API service supporting cadet enrollment, ANO verification, multi-channel dispatch (Email/WhatsApp/SMS), calendar event scheduling, prompter reminders, and multi-tier cached real-time telemetry.

```text
                                 ┌─────────────────────────┐
                                 │   Nginx Load Balancer   │ (least_conn, failover, rate-limits)
                                 └────────────┬────────────┘
                                              │
                      ┌───────────────────────┴───────────────────────┐
                      ▼                                               ▼
         ┌─────────────────────────┐                     ┌─────────────────────────┐
         │  App Node 1 (SSR/API)   │                     │  App Node 2 (SSR/API)   │
         │   • L1 LRU Cache        │                     │   • L1 LRU Cache        │
         │   • Socket.IO Server    │                     │   • Socket.IO Server    │
         │   • Queue Worker Pool   │                     │   • Queue Worker Pool   │
         └────────────┬────────────┘                     └────────────┬────────────┘
                      │                                               │
                      └───────────────────────┬───────────────────────┘
                                              │
                         ┌────────────────────┴────────────────────┐
                         ▼                                         ▼
            ┌─────────────────────────┐               ┌─────────────────────────┐
            │   Redis Cluster (L2)    │               │  Supabase / PostgreSQL  │
            │ (Upstash REST / ioredis)│               │ (Auth, Cadets, Events)  │
            └─────────────────────────┘               └─────────────────────────┘
```

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---|---|---|---|
| 1 | Password Hashing (scrypt) & Policy | Salted scrypt key derivation (N=16384, r=8, p=1, 64B), constant-time verification (`timingSafeEqual`), 8-128 char password policy. | M1 | Survey E1 |
| 2 | OTP Lifecycle & Brute-Force Lockout | 6-digit numeric OTP, SHA-256 digest storage, 10m TTL, 45s resend cooldown, 5-attempt brute-force lockout. | M1 | Survey E1 |
| 3 | Single-Use Activation Tokens | 256-bit entropy token, SHA-256 hashed storage, 24h/30m TTL, atomic consumption, replay protection. | M1 | Survey E1 |
| 4 | Session Security & Invalidation | 256-bit `sess_` tokens, 8h TTL, HttpOnly cookies, multi-tier cache with instant purge on logout. | M1 | Survey E1 |
| 5 | RBAC & Middleware Gates | Server-side role enforcement (`requireOfficer`, `requireCadetSession`, Supabase JWT). | M1 | Survey E1 |
| 6 | Form 1 Cadet Enrollment Validation | Zod schema validation for personal, academic, physical, and DBT bank data, age 15–28. | M1 | Survey E1 |
| 7 | 18-Digit Unique Application ID | Format `19` + `YYYYMMDD` + 8 random digits, collision-resistant generation and formatted display. | M1 | Survey E1 |
| 8 | UIDAI Verhoeff Aadhaar Checksum | Official UIDAI Verhoeff algorithm ($D_5$) validation for 12-digit Aadhaar numbers. | M1 | Survey E1 |
| 9 | PII Data Protection & Sanitization | Public status masking (`maskPublicRecord`), nominal roll masking (`mapCadet`), PostgREST query injection prevention. | M1 | Survey E1 |
| 10 | TypeScript & Lint Type Safety | Resolve TS errors in calendar/cadet route files; optimize ESLint ignore rules for fast analysis. | M1 | Survey E3 |
| 11 | Multi-Tier LRU Cache Bounds (5000) | Enforce strict `MAX_MEMORY_ITEMS = 5000` ceiling with true LRU eviction across L1 and Redis in-memory fallback. | M2 | Survey E2 |
| 12 | Rate Limiter LRU Memory Bounds | Add 5,000 item bounded LRU ceiling to `rate-limiter.server.ts` and `ids.service.ts`. | M2 | Survey E2 |
| 13 | Single-Flight Cache Deduplication | In-flight promise deduplication in `getOrSetCache` to eliminate thundering herd cache stampedes. | M2 | Survey E2 |
| 14 | Upstash Prefix Invalidation & SCAN | Implement Upstash SCAN/DEL loop and non-blocking SCAN for ioredis in `redisDelPrefix`. | M2 | Survey E2 |
| 15 | Cache Telemetry & Observability | Track and expose L1/L2 hits, misses, hit ratio, and eviction metrics in `/api/v1/metrics`. | M2 | Survey E2 |
| 16 | Batch Queue Draining & Concurrency | Queue draining loop in `processPendingEmailJobs` with concurrent worker execution (5 concurrent pool connections). | M2 | Survey E2 |
| 17 | Batch Queue Adoption in Dispatchers | Migrate loops of single `queueEmailJob` calls to `queueEmailJobsBatch` in calendar and reminder routes. | M2 | Survey E2 |
| 18 | Real-Time Sockets & Room Isolation | Socket connection auth, room derivation (`user:id`, `role:role`, `calendar`), presence tracking, event broadcast security. | M3 | Survey E2 |
| 19 | Prompter Engine Reschedule & Invalidation | Dynamic reminder calculation (24h, 2h, 30m, 0m), atomic reminder invalidation and reschedule on event updates. | M3 | Survey E2 |
| 20 | Nginx Load-Balancer Failover | Add `proxy_next_upstream` to `/api/v1/auth/` and `/api/v1/health` location blocks for seamless failover. | M3 | Survey E2 |
| 21 | Tier 1 Unit & Crypto Test Suite | `tier1-crypto-auth.test.ts`, `tier1-enrollment-validation.test.ts`, `tier1-sanitization-ids.test.ts`. | M4 | Survey E3 |
| 22 | Tier 2 State Machine & Integration Suite | `tier2-cadet-lifecycle.test.ts`, `tier2-storage-capability.test.ts`, `tier2-prompter-reminders.test.ts`. | M4 | Survey E3 |
| 23 | Tier 3 Concurrency & Caching Suite | `tier3-cache-concurrency.test.ts` (sub-ms benchmark), `tier3-rate-limiter-bounds.test.ts`, `tier3-batch-queue.test.ts`. | M4 | Survey E3 |
| 24 | Tier 4 Real-Time Sockets & Pipeline Suite | `tier4-socket-engine.test.ts`, `tier4-pipeline-e2e.test.ts`. | M4 | Survey E3 |
| 25 | Stress, Boundary & Memory Leak Suite | `stress-boundary.test.ts` (10k ID uniqueness Monte Carlo, heap memory bounds, malformed input fuzzing). | M5 | Survey E3 |
| 26 | Final Full Verification & Forensic Audit | 100% test pass rate (<2s total duration), clean build, zero TS/lint errors, Challenger review, Forensic Audit. | M5 | Survey E3 |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|---|---|---|---|
| M1 | Core Security, Identity & Verification Hardening | Verhoeff Aadhaar checksum, TS route typing fixes, ESLint ignore rules, Auth/OTP/token edge cases. | none | PLANNED |
| M2 | High-Throughput Caching, Memory Bounds & Batch Queueing | MAX_MEMORY_ITEMS = 5000 LRU ceilings, single-flight cache, Upstash prefix invalidation, queue draining & concurrent worker. | M1 | PLANNED |
| M3 | Sockets, Prompter Engine & Nginx Failover | Nginx proxy_next_upstream failover, socket room isolation, prompter reminder atomic lifecycle. | M2 | PLANNED |
| M4 | Comprehensive E2E Testing Track (Tiers 1–4) | Implement Tiers 1-4 test suites covering all 24 inventory features, publish TEST_READY.md. | M1, M2, M3 | PLANNED |
| M5 | Final Stress/Boundary Verification & Forensic Audit | Stress suite (10k ID uniqueness, heap memory bounds), 100% test pass (<2s), clean build, zero TS/lint, Challenger & Auditor sign-off. | M4 | PLANNED |

## Interface Contracts

### Verhoeff Checksum Utility (`backend/lib/sanitization.ts`)
```typescript
export function validateVerhoeff(input: string): boolean;
export function sanitizeAadhaar(input: string): string; // Throws on non-12-digit or invalid Verhoeff checksum
```

### Multi-Tier Bounded Cache (`backend/lib/cache.server.ts`)
```typescript
export const MAX_MEMORY_ITEMS: number = 5000;
export async function getOrSetCache<T>(key: string, ttlSeconds: number, fetcher: () => Promise<T>): Promise<T>;
export function invalidateCache(key: string): void;
export async function invalidateCachePrefix(prefix: string): Promise<void>;
export function getCacheStats(): { l1Hits: number; l1Misses: number; l2Hits: number; l2Misses: number; l1Size: number; hitRatio: number };
```

### High-Throughput Batch Queue (`backend/services/queue/queue.service.ts`)
```typescript
export interface BatchEmailJobInput {
  jobType: "OTP" | "WELCOME" | "APPLICATION_APPROVED" | "APPLICATION_REJECTED" | "EVENT_CREATED" | "EVENT_REMINDER";
  recipient: string;
  payload: Record<string, unknown>;
  scheduledAt?: string;
}
export async function queueEmailJobsBatch(jobs: BatchEmailJobInput[]): Promise<{ success: boolean; enqueuedCount: number; batchId?: string }>;
export async function processPendingEmailJobs(): Promise<{ processedCount: number; failedCount: number }>;
```

## Code Layout
- `backend/lib/`: Core utilities (`auth-otp.server.ts`, `cache.server.ts`, `redis.server.ts`, `rate-limiter.server.ts`, `sanitization.ts`, `validation.schemas.ts`, `cadet-registry.server.ts`, `ncc-db.ts`).
- `backend/services/`: Domain services (`queue/`, `mail/`, `socket/`, `prompter/`, `ids/`, `storage/`, `messaging/`).
- `backend/tests/`: Automated test suites (`*.test.ts`, `tier1-*.test.ts`, `tier2-*.test.ts`, `tier3-*.test.ts`, `tier4-*.test.ts`, `stress-boundary.test.ts`).
- `src/routes/`: Web & API route endpoints (`api/v1/auth/`, `api/v1/enrollments/`, `api/v1/calendar/`, `api/v1/ano/`, `api/v1/health.ts`, `api/v1/metrics.ts`).
- `nginx/`: Reverse proxy configuration (`nginx.conf`).
