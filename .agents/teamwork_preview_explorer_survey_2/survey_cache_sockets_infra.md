# Phase 0 Survey Report: Multi-Tier Caching, Real-time Sockets, Batch Queueing & Infrastructure

**System**: 19 Jharkhand Battalion NCC Command Centre Platform (Sarala Birla University Sub-Unit)  
**Corpus**: Hellthefox808/NCC-CRM-V1.0  
**Investigator**: Explorer 2 (Teamwork Specialist)  
**Date**: 2026-08-21  
**Integrity Mode**: Development / Read-Only Survey

---

## Executive Summary

This survey provides a comprehensive architectural and code-level investigation into four critical platform subsystems within the 19 JHR BN NCC Command Centre:

1. **Multi-Tier Caching & Invalidation** (`cache.server.ts`, `redis.server.ts`, `rate-limiter.server.ts`)
2. **High-Throughput Batch Queueing** (`queue.service.ts`, `mailer.ts`, `templates.ts`)
3. **Real-time Sockets & Prompter Engine** (`socket.server.ts`, `prompter.service.ts`, `reminder.dispatcher.ts`, `reminder.rules.ts`, `scheduler.ts`)
4. **Infrastructure & Deployment** (`nginx.conf`, `Dockerfile`, `docker-compose.yml`, `server.ts`, `health.ts`, `metrics.ts`)

Across these subsystems, the codebase demonstrates clean modular separation and strong baseline engineering. However, the survey has uncovered specific concurrency bottlenecks, memory bound inconsistencies, cache stampede exposure, multi-node pub/sub isolation, and Nginx failover routing gaps that must be addressed during optimization phases.

---

## Section 1: Multi-Tier Caching & Invalidation

### 1.1 Architecture Overview

The platform employs a two-tier caching strategy designed to minimize latency and offload database reads:

- **Tier 1 (L1)**: In-memory bounded LRU cache implemented via JavaScript `Map` (`l1Cache` in `backend/lib/cache.server.ts`).
- **Tier 2 (L2)**: Distributed Redis cache (`redis.server.ts`) supporting dual connection modes (Upstash REST API or native TCP via `ioredis`), with an in-memory fallback store (`memoryStore`).
- **Authoritative Tier**: Supabase / PostgreSQL database accessed via asynchronous fetcher closures.

```text
Request Key Read
      │
      ▼
┌──────────────┐   HIT (< 1ms)
│   L1 (Map)   ├─────────────────► Return Data & Update LRU Position
└──────┬───────┘
       │ MISS
       ▼
┌──────────────┐   HIT (< 5ms)
│   L2 (Redis) ├─────────────────► Backfill L1 ──► Return Data
└──────┬───────┘
       │ MISS
       ▼
┌──────────────┐
│  DB Fetcher  ├─────────────────► Populate L1 & L2 (TTL) ──► Return Data
└──────────────┘
```

### 1.2 Capacity Limits & `MAX_MEMORY_ITEMS` Verification

A critical requirement is ensuring memory stores enforce strict LRU bounds to avoid unbounded memory leakage:

| File                                  | Memory Store Identifier | Max Capacity Setting      | Eviction Strategy                         | True LRU on Read?                                   |
| :------------------------------------ | :---------------------- | :------------------------ | :---------------------------------------- | :-------------------------------------------------- |
| `backend/lib/cache.server.ts`         | `l1Cache`               | `L1_MAX_ITEMS = 2000`     | Oldest key slice eviction on prune        | **Yes** (`delete` + `set` on hit)                   |
| `backend/lib/redis.server.ts`         | `memoryStore`           | `MAX_MEMORY_ITEMS = 5000` | Oldest key slice eviction on prune        | **No (FIFO)** (read hit does not refresh Map order) |
| `backend/lib/rate-limiter.server.ts`  | `store`                 | **None (Unbounded)**      | Periodic time cutoff filter (every 5 min) | **No** (vulnerable to IP spray attacks)             |
| `backend/services/ids/ids.service.ts` | `eventHistory`          | **None (Unbounded)**      | Shift items older than 15 min             | **No** (vulnerable to event flood)                  |

