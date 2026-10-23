<!-- LOVABLE:BEGIN -->

> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

<!-- LOVABLE:END -->

# Engineering & Agent Operating Protocol
## 19 Jharkhand Battalion NCC Command Centre & Cadet Portal (`Hellthefox808/NCC-CRM-V1.0`)

This document defines the mandatory operating contract, engineering standards, security rules, and validation protocols for all human engineers and AI coding agents operating on this repository.

---

## 1. Core Operating Principles

1. **Inspect Before Changing**: Always inspect existing code, directory structures, and git state before proposing or applying changes. Never assume an interface or implementation without verification.
2. **Preserve Working Functionality**: Do not break existing user workflows, routes, or features. Never silently modify runtime behavior during documentation or refactoring tasks.
3. **Zero-Placeholder Law**: Never commit `// TODO`, stub implementations, truncated configurations, or incomplete files. Every deliverable must be production-ready and functional.
4. **No History Rewrites (Lovable Compliance)**: Never run `git push --force`, `git rebase` published commits, or `git commit --amend` on pushed branches. All commits must be clean forward commits.
5. **No Direct Commits to `main`**: Work exclusively on scoped branches (e.g. `feat/...`, `fix/...`, `docs/...`) and open pull requests for review.
6. **Zero Credential Exposure**: Never commit API keys, service-role tokens, passwords, database connection strings, or real personal data.
7. **Empirical Evidence Only**: Never fabricate test counts, passing percentages, benchmarks, or certifications. Every reported metric must originate from an actual tool execution.

---

## 2. Context & Planning Protocol

Before initiating any task:

1. **Check Git Working Tree**: Run `git status` and `git log -n 5` to understand current branch state and verify no uncommitted user changes are overwritten.
2. **Read Authoritative Documentation**:
   - System Overview: [`docs/PROJECT-CONTEXT.md`](docs/PROJECT-CONTEXT.md)
   - Architecture & Topology: [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)
   - Authentication & Identity: [`docs/AUTH-MODEL.md`](docs/AUTH-MODEL.md)
   - Database & Schema: [`docs/DATABASE.md`](docs/DATABASE.md)
   - Cache & Rate Limiting: [`docs/REDIS-MODEL.md`](docs/REDIS-MODEL.md)
   - Test Matrix & Harness: [`docs/TEST-MATRIX.md`](docs/TEST-MATRIX.md)
   - Architecture Decisions: [`docs/adr/INDEX.md`](docs/adr/INDEX.md)
3. **Trace Data & Component Flow**: Map affected frontend components, backend handlers, and database tables before altering any logic.
4. **Distinguish Verified Facts from Assumptions**: Explicitly note verified code patterns versus external hypotheses.

---

## 3. Full-Stack Engineering Standards

### 3.1 Frontend Architecture (`frontend/`, `src/routes/`)
- **Framework**: React 19 with TanStack Start (SSR) and file-based TanStack Router.
- **Styling**: Tailwind CSS v4 and dynamic CSS variables (`var(--bg)`, `var(--card-bg)`, `var(--primary)`). Never hardcode light/dark theme color literals (`#fff`, `bg-white`, `text-black`).
- **Design Language**: Regimental Glassmorphism with authentic NCC tricolor accents (Army Red `#dc2626`, Navy Blue `#1e3a8a`, Air Force Cyan `#0284c7`, Brass Gold `#d97706`).
- **Accessibility (a11y)**: Maintain WCAG 2.2 AA compliance, visible keyboard focus indicators, accessible labels for icon-only buttons, and semantic HTML landmarks.
- **Responsive Geometry**: Test all interfaces across Desktop (1440×900), Laptop (1280×800), Tablet (768×1024), and Mobile (390×844).

### 3.2 Backend & API Architecture (`backend/`, `src/routes/api/v1/`)
- **Runtime**: Nitro 3.0 server engine compiling unified TypeScript ESM handlers for Node.js 22 and serverless edge.
- **Validation**: All incoming mutation requests (`POST`, `PUT`, `PATCH`) must validate against strict Zod schemas.
- **Error Handling**: Return structured JSON error envelopes with explicit HTTP status codes (`400 Bad Request`, `401 Unauthorized`, `403 Forbidden`, `404 Not Found`, `429 Too Many Requests`, `500 Internal Server Error`). Never leak internal stack traces to clients.
- **Real-Time Communications**: Socket.IO 4.8 engine with authenticated room isolation (`cadre:notifications`, `cadre:enrollments`, conversation rooms).

### 3.3 Database & Storage (`backend/lib/`, `supabase/migrations/`)
- **Primary Database**: Supabase PostgreSQL 15 accessed via Prisma ORM and Supabase Client.
- **Idempotent Migrations**: All database schema migrations in `supabase/migrations/` must be idempotent (`CREATE TABLE IF NOT EXISTS`, `CREATE INDEX IF NOT EXISTS`).
- **In-Memory Failover**: Database operations must degrade gracefully to in-memory mock stores (`cadetStore`, `memoryOtps`, `ChatStore`) when external databases are unreachable, preserving local dev and test availability.
- **Row-Level Security (RLS)**: Enforce PostgreSQL RLS policies on all public-facing tables.

