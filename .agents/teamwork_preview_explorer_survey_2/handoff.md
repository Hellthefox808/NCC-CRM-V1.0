# Handoff Report: Phase 0 Survey (Cache, Sockets, Prompter, Batch Queues, Infrastructure)

**Agent**: Explorer 2  
**Date**: 2026-08-21  
**Status**: Survey Complete (Hard Handoff)  
**Deliverable Path**: `c:\Users\ravir\Desktop\PROJECT\Project\NCC\.agents\teamwork_preview_explorer_survey_2\survey_cache_sockets_infra.md`

---

## 1. Observation

Direct code inspection and test execution results:

1. **L1 LRU & In-Memory Capacity Bounds**:
   - `backend/lib/cache.server.ts` line 19: `const L1_MAX_ITEMS = 2000;`
   - `backend/lib/redis.server.ts` line 17: `const MAX_MEMORY_ITEMS = 5000;`
   - `backend/lib/rate-limiter.server.ts` line 28: `const store = new Map<string, RateLimitEntry>();` (No capacity ceiling; periodic time cleanup every 5 min in line 31).
   - `backend/services/ids/ids.service.ts` line 27: `const eventHistory: Array<{ eventType: string; actorIp: string; timestamp: number }> = [];` (No max length bound).
   - In `backend/lib/redis.server.ts` lines 174–183: `redisGet` retrieves from `memoryStore` without refreshing key access order (`delete` + `set`), leading to FIFO rather than true LRU eviction.

2. **Prefix Invalidation & Upstash Omission**:
   - In `backend/lib/redis.server.ts` lines 275–302 (`redisDelPrefix`):
     ```ts
     const ioClient = await getIoRedisClient();
     if (ioClient && ioClient.status === "ready") {
       const rawClient = ioClient as unknown as { ... };
       if (typeof rawClient.keys === "function") {
         const matchingKeys = await rawClient.keys(`${prefix}*`);
         if (matchingKeys && matchingKeys.length > 0) {
           await rawClient.del(...matchingKeys);
         }
       }
     }
     ```
     `getUpstashClient()` is not invoked, leaving Upstash Redis keys matching the prefix un-invalidated.

3. **Cache Stampede Exposure**:
   - In `backend/lib/cache.server.ts` lines 45–88 (`getOrSetCache`): concurrent cold misses execute `const freshData = await fetcher();` independently in parallel without in-flight promise deduplication.

4. **Batch Queueing Bottlenecks**:
   - `backend/services/queue/queue.service.ts` line 115: `.limit(10)` in `processPendingEmailJobs()`.
   - `backend/services/queue/queue.service.ts` lines 121–257: `for (const job of jobs)` executes sequential `await mailer.send*()` rather than leveraging the 5-connection pool in `backend/services/mail/mailer.ts` line 67 (`maxConnections: 5`).
   - Anti-pattern: `backend/services/prompter/reminder.dispatcher.ts` (lines 89–97), `src/routes/api/v1/calendar.$id.cancel.ts` (lines 54–61), and `src/routes/api/v1/calendar.$id.ts` (lines 113–124) call `queueEmailJob` in a loop instead of calling `queueEmailJobsBatch`.

5. **Real-time Sockets & Multi-Node Cluster Isolation**:
   - `backend/services/socket/socket.server.ts` line 13: `let activeConnectionCount = 0;`
   - Broadcast functions (`emitCalendarEventCreated`, `emitCalendarEventUpdated`, `emitCalendarEventCancelled`, `emitNotification`) broadcast only to local process `ioInstance`. Without `@socket.io/redis-adapter`, multi-node Docker deployment (`ncc-app-1`, `ncc-app-2`) isolates events to the connected node.

6. **Prompter Engine Scheduling**:
   - `backend/services/prompter/reminder.rules.ts` line 8: `DEFAULT_REMINDER_RULES` defines triggers at 1440 min (24h), 120 min (2h), 30 min, and 0 min.
   - `backend/services/prompter/scheduler.ts` line 16: queries pending reminders with `.limit(20)`.

7. **Nginx Reverse Proxy & Failover**:
   - `nginx/nginx.conf` line 148: `proxy_next_upstream error timeout invalid_header http_500 http_502 http_503;` is present in `location /`, but omitted in `location /api/v1/auth/` (line 112) and `location = /api/v1/health` (line 85).

8. **Test Suite Execution**:
   - `npm run test` executes 11 suites, 60 tests, 100% pass in 891ms.
   - `npx tsx --test backend/tests/cache.test.ts` executes 7 tests, 100% pass in 158ms.
   - Total test coverage across codebase: 12 test files, 67 tests, 100% passing.

