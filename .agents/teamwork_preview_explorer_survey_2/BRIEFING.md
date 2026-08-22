# BRIEFING — 2026-08-21T18:34:00Z

## Mission

Survey NCC Command Centre codebase covering Multi-Tier Caching & Invalidation, High-Throughput Batch Queueing, Real-time Sockets & Prompter Engine, and Infrastructure (Nginx, Docker, Failover).

## 🔒 My Identity

- Archetype: explorer
- Roles: investigation, synthesis
- Working directory: c:\Users\ravir\Desktop\PROJECT\Project\NCC\.agents\teamwork_preview_explorer_survey_2
- Original parent: c7e39334-555f-4f2a-83ae-915c7b6caab9
- Milestone: Phase 0 Survey (Cache, Sockets, Prompter, Queues, Infra)

## 🔒 Key Constraints

- Read-only investigation — do NOT implement
- Investigate Multi-Tier Caching & Invalidation (L1 LRU, MAX_MEMORY_ITEMS, L2 Redis failover, metrics, prefix invalidation)
- Investigate High-Throughput Batch Queueing (queueEmailJobsBatch, concurrency, batch size, error handling, memory bounds)
- Investigate Real-time Sockets & Prompter Engine (lifecycle, reconnection, event rooms, prompter reminders & scheduling)
- Investigate Infrastructure (Nginx configs, worker failover, Docker / deployment)

## Current Parent

- Conversation ID: c7e39334-555f-4f2a-83ae-915c7b6caab9
- Updated: not yet

## Investigation State

- **Explored paths**:
  - `backend/lib/cache.server.ts`, `backend/lib/redis.server.ts`, `backend/lib/rate-limiter.server.ts`
  - `backend/services/queue/queue.service.ts`, `backend/services/mail/mailer.ts`, `backend/services/mail/templates.ts`
  - `backend/services/socket/socket.server.ts`, `backend/services/prompter/*` (`prompter.service.ts`, `reminder.dispatcher.ts`, `reminder.rules.ts`, `scheduler.ts`)
  - `nginx/nginx.conf`, `Dockerfile`, `docker-compose.yml`, `src/routes/api/v1/*`, `src/server.ts`
  - Test suites in `backend/tests/*.test.ts` (executed and verified 100% pass)
- **Key findings**:
  - LRU/Memory: Disparity between `L1_MAX_ITEMS = 2000` and `MAX_MEMORY_ITEMS = 5000`; unbounded maps in `rate-limiter.server.ts` and `ids.service.ts`; pseudo-LRU in `redis.server.ts` fallback.
  - Invalidation: `redisDelPrefix` completely skips Upstash REST API; uses blocking `KEYS` command on ioredis.
  - Stampede: `getOrSetCache` lacks in-flight promise deduplication.
  - Queueing: `processPendingEmailJobs` hardcodes `limit(10)` without draining loop; processes sequentially despite 5-connection SMTP pool.
  - Sockets: Multi-node Docker setup lacks Redis Pub/Sub adapter for WebSocket broadcasts.
  - Infra: Nginx `/api/v1/auth/` and `/api/v1/health` omit `proxy_next_upstream`.
- **Unexplored areas**: None within Explorer 2 Phase 0 scope.

## Key Decisions Made

- Completed deep dive across all 4 technical domains.
- Authored detailed survey report `survey_cache_sockets_infra.md`.
- Authored 5-component hard handoff report `handoff.md`.

## Artifact Index

- `DISPATCH.md` — Initial dispatch log
- `progress.md` — Heartbeat and progress tracking
- `survey_cache_sockets_infra.md` — Comprehensive Phase 0 survey report
- `handoff.md` — 5-Component hard handoff report
