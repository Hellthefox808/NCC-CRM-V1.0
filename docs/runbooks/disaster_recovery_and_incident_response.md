# Runbook: Disaster Recovery & Incident Response

**Platform:** 19 Jharkhand Battalion NCC Command Centre  
**SRE Classification:** Mission-Critical Cadre & Enrollment Infrastructure  
**Objectives:** RTO < 15 minutes | RPO < 1 hour  

---

## 1. Incident Classification & Severity Matrix

| Severity | Definition | Target Response | Notification Channels |
|---|---|---|---|
| **P0 - Catastrophic** | Full portal outage, database unreachable, security breach, secret leak | < 5 minutes | SRE On-Call, Lead Architect, ANO Command |
| **P1 - Critical** | Enrollment submission broken, OTP dispatch failure, auth gate malfunction | < 15 minutes | SRE On-Call, Lead Developer |
| **P2 - Major** | Degraded performance (>2s response), Redis offline (operating on L1), chat latency | < 1 hour | Engineering Team |
| **P3 - Minor** | Non-blocking UI glitch, single report export error | Next Business Day | Bug Backlog |

---

## 2. Component Failure & Recovery Procedures

### Scenario A: Redis Cluster Outage (L2 Cache Down)
- **Impact**: Cache requests fall back to L1 in-memory cache. Rate limiting switches to local memory LRU.
- **Immediate Action**:
  1. Inspect Redis container or Upstash connection:
     ```bash
     docker logs ncc_redis --tail 100
     ```
  2. If local Redis crashed, restart container:
     ```bash
     docker restart ncc_redis
     ```
  3. Verify application continues serving requests gracefully via L1 fallback.
  4. Once Redis recovers, test connectivity via `redis-cli ping`.

### Scenario B: Database Outage / Connection Saturation
- **Impact**: Read/write operations to persistent storage fail.
- **Immediate Action**:
  1. Check PostgreSQL connection pool metrics via Supabase Dashboard or pg_stat_activity.
  2. If connection pool exhausted, restart PgBouncer pooler or scale max connections.
  3. For database recovery from PITR (Point-in-Time Recovery):
     - Restore latest snapshot from Supabase backup vault.
     - Replay WAL logs up to timestamp of failure.
     - Run `npx prisma db pull` to verify schema parity.

### Scenario C: SMTP Mailer Failure / Throttling
- **Impact**: Welcome emails or reminder notifications cannot be delivered immediately.
- **Behavior**: The background batch queue (`queueEmailJobsBatch`) holds pending jobs in `status: PENDING` and applies exponential backoff up to 5 retries.
- **Immediate Action**:
  1. Check queue backlog size:
     ```bash
     curl -s https://ncc.sbu.ac.in/api/v1/metrics | jq .queue
     ```
  2. Update SMTP credentials in `/etc/ncc/production.env` if throttled or expired.
  3. Manually trigger draining loop once mail provider recovers:
     ```bash
     curl -X POST https://ncc.sbu.ac.in/api/v1/queue/drain \
       -H "Authorization: Bearer $SUPER_ADMIN_TOKEN"
     ```

### Scenario D: Security Credential Compromise / Secret Leak
- **Immediate Action**:
  1. **Revoke Active Sessions Immediately**:
     Execute global cache purge for all active session keys:
     ```bash
     # Invalidate all cadet and officer sessions
     docker exec ncc_app_1 node -e '
       const { invalidateCachePrefix } = require("./.output/server/index.mjs");
       invalidateCachePrefix("ncc:session:").then(() => console.log("Sessions purged"));
     '
     ```
  2. **Rotate Secrets**:
     - Generate new 256-bit `JWT_SECRET` and `SESSION_SECRET`.
     - Update `/etc/ncc/production.env`.
     - Perform rolling restart of all backend nodes.
  3. **Inspect IDS Security Logs**:
     Review `security_events` table for unauthorized access or privilege escalation attempts.

---

## 3. Post-Mortem & Root Cause Analysis (RCA) Protocol

Every P0 or P1 incident requires an RCA within 24 hours containing:
1. **Incident Timeline**: Precise timestamps of detection, escalation, mitigation, and resolution.
2. **Root Cause**: Underlying technical defect, misconfiguration, or external failure.
3. **Trigger**: The specific event or input that triggered the failure.
4. **Resolution Steps**: Actions taken to restore normal operation.
5. **Preventative Action Items**: Code changes, automated regression tests, or architecture improvements to ensure the failure cannot reoccur.
