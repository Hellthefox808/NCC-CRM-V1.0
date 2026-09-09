# 19 Jharkhand Battalion NCC — CI/CD Pipeline Architecture & Operations

## 1. Executive Summary

This document establishes the official Continuous Integration (CI) and Continuous Delivery (CD) operational specification for the **19 Jharkhand Battalion NCC Command Portal** (`Hellthefox808/NCC-CRM-V1.0`).

The pipeline is engineered to deliver:
- **Zero-Trust Validation**: Deterministic static analysis, strict TypeScript compiler verification, and OWASP-grade test coverage.
- **Fail-Fast Quality Gates**: Independent, parallelized jobs reporting distinct status checks for immediate developer feedback.
- **Supply-Chain & Container Security**: Least-privilege permissions, automated dependency vulnerability auditing, and immutable container builds.
- **Rollback Safety & Health Verification**: Automated multi-probe deployment verification against `/api/v1/health` with retry-backoff algorithms.

---

## 2. CI/CD Architecture Map

```text
DEVELOPER PUSH / PULL REQUEST
              │
              ▼
┌────────────────────────────────────────────────────────┐
│                   PR Quality Gates                     │
│  - Conventional Commit Validation                      │
│  - PR Diff Size Threshold Guard                        │
└─────────────────────────────┬──────────────────────────┘
                              │
                              ▼
┌────────────────────────────────────────────────────────┐
│                   CI Quality Matrix                    │
│  ┌──────────────┬──────────────┬────────────────────┐  │
│  │ Lint Style   │ Typecheck    │ Test Suite (69/69) │  │
│  └──────┬───────┴──────┬───────┴────────────┬───────┘  │
│         │              │                    │          │
│  ┌──────┴──────────────┴───────┐     ┌──────┴───────┐  │
│  │ Prisma Validate & Generate  │     │ Security Scan│  │
│  └──────────────┬──────────────┘     └──────┬───────┘  │
│                 └──────────────┬────────────┘          │
│                                │                       │
│                                ▼                       │
│                   Production Build & Output            │
│                                │                       │
│                                ▼                       │
│                   Docker Multi-Stage Validate          │
└─────────────────────────────┬──────────────────────────┘
                              │
                    MERGE TO MAIN BRANCH
                              │
                              ▼
┌────────────────────────────────────────────────────────┐
│             Continuous Delivery (CD) Engine            │
│  - Concurrency Lock (Serial Production Deployment)     │
│  - Release Gate Verification                           │
│  - Immutable Container Tagging (sha-<commit-sha>)      │
│  - Artifact Archival (14-day retention)                │
│  - Automated Health Verification & Smoke Probes        │
│  - Automated Rollback Trigger on Probe Failure         │
└────────────────────────────────────────────────────────┘
```

---

## 3. Workflow Specifications

### 3.1. Quality Matrix (`.github/workflows/ci.yml`)
- **Trigger**: Push to `main`, Pull Request targeting `main`, `workflow_dispatch`.
- **Permissions**: `contents: read` (Enforced Least Privilege).
- **Concurrency**: Cancels obsolete in-flight runs on the same branch.
- **Matrix Jobs**:
  1. `lint`: Executes ESLint 9 across `src/`, `backend/`, and `frontend/`.
  2. `typecheck`: Executes `tsc --noEmit` against strict TypeScript specifications.
  3. `test`: Executes Node.js native test runner across all 12 test suites (69 tests).
  4. `prisma-validate`: Verifies Prisma schema syntax and generates typed client.
  5. `security-check`: Audits npm dependencies for critical vulnerabilities and scans git commit history for private credentials.
  6. `build`: Compiles Vite frontend assets and Nitro SSR server bundle into `.output/`.
  7. `docker-validate`: Builds multi-stage production Docker container to guarantee deployment readiness.