---

## 2. Logic Chain

1. **Memory Bound Analysis**:
   - From Observation 1: `rate-limiter.server.ts` and `ids.service.ts` store unbounded arrays/maps in memory. Under sustained high-frequency requests with varied IP addresses or event payloads, heap memory grows linearly until process exhaustion.
   - Therefore, all in-memory fallback stores must enforce `MAX_MEMORY_ITEMS = 5000` with strict LRU eviction.

2. **Cache Correctness & Invalidation**:
   - From Observation 2: `redisDelPrefix` only executes against `ioClient` and skips Upstash REST API.
   - If deployed on serverless Upstash, `invalidateCachePrefix("ncc:calendar")` will purge L1 memory and local fallback, but Upstash Redis will continue serving stale calendar data.
   - From Observation 3: Lack of single-flight mutex allows database stampedes on cold cache keys.

3. **Batch Processing Throughput**:
   - From Observation 4: `queueEmailJobsBatch` enqueues N jobs in one query, but `processPendingEmailJobs` only processes 10 jobs per invocation and lacks a draining loop.
   - When 100 jobs are enqueued, 90 remain unexecuted until future triggers.
   - Processing sequentially underutilizes Nodemailer's 5-connection pool. Parallelizing up to concurrency 5 will reduce batch latency by ~80%.

4. **Cluster Real-time Consistency**:
   - From Observation 5: Docker configuration provisions `ncc-app-1` and `ncc-app-2`.
   - Because Socket.IO runs purely in-memory on each container, cross-node event distribution fails without Redis Pub/Sub adapter.

5. **Gateway Failover Hardening**:
   - From Observation 7: An outage on `ncc-app-1` during user authentication or health check requests results in HTTP 502 instead of seamless upstream failover to `ncc-app-2`.

---

## 3. Caveats

- Live multi-node Docker cluster and live Upstash Redis instance were not run during this read-only survey; findings are derived from static code analysis, configuration auditing, and local unit test execution.
- Supabase live database connection was not present in the local unit test environment (tests gracefully fallback/mock as designed).
- Performance throughput figures are projected based on Node.js event loop characteristics and Nodemailer pool configurations.

---

## 4. Conclusion

The NCC platform caching, queuing, real-time socket, and infrastructure tiers are well-structured, but exhibit key optimization opportunities:

1. Standardize and enforce `MAX_MEMORY_ITEMS = 5000` across `cache.server.ts`, `rate-limiter.server.ts`, `redis.server.ts`, and `ids.service.ts`.
2. Add Upstash REST support to `redisDelPrefix` and replace blocking `KEYS` with non-blocking key resolution.
3. Introduce single-flight promise caching in `getOrSetCache` to prevent stampedes.
4. Upgrade `processPendingEmailJobs` with a loop-until-empty draining mechanism and concurrent pool execution (`p-limit` / `Promise.allSettled(concurrency: 5)`).
5. Convert all dependent notification calls (`reminder.dispatcher.ts`, `calendar.$id.cancel.ts`, `calendar.$id.ts`) to use `queueEmailJobsBatch`.
6. Add `proxy_next_upstream` to Nginx `/api/v1/auth/` and `/api/v1/health`.
7. Add `@socket.io/redis-adapter` for multi-instance WebSocket broadcasts.

---

## 5. Verification Method

To independently verify all observations and test baselines:

1. **Run full unit test suite**:
   ```bash
   npm run test
   ```
2. **Run cache-specific unit tests**:
   ```bash
   npx tsx --test backend/tests/cache.test.ts
   ```
3. **Run redis and rate-limiter unit tests**:
   ```bash
   npx tsx --test backend/tests/redis.test.ts
   ```
4. **Run prompter reminder unit tests**:
   ```bash
   npx tsx --test backend/tests/prompter.test.ts
   ```
5. **Inspect key source files**:
   - `backend/lib/cache.server.ts` (L1 LRU & getOrSetCache)
   - `backend/lib/redis.server.ts` (MAX_MEMORY_ITEMS, failover, redisDelPrefix)
   - `backend/lib/rate-limiter.server.ts` (hybrid rate limiter memory store)
   - `backend/services/queue/queue.service.ts` (batch queueing & processor)
   - `backend/services/socket/socket.server.ts` (socket rooms & broadcasting)
   - `backend/services/prompter/prompter.service.ts` & `reminder.rules.ts`
   - `nginx/nginx.conf` (upstream balancing & proxy_next_upstream)
   - `docker-compose.yml` (multi-node setup & healthchecks)