#### Detailed Observations & Deficiencies:

1. **Capacity Disparity**: `cache.server.ts` sets `L1_MAX_ITEMS = 2000`, whereas `redis.server.ts` fallback sets `MAX_MEMORY_ITEMS = 5000`. Requirement R2 calls for strict `MAX_MEMORY_ITEMS = 5000` ceilings.
2. **Pseudo-LRU in `redis.server.ts` Fallback**: In `redisGet()`, when an entry is read from `memoryStore`, it returns `entry.value` directly without re-inserting into the `Map`. As a result, frequently read keys remain in their initial insertion position and are prematurely evicted during `pruneMemoryStore()` when the 5,000 threshold is reached.
3. **Unbounded Rate-Limiter Store**: In `backend/lib/rate-limiter.server.ts`, `store = new Map<string, RateLimitEntry>()` has no size ceiling. If a distributed client sends millions of unique IPs, `store` grows indefinitely until the 5-minute periodic prune interval, creating memory pressure under sustained DDoS.

### 1.3 L2 Redis Connection & Failover Handling

In `backend/lib/redis.server.ts`:

- Connection resolution dynamically queries environment variables (`UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` or `REDIS_URL`).
- All Redis operations (`redisGet`, `redisSet`, `redisIncr`, `redisDel`, `redisDelPrefix`) wrap external calls in `try / catch` blocks.
- **Failover Behavior**: If Redis disconnects, timeouts, or throws, the catch block logs a warning (`console.warn`) and immediately delegates the operation to `memoryStore`.
- **Failover Observation**: The failover is safe and non-blocking, but in-memory state is isolated to that specific Node.js process and will not sync back to Redis once the connection recovers.

### 1.4 Cache Stampede (Single-Flight) Gap

In `backend/lib/cache.server.ts` (lines 45–88):

```ts
export async function getOrSetCache<T>(
  key: string,
  ttlSeconds: number,
  fetcher: () => Promise<T>,
): Promise<T> {
  // 1. L1 check ...
  // 2. L2 check ...
  // 3. Cache Miss — Execute Fetcher
  const freshData = await fetcher();
  // 4. Update L1 and L2 ...
}
```

- **Vulnerability**: If 50 concurrent requests hit an expired or cold key simultaneously (e.g. during high-traffic calendar or activity page loads), all 50 requests experience a cache miss and trigger `fetcher()` concurrently before the first response can write to L1/L2.
- **Recommendation**: Implement an in-flight promise deduplication map (`Map<string, Promise<T>>`) to coalesce concurrent misses into a single fetch execution.

### 1.5 Prefix Invalidation & Upstash Omission Bug

In `backend/lib/cache.server.ts`, `invalidateCachePrefix(prefix)` purges matching keys from `l1Cache` and delegates to `redisDelPrefix(prefix)`.
In `backend/lib/redis.server.ts` (lines 275–302):

```ts
export async function redisDelPrefix(prefix: string): Promise<boolean> {
  try {
    const ioClient = await getIoRedisClient();
    if (ioClient && ioClient.status === "ready") {
      const matchingKeys = await rawClient.keys(`${prefix}*`);
      if (matchingKeys && matchingKeys.length > 0) {
        await rawClient.del(...matchingKeys);
      }
    }
  } catch (err) { ... }
  // Memory fallback prefix deletion ...
}
```

- **Defects Identified**:
  1. **Upstash Client Skipped**: `getUpstashClient()` is completely absent from `redisDelPrefix`. If Upstash Redis is used, keys matching the prefix remain cached in Upstash, causing stale reads across serverless deployments.
  2. **Blocking `KEYS` Command**: For `ioredis`, using `KEYS ${prefix}*` blocks the Redis single-threaded event loop on large databases. Production-grade invalidation should use `SCAN` with cursor batches or maintain an active key set index.

