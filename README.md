# 19 JHR BN NCC • Sarala Birla University (SBU) Company Portal

> **Enterprise Digital Management Platform for 19 Jharkhand Battalion NCC (Ranchi, Bihar & Jharkhand Directorate) at Sarala Birla University, Ranchi.**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![React](https://img.shields.io/badge/React-18.0-blue.svg)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-6.2-646CFF.svg)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.1-38B2AC.svg)](https://tailwindcss.com)
[![Express](https://img.shields.io/badge/Express-4.21-000000.svg)](https://expressjs.com)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green.svg)](https://nodejs.org)

- **Version**: 3.0.0 (Enterprise Real-time Release)
- **Project Status**: 🟢 Active • Production & Deployment Ready

---

## 1. Project Title & Tagline

**19 JHR BN NCC • Sarala Birla University (SBU) Company Portal**  
*Modernizing Battalion Operations, Cadet Enrollment, Drill Tracking, AI Cadre Guidance, and Official Administration for Sarala Birla University, Ranchi.*

---

## 2. Executive Summary

- **What problem does it solve?** Replaces paper-based application forms, manual ledger attendance logs, and fragmented communications with a centralized real-time digital workspace.
- **Who is it for?** SBU students seeking NCC Senior Division (SD - Male) & Senior Wing (SW - Female) enrollment, enrolled cadets tracking attendance/leaves/certificates, and Associate NCC Officers (ANO) managing battalion records.
- **Why does it exist?** To streamline battalion workflows, enforce DBT bank data accuracy for camp allowances, accelerate status verification, and provide cadets 24/7 access to drill handbooks and AI-assisted exam preparation.
- **What makes it different?** Built-in real-time WebSocket broadcast engine (`/ws/v1`), server-side Gemini 3.6/3.1 AI Subedar Major Assistant, client-side dynamic PDF identity card generation, and one-click multi-sheet Excel nominal roll generation for Battalion HQ.

---

## 3. Project Overview

The portal unifies cadet lifecycle management into a single web application:
1. **Public Information & Enrollment Wizard**: Students complete a 4-stage registration form (Personal, Academic, Physical Fitness, Bank DBT details).
2. **Application Status Verification**: Real-time lookup modal allowing instant status tracking via Application ID, Aadhaar Number, or SBU Roll Number.
3. **Cadet Portal**: Enrolled cadets view drill attendance statistics, download printable Digital NCC ID Cards with QR verification, request leaves, and attempt mock quizzes for NCC 'B' & 'C' Certificate exams.
4. **Officer Administration Dashboard**: Officers review enrollment requests, update status (Submitted, Physical Scheduled, Medical Cleared, Selected, Enrolled), publish official broadcast announcements, and export nominal rolls to Excel.

---

## 4. Key Features

- **Cadet Enrollment Engine**: Automated validation for 1600m run timings, push-ups count, 10th/12th marks, sports achievement levels, and DBT bank account details.
- **Printable Cadet Digital Identity Card**: Client-side dynamic rendering using `html2canvas` and `jspdf` featuring official unit crests and QR code validation.
- **Subedar Major AI Assistant (24/7 Cadre Guide)**: Dual-model Gemini AI integration (`gemini-3.6-flash` & `gemini-3.1-flash-lite`) answering questions on drill commands, .22 Rifle Mark IV specs, map reading, camp eligibility, and SSB direct entry schemes.
- **Officer Control Center**: Comprehensive administration suite for reviewing candidates, updating ranks/remarks, tracking drill attendance, and broadcasting urgent alerts.
- **Real-Time WebSocket Engine**: Pub/Sub channels (`cadre:notifications`, `cadre:enrollments`, `cadre:presence`) delivering live updates across all connected browser sessions.
- **Multi-Sheet Excel Exporter**: Built-in backend exporter (`/api/v1/export-excel`) generating formatted `.xlsx` files with separate tabs for Nominal Rolls and Bank DBT details.
- **Security & Observability**: Express rate-limiting (120 req/min/IP), request correlation IDs (`X-Request-ID`), health status (`/api/v1/health`), and latency metrics (`/api/v1/metrics`).

---

## 5. UI & Feature Screenshots

The application features a modern dark military navy UI (`#002147`), brass gold accents (`#D4AF37`), high-contrast typography, and responsive layouts:
- **Hero & Public Portal**: Interactive banner, quick status tracker, and battalion overview.
- **Enrollment Wizard**: Structured 4-step wizard with real-time field validation.
- **Cadet Dashboard**: Attendance progress bars, leave manager, and printable ID card preview.
- **Officer Dashboard**: Filterable candidate table, approval modal, and broadcast composer.
- **Subedar Major AI Assistant**: Floating widget with active pulse glow and structured responses.

---

## 6. Technology Stack

- **Frontend**: React 18, TypeScript 5.8, Tailwind CSS v4, Motion (`motion/react`), Lucide Icons, html2canvas, jspdf, canvas-confetti.
- **Backend**: Node.js / Bun, Express.js (v4), TypeScript (`tsx`), WebSockets (`ws`), SheetJS (`xlsx`).
- **AI Integration**: `@google/genai` SDK targeting `gemini-3.6-flash` with fallback to `gemini-3.1-flash-lite`.
- **Tooling & Build**: Vite 6, esbuild, TypeScript compiler (`tsc`).

---

## 7. Architecture Overview

```
[ Browser / Mobile Client ]
       │
       ├─► HTTP REST API (/api/v1)
       │     ├── Middleware: Rate Limiter (120 req/min), X-Request-ID Correlation
       │     ├── Caching: ServerCache in-memory TTL store
       │     ├── Routes: /health, /metrics, /enrollments, /notifications, /ai-chat, /export-excel
       │     └── Exporters: SheetJS XLSX nominal roll generator
       │
       └─► WebSocket Engine (/ws/v1)
             ├── Protocol: ws / wss
             ├── Heartbeat: 15s ping-pong RTT latency tracking
             └── Channels: cadre:notifications, cadre:enrollments, cadre:presence
```

---

## 8. Project Structure

```
NCC/
├── .env.example              # Environment variables template
├── .gitignore                # Production ignore configuration
├── API_REFERENCE.md          # REST API & WebSocket documentation
├── CHANGELOG.md              # Version history log
├── CONTRIBUTING.md           # Guidelines for contributors
├── DATA_FLOW.md              # System data flow specs
├── LICENSE                   # MIT License
├── PROJECT_OVERVIEW.md       # High-level business overview
├── README.md                 # Primary project documentation
├── SECURITY.md               # Security & vulnerability reporting
├── server.ts                 # Backend Express & WebSocket server
├── package.json              # Dependencies and scripts
├── tsconfig.json             # TypeScript configuration
├── vite.config.ts            # Vite bundler configuration
└── src/                      # Frontend application source
    ├── App.tsx               # Main application component
    ├── main.tsx              # React entry point
    ├── index.css             # Tailwind CSS & global styles
    ├── types.ts              # Core TypeScript interfaces
    ├── components/           # React UI components
    │   ├── AboutNCC.tsx
    │   ├── ActivitiesGallery.tsx
    │   ├── AdminDashboard.tsx
    │   ├── AiCadreAssistant.tsx
    │   ├── CadetDashboard.tsx
    │   ├── EnrollmentForm.tsx
    │   ├── FaqSection.tsx
    │   ├── Footer.tsx
    │   ├── HeroSection.tsx
    │   ├── Navbar.tsx
    │   ├── NotificationsFeed.tsx
    │   ├── PrintableEnrollmentForm.tsx
    │   ├── RanksSyllabusSection.tsx
    │   ├── SbuNccSignupPortal.tsx
    │   └── StatusTrackerModal.tsx
    ├── data/                 # Static data constants
    │   └── nccData.ts
    ├── hooks/                # Custom React hooks
    │   └── useRealtimeData.ts
    └── services/             # API client & caching SDK
        └── dataPlatform.ts
```

---

## 9. Installation & Getting Started

### Prerequisites
- **Node.js**: v18.0.0 or higher (or **Bun** v1.0+)
- **npm**: v9.0.0+

### Step-by-Step Setup

```bash
# 1. Clone the repository
git clone https://github.com/Hellthefox808/NCC-CRM-V1.0.git
cd NCC-CRM-V1.0

# 2. Install dependencies
npm install

# 3. Setup environment variables
cp .env.example .env

# 4. Start local development server
npm run dev
```

The application will be available at `http://localhost:3000`.

---

## 10. Configuration & Environment Variables

Create a `.env` file in the root directory:

```env
# Server Port Configuration
PORT=3000

# Google Gemini AI API Key (Server-Side Only)
GEMINI_API_KEY="your_gemini_api_key_here"

# Application URL
APP_URL="http://localhost:3000"
```

> **Security Note**: `GEMINI_API_KEY` is loaded on the backend in `server.ts` and is **never** exposed to browser clients.

---

## 11. Usage Guide

- **Public Users**: Visit home page, review enrollment criteria, click **"Apply for Enrollment"**, and fill out the multi-step form.
- **Track Status**: Click **"Track Application"** in the navigation bar and enter your Application ID, Aadhaar, or SBU Roll Number.
- **Cadets**: Log into the Cadet Portal to view parade attendance statistics, download your printable Digital ID Card, or practice mock quizzes.
- **Officers**: Log into the Officer Command Portal to verify candidates, issue ranks/remarks, broadcast notices, and export Excel nominal rolls.

---

## 12. API Overview

### Primary Endpoints (`/api/v1`)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/v1/health` | System health check & memory statistics |
| `GET` | `/api/v1/metrics` | System latency & cache hit ratio metrics |
| `GET` | `/api/v1/enrollments` | List enrollments (supports filtering, sorting, pagination) |
| `GET` | `/api/v1/enrollments/status/:query` | Track cadet application status |
| `POST` | `/api/v1/enrollments` | Submit new cadet enrollment application |
| `PATCH` | `/api/v1/enrollments/status` | Update candidate status & officer remarks |
| `GET` | `/api/v1/notifications` | Fetch active officer notice feed |
| `POST` | `/api/v1/notifications` | Broadcast official notice to connected clients |
| `POST` | `/api/v1/ai-chat` | Submit prompt to Subedar Major AI Assistant |
| `GET` | `/api/v1/export-excel` | Download nominal roll Excel file (`.xlsx`) |

---

## 13. Security Practices

- **Token Bucket Rate Limiting**: Restricts requests to 120 per minute per IP address.
- **Payload Constraints**: Limits incoming JSON request bodies to `10MB`.
- **Request Tracing**: Injects unique `X-Request-ID` headers into every response.
- **Secret Isolation**: Protects Gemini API keys on the server backend.

---

## 14. Performance Strategy

- **Server-side Caching**: In-memory `ServerCache` with TTL invalidates automatically on data mutation.
- **Client Request Deduplication**: `dataCache.deduplicate()` merges concurrent duplicate API calls.
- **Asset Optimization**: Vite bundles frontend assets with gzip compression.

---

## 15. Accessibility & UX

- High contrast text targeting WCAG AA compliance.
- Keyboard accessible form fields and modal dialogs with focus trap management.
- Motion preference support via Framer Motion settings.

---

## 16. Testing & Quality Assurance

- **Type Check**: Executed via `npm run lint` (`tsc --noEmit`).
- **Production Build Sanity**: Validated via `npm run build`.

---

## 17. Deployment & Production Setup

To compile and run for production:

```bash
# 1. Build client assets and bundle Express server
npm run build

# 2. Start production server
npm run start
```

The server serves static assets from `dist/` and runs the backend API on port `3000`.

---

## 18. Additional Documentation Index

- [`PROJECT_OVERVIEW.md`](PROJECT_OVERVIEW.md) — High-level business problem and solution overview.
- [`ARCHITECTURE.md`](ARCHITECTURE.md) — System architecture & subsystem specifications.
- [`API_REFERENCE.md`](API_REFERENCE.md) — Detailed REST API specs and payloads.
- [`DATA_FLOW.md`](DATA_FLOW.md) — Data flow and state lifecycle diagrams.
- [`REALTIME_ARCHITECTURE.md`](REALTIME_ARCHITECTURE.md) — Real-time WebSocket gateway specs.
- [`WEBSOCKET_EVENTS.md`](WEBSOCKET_EVENTS.md) — WebSocket event catalog & contracts.
- [`INTEGRATION_GUIDE.md`](INTEGRATION_GUIDE.md) — Developer SDK & React hook usage guide.
- [`SECURITY.md`](SECURITY.md) — Security policy and vulnerability disclosure procedures.
- [`DEPLOYMENT.md`](DEPLOYMENT.md) — Production deployment, Docker & Cloud setup guide.
- [`TESTING.md`](TESTING.md) — Quality assurance & testing specifications.
- [`PER_FILE_DOCUMENTATION.md`](PER_FILE_DOCUMENTATION.md) — Per-file source module breakdown.
- [`STACK_MODERNIZATION_REPORT.md`](STACK_MODERNIZATION_REPORT.md) — Technology stack audit & rewrite decision report.
- [`GITHUB_SANITIZATION_REPORT.md`](GITHUB_SANITIZATION_REPORT.md) — Pre-push repository audit & secret scan report.
- [`CONTRIBUTING.md`](CONTRIBUTING.md) — Code contribution guidelines.
- [`LICENSE`](LICENSE) — Open source software license terms.

---

## 19. Roadmap & Future Scope

- [ ] PostgreSQL / Cloud SQL database integration for persistent multi-node deployments.
- [ ] Redis pub/sub adapter for multi-instance WebSocket horizontal scaling.
- [ ] Automated SMS/WhatsApp notifications for drill parade alerts.

---

## 20. License

This project is licensed under the [MIT License](LICENSE).

---

## 21. Author & Maintainer Profile

**Author & Principal Architect**: **Ravi Ranjan Singh**  
- **Role**: Software Engineer • Software Architect • Full Stack Developer • AI SaaS Developer  
- **Repository Maintainer**: **Ravi Ranjan Singh**  
- **GitHub Profile**: [https://github.com/Hellthefox808](https://github.com/Hellthefox808)  
- **Repository**: [https://github.com/Hellthefox808/NCC-CRM-V1.0](https://github.com/Hellthefox808/NCC-CRM-V1.0)
