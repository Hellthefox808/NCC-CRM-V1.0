# PROJECT OVERVIEW • 19 JHR BN NCC SBU COMPANY PORTAL

---

## 1. Project Vision

The **19 JHR BN NCC • Sarala Birla University (SBU) Company Portal** is an enterprise-grade digital management platform engineered to modernize battalion administration, cadet enrollment workflows, drill & parade attendance tracking, training syllabus delivery, official certificate verification, and real-time communication for the National Cadet Corps (NCC) Senior Division (SD) & Senior Wing (SW) companies operating under **19 Jharkhand Battalion NCC (Ranchi, Bihar & Jharkhand Directorate)** at **Sarala Birla University, Ranchi**.

The system replaces manual paper-based nominal rolls, physical application queues, and fragmented messaging channels with a centralized, real-time, AI-assisted digital web application.

---

## 2. Business & Operational Problem

Before this platform:
- **Enrollment Bottlenecks**: Prospective cadets submitted paper application forms, leading to lost documents, errors in DBT bank details, and delayed verification by Associate NCC Officers (ANO).
- **Attendance & Parade Tracking**: Tracking parade physical fitness (1600m run timings, push-ups) and attendance percentage across Senior Division and Senior Wing required manual ledger entries.
- **Communication Delays**: Camp announcements, drill orders, and exam schedules relied on word-of-mouth or unorganized chat groups.
- **Syllabus & Drill Guidance**: Cadets lacked 24/7 access to official drill manuals, .22 Rifle Mark IV specifications, map reading charts, and mock practice quizzes for NCC 'B' & 'C' Certificate exams.

---

## 3. The Digital Solution

The portal provides an integrated, real-time solution with:
1. **Public Enrollment Portal & Digital Verification Engine**: Online multi-step registration with instant status tracking via Application ID, Aadhaar, or SBU Roll Number.
2. **Cadet Dashboard & Printable Digital ID Card**: Enables cadets to track live attendance percentages, generate official printable digital identity cards with QR verification, apply for drill leaves, and take interactive certificate practice quizzes.
3. **Officer Command & Administrative Dashboard**: Grants ANOs and Battalion staff full control over enrollment verification, status management (Submitted, Physical Scheduled, Medical Cleared, Selected, Enrolled), parade attendance logs, notification broadcasts, and one-click multi-sheet Excel nominal roll generation for Battalion HQ.
4. **Subedar Major AI Assistant (24/7 Cadre Guide)**: Server-side Gemini AI integration delivering instant, accurate guidance on military drill, uniform standards, weapon specs, camp eligibility, and certificate exam preparation in Hindi and English.
5. **Real-time Event Engine**: WebSocket-driven channel subscriptions delivering live notification broadcasts, enrollment status updates, and active presence tracking across all online users.

---

## 4. Target User Personas

| Persona | Primary Goal | Core Features Used |
| :--- | :--- | :--- |
| **Prospective Cadet (SBU Student)** | Apply for NCC SD/SW enrollment & check application status. | Public Enrollment Form, Status Tracker Modal, AI Cadre Guide. |
| **Enrolled Cadet** | Manage NCC profile, download Digital ID, access study materials, track attendance & certificates. | Cadet Dashboard, Digital ID Card Generator, Practice Quizzes, Leave Workflow. |
| **Associate NCC Officer (ANO) / Admin** | Review enrollments, update cadet status, log parade attendance, broadcast notices, export records. | Officer Command Dashboard, Nominal Roll Exporter, Notification Broadcast Engine. |
| **Battalion HQ / Auditor** | Audit nominal rolls, bank DBT accounts, and physical fitness metrics. | Multi-sheet XLSX Exporter (`/api/v1/export-excel`), Metrics API (`/api/v1/metrics`). |

---

## 5. Architecture Summary

```
                  ┌─────────────────────────────────────────┐
                  │          React 18 Single Page App       │
                  │   (TypeScript, Tailwind CSS v4, Motion) │
                  └────────────────────┬────────────────────┘
                                       │
                        HTTP / REST    │    WebSocket (/ws/v1)
                    (JSON Payload API) │    (Real-time Events)
                                       ▼
                  ┌─────────────────────────────────────────┐
                  │          Express.js Node Backend        │
                  │   - Token Bucket Rate Limiter           │
                  │   - X-Request-ID Correlation Middleware │
                  │   - In-Memory ServerCache (TTL)         │
                  └────────────┬────────────────┬───────────┘
                               │                │
                               ▼                ▼
                     ┌──────────────────┐  ┌──────────────────┐
                     │ Google Gen AI    │  │ SheetJS (XLSX)   │
                     │ (Gemini 3.6/3.1) │  │ Excel Exporter   │
                     └──────────────────┘  └──────────────────┘
```

---

## 6. Technology Stack

- **Frontend**: React 18, TypeScript 5.8, Tailwind CSS v4, Motion (`motion/react`), Lucide Icons, html2canvas, jspdf, canvas-confetti.
- **Backend**: Node.js / Bun, Express.js (v4), TypeScript (`tsx`), WebSockets (`ws`), SheetJS (`xlsx`).
- **AI Integration**: Google Gen AI SDK (`@google/genai`) accessing Gemini 3.6 Flash / 3.1 Flash-Lite with structured military system prompt.
- **Build & Dev Tooling**: Vite 6, esbuild, TypeScript compiler (`tsc`).

---

## 7. Engineering & Architectural Principles

- **Zero Assumption & Strict Typing**: End-to-end TypeScript interfaces (`CadetRecord`, `OfficerNotification`, `ApiResponse`) ensure total contract safety between client and server.
- **Performance First**: In-memory server caching with TTL, client request deduplication (`dataCache.deduplicate`), and lightweight payload serialization.
- **Security & Secret Isolation**: API keys remain strictly server-side in `process.env.GEMINI_API_KEY`. Enforced IP rate-limiting (120 req/min/IP).
- **Accessibility & Responsiveness**: Mobile-first fluid layout, high-contrast military color palette, keyboard navigable forms, and motion preference respect.

---

## 8. Author & Ownership

- **Author**: **Ravi Ranjan Singh**
- **Role**: Software Engineer • Software Architect • Full Stack Developer • AI SaaS Developer
- **Repository Maintainer**: **Ravi Ranjan Singh**
- **GitHub Repository**: [https://github.com/Hellthefox808/NCC-CRM-V1.0.git](https://github.com/Hellthefox808/NCC-CRM-V1.0.git)

---

## 9. License

This project is licensed under the **MIT License**.
