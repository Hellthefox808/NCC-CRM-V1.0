# NCC Platform — System Architecture & Component Model

**System Name**: 19 Jharkhand Battalion NCC Portal (Sarala Birla University Sub-Unit)  
**Architecture Pattern**: Scaled Multi-Instance SSR Monolith (Nginx Reverse Proxy + Multi-Tier Cache + Domain Services)  
**Last Updated**: 2026-08-21

---

## 1. High-Level Architecture Overview

The NCC Platform is designed as an integrated, OWASP-compliant software system supporting cadet onboarding, ANO verification, attendance tracking, event management, and security auditing.

```text
                                INCOMING TRAFFIC
                                       │
                        ┌──────────────┴──────────────┐
                        │    Nginx Load Balancer      │
                        │ (Gzip, Rate Limiting, HTTP2)│
                        └──────────────┬──────────────┘
                                       │
                  ┌────────────────────┴────────────────────┐
                  │ (Least Connections / Sticky Socket.IO)   │
                  ▼                                         ▼
        ┌───────────────────┐                     ┌───────────────────┐
        │   ncc-app-node-1  │                     │   ncc-app-node-2  │
        │ (TanStack / Nitro)│                     │ (TanStack / Nitro)│
        └─────────┬─────────┘                     └─────────┬─────────┘
                  │                                         │
                  └────────────────────┬────────────────────┘
                                       │
                        ┌──────────────┴──────────────┐
                        │      Multi-Tier Cache       │
                        │ (L1 LRU + L2 Redis Cluster) │
                        └──────────────┬──────────────┘
                                       │
                        ┌──────────────┴──────────────┐
                        │     Supabase / Postgres     │
                        │ (Connection Pooling & RLS)  │
                        └─────────────────────────────┘
```

---

## 2. Backend Request & Performance Pipeline

All incoming HTTP requests pass through a uniform performance and security pipeline before reaching business logic:

```text
Request (Port 80/443)
  ↓
Nginx Reverse Proxy (DDoS Shielding & Burst Rate Limiter)
  ↓
Upstream Load Balancing (Least Connections / IP Hash for WebSocket)
  ↓
Security Headers (HSTS, CSP, X-Frame-Options, X-Content-Type-Options)
  ↓
Multi-Tier Session Cache (L1 LRU -> L2 Redis -> Supabase Fallback)
  ↓
Server Authorization (requireOfficer / requireCadetSession)
  ↓
Input Schema Validation (Zod)
  ↓
API Route Controller / Cached Endpoint Handler
  ↓
Domain Service Layer (Batch Queueing, Prompter, Multi-Channel)
  ↓
Repository / Data Access Layer
  ↓
Database / Redis Store
  ↓
Response Serializer, Audit Event Logging & Cache Headers
```

---

## 3. Modular Domain Boundaries

The application logic is decoupled into distinct domain subsystems:

- **Multi-Tier Cache Layer**: `cache.server.ts`, `redis.server.ts` (L1 Bounded LRU + L2 Redis)
- **Identity & Auth**: `auth-otp.server.ts`, `validation.schemas.ts`, `/api/v1/auth/*`
- **Data Platform & Registry**: `cadet-registry.server.ts`, `dataPlatform.ts`
- **Intrusion Detection System (IDS)**: `ids/` threat engine & alert scoring with bounded history
- **Transactional Mailer & Batch Queue**: `mail/templates.ts`, `mail/mailer.ts`, `queue.service.ts`
- **Reminder Engine**: `prompter/` automated notification dispatcher
- **Audit Logging**: `audit-log.server.ts`
- **Storage & Tokenization**: `storage/` capability & MIME magic byte validation

---

## 4. Container & Infrastructure Deployment Model

- **Multi-Stage Dockerfile**:
  - Stage 1 (`builder`): `node:22-alpine` installs dependencies and compiles Nitro SSR production bundle (`npm run build`).
  - Stage 2 (`runner`): Minimal `node:22-alpine` execution container using non-root user `nccapp` (UID/GID 1001).
- **Health Verification**: Docker HEALTHCHECK queries `GET /api/v1/health?type=liveness` every 15s.
- **Orchestration**: `docker-compose.yml` pairs an `nginx:alpine` load balancer frontend with multiple backend nodes (`ncc-app-1`, `ncc-app-2`) and a dedicated `redis:7-alpine` caching service.