### 1.6 Hit/Miss Telemetry & Metrics

- **Current State**: Neither `cache.server.ts` nor `redis.server.ts` records cache performance metrics.
- **Gap**: Zero observability into L1 hit rates, L2 hit rates, miss counts, or eviction frequency in `/api/v1/metrics` or `/api/v1/health`.

---

## Section 2: High-Throughput Batch Queueing

### 2.1 Queue Service Architecture

Transactional email and notification dispatches are managed via `backend/services/queue/queue.service.ts` backed by the `email_jobs` and `email_delivery_logs` Supabase database tables.

```text
HTTP Request (e.g., Event Created)
      │
      ▼
queueEmailJobsBatch(jobs) ──► Single Batch INSERT into `email_jobs` (status: 'PENDING')
      │
      ▼ (setTimeout 50ms)
processPendingEmailJobs()
      │
      ├─► SELECT up to 10 PENDING jobs (scheduled_at <= now)
      ├─► UPDATE status = 'PROCESSING', attempts++
      ├─► Execute mailer handler (sendEventCreated, sendOtp, etc.)
      └─► Success: UPDATE 'COMPLETED' + INSERT `email_delivery_logs` ('SENT')
          Failure: attempts >= 3 ? 'FAILED' : 'PENDING' + INSERT `email_delivery_logs` ('FAILED')
```

### 2.2 `queueEmailJobsBatch` Implementation

- Accepts `jobs: Array<{ jobType, recipient, payload, scheduledAt? }>`.
- Returns `{ success: true, enqueuedCount: 0 }` immediately when given an empty array.
- Maps all items into a single array and calls `admin.from("email_jobs").insert(rows)` in one round trip.
- Fires a non-blocking background execution cycle using `setTimeout(() => processPendingEmailJobs(), 50)`.

### 2.3 Queue Execution Bottlenecks & Concurrency Deficiencies

#### 1. Hardcoded Batch Limit & Lack of Queue Draining

- `processPendingEmailJobs()` fetches with `.limit(10)`.
- If an officer creates an event broadcasting to 200 cadets via `queueEmailJobsBatch(200_jobs)`, only the first 10 jobs will be executed by the single `setTimeout` trigger!
- The remaining 190 jobs remain `PENDING` indefinitely unless an external cron or subsequent enqueue triggers another run.
- **Fix**: The processor must loop until no pending jobs remain (or up to a safe execution timeout).

#### 2. Sequential Execution vs SMTP Connection Pool

- In `backend/services/mail/mailer.ts`:
  ```ts
  nodemailer.createTransport({
    pool: true,
    maxConnections: 5,
    maxMessages: 100,
    rateLimit: 14,
  });
  ```
- In `processPendingEmailJobs()`:
  ```ts
  for (const job of jobs) {
    // ... await mailer.send*(...) sequentially
  }
  ```
- Although the SMTP transport supports 5 concurrent connections, the worker processes jobs strictly one by one in a serial loop. At ~300ms per SMTP handshake/send, processing 10 jobs takes 3+ seconds.
- **Fix**: Execute batch jobs concurrently with controlled parallelism (concurrency: 5) matching the pool limit.

#### 3. Concurrent Worker Race Conditions

- If two HTTP requests enqueue jobs concurrently, two `processPendingEmailJobs()` cycles run in parallel.
- Both workers may execute `.select("*").eq("status", "PENDING").limit(10)` before either has executed the `.update({ status: "PROCESSING" })` step.
- Both workers will fetch and dispatch the same email jobs, causing duplicate emails to be sent to cadets.
- **Fix**: Implement an atomic status reservation (e.g. database RPC `claim_email_jobs` with `FOR UPDATE SKIP LOCKED` or unique processing lock in Redis).