### 3.2. Continuous Delivery & Deployment Pipeline (`.github/workflows/deploy.yml`)
- **Trigger**: Merge/Push to `main`, manual dispatch (`workflow_dispatch`).
- **Permissions**: `contents: read`, `deployments: write`.
- **Concurrency**: `group: production-deployment`, `cancel-in-progress: false` (Guarantees atomic, non-overlapping production rollouts).
- **Release Steps**:
  1. `build-artifact`: Generates Prisma client, compiles production bundle (`NITRO_PRESET=node-server`), and uploads immutable artifacts.
  2. `deploy-and-verify`: Downloads artifacts, runs optional Prisma migrations if `DATABASE_URL` is set, builds container tagged with commit SHA (`ncc-crm:${{ github.sha }}`), spins up runtime container, executes automated health checks (`/api/v1/health?type=liveness`) and smoke tests (`/api/v1/enrollments/status/...`) with fallback between remote and local runtime, and executes rollback cleanup on failure.

### 3.3. PR Quality Gate (`.github/workflows/pr-validation.yml`)
- Validates that PR titles follow Conventional Commits standard (`feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`).
- Monitors PR diff size and warns if modifications exceed 2,500 lines to preserve code review quality.

### 3.4. Scheduled Security Audit (`.github/workflows/security-audit.yml`)
- Runs weekly (Sundays at 00:00 UTC) and on-demand.
- Scans dependency graph for critical vulnerabilities.
- Audits full Git patch history for accidental credential leakage (RSA keys, AWS keys, GitHub tokens).

---

## 4. Local CI-Equivalent Commands

Developers can reproduce 100% of CI validation locally prior to pushing code:

```bash
# 1. Deterministic Dependency Installation
npm ci

# 2. Static Code Analysis & Prettier Linting
npm run lint

# 3. TypeScript Strict Compiler Verification
npm run typecheck

# 4. Prisma Schema Validation & Client Generation
npm run prisma:validate
npm run prisma:generate

# 5. Unit & Integration Test Matrix
npm test

# 6. Production SSR Compilation
npm run build

# 7. Local Docker Container Build Verification
docker build -t ncc-crm-app:local .
```

---

## 5. Environment Variables & Secret Configuration

> [!IMPORTANT]
> Never commit real secret values to repository code or workflow files. Use GitHub Repository Secrets and GitHub Environments (`production`).

### 5.1. Required Secrets (GitHub Secrets)
| Secret Name | Purpose | Scope |
| :--- | :--- | :--- |
| `VITE_SUPABASE_URL` | Supabase project API gateway | Staging / Production |
| `VITE_SUPABASE_ANON_KEY` | Public client token for Supabase | Staging / Production |
| `SUPABASE_URL` | Backend server direct Supabase URL | Staging / Production |
| `SUPABASE_ANON_KEY` | Backend server anon key | Staging / Production |
| `SUPABASE_SERVICE_ROLE_KEY` | Elevated key for admin operations | Production Server |
| `JWT_SECRET` | 256-bit secret for signing auth tokens | Backend Server |
| `SESSION_SECRET` | 32-byte secret for session management | Backend Server |
| `REDIS_PASSWORD` | Access password for distributed Redis | Docker / Production |
| `DATABASE_URL` | PgBouncer pooler connection string | Prisma ORM |
| `DIRECT_URL` | Direct PostgreSQL connection for migrations| Prisma ORM |

### 5.2. Required Variables (GitHub Variables)
| Variable Name | Purpose | Example Value |
| :--- | :--- | :--- |
| `PRODUCTION_URL` | Target production domain for health probes | `https://19th-jh-ncc-crm-v1-0.vercel.app` |

---

## 6. Health Verification & Rollback Protocols

### 6.1. Health Check Probes
The deployment health verification automatically tests:
- **Liveness Probe**: `GET /api/v1/health?type=liveness`
  - Validates process responsiveness and memory headroom.
- **Readiness Probe**: `GET /api/v1/health?type=readiness`
  - Validates PostgreSQL database connectivity and Redis availability.

### 6.2. Rollback Protocol
If `healthcheck-smoke-test` fails or reports an HTTP status outside `{200, 301, 308}`:
1. **Pipeline Fails Immediately**: Alerts DevOps via GitHub Actions notification.
2. **Immutable Container Recovery**: Re-tag and deploy the previous known-good commit SHA artifact from GitHub Actions packages.
3. **Database Migration Precaution**: Never execute automated rollback on migrations unless forward/backward compatibility is verified. Use the `expand -> deploy -> migrate -> contract` pattern.
