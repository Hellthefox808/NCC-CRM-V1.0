# NCC Platform — Production Readiness Evaluation & Operational Checklist

This document provides an objective, evidence-based assessment of the 19 Jharkhand Battalion NCC Platform across core operational dimensions, distinguishing verified local capabilities from production deployment prerequisites.

---

## 1. Operational Readiness Evaluation

| Dimension | Verification Status | Verified Evidence & Implementation Details | Production Deployment Prerequisites |
| :--- | :---: | :--- | :--- |
| **Architecture** | **VERIFIED** | Monolithic SSR runtime powered by TanStack Start and Nitro 3.0 with unified TypeScript ESM endpoints. Nginx multi-node load balancer configuration in `nginx/nginx.conf`. | Verify target cluster egress rules and load balancer SSL termination. |
| **Security & Cryptography** | **VERIFIED** | Salted `scrypt` (`N=16384, r=8, p=1`) password hashing; single-use 256-bit SHA-256 activation tokens; constant-time comparison on OTP verification. | Generate cryptographically unique `JWT_SECRET` and `SESSION_SECRET` values (minimum 32 characters) per environment. |
| **Authentication & Sessions** | **VERIFIED** | Multi-stage onboarding pipeline; `HttpOnly; SameSite=Strict; Secure` session cookies; token expiration handling. | Enforce HTTPS upstream so browser accepts `Secure` cookie flag. |
| **OTP Subsystem** | **VERIFIED** | Purpose-segregated OTPs (`password_reset`, `onboarding`, `account_activation`), 45s resend cooldown, 5-attempt brute-force limit, in-memory failover store. | Connect SMS / WhatsApp gateway provider keys in production `.env`. |
| **Authorization** | **VERIFIED** | Server-enforced middleware (`requireOfficer`, `requireCadetSession`) checking database roles; public status tracking strips PII. | Verify Supabase Row-Level Security (RLS) policies on live database. |
| **Input Validation** | **VERIFIED** | Strict Zod schemas on all mutating endpoints (`/api/v1/enrollments`, `/api/v1/auth/*`); UIDAI Verhoeff $D_5$ Aadhaar checksum validation; PostgREST operator stripping. | Periodic review of endpoint validation schemas against newly added fields. |
| **Database & Migrations** | **VERIFIED** | 14 relational tables in Supabase PostgreSQL; Prisma ORM client; idempotent SQL migrations under `supabase/migrations/`; in-memory store for test isolation. | Run migrations on staging/production Supabase project; configure connection pooling via PgBouncer. |
| **Caching & Rate Limiting** | **VERIFIED** | L1 in-memory LRU cache (bounded to 5,000 items) with single-flight promise deduplication; L2 Redis integration with prefix invalidation; sliding-window rate limiters. | Provision dedicated Upstash Redis REST or Redis cluster; ensure `REDIS_PASSWORD` is set securely. |
| **File Storage Security** | **VERIFIED** | Opaque capability tokens; MIME type validation with magic-byte verification (OWASP ASVS 5.0 V12) preventing executable spoofing; 10MB ceiling. | Configure AWS S3 or Supabase Storage bucket CORS and IAM policies. |
| **Automated Testing** | **VERIFIED** | Complete test matrix covering 206 automated tests across 71 suites (see [`docs/TEST-MATRIX.md`](TEST-MATRIX.md)). Validated via `npm test`. | Execute `npm test` on each CI commit and release branch. |
| **Build & Type Safety** | **VERIFIED** | Zero TypeScript compiler errors (`npm run typecheck`); clean production SSR compilation via Vite 8.2 and Nitro 3.0 (`npm run build`). | Ensure Node.js 22 LTS runtime in container or serverless runtime environment. |
| **Containerization** | **VERIFIED** | Multi-stage `Dockerfile` with non-root execution; `docker-compose.yml` defining application nodes, Nginx proxy, and Redis. | Avoid hardcoded default fallback passwords in Compose configurations; inject secrets from secure vault. |
| **Observability & Health** | **VERIFIED** | Multi-probe health endpoint (`/api/v1/health`) reporting system status, uptime, memory, and database connectivity. | Wire `/api/v1/health` into external uptime monitor (e.g. BetterStack, Prometheus, CloudWatch). |
| **Disaster Recovery** | **DOCUMENTED** | Documented runbooks for deployment, rollback, and incident recovery (see [`docs/runbooks/`](runbooks/)). | Test point-in-time database restoration and verify backup retention schedules. |

---

## 2. Pre-Deployment Verification Checklist

Before deploying any release to production:

- [ ] **Automated Quality Gates**:
  - `npm test` passes 100% without failures.
  - `npm run typecheck` passes with 0 errors.
  - `npm run lint` passes with 0 errors.
  - `npm run build` succeeds without warnings or bundle failures.
- [ ] **Secret Hygiene**:
  - No default fallback credentials in `.env`, `docker-compose.yml`, or server configurations.
  - `JWT_SECRET`, `SESSION_SECRET`, and `DRAFT_ENCRYPTION_KEY` are uniquely generated 256-bit secrets.
  - Service-role keys (`SUPABASE_SERVICE_ROLE_KEY`) are kept on the server and never prefixed with `VITE_`.
- [ ] **Data Stores**:
  - Supabase PostgreSQL migrations applied cleanly.
  - Redis connection validated (local TCP or Upstash REST).
  - MongoDB URI configured if secondary analytics logging is active.
- [ ] **Third-Party Integrations**:
  - SMTP mailer credentials verified (`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`).
  - WhatsApp / SMS gateway endpoints configured and funded if transactional mobile messaging is active.
- [ ] **Monitoring & Alerts**:
  - Health probe (`/api/v1/health?type=liveness`) integrated with container orchestrator or uptime tracker.