#### 4. Anti-Pattern in Dependent Services

In several API routes and dispatcher files, single `queueEmailJob` is called inside a `for ... of` loop instead of calling `queueEmailJobsBatch`:

- `backend/services/prompter/reminder.dispatcher.ts` (lines 89–97)
- `src/routes/api/v1/calendar.$id.cancel.ts` (lines 54–61)
- `src/routes/api/v1/calendar.$id.ts` (lines 113–124)
- When dispatching to 500 cadets, this causes 500 sequential DB insert calls and spawns 500 timer callbacks.

---

## Section 3: Real-time Sockets & Prompter Engine

### 3.1 Socket.IO Lifecycle & Server Configuration

In `backend/services/socket/socket.server.ts`:

- Attached to HTTP Server on path `/socket.io/`.
- Configured with `pingInterval: 15000` (15s) and `pingTimeout: 10000` (10s).
- Authenticates incoming handshakes via `socket.handshake.auth.token` or headers.
- Auto-populates `socket.user` (`id`, `email`, `role`).

### 3.2 Channel & Room Membership Model

Upon successful connection, sockets automatically join:

- `user:${user.id}` (private Cadet / Officer channel)
- `notification:user:${user.id}` (targeted notification feed)
- `role:${user.role}` (e.g. `role:OFFICER`, `role:CADET`)
- `calendar` (battalion-wide schedule events)
- `notification:global` (all-cadre emergency/general announcements)

Dynamic Event Subscriptions:

- `join_event_room(eventId)` -> joins `calendar:event:${eventId}` (with `< 100` length sanitization)
- `leave_event_room(eventId)` -> leaves `calendar:event:${eventId}`

Broadcast Helper APIs:

- `emitCalendarEventCreated(event)` -> broadcasts to `calendar`
- `emitCalendarEventUpdated(event)` -> broadcasts to `calendar` and `calendar:event:${id}`
- `emitCalendarEventCancelled(eventId, reason)` -> broadcasts to `calendar` and `calendar:event:${id}`
- `emitCalendarUpdate(payload)` -> broadcasts to `calendar`
- `emitNotification(notification, targetUserId?)` -> broadcasts to user room or `notification:global`
- `PRESENCE_UPDATE` -> broadcasts active cadet connection count

### 3.3 Reconnection Resilience & Ping RTT

- Built-in Socket.IO ping/pong heartbeat guarantees transport-level connection detection.
- Explicit `socket.on("ping", ...)` listener provides application-level Round-Trip-Time (RTT) timestamps for latency calculation.
- On client disconnect, `activeConnectionCount` decrements safely (`Math.max(0, count - 1)`) and publishes updated presence.

### 3.4 Multi-Node Clustering Limitation

- `activeConnectionCount` is an in-memory scalar variable (`let activeConnectionCount = 0`).
- Socket.IO emits directly to the local node's `ioInstance`.
- In the multi-node Docker deployment (`ncc-app-1` and `ncc-app-2`), if an officer connects to Node 1 and updates a calendar event, cadets connected to Node 2 will **not** receive the WebSocket event because no Redis Pub/Sub adapter (`@socket.io/redis-adapter`) is attached.

### 3.5 Prompter Engine Architecture

The prompter subsystem automates schedule reminders across time windows:

- **Reminder Rules** (`backend/services/prompter/reminder.rules.ts`):
  1. **T-24 Hours** (1440 min offset): Channel `BOTH` (Email + Socket.IO)
  2. **T-2 Hours** (120 min offset): Channel `BOTH` (Email + Socket.IO)
  3. **T-30 Minutes** (30 min offset): Channel `SOCKET_IO`
  4. **T-0 (Event Start)** (0 min offset): Channel `SOCKET_IO`
- **Schedule Calculation**:
  `scheduled_for = new Date(new Date(eventStartTime).getTime() - offsetMinutes * 60 * 1000).toISOString()`
