# NCC Platform — System Architecture & Component Model

**System Name**: 19 Jharkhand Battalion NCC Portal (Sarala Birla University Sub-Unit)  
**Architecture Pattern**: Modular Full-Stack Monolith (React SSR + Thin Controllers + Domain Services)  
**Last Updated**: 2026-08-12

---

## 1. High-Level Architecture Overview

The NCC Platform is designed as an integrated, OWASP-compliant software system supporting cadet onboarding, ANO verification, attendance tracking, event management, and security auditing.

```text
                    NCC PRODUCTION SYSTEM
                              │
             ┌────────────────┴────────────────┐
             │                                 │
        APPLICATION                         PLATFORM
             │                                 │
      ┌──────┴──────┐              ┌───────────┴───────────┐
      │             │              │                       │
   Frontend      Backend        Database                 AWS
      │             │              │                       │
   UI/UX        APIs/Auth       Redis                 Docker
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

## 2. Backend Request & Security Pipeline

All incoming HTTP requests pass through a uniform security pipeline before reaching business logic:

```text
Request
  ↓
Request ID & CSRF Verification
  ↓
Security Headers (HSTS, CSP, X-Frame-Options)
  ↓
Hybrid Rate Limiter (Redis / Memory)
  ↓
Authentication Middleware (Bearer JWT / HttpOnly Cookie)
  ↓
Server Authorization (requireOfficer / requireCadetSession)
  ↓
Input Schema Validation (Zod)
  ↓
Thin API Controller Route
  ↓
Domain Service Layer
  ↓
Repository / Data Access Layer
  ↓
Database / Redis Store
  ↓
Response Serializer & Audit Event Logging
```

---

## 3. Modular Domain Boundaries

The application logic is decoupled into distinct domain subsystems:

- **Identity & Auth**: `auth-otp.server.ts`, `validation.schemas.ts`, `/api/v1/auth/*`
- **Data Platform & Registry**: `cadet-registry.server.ts`, `dataPlatform.ts`
- **Intrusion Detection System (IDS)**: `ids/` threat engine & alert scoring
- **Transactional Mailer**: `mail/templates.ts`, `mail/mailer.ts`
- **Reminder Engine**: `prompter/` automated notification dispatcher
- **Audit Logging**: `audit-log.server.ts`
- **Storage & Tokenization**: `storage/` capability & MIME magic byte validation

---

## 4. Container & Infrastructure Deployment Model

- **Multi-Stage Dockerfile**:
  - Stage 1 (`builder`): `node:22-alpine` installs dependencies and compiles Nitro SSR production bundle (`npm run build`).
  - Stage 2 (`runner`): Minimal `node:22-alpine` execution container using non-root user `nccapp` (UID/GID 1001).
- **Health Verification**: Docker HEALTHCHECK queries `GET /api/v1/health` every 30s.
- **Orchestration**: `docker-compose.yml` pairs the app container with a dedicated `redis:7-alpine` service.
