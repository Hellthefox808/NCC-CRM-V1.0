# 19 JHR BN NCC Command Centre & Cadet Portal

> Enterprise Digital Management, Cadet Enrollment & Institutional Identity Subsystem for **19 Jharkhand Battalion NCC, Sarala Birla University (SBU), Ranchi**.

[![Version](https://img.shields.io/badge/version-3.2.0-blue.svg)](https://github.com/Hellthefox808/NCC-CRM-V1.0)
[![Unit Tests](https://img.shields.io/badge/tests-53%2F53%20passing-brightgreen.svg)](https://github.com/Hellthefox808/NCC-CRM-V1.0)
[![CI/CD](https://img.shields.io/badge/CI%2FCD-GitHub%20Actions-blue.svg)](https://github.com/Hellthefox808/NCC-CRM-V1.0/actions)
[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)](https://github.com/Hellthefox808/NCC-CRM-V1.0)
[![TypeScript](https://img.shields.io/badge/typescript-strict%205.8-blue.svg)](https://www.typescriptlang.org/)
[![Database](https://img.shields.io/badge/database-Supabase%20PostgreSQL%2015-3ECF8E.svg)](https://supabase.com)
[![Frontend](https://img.shields.io/badge/frontend-Vercel-black.svg)](https://19th-jh-ncc-crm-v1-0.vercel.app/)
[![Backend](https://img.shields.io/badge/backend-Netlify%20Nitro-00C7B7.svg)](https://agent-6a88700c8504a--spectacular-entremet-464b43.netlify.app/)
[![Security](https://img.shields.io/badge/OWASP-Compliant%20%7C%20scrypt-success.svg)](https://owasp.org/)

---

## 🌐 Live System Deployments

| Component | Platform | Live URL | Description |
| :--- | :--- | :--- | :--- |
| **Frontend Client** | **Vercel** | [19th-jh-ncc-crm-v1-0.vercel.app](https://19th-jh-ncc-crm-v1-0.vercel.app/) | React 19 Client SPA + TanStack Router |
| **Backend & SSR** | **Netlify** | [agent-6a88700c8504a--spectacular-entremet-464b43.netlify.app](https://agent-6a88700c8504a--spectacular-entremet-464b43.netlify.app/) | Nitro 3.0 Serverless Edge API & SSR Engine |
| **Database** | **Supabase** | `qsrmzajadmmgqhfbxdwu.supabase.co` | PostgreSQL 15 with Row-Level Security (RLS) |

---

## 📐 Architecture Overview

```mermaid
graph TD
    CLIENT["React 19 Frontend (Vercel)"]
    NETLIFY["Nitro 3.0 Backend Engine (Netlify)"]
    ROUTER["TanStack Router (SSR & API Handlers)"]
    VALIDATION["Zod Validation Engine (Form 1 Schemas)"]
    AUTH["Crypto Session & HttpOnly Cookie Service"]
    ACTIVATION["Single-Use 256-bit Token Activation"]
    LIMITER["Hybrid Rate Limiter (Redis + In-Memory)"]
    IDS["Intrusion Detection System (IDS Threat Engine)"]
    NOTIFICATIONS["Multi-Channel Dispatch (Email + WhatsApp + SMS)"]
    SUPABASE["Supabase PostgreSQL (14 Entity Tables + RLS)"]
    REDIS["Redis Cache & Store (Docker / Upstash)"]

    CLIENT -->|Proxied API Requests| NETLIFY
    NETLIFY --> ROUTER
    ROUTER --> VALIDATION
    ROUTER --> AUTH
    ROUTER --> ACTIVATION
    ROUTER --> LIMITER
    ROUTER --> IDS
    ROUTER --> NOTIFICATIONS
    ROUTER --> SUPABASE
    LIMITER --> REDIS
```

### Technical Stack & Key Capabilities

- **Frontend Application**: React 19, TanStack Start, TanStack Router, Tailwind CSS v4, Radix UI, Lucide Icons, Framer Motion.
- **Backend & SSR Engine**: Nitro 3.0 + Vite 8.2 compiling unified TypeScript serverless functions.
- **Identity & Access Control**: HttpOnly Cookie Sessions (`ncc_session`), Salted `scrypt` (`N=16384, r=8, p=1`), Single-Use 256-bit SHA-256 Activation Tokens.
- **Form 1 Cadet Enrollment Engine**: 5-step wizard supporting Senior Division (`SD`) & Senior Wing (`SW`), auto-sanitizing Indian mobile numbers (`+91`), 12-digit Aadhaar validation, and 1-click Application Number copy UX.
- **18-Digit Application Number Subsystem**: Generates standard `19${YYYYMMDD}${8-digit random}` tracking numbers (e.g. `192026082163982382`).
- **Multi-Channel Notification Dispatch**: Automated dispatch across Email (Nodemailer / SMTP), WhatsApp (`+91` E.164), and SMS upon application submission and ANO approval.
- **Intrusion Detection System (IDS)**: Cumulative risk scoring engine with automated threat mitigation (`RATE_LIMIT_IP`, `REVOKE_SESSION`, `QUARANTINE_OBJECT`).
- **Database & Storage**: Supabase PostgreSQL 15 with 10 sequential idempotent migrations and zero-leak Row-Level Security policies.
- **Export Capabilities**: RFC 4180 CSV export with UTF-8 BOM (`\uFEFF`) for seamless Microsoft Excel nominal roll generation.

---

## 📋 18-Digit Application Number & Tracking Workflow

The portal issues an official 18-digit Application Number upon cadet registration:

```text
Format: 19 + [YYYYMMDD] + [8-Digit Random Number]
Example: 19 20260821 63982382
```

1. **Submission**: Cadet fills Form 1 on [`/enroll`](https://19th-jh-ncc-crm-v1-0.vercel.app/enroll).
2. **Validation**: `cadetEnrollmentSchema` sanitizes mobile, Aadhaar, DOB (15–28 years), physical metrics, and academic profile.
3. **Dispatch**: Instant multi-channel notifications sent with tracking link.
4. **Public Tracking**: Status queries on `/api/v1/enrollments/status/:query` return masked PII records for security.
5. **ANO Verification**: Commanding officers review, verify documents, and issue single-use activation tokens.

---

## 🔒 Security Hardening & Authentication Architecture

### 1. Multi-Stage Cadet Provisioning Pipeline

```text
Cadet Registration ──> PENDING_ANO_REVIEW ──> Officer Approval ──> Single-Use Token
                                                                        │
                                                                        ▼
Active Cadet Session <── Scrypt Set Password <── Email Activation Link ─┘
```

- **Officer Access Gate**: Privileged endpoints strictly enforce `requireOfficer(request)` server-side.
- **Single-Use Cryptographic Tokens**: 256-bit entropy raw tokens (`crypto.randomBytes(32)`) sent via email; only `sha256(rawToken)` is stored in `account_activation_tokens`.
- **Anti-Replay Protection**: Single-use flag (`used_at`) and 24-hour expiration (`expires_at`).

### 2. Password & Identity Standards

- **Salted Scrypt Hashing**: Password hashes derived with `scrypt` using unique per-user cryptographic salts.
- **OWASP Password Standard**: Minimum 8 characters with upper, lower, numeric, and symbol enforcement.
- **Timing-Safe Responses**: Uniform messages on recovery and OTP endpoints to eliminate user enumeration vectors.

### 3. Session Security

- **Zero Client Token Storage**: Session tokens are not stored in `localStorage` or `sessionStorage` to mitigate XSS attacks.
- **HttpOnly Cookie Handling**: Auth middleware extracts tokens from `HttpOnly; SameSite=Lax; Secure` cookies.

---

## 📁 Repository Documentation Matrix

Detailed architecture and operations guides are located in the [`docs/`](file:///c:/Users/ravir/Desktop/PROJECT/Project/NCC/docs/) directory:

| Document | Description |
| :--- | :--- |
| **[`docs/DATABASE.md`](file:///c:/Users/ravir/Desktop/PROJECT/Project/NCC/docs/DATABASE.md)** | Complete database schema, 14 tables, ERD, 10 SQL migrations, and RLS policies. |
| **[`docs/PROJECT-CONTEXT.md`](file:///c:/Users/ravir/Desktop/PROJECT/Project/NCC/docs/PROJECT-CONTEXT.md)** | System architecture, component stacks, and operational boundaries. |
| **[`docs/TEST-MATRIX.md`](file:///c:/Users/ravir/Desktop/PROJECT/Project/NCC/docs/TEST-MATRIX.md)** | Comprehensive test matrix of all 49 unit, integration, and security tests. |
| **[`docs/security/SECURITY_BASELINE.md`](file:///c:/Users/ravir/Desktop/PROJECT/Project/NCC/docs/security/SECURITY_BASELINE.md)** | Threat model, OWASP compliance, and security implementation baseline. |

---

## 🚀 Quick Start Guide

### Prerequisites

- **Node.js**: `>= 22.0.0`
- **npm**: `>= 10.0.0`
- **Docker & Docker Compose** _(Optional, for containerized run)_

### 1. Local Setup

```bash
# Clone the repository
git clone https://github.com/Hellthefox808/NCC-CRM-V1.0.git
cd NCC-CRM-V1.0

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Configure Supabase credentials in .env
```

### 2. Start Development Server

```bash
npm run dev
```

Application will be accessible at `http://localhost:3000`.

### 3. Run Automated Tests

```bash
# Execute full test suite (53 tests across 10 suites)
npm run test
```

### 4. Build Production Bundle

```bash
npm run build
```

---

## ⚙️ Environment Variables Reference

| Variable Name | Required | Default / Example | Purpose |
| :--- | :---: | :--- | :--- |
| `NODE_ENV` | Yes | `development` / `production` | Application execution environment |
| `PORT` | No | `3000` | HTTP server listening port |
| `VITE_SUPABASE_URL` | Yes | `https://qsrmzajadmmgqhfbxdwu.supabase.co` | Public Supabase API Endpoint |
| `VITE_SUPABASE_ANON_KEY` | Yes | `eyJhbGciOi...` | Supabase Anonymous Client Key |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | `eyJhbGciOi...` | Supabase Service Role Key (Backend Server Only) |
| `REDIS_URL` | Optional | `redis://localhost:6379` | Connection URL for Local / Docker TCP Redis |
| `UPSTASH_REDIS_REST_URL` | Optional | `https://...upstash.io` | Upstash Redis REST URL for Vercel Serverless |
| `UPSTASH_REDIS_REST_TOKEN` | Optional | `AXXX...` | Upstash Redis REST API Authorization Token |
| `JWT_SECRET` | Yes | `min-32-character-secret` | 256-bit secret for signing user auth tokens |
| `SESSION_SECRET` | Yes | `session-encryption-secret` | Encryption key for cookie-based session state |
| `SMTP_HOST` | Optional | `smtp.gmail.com` | Host for email notification server |
| `SMTP_PORT` | Optional | `587` | Port for SMTP mailer connection |
| `SMTP_USER` | Optional | `user@sbu.ac.in` | SMTP authentication user |
| `SMTP_PASS` | Optional | `app-password` | SMTP authentication password |

---

## 🐳 Docker & Containerization

The repository includes a production multi-container setup with `ncc-app` and `redis`:

```bash
# Build and run containers in detached mode
docker-compose up -d --build

# Check container status
docker-compose ps

# View real-time logs
docker-compose logs -f
```

---

## 📋 Key API Endpoints Matrix

| Category | Endpoint | Method | Access | Description |
| :--- | :--- | :--- | :--- | :--- |
| **System** | `/api/v1/health` | GET | Public | System health check & database connectivity probe |
| **Auth** | `/api/v1/auth/login` | POST | Public | User authentication with rate limiting |
| **Auth** | `/api/v1/auth/me` | GET | Session | Retrieve active user session profile |
| **Auth** | `/api/v1/auth/activate` | POST | Public | Validate single-use activation token |
| **Auth** | `/api/v1/auth/set-password` | POST | Public | Set password & activate cadet account |
| **Auth** | `/api/v1/auth/otp/request` | POST | Public | Request OTP for authentication/recovery |
| **Enrollment** | `/api/v1/enrollments` | POST / GET | Public / Officer | Submit Form 1 application / list enrollments |
| **Enrollment** | `/api/v1/enrollments/status/$query` | GET | Public | Track application status (PII masked) |
| **ANO Review** | `/api/v1/ano/applications/$id/approve` | POST | Officer | Approve application & issue activation token |
| **Cadets** | `/api/v1/cadets` | GET | Officer | Query unit nominal rolls & roster |
| **Export** | `/api/v1/export-excel` | GET | Officer | Export official nominal roll CSV/Excel |
| **Operations** | `/api/v1/activities` | GET / POST | Public / Officer | Manage battalion activities |
| **Operations** | `/api/v1/calendar` | GET / POST | Public / Officer | Manage parade & event calendar |

---

## 🧪 Testing & Quality Assurance

```bash
# Execute unit & integration test suite (49/49 passing)
npm test

# Run ESLint analysis (0 errors)
npm run lint

# Format codebase with Prettier
npm run format
```

---

## 📜 License & Compliance

Maintained for the **19 Jharkhand Battalion NCC (Sarala Birla University Sub-Unit)**.  
Engineered in accordance with institutional security protocols, OWASP API Security Top 10, and Supabase RLS standards.
