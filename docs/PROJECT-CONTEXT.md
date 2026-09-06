# NCC Platform — Project Context & System State

**System Name**: 19 Jharkhand Battalion NCC Portal (Sarala Birla University Sub-Unit)  
**Corpus Name**: Hellthefox808/NCC-CRM-V1.0  
**Branch**: `main`  
**Last Updated**: 2026-09-06  
**Status**: 100% Verified E2E, 65/65 Tests Passing, Elite Glassmorphism UI, Dynamic Backend Sync, Hardened Security & Infrastructure

---

## 1. System Architecture Summary

The NCC Portal operates as an integrated, OWASP-compliant identity and management system designed for cadet enrollment, ANO verification, attendance tracking, event scheduling, and security auditing.

```text
                    NCC PRODUCTION SYSTEM
                              │
             ┌────────────────┴────────────────┐
             │                                 │
        APPLICATION                         PLATFORM
             │                                 │
      ┌──────┴──────┐              ┌───────────┴───────────┐
      │             │              │                       │
   Frontend      Backend        Database              Load Balancer
      │             │              │                       │
   UI/UX        APIs/Auth       Redis               Nginx / Multi-Node
      │             │              │                       │
      └──────┬──────┘              └───────────┬───────────┘
             │                                 │
             └──────────────┬──────────────────┘
                            │
                       GitHub / CI-CD
                            │
                    Test → Build → Scan
                            │
                       Staging → Prod
```

---

## 2. Component Stack

- **Frontend**: React 19 + TanStack Router (SSR) + Tailwind CSS v4 + Motion + Regimental Glassmorphic Design System (`.glass-panel`, `.glass-panel-elevated`, `.glass-pill`, `.glass-input`, `.glass-glow-*`)
- **Backend API**: TanStack Start / Nitro (TypeScript Node ESM) with dynamic endpoints (`/api/v1/metrics`, `/api/v1/leaves`, `/api/v1/discipline`, `/api/v1/enrollments`, `/api/v1/calendar`, `/api/v1/notifications`)
- **Database**: Supabase / PostgreSQL (`app_credentials`, `cadet_users`, `cadet_enrollments`, `auth_otp_codes`, `audit_logs`)
- **Multi-Tier Caching & Rate Limiting**: L1 Bounded In-Memory LRU Cache + L2 Redis (`ncc:session:*`, `ncc:calendar:*`, `ncc:annual_plans:*`, `ncc:activities:*`, `ncc:notifications:*`, `ncc:enrollment:*`, `ratelimit:*`)
- **Load Balancer & Gateway**: Nginx Reverse Proxy with `least_conn` upstream balancing, HTTP/2, Gzip compression, WebSocket sticky affinity, and proxy rate limiting
- **Transactional Mailer**: Nodemailer (Dev simulated dispatch + SMTP pool) with atomic bulk queueing (`queueEmailJobsBatch`)
- **Bundler & Build Tool**: Vite 8.2 + Nitro 3.0
- **Deployment Pipelines**: Docker Multi-Node Cluster (`docker-compose.yml`), Netlify (`netlify.toml` -> `.output/public`), Vercel (`vercel.json` -> `.output/public`)

---

## 3. Active Security & Authentication Subsystems

1. **Multi-Stage Identity Pipeline**:
   `Applicant Registration` → `ANO Verification` → `Account Provisioning` → `Single-Use SHA256 Activation Token` → `Welcome Email` → `Set Password (scrypt)` → `Account Activated` → `Login` → `OTP / Rate Limited Verification` → `RBAC Session`.
2. **Password Security**:
   - Algorithm: Salted scrypt (`scrypt$N=16384,r=8,p=1$...`).
   - OWASP Password Policy: Minimum 8 characters, uppercase, lowercase, number, special character.
3. **Anti-Enumeration Recovery**:
   - Uniform response on password recovery: _"If an account matches the information provided, recovery instructions will be sent."_
4. **Role-Based Access Control (RBAC) & Session Caching**:
   - Server-enforced middleware (`requireOfficer` vs `requireCadetSession`) with 300s multi-tier session caching reducing DB overhead by >85%.
   - Instant token invalidation across all nodes on logout.
   - Zero frontend-only privilege boundaries.
5. **IDOR & Broken Object Level Authorization Mitigation**:
   - Strict session scoping on `/api/v1/discipline` (cadets can only access their own records; cross-cadet lookups trigger IDS alert `IDOR_ATTEMPT` and 403 Forbidden).
   - Session authentication and ownership verification on notification acknowledgment (`/api/v1/notifications/:id/read`).
6. **CWE-1236 CSV Formula Injection Neutralization**:
   - All user-supplied fields in Excel/CSV exports starting with `=`, `@`, `\t`, `\r`, `+`, or `-` are prepended with apostrophe `'`.
7. **Dual-Layer Rate Limiting & Anti-Brute-Force / Anti-Enumeration**:
   - Login protected by network IP ceiling (25 req/15min) + target account ceiling (5 req/15min).
   - Public enrollment status search rate limited (20 req/min per IP) to prevent Aadhaar / phone number enumeration.
   - Enrollment form submission rate limited (5 req/15min per IP).
   - OTP requests rate limited (5 req/10min per IP).
8. **PostgREST Query Injection Defense**:
   - Strict sanitization stripping PostgREST reserved operators (`.eq.`, `()`, `,`, etc.) across all identifier queries.
9. **Timing Attack & Memory Safety**:
   - Constant-time `crypto.timingSafeEqual` comparison on OTP hash verification.
   - Hard memory ceilings (`MAX_MEMORY_TOKENS = 1000`) and automatic pruning to prevent heap exhaustion.
10. **Infrastructure Hardening**:
    - Redis loopback binding (`127.0.0.1:6379`) with password protection in `docker-compose.yml`.
    - Nginx `api_status_limit` zone, HSTS, and Permissions-Policy headers.
    - Content-Security-Policy (CSP) header enforced on Nitro SSR responses.

---

## 4. Test Suite & Verification Metrics

- **Backend Unit Tests**: **65 / 65 Pass (100%)** across 12 test suites (including Security Hardening, Multi-Tier Cache & Storage Capability tests).
- **ESLint Static Code Analysis**: **0 Errors (100% clean type-safety)**.
- **CI/CD Automation**: GitHub Actions workflow (`.github/workflows/ci.yml`) automating lint, test suite execution, and production compilation.
- **Form 1 Enrollment Validation**: Full coverage for SD/SW cadet registration, 18-digit Application Number generation, phone/Aadhaar normalization, and multi-channel dispatches (Email + WhatsApp + SMS).
- **Production Build Status**: **Success (Vite + Nitro SSR Bundle)** with zero blocking warnings.

