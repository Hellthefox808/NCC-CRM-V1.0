# 19 JHR BN NCC • Sarala Birla University (SBU) Company Portal

> **Enterprise Microservices & Data Platform for 19 Jharkhand Battalion NCC (Ranchi, Bihar & Jharkhand Directorate) at Sarala Birla University, Ranchi.**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![React](https://img.shields.io/badge/React-19.0-blue.svg)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-6.4-646CFF.svg)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC.svg)](https://tailwindcss.com)
[![Express](https://img.shields.io/badge/Express-4.21-000000.svg)](https://expressjs.com)
[![Prisma](https://img.shields.io/badge/Prisma-6.4-2D3748.svg)](https://www.prisma.io)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15.0-336791.svg)](https://www.postgresql.org)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED.svg)](https://www.docker.com)

- **Version**: 4.0.0 (Decoupled Microservices Architecture)
- **Project Status**: 🟢 Active • Production & Deployment Ready

---

## 1. Project Title & Tagline

**19 JHR BN NCC • Sarala Birla University (SBU) Company Portal**  
*Decoupled Microservices Architecture for Battalion Operations, Cadet Enrollment, Drill Tracking, Live WebSocket Pipelines, AI Cadre Guidance, and Official Administration.*

---

## 2. Executive Summary

- **What problem does it solve?** Replaces legacy paper-based application forms, manual ledger attendance logs, and fragmented communications with a centralized, real-time microservices data platform.
- **Who is it for?** SBU students seeking NCC Senior Division (SD - Male) & Senior Wing (SW - Female) enrollment, enrolled cadets tracking attendance/leaves/certificates, and Associate NCC Officers (ANO) managing battalion records.
- **Why does it exist?** To streamline battalion workflows, enforce DBT bank data accuracy for camp allowances, accelerate status verification, and provide cadets 24/7 access to drill handbooks and AI-assisted exam preparation.
- **What makes it different?** Complete separation into **frontend** and **backend** microservices, Prisma ORM + PostgreSQL persistence layer, real-time WebSocket broadcast engine (`/ws/v1`), server-side Gemini AI Subedar Major Assistant, client-side dynamic PDF identity card engine, and multi-sheet Excel nominal roll generation.

---

## 3. Project Architecture & Microservices

The application is structured into decoupled, independent microservices communicating via **REST API Pipelines** and **Bi-Directional WebSocket Gateways**:

```
                                 ┌─────────────────────────────────┐
                                 │    Browser / Mobile Clients     │
                                 └────────────────┬────────────────┘
                                                  │
                                  HTTP REST / WS Pipeline (/api/v1)
                                                  │
                 ┌────────────────────────────────┴────────────────────────────────┐
                 │                                                                 │
                 ▼                                                                 ▼
   ┌──────────────────────────┐                                      ┌──────────────────────────┐
   │   Frontend Microservice  │                                      │   Backend Microservice   │
   │   (React 19 + Vite 6)    │                                      │ (Express + Node 20 + WS) │
   │   - Glassmorphism UI     │                                      │ - Rate Limiting & Auth   │
   │   - Cadet/Admin Views    │                                      │ - WebSocket Broadcast    │
   │   - PDF Identity Engine  │                                      │ - ServerCache (TTL Store)│
   └──────────────────────────┘                                      └────────────┬─────────────┘
                                                                                  │
                                                                           Prisma ORM Client
                                                                                  │
                                                                                  ▼
                                                                     ┌──────────────────────────┐
                                                                     │   PostgreSQL 15 Database │
                                                                     │   - Cadet Records        │
                                                                     │   - Parade Attendance    │
                                                                     │   - Leave Requests       │
                                                                     └──────────────────────────┘
```

---

## 4. Key Features

- **Decoupled Microservices Architecture**: Standalone frontend React app (`frontend/`) and Express REST + WebSocket backend (`backend/`) orchestrated via Docker Compose.
- **PostgreSQL Persistence Layer**: Relational data storage managed via **Prisma ORM** (`backend/prisma/schema.prisma`) for robust cadet, attendance, leave, and notice records.
- **Cadet Enrollment Engine**: Automated validation for 1600m run timings, push-ups count, 10th/12th marks, sports achievement levels, and DBT bank account details.
- **Printable Cadet Digital Identity Card**: Client-side dynamic rendering using `html2canvas` and `jspdf` featuring official unit crests and QR code validation.
- **Subedar Major AI Assistant (24/7 Cadre Guide)**: Powered by Google Gemini AI (`gemini-2.5-flash` / `gemini-1.5-flash`) answering questions on drill commands, .22 Rifle Mark IV specs, map reading, camp eligibility, and SSB direct entry schemes.
- **Officer Control Center**: Modular administration suite for reviewing candidates, updating ranks/remarks, tracking drill attendance, and broadcasting urgent alerts.
- **Real-Time WebSocket Engine**: Pub/Sub channels (`cadre:notifications`, `cadre:enrollments`, `cadre:presence`) delivering live updates across all connected sessions.
- **Multi-Sheet Excel Exporter**: Backend exporter (`/api/v1/export-excel`) generating formatted `.xlsx` files with separate tabs for Nominal Rolls and Bank DBT details.

---

## 5. Visual Interface Showcase & Design System

```
  Primary Dark Navy   │ #002147 │ Main Header, Cards, Modal Backgrounds
  Ceremonial Brass    │ #D4AF37 │ Badges, Borders, Highlights, Active States
  Cadet Emerald       │ #10B981 │ Success Statuses, Verified Badges, Real-time Pulse
  Shield Crimson      │ #EF4444 │ Urgent Alerts, Critical Notices, Rejection Tags
  Slate Background    │ #F8FAFC │ High-contrast Crisp Surface Container
```

---

## 6. Project Directory Structure

```
NCC-CRM-V1.0/
├── frontend/                              # Standalone React 19 + Vite Microservice
│   ├── src/
│   │   ├── components/                    # Feature Components (Admin, Cadet, Hero, Navbar, etc.)
│   │   ├── pages/                         # Top-Level Page Views (Home, Enrollment, Cadet, Admin, Login)
│   │   ├── hooks/                         # Real-time WebSocket Custom Hooks (useRealtimeData.ts)
│   │   ├── services/                      # Enterprise API SDK Client (dataPlatform.ts)
│   │   └── types.ts                       # Frontend Data Models & Interfaces
│   ├── components/                        # UI Design Primitives (shadcn/ui)
│   ├── hooks/                             # Responsive UI Hooks (use-mobile.ts)
│   ├── lib/                               # Styling Utilities (utils.ts)
│   ├── public/                            # Static Web Assets & Media Images
│   ├── index.html                         # SPA Root HTML Template
│   ├── vite.config.ts                     # Vite Dev Server & Proxy Settings
│   ├── tsconfig.json                      # Frontend TypeScript Config
│   └── package.json                       # Frontend Package Manifest
│
├── backend/                               # Standalone Express + Prisma + WebSocket Microservice
│   ├── src/
│   │   ├── controllers/                   # Domain API Controllers (auth, enrollment, notification, system)
│   │   ├── routes/                        # Versioned REST Routes (/api/v1/*)
│   │   ├── repositories/                  # Prisma Client (db.ts) & ServerCache (cache.ts)
│   │   ├── services/                      # WebSocket Engine & Telemetry Services
│   │   ├── middlewares/                   # Security Headers, Rate Limiting & Tracing
│   │   └── index.ts                       # Express & WebSocket HTTP Server Entry Point
│   ├── prisma/
│   │   └── schema.prisma                  # Relational PostgreSQL Schema
│   ├── tsconfig.json                      # Backend TypeScript Config
│   └── package.json                       # Backend Package Manifest
│
├── shared/
│   └── types/
│       └── index.ts                       # Shared DTO & Interface Declarations
│
├── documentation/                         # Architecture & API Specs
├── docker-compose.yml                     # Multi-Container Deployment Orchestration
├── .env.example                           # Complete Environment Variables Template
├── package.json                           # Root Workspace Package Descriptor
└── README.md                              # Main Project Overview & Guide
```

---

## 7. Technology Stack

- **Frontend**: React 19, TypeScript 5.8, Vite 6, Tailwind CSS v4, Motion (`motion/react`), Lucide Icons, html2canvas, jspdf, canvas-confetti.
- **Backend**: Node.js v20, Express.js (v4), TypeScript (`tsx`), WebSockets (`ws`), SheetJS (`xlsx`), Prisma ORM.
- **Database**: PostgreSQL 15 Alpine container.
- **AI Integration**: `@google/genai` SDK targeting Google Gemini AI models.
- **Containerization**: Docker, Docker Compose, Nginx Alpine (Frontend Reverse Proxy).

---

## 8. Installation & Quick Start

### Prerequisites
- **Node.js**: v20.0.0 or higher
- **npm**: v9.0.0+
- **Docker & Docker Compose**: (Required for database & containerized runtime)

### 🚀 Running with Docker Compose (Recommended)

```bash
# 1. Clone the repository
git clone https://github.com/Hellthefox808/NCC-CRM-V1.0.git
cd NCC-CRM-V1.0

# 2. Copy environment template
cp .env.example .env

# 3. Launch full microservices stack (Frontend, Backend, PostgreSQL)
docker-compose up --build -d

# 4. Access applications:
# - Frontend SPA: http://localhost:5173 (or http://localhost:80 in Docker)
# - Backend API:  http://localhost:3000/api/v1/health
```

### 💻 Local Workspace Development

```bash
# 1. Install dependencies for root workspace and sub-packages
npm install

# 2. Start PostgreSQL container
docker-compose up -d db

# 3. Push Prisma database schema
npm --prefix backend run db:push

# 4. Run concurrent development servers
npm run dev

# Or run individual microservices:
npm run dev:frontend   # Starts Vite on port 5173
npm run dev:backend    # Starts Express backend on port 3000
```

---

## 9. Configuration & Environment Variables

Create a `.env` file in the root directory:

```env
# Server Port & Mode
PORT=3000
NODE_ENV=production

# Relational Database Connection
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/ncc_db?schema=public"

# Google Gemini AI Key
GEMINI_API_KEY="your_gemini_api_key_here"

# Frontend Network Pipelines
VITE_API_URL="http://localhost:3000/api/v1"
VITE_WS_HOST="localhost:3000"

# Host Application URL
APP_URL="http://localhost:3000"
```

---

## 10. API Reference Overview

### Primary API Endpoints (`/api/v1`)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/v1/health` | System health status & memory statistics |
| `GET` | `/api/v1/metrics` | System request latency & cache hit ratio metrics |
| `GET` | `/api/v1/enrollments` | List cadet applications (with filter, search, pagination) |
| `GET` | `/api/v1/enrollments/status/:query` | Track cadet application status by ID, Aadhaar, or SBU Roll |
| `POST` | `/api/v1/enrollments` | Submit new cadet enrollment application |
| `PATCH` | `/api/v1/enrollments/status` | Update candidate status & officer remarks |
| `GET` | `/api/v1/notifications` | Fetch active officer broadcast notices |
| `POST` | `/api/v1/notifications` | Broadcast official notice to connected WS sessions |
| `POST` | `/api/v1/ai-chat` | Submit question to Subedar Major AI Assistant |
| `GET` | `/api/v1/export-excel` | Download multi-tab nominal roll Excel file (`.xlsx`) |

---

## 11. Testing & Build Verification

```bash
# Run type checking across both microservices
npm run lint

# Build production bundles (esbuild backend + vite frontend)
npm run build
```

---

## 12. Author & Maintainer Profile

**Principal Architect**: **Ravi Ranjan Singh**  
- **Role**: Software Engineer • Software Architect • Full Stack Developer • AI SaaS Developer  
- **Repository Maintainer**: **Ravi Ranjan Singh**  
- **GitHub Profile**: [https://github.com/Hellthefox808](https://github.com/Hellthefox808)  
- **Repository**: [https://github.com/Hellthefox808/NCC-CRM-V1.0](https://github.com/Hellthefox808/NCC-CRM-V1.0)  

---
*Official Portal for 19 Jharkhand Battalion NCC (Ranchi) • Sarala Birla University (SBU), Ranchi.*
