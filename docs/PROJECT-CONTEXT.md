# NCC Platform — Project Context & System State

**System Name**: 19 Jharkhand Battalion NCC Portal (Sarala Birla University Sub-Unit)  
**Corpus Name**: Hellthefox808/NCC-CRM-V1.0  
**Branch**: `main`  
**Last Updated**: 2026-08-22  
**Status**: 100% Verified E2E, 60/60 Tests Passing, Full Cross-Device Responsiveness (Mobile, Tablet, Desktop)

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

- **Frontend**: React 19 + TanStack Router (SSR) + Tailwind CSS v4 + Motion
- **Backend API**: TanStack Start / Nitro (TypeScript Node ESM)
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

---

## 4. Test Suite & Verification Metrics

- **Backend Unit Tests**: **60 / 60 Pass (100%)** across 11 test suites (including Multi-Tier Cache & Storage Capability tests).
- **ESLint Static Code Analysis**: **0 Errors (100% clean type-safety)**.
- **CI/CD Automation**: GitHub Actions workflow (`.github/workflows/ci.yml`) automating lint, test suite execution, and production compilation.
- **Form 1 Enrollment Validation**: Full coverage for SD/SW cadet registration, 18-digit Application Number generation, phone/Aadhaar normalization, and multi-channel dispatches (Email + WhatsApp + SMS).
- **Production Build Status**: **Success (Vite + Nitro SSR Bundle)** with zero blocking warnings.