- **Lifecycle Synchronization**:
  - `setupEventReminders`: creates 4 scheduled database records in `calendar_event_reminders`.
  - `updateEventReminders`: cancels previous `PENDING` reminders and creates a refreshed schedule if `start_time` changes.
  - `cancelEventReminders`: marks all pending reminders as `CANCELLED`.
- **Scheduler Worker** (`backend/services/prompter/scheduler.ts`):
  - `startPrompterScheduler(intervalMs = 30000)`: ticks every 30s.
  - Fetches up to 20 due reminders (`status = 'PENDING' AND scheduled_for <= now()`).
  - Calls `dispatchReminder(payload)` to trigger Socket broadcasts, in-app notifications, and queued email reminders.

---

## Section 4: Infrastructure, Nginx Load Balancer & Deployment Architecture

### 4.1 Nginx Reverse Proxy Architecture

Defined in `nginx/nginx.conf`:

- **Worker Configuration**: `worker_processes auto; worker_connections 2048; multi_accept on;`.
- **Traffic Routing Zones**:
  - `limit_req_zone $binary_remote_addr zone=api_auth_limit:10m rate=10r/s;` (protects `/api/v1/auth/` with `burst=20 nodelay`).
  - `limit_req_zone $binary_remote_addr zone=api_general_limit:10m rate=60r/s;` (protects `/` with `burst=50 nodelay`).
- **Upstream Backend Cluster**:
  ```nginx
  upstream ncc_backend {
      least_conn;
      server ncc-app-1:3000 max_fails=3 fail_timeout=10s;
      server ncc-app-2:3000 max_fails=3 fail_timeout=10s;
      keepalive 32;
  }
  ```
- **Upstream WebSocket Cluster**:
  ```nginx
  upstream ncc_socketio {
      ip_hash;
      server ncc-app-1:3000;
      server ncc-app-2:3000;
  }
  ```

### 4.2 Failover Handling Audit

In `location /`:

- `proxy_next_upstream error timeout invalid_header http_500 http_502 http_503;`
- `proxy_connect_timeout 5s;`
- When `ncc-app-1` goes down, Nginx transparently retries the request on `ncc-app-2` without user disruption.

#### Identified Infrastructure Gaps:

1. **Missing `proxy_next_upstream` on Auth Endpoint**: `location /api/v1/auth/` defines rate limits and proxy pass, but omits `proxy_next_upstream`. If `ncc-app-1` crashes during a cadet login or OTP verification, the client receives a 502 Bad Gateway instead of being failed over to `ncc-app-2`.
2. **Missing `proxy_next_upstream` on Health Probe**: `location = /api/v1/health` omits `proxy_next_upstream`.
3. **Socket Upstream Health Parameters**: `upstream ncc_socketio` entries lack `max_fails=3 fail_timeout=10s`.

### 4.3 Container & Multi-Node Orchestration

- **Dockerfile**:
  - Multi-stage build with `node:22-alpine`.
  - Non-root user `nccapp` (UID 1001, GID 1001).
  - Healthcheck: `wget --no-verbose --tries=1 --spider http://localhost:3000/api/v1/health?type=liveness || exit 1`.
- **docker-compose.yml**:
  - `nginx`: Ports 80 and 3000; depends on both app nodes being healthy.
  - `redis`: Redis 7 Alpine with persistent storage volume and healthcheck `redis-cli ping`.
  - `ncc-app-1` & `ncc-app-2`: Independent application containers connected to `redis:6379`.
- **Health Probing**:
  - Liveness probe (`/api/v1/health?type=liveness`): lightweight process check.
  - Readiness/Health probe (`/api/v1/health`): verifies PostgreSQL DB latency, Redis status, and memory stats.

### 4.4 Test Runner Globbing on Windows

