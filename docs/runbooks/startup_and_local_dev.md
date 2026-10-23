# Runbook: Local Development & Service Startup

**Component:** 19 Jharkhand Battalion NCC Command Centre Platform  
**Target Environment:** Local Workstation / Development VM  
**Runtime:** Node.js 22.x+ / TypeScript 5.7+ / Vite / Nitro SSR  

---

## 1. System Prerequisites

Ensure the following runtimes and tools are installed:
- **Node.js**: `v22.x` or `v24.x` (LTS recommended)
- **npm**: `v10.x` or higher (or `bun` / `pnpm`)
- **Docker & Docker Compose**: (Optional, for running full containerized stack with Redis and Postgres)
- **Git**: Installed with clean working tree

---

## 2. Environment Configuration

Copy the example environment template to `.env`:

```bash
cp .env.example .env
```

### Essential Environment Variables

| Variable | Description | Default / Dev Value |
|---|---|---|
| `NODE_ENV` | Runtime environment mode | `development` or `production` |
| `PORT` | HTTP port for server listener | `3000` |
| `VITE_SUPABASE_URL` | Supabase project endpoint | Optional for local in-memory fallback |
| `VITE_SUPABASE_ANON_KEY` | Supabase public anon key | Optional for local in-memory fallback |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase privileged service key | Optional for local in-memory fallback |
| `REDIS_URL` | Local TCP Redis connection URL | `redis://localhost:6379` (fallback to L1) |
| `JWT_SECRET` | 256-bit secret for signing tokens | Any 32+ char random string |
| `SESSION_SECRET` | Secret for session cookie authentication | Any 32+ char random string |
| `SMTP_HOST` | Transactional email provider host | Dev mailer mode active if unset |

> [!NOTE]
> **Deterministic In-Memory Fallback**: When Supabase or Redis are unconfigured or offline, the platform automatically activates in-memory fallbacks with full cryptographic security and state tracking.

---

## 3. Installation & Dependency Verification

Install dependencies using npm:

```bash
npm install
```

Verify that the TypeScript compiler and linters run cleanly:

```bash
# Verify static type safety
npm run typecheck

# Verify code style and linting
npm run lint
```

---

## 4. Running the Development Server

Start the local development server with Hot Module Replacement (HMR):

```bash
npm run dev
```

The application will start on:
- **Web Portal & API**: `http://localhost:3000`
- **Health Check Endpoint**: `http://localhost:3000/api/v1/health`
- **Metrics Telemetry**: `http://localhost:3000/api/v1/metrics`

---

## 5. Running the Automated Test Suite

Execute the full automated test matrix (206 tests across 71 suites):

```bash
npm run test
```

Expected output:
```text
ℹ tests 206
ℹ suites 71
ℹ pass 206
ℹ fail 0
ℹ duration_ms ~3000ms
```

---

## 6. Building the Production Bundle Locally

To test the production SSR compilation locally:

```bash
# Build the production bundle
npm run build

# Preview the built application
npx vite preview
```

---

## 7. Containerized Local Development (Docker Compose)

To spin up the application alongside Redis and Nginx:

```bash
# Build and start all services in detached mode
docker compose up -d --build

# Inspect running container logs
docker compose logs -f ncc_app

# Tear down containers and volumes
docker compose down
```
