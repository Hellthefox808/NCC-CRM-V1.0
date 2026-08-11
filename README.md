# 19 JHR BN NCC Command Centre & Cadet Portal

> Enterprise digital management platform for **19 Jharkhand Battalion NCC, Sarala Birla University (SBU), Ranchi**.

![Version](https://img.shields.io/badge/version-3.0.0-blue.svg)
![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)
![Node](https://img.shields.io/badge/node-%3E%3D22.0.0-informational.svg)
![Docker](https://img.shields.io/badge/docker-ready-blue.svg)
![Vercel](https://img.shields.io/badge/vercel-supported-black.svg)
![Redis](https://img.shields.io/badge/redis-integrated-red.svg)
![Security](https://img.shields.io/badge/security-hardened-success.svg)

---

## 📐 Architecture Overview

```mermaid
graph TD
    CLIENT["React 19 Client SPA / SSR"]
    START["TanStack Start + Nitro SSR Engine"]
    ROUTER["TanStack Router (File-based API & Page Routes)"]
    AUTH["Crypto Session & Auth Service (256-bit Tokens)"]
    LIMITER["Hybrid Rate Limiter (Redis + In-Memory Fallback)"]
    REDIS["Redis Cache & Store (Docker / Upstash REST)"]
    AUDIT["Structured Security Audit Logger"]
    SUPABASE["Supabase PostgreSQL Database (Service Role)"]

    CLIENT --> START --> ROUTER
    ROUTER --> AUTH
    ROUTER --> LIMITER
    LIMITER --> REDIS
    ROUTER --> AUDIT
    ROUTER --> SUPABASE
```

### Technical Stack

- **Frontend**: React 19, TanStack Start, TanStack Router, Tailwind CSS v4, Radix UI, Lucide Icons, Framer Motion
- **Backend / SSR**: TanStack Start API Routes running on Nitro Engine (Node.js / Cloudflare Workers / Vercel Serverless)
- **Database**: Supabase PostgreSQL with Row Level Security (RLS) & Automated Audit Logging
- **Caching & Rate Limiting**: Redis 7 (Local/Docker) & Upstash Redis REST (Cloud Serverless) with graceful In-Memory Fallback
- **Deployment**: Docker & Docker Compose, Vercel Serverless Platform
- **Testing & CI**: Native Node.js Test Runner with `tsx` & ESLint

---

## 🔒 GitHub Upload & Repository Hygiene

To keep the repository secure and prevent accidental leakage of credentials or bloated build files, follow these strict rules:

### ⚠️ What NOT to Upload to GitHub

The repository is pre-configured with a comprehensive `.gitignore`. The following files **MUST NEVER** be pushed to GitHub:

| Category             | File Patterns / Folders                                           | Reason                                               |
| :------------------- | :---------------------------------------------------------------- | :--------------------------------------------------- |
| **Secrets & Keys**   | `.env`, `.env.local`, `.dev.vars`, `*.pem`, `*.key`               | Contains private Supabase, JWT, and SMTP credentials |
| **Dependencies**     | `node_modules/`, `.pnpm-store/`                                   | Large generated package directories                  |
| **Build Artifacts**  | `dist/`, `.output/`, `.tanstack/`, `.next/`, `.vercel/`           | Local build outputs generated on build server        |
| **Tooling & Caches** | `.jolli/`, `.lovable/`, `.nex/`, `.gemini/`, `.system_generated/` | Temporary CLI and AI workspace caches                |
| **Logs & Backups**   | `logs/`, `*.log`, `*.sqlite`, `*.db`, `backups/`                  | Runtime logs and local database dumps                |

### ✅ What MUST Be Uploaded to GitHub

- All source code in `src/`, `frontend/`, `backend/`, and `agent/`
- Configuration files: `package.json`, `package-lock.json`, `tsconfig.json`, `vite.config.ts`, `eslint.config.js`
- Deployment configurations: `Dockerfile`, `docker-compose.yml`, `vercel.json`
- Database migrations: `supabase/migrations/`
- Environment template: `.env.example`
- Documentation: `README.md`, `SECURITY.md`

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

# Edit .env and supply your Supabase & Secret credentials
```

### 2. Start Development Server

```bash
npm run dev
```

The application will be accessible at `http://localhost:3000`.

### 3. Run Test Suite

```bash
npm test
```

---

## ⚙️ Environment Variables Reference

| Variable Name               | Required | Default / Example                  | Purpose                                         |
| :-------------------------- | :------: | :--------------------------------- | :---------------------------------------------- |
| `NODE_ENV`                  |   Yes    | `development` / `production`       | Application execution environment               |
| `PORT`                      |    No    | `3000`                             | HTTP server listening port                      |
| `VITE_SUPABASE_URL`         |   Yes    | `https://your-project.supabase.co` | Public Supabase API Endpoint                    |
| `VITE_SUPABASE_ANON_KEY`    |   Yes    | `eyJhbGciOi...`                    | Supabase Anonymous Client Key                   |
| `SUPABASE_SERVICE_ROLE_KEY` |   Yes    | `eyJhbGciOi...`                    | Supabase Service Role Key (Backend Server Only) |
| `REDIS_URL`                 | Optional | `redis://localhost:6379`           | Connection URL for Local / Docker TCP Redis     |
| `UPSTASH_REDIS_REST_URL`    | Optional | `https://...upstash.io`            | Upstash Redis REST URL for Vercel Serverless    |
| `UPSTASH_REDIS_REST_TOKEN`  | Optional | `AXXX...`                          | Upstash Redis REST API Authorization Token      |
| `JWT_SECRET`                |   Yes    | `min-32-character-secret`          | 256-bit secret for signing user auth tokens     |
| `SESSION_SECRET`            |   Yes    | `session-encryption-secret`        | Encryption key for cookie-based session state   |
| `SMTP_HOST`                 | Optional | `smtp.gmail.com`                   | Host for email notification server              |
| `SMTP_PORT`                 | Optional | `587`                              | Port for SMTP mailer connection                 |
| `SMTP_USER`                 | Optional | `user@sbu.ac.in`                   | SMTP authentication user                        |
| `SMTP_PASS`                 | Optional | `app-password`                     | SMTP authentication password                    |

---

## 🐳 Docker & Docker Compose Deployment

The project includes a multi-container Docker configuration with `ncc-app` and a persistent `redis` service.

### Launch Containers

```bash
# Build and run containers in detached mode
docker-compose up -d --build
```

### Container Architecture

- **`ncc-app`**: Production build running Node 22 Alpine on port `3000` with healthcheck endpoint at `/api/v1/health`.
- **`ncc_redis`**: Redis 7 Alpine container running on port `6379` with a persistent volume (`redis_data`) for caching and rate limiting.

### Manage Containers

```bash
# Check container status
docker-compose ps

# View real-time logs
docker-compose logs -f

# Stop and remove containers
docker-compose down
```

---

## 🌐 Vercel Deployment Guide

Deploying to Vercel requires zero infrastructure overhead and leverages Vercel's serverless edge network.

### Step 1: Push Code to GitHub

Ensure all local changes are committed and pushed to your GitHub repository:

```bash
git add .
git commit -m "Prepare production deployment"
git push origin main
```

### Step 2: Import into Vercel

1. Log in to [Vercel Dashboard](https://vercel.com).
2. Click **New Project** and import the `NCC-CRM-V1.0` repository.
3. Vercel will automatically detect the settings specified in `vercel.json`:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `.output/public`

### Step 3: Configure Vercel Environment Variables

In the Vercel Project Settings under **Environment Variables**, add:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `JWT_SECRET`
- `SESSION_SECRET`
- `UPSTASH_REDIS_REST_URL` _(Recommended for Vercel serverless Redis rate-limiting)_
- `UPSTASH_REDIS_REST_TOKEN`

### Step 4: Deploy

Click **Deploy**. Vercel will build the frontend assets and serverless functions with security headers configured via `vercel.json`.

---

## 🔴 Redis Caching & Rate Limiting Architecture

The platform features a resilient **Dual-Mode Redis Client** (`backend/lib/redis.server.ts`):

1. **Cloud Serverless Mode**: Used when `UPSTASH_REDIS_REST_URL` & `UPSTASH_REDIS_REST_TOKEN` are set (ideal for Vercel).
2. **Container / Local Mode**: Used when `REDIS_URL` is configured (ideal for Docker Compose).
3. **Automatic In-Memory Fallback**: If Redis is not configured or unavailable, rate limiting automatically falls back to an in-memory sliding window algorithm without throwing application errors.

---

## 📋 Key API Endpoints Matrix

| Category       | Endpoint                            | Method     | Access           | Description                           |
| :------------- | :---------------------------------- | :--------- | :--------------- | :------------------------------------ |
| **System**     | `/api/v1/health`                    | GET        | Public           | System health check & Redis status    |
| **Auth**       | `/api/v1/auth/login`                | POST       | Public           | User authentication with rate limit   |
| **Auth**       | `/api/v1/auth/me`                   | GET        | Session          | Retrieve active user session profile  |
| **Auth**       | `/api/v1/auth/otp/request`          | POST       | Public           | Request OTP for authentication/reset  |
| **Enrollment** | `/api/v1/enrollments`               | POST / GET | Public / Officer | Submit application / list enrollments |
| **Enrollment** | `/api/v1/enrollments/status/$query` | GET        | Public           | Track application status (PII masked) |
| **Cadets**     | `/api/v1/cadets`                    | GET        | Officer          | Query unit nominal rolls & roster     |
| **Export**     | `/api/v1/export-excel`              | GET        | Officer          | Export official nominal roll Excel    |
| **Operations** | `/api/v1/activities`                | GET / POST | Public / Officer | Manage battalion activities           |
| **Operations** | `/api/v1/calendar`                  | GET / POST | Public / Officer | Manage parade & event calendar        |
| **Operations** | `/api/v1/staff-attendance`          | GET / POST | Officer          | PI staff duty clock-in/out            |

---

## 🧪 Testing & Verification

Run the comprehensive unit test suite covering auth, security, data sanitization, and Redis rate limiting:

```bash
# Run backend test suite
npm test

# Run ESLint check
npm run lint

# Format code with Prettier
npm run format
```

---

## 📜 License & Compliance

Maintained for the **19 Jharkhand Battalion NCC (Sarala Birla University Unit)**. Managed in accordance with institutional security guidelines and Supabase RLS row-level security protocols.
