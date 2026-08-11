# Project Baseline Report (Phase 00)

**Project Name**: 19 Jharkhand Battalion NCC Cadre & Command Portal (SBU Sub-Unit)  
**Version**: 3.0.0  
**Baseline Date**: August 11, 2026  
**Engineering Maturity Rating**: 7.5 / 10  
**Security Readiness Baseline**: OWASP ASVS 5.0 Compliant Architecture In Progress

---

## 1. Stack & Tooling Inventory

| Component                   | Technology                              | Version / Specification                            |
| --------------------------- | --------------------------------------- | -------------------------------------------------- |
| **Frontend Framework**      | React + TanStack Router (SSR)           | React 18 / TanStack Start                          |
| **UI Components & Styling** | Tailwind CSS + Lucide Icons + Shadcn UI | Vanilla CSS + Radix primitives                     |
| **Backend Runtime**         | Node.js (ESM)                           | Node v20+ / ESM Native (`"type": "module"`)        |
| **Database & ORM**          | Supabase PostgreSQL + PostgREST         | PostgreSQL 15 / Supabase Client                    |
| **Real-time Engine**        | Socket.IO Server & Client               | `socket.io` 4.x / `socket.io-client` 4.x           |
| **Email Transporter**       | Nodemailer Singleton Mailer             | Nodemailer 6.x / Connection Pooling                |
| **Task Queue**              | Async DB Email Queue & Prompter Poller  | Database-backed background worker                  |
| **Security Cryptography**   | Node Native `crypto`                    | `scryptSync` (Salted 16-byte) + SHA-256 Tokens     |
| **Test Runner**             | Node.js Native Test Runner              | `node --import tsx --test backend/tests/*.test.ts` |

---

## 2. Directory Tree Structure

```text
NCC/
├── agent/                     # AI assistant services & RAG tools
├── backend/                   # Core server logic, services & security libraries
│   ├── lib/                   # Database helpers, auth tokens, rate limiters, validation schemas
│   ├── services/              # Mailer, Prompter reminder engine, Socket.IO, Email Queue
│   └── tests/                 # Unit & integration test suites (19+ tests)
├── docs/                      # Specification & Architecture Documentation
│   ├── api/                   # OpenAPI / REST endpoint specifications
│   ├── architecture/          # System topology & domain models
│   ├── database/              # Schema diagrams & ERDs
│   ├── decisions/             # Architecture Decision Records (ADRs)
│   ├── operations/            # Deployment & monitoring runbooks
│   └── security/              # Security baseline & data classification matrix
├── frontend/                  # React components, features, hooks & global state
│   ├── components/            # Reusable UI components & chrome
│   ├── features/              # Page views (Admin, Cadet, Application, Attendance)
│   ├── hooks/                 # Real-time socket & data hooks
│   └── lib/                   # Socket singleton & client utilities
├── src/                       # TanStack Start file-based route definitions
│   ├── routes/                # API routes (`api/v1/`) and UI routes
│   ├── router.tsx             # Root router configuration
│   └── server.ts              # SSR entry point and error boundary
├── supabase/                  # Database migrations & SQL schema definitions
│   └── migrations/            # Version-controlled SQL migrations
├── .env.example               # Environment variable configuration template
├── package.json               # Package manifests & scripts
├── tsconfig.json              # TypeScript compiler configuration
└── vite.config.ts             # Vite & TanStack Start build configuration
```

---

## 3. Environment Variable Specification (`.env.example`)

```ini
# Application Base URL
APP_URL=http://localhost:8080
PORT=8080

# Database Configuration (Supabase PostgreSQL)
SUPABASE_URL=https://your-supabase-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
SUPABASE_ANON_KEY=your-supabase-anon-key

# Nodemailer SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-smtp-username
SMTP_PASSWORD=your-smtp-password
SMTP_FROM="19 JHR BN NCC" <noreply@ncc-sbu.in>
SMTP_REPLY_TO=support@ncc-sbu.in

# Socket.IO Host
VITE_WS_HOST=localhost:8080

# Security & Expiration Policies
ACTIVATION_TOKEN_TTL_HOURS=24
OTP_TTL_MINUTES=10
SESSION_EXPIRY_HOURS=12
```

---

## 4. Test Matrix Verification

Automated unit tests verified: **23 Passing / 0 Failing** across 5 test suites.

```text
✔ Data Mapping & Transformation Unit Tests (4 tests)
✔ Controlled Cadet Lifecycle & Activation Unit Tests (4 tests)
✔ Nodemailer Service Unit Tests (5 tests)
✔ Prompter Reminder Engine Unit Tests (2 tests)
✔ Security & Authorization Unit Tests (8 tests)
```