- In `package.json`: `"test": "node --import tsx --test backend/tests/*.test.ts"`.
- When running on Windows cmd/powershell, glob expansion executes 11 suites instead of all 12 test files (`cache.test.ts` was skipped when running raw glob).
- When explicitly executed (`npx tsx --test backend/tests/cache.test.ts`), all 7 tests in `cache.test.ts` pass cleanly in 158ms.
- **Recommendation**: Standardize test script in `package.json` to ensure cross-platform test discovery across all test files.

---

## Section 5: Optimization & Hardening Recommendations Roadmap

| ID         | Domain   | Issue / Defect                                                                        | Severity   | Affected Files                                                                                                                      | Recommended Optimization                                                                                    |
| :--------- | :------- | :------------------------------------------------------------------------------------ | :--------- | :---------------------------------------------------------------------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------- |
| **OPT-1**  | Caching  | `redisDelPrefix` bypasses Upstash REST API                                            | **HIGH**   | `backend/lib/redis.server.ts`                                                                                                       | Implement Upstash SCAN/DEL loop for prefix deletion.                                                        |
| **OPT-2**  | Caching  | Cache stampede exposure on cold misses                                                | **HIGH**   | `backend/lib/cache.server.ts`                                                                                                       | Add in-flight promise deduplication map to `getOrSetCache`.                                                 |
| **OPT-3**  | Memory   | In-memory stores lack strict `MAX_MEMORY_ITEMS = 5000` bounds                         | **HIGH**   | `backend/lib/rate-limiter.server.ts`, `backend/services/ids/ids.service.ts`, `backend/lib/cache.server.ts`                          | Enforce 5,000 item LRU ceiling across all in-memory stores; fix pseudo-LRU in `redis.server.ts` fallback.   |
| **OPT-4**  | Queues   | Queue processor only executes 10 jobs per trigger without draining                    | **HIGH**   | `backend/services/queue/queue.service.ts`                                                                                           | Implement draining loop in `processPendingEmailJobs` until pending queue is empty.                          |
| **OPT-5**  | Queues   | Sequential email sending underutilizes SMTP connection pool (5 max conns)             | **MEDIUM** | `backend/services/queue/queue.service.ts`                                                                                           | Process batch jobs concurrently (concurrency = 5) via `Promise.allSettled`.                                 |
| **OPT-6**  | Sockets  | Multi-node cluster lacks Redis Pub/Sub adapter for WebSocket broadcasts               | **HIGH**   | `backend/services/socket/socket.server.ts`                                                                                          | Integrate `@socket.io/redis-adapter` so events emitted on Node 1 reach Node 2.                              |
| **OPT-7**  | Infra    | Nginx `/api/v1/auth/` missing `proxy_next_upstream` failover configuration            | **MEDIUM** | `nginx/nginx.conf`                                                                                                                  | Add `proxy_next_upstream error timeout http_500 http_502 http_503` to `/api/v1/auth/` and `/api/v1/health`. |
| **OPT-8**  | Caching  | Zero cache hit/miss telemetry or observability                                        | **LOW**    | `backend/lib/cache.server.ts`, `src/routes/api/v1/metrics.ts`                                                                       | Track and export `l1Hits`, `l1Misses`, `l2Hits`, `l2Misses`, `hitRatio` in metrics.                         |
| **OPT-9**  | Batching | Dependent modules use single `queueEmailJob` in loop instead of `queueEmailJobsBatch` | **MEDIUM** | `backend/services/prompter/reminder.dispatcher.ts`, `src/routes/api/v1/calendar.$id.cancel.ts`, `src/routes/api/v1/calendar.$id.ts` | Replace loop of single inserts with single atomic `queueEmailJobsBatch` call.                               |
| **OPT-10** | Testing  | Test script glob skips `cache.test.ts` on Windows shell                               | **LOW**    | `package.json`                                                                                                                      | Update test script to explicitly match all 12 test files across operating systems.                          |

---