### 3.4 Caching & Rate Limiting (`backend/lib/cache.server.ts`, `backend/lib/rate-limiter.server.ts`)
- **Multi-Tier Architecture**: L1 in-memory LRU cache + L2 distributed Redis (local TCP or Upstash REST).
- **Memory Ceiling**: Enforce `MAX_MEMORY_ITEMS = 5000` ceiling on L1 caches to prevent Node.js heap exhaustion under burst traffic.
- **Synchronized Invalidation**: Any mutation write must invalidate keys and key prefixes across both L1 and L2 simultaneously.
- **Single-Flight Deduplication**: Deduplicate concurrent cold-cache requests to prevent database thundering herd stampedes.

---

## 4. Security, Privacy & Data Handling

### 4.1 Authentication & Sessions
- **Password Security**: Passwords must be hashed using salted `scrypt` (`N=16384, r=8, p=1`). Never use MD5, SHA-1, or unsalted SHA-256 for passwords.
- **Activation Tokens**: Issue 256-bit cryptographically random tokens (`crypto.randomBytes(32)`). Store only `sha256(rawToken)` in the database. Invalidate upon single use with a 24-hour expiration window.
- **Session Tokens**: Issue `HttpOnly; SameSite=Strict; Secure` session cookies (`ncc_session`). Never store raw session tokens in `localStorage` or `sessionStorage`.
- **OTP Subsystem**: Isolate OTPs by purpose (`password_reset`, `onboarding`, `account_activation`). Enforce a 45-second resend cooldown and 5-attempt brute-force lockout.

### 4.2 Authorization & Access Control
- **Server-Side Enforcement**: All privileged actions must be verified server-side via `requireOfficer(request)` or `requireCadetSession(request)`. Never rely on client-supplied role parameters.
- **Public Data Masking**: Endpoints accessible to the public (e.g. `/api/v1/enrollments/status/:query`) must mask sensitive PII (Aadhaar, bank account numbers, IFSC, residential addresses, and parent contact information).

### 4.3 Safe File Uploads (OWASP ASVS 5.0 V12)
- **Magic-Byte Header Validation**: Inspect raw binary header bytes (PDF `%PDF`, PNG `\x89PNG`, JPEG `\xFF\xD8\xFF`). Reject disguised executables (`.exe`, `.sh`, `.bat`, `.js`, `.phar`).
- **Opaque Storage Capability Tokens**: Disallow direct client S3 key specification; generate unique server-derived storage tokens.
- **Size Ceilings**: Enforce maximum file size limits (10MB for documents, 2MB for profile photos).

### 4.4 Data Minimization & Privacy
- **Cadet Records**: The application manages personal bio-data, Aadhaar numbers, academic marks, and banking details for camp DBT allowances. Treat this data as high-sensitivity institutional PII.
- **Log Sanitization**: Never output passwords, auth tokens, full Aadhaar numbers, or bank account credentials to server console logs or error monitoring services.
- **Synthetic Test Data**: All automated tests must use synthetic mock records. Never commit real cadet records into test suites.

---

## 5. Engineering Validation Protocol

Every change must be validated proportionally to its blast radius:

| Change Scope | Required Validation Checks |
| :--- | :--- |
| **Documentation Only** (`README.md`, `docs/*`) | 1. Review `git diff --check`.<br>2. Verify internal relative links.<br>3. Check shell commands against `package.json`.<br>4. Ensure no machine-specific paths (`file:///`). |
| **Frontend Code** (`frontend/*`, UI components) | 1. `npm run lint`<br>2. `npm run typecheck`<br>3. Visual check across responsive viewports.<br>4. `npm run build` |
| **Backend & API** (`backend/*`, `src/routes/api/*`) | 1. `npm run lint`<br>2. `npm run typecheck`<br>3. `npm test` (verify 206 tests pass)<br>4. `npm run build` |
| **Database & Auth** (`supabase/*`, auth libraries) | 1. `npm run prisma:validate`<br>2. `npm test` (all tiers including Tier 1 & Tier 2)<br>3. Verify migration idempotency.<br>4. Additional security review. |
| **Infrastructure** (`Dockerfile`, `docker-compose.yml`, CI) | 1. Container configuration lint.<br>2. Check for committed fallback passwords.<br>3. Verify CI workflow syntax. |

---

## 6. Completion Report Contract

When completing any engineering task, the agent must output a structured handoff report covering:

1. **What Changed and Why**: Concise, non-trivial rationale for modifications.
2. **Files Affected**: Exact list of modified, created, or deleted files.
3. **Validation Commands Executed**: Real command invocations with exact results (e.g. `npm test -> 206 passed in 3.41s`).
4. **Omitted Checks & Rationale**: Any checks not run (e.g. skipped Docker run in an air-gapped terminal) and why.
5. **Security & Configuration Findings**: Any observed configuration risks (e.g. fallback passwords, exposed keys) documented separately.
6. **Git Branch & Pull Request Status**: Active branch name, commit SHA, and PR link or permission blocker.
