# Enterprise CI/CD Pipeline & Architecture Guide

> **19 Jharkhand Battalion NCC Command Centre & Cadet Portal**

---

## 🏛️ Pipeline Overview & Architecture

The repository employs a multi-stage GitHub Actions CI/CD pipeline enforcing code quality, type safety, test suite validation, security compliance, immutable artifact generation, database migration safety, and post-deployment health verification.

```
Developer Push / Pull Request
    │
    ├──> CI Pipeline (.github/workflows/ci.yml)
    │     ├── 1. Checkout & Setup Node.js 22 LTS
    │     ├── 2. Deterministic Install (`npm ci`)
    │     ├── 3. Prisma Schema Validation (`npx prisma validate`)
    │     ├── 4. Static Code Linting (`npm run lint`)
    │     ├── 5. Strict Typechecking (`npm run typecheck`)
    │     ├── 6. Automated Test Suite (`npm run test`)
    │     ├── 7. Production Bundle Compilation (`npm run build`)
    │     ├── 8. Security Audit (`npm audit`)
    │     └── 9. Multi-stage Docker Image Build Test
    │
Merge to main
    │
    └──> Production Deployment Pipeline (.github/workflows/deploy.yml)
          ├── 1. Immutable Artifact Build & Archive
          ├── 2. Safe Database Migrations (`prisma migrate deploy`)
          ├── 3. Deployment Artifact / Container Tagging (`commit SHA`)
          ├── 4. Automated Production Health Check (`GET /api/v1/health`)
          ├── 5. Production Smoke Test
          └── 6. Rollback Handling on Health Check Failure
```

---

## 🛠️ Local CI-Equivalent Verification Commands

Before pushing code or opening a PR, developers must run the following validation suite locally:

```bash
# 1. Deterministic Dependency Installation
npm ci

# 2. Prisma Schema Validation
npx prisma validate

# 3. Code Linting (ESLint)
npm run lint

# 4. Strict TypeScript Typecheck
npm run typecheck

# 5. Full Test Suite (67 tests across 12 suites)
npm run test

# 6. Production Bundle Build
npm run build

# 7. Multi-stage Docker Container Build
docker build -t ncc-crm:local .
```

---

## 🔐 Required GitHub Environment Secrets & Variables

The following secrets and environment variables must be configured in GitHub Repository / Environment settings (`production` environment):

| Name | Type | Purpose | Example / Description |
| :--- | :--- | :--- | :--- |
| `DATABASE_URL` | Secret | Production PostgreSQL Database Connection String | `postgresql://user:pass@host:5432/db` |
| `DIRECT_URL` | Secret | Direct Database Connection URL (Prisma Migrations) | `postgresql://user:pass@host:5432/db` |
| `JWT_SECRET` | Secret | 256-Bit Secret Key for Auth Tokens | Minimum 32 characters |
| `SESSION_SECRET` | Secret | Session Encryption Secret Key | Minimum 32 bytes |
| `SUPABASE_URL` | Secret / Env | Backend Supabase API URL | `https://qsrmzajadmmgqhfbxdwu.supabase.co` |
| `SUPABASE_ANON_KEY` | Secret / Env | Supabase Anonymous Client Key | `eyJhbGciOi...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Secret | Supabase Service Role Key | `eyJhbGciOi...` |
| `VITE_SUPABASE_URL` | Secret / Env | Frontend Supabase API URL | `https://qsrmzajadmmgqhfbxdwu.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Secret / Env | Frontend Supabase Anonymous Key | `eyJhbGciOi...` |
| `PROD_HEALTH_URL` | Variable | Production Endpoint for Health Checks | `https://.../api/v1/health` |
| `PROD_BASE_URL` | Variable | Production Application Base URL | `https://19th-jh-ncc-crm-v1-0.vercel.app` |

---

## 🛡️ Concurrency Controls & Security Standards

- **Pull Requests**: Concurrency group set to `${{ github.workflow }}-${{ github.ref }}` with `cancel-in-progress: true` to prevent redundant runner time on superseded commits.
- **Production Deployments**: Concurrency group set to `production-deployment` with `cancel-in-progress: false` to ensure single-flight execution and eliminate concurrent database or infrastructure mutation races.
- **Least-Privilege Permissions**: Top-level workflow permissions default strictly to `permissions: contents: read`.
- **Zero Secrets Leakage**: No hardcoded production passwords or tokens in repository code. Secrets are injected strictly via environment variables or GitHub Secrets.

---

## 🩺 Automated Health Checks & Smoke Testing

1. **Health Verification Endpoint**: `GET /api/v1/health`
   - Validates server runtime, memory consumption, uptime, and storage readiness.
   - Retries up to 5 times with exponential backoff to accommodate cold start times.
2. **Smoke Test Endpoint**: `GET /api/v1/enrollments/status/192026082163982382`
   - Verifies public route reachability, routing layer integrity, and database response handling.

---

## 🔄 Rollback Strategy

1. **Immutable Tagged Container Reversion**: In containerized environments, traffic is immediately routed back to the previous verified Docker image tag (`ncc-crm:${PREVIOUS_SHA}`).
2. **Artifact Re-deployment**: Static frontend assets and SSR functions are restored from the previous successful release output archive (`production-output`).
3. **Database Migration Safety**: Migrations use forward-compatible expand/contract patterns. Destructive reset commands (`prisma db push --force` or `prisma migrate reset`) are strictly prohibited in production pipelines.
