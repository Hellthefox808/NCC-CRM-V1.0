# PER-FILE SOURCE CODE BRIEFING • 19 JHR BN NCC PORTAL

---

## 1. Overview

This document provides a per-file architectural breakdown of every major file in the codebase.

- **Author & Architect**: **Ravi Ranjan Singh**

---

## 2. Source Code Modules

### 2.1. `server.ts`
- **Purpose**: Express backend REST API server and WebSocket gateway (`/ws/v1`).
- **Responsibilities**: Route handling, token-bucket rate limiting, correlation ID tracking, server-side caching (`ServerCache`), Gemini AI integration, SheetJS Excel export, and WebSocket pub/sub event broadcasting.
- **Inputs**: HTTP REST requests (`/api/v1/*`), WebSocket connections (`/ws/v1`), environment variables (`GEMINI_API_KEY`, `PORT`).
- **Outputs**: JSON API responses (`ApiResponse<T>`), Excel `.xlsx` binary stream, WebSocket JSON event streams.
- **Dependencies**: `express`, `ws`, `@google/genai`, `xlsx`, `vite`, `http`.
- **Architecture Layer**: Backend Application & API Layer.
- **Security Notes**: Isolates `GEMINI_API_KEY` on server side; enforces 120 req/min IP rate limiting.

---

### 2.2. `src/services/dataPlatform.ts`
- **Purpose**: Centralized SDK and client-side caching layer for interacting with the backend API.
- **Responsibilities**: Wraps `fetch` calls, handles exponential backoff retries, injects `X-Request-ID` headers, deduplicates in-flight calls (`QueryCache.deduplicate`), and caches query results with TTL.
- **Inputs**: Endpoint options, payload parameters, filter queries.
- **Outputs**: Strongly typed `ApiResponse<T>` promises.
- **Dependencies**: `src/types.ts`.
- **Architecture Layer**: Client Data Access & SDK Layer.

---

### 2.3. `src/hooks/useRealtimeData.ts`
- **Purpose**: React custom hook managing WebSocket connection lifecycle.
- **Responsibilities**: Connects to `/ws/v1`, auto-subscribes to channels, handles 15s ping/pong heartbeat, measures RTT latency (`latencyMs`), and triggers event callbacks.
- **Inputs**: Options object (`channels`, `onNotificationBroadcast`, `onStatusUpdated`, etc.).
- **Outputs**: `RealtimeState` (`isConnected`, `latencyMs`, `activePresenceCount`, `sendEvent`).
- **Dependencies**: `react`, `src/types.ts`.
- **Architecture Layer**: Client Real-Time Hook Layer.

---

### 2.4. `src/App.tsx`
- **Purpose**: Root React component and view router.
- **Responsibilities**: Renders top navigation bar, main view switcher (`home`, `about`, `activities`, `enroll`, `cadet`, `admin`, `ranks`, `faq`), floating AI assistant trigger button, status tracker modal, printable slip modal, and footer.
- **Inputs**: User interaction events, navigation tab selections.
- **Outputs**: Rendered DOM layout.
- **Dependencies**: `motion/react`, `lucide-react`, React components in `src/components/`.
- **Architecture Layer**: Client Presentation & Routing Layer.

---

### 2.5. `src/components/AdminDashboard.tsx`
- **Purpose**: Officer administration and command center UI.
- **Responsibilities**: Displays candidate nominal rolls, status updates, drill attendance logs, announcement broadcast composer, and Excel export triggers.
- **Architecture Layer**: Officer Presentation Layer.

---

### 2.6. `src/components/CadetDashboard.tsx`
- **Purpose**: Cadet student portal UI.
- **Responsibilities**: Attendance progress indicators, leave request forms, training syllabus downloads, and printable digital ID card generator.
- **Architecture Layer**: Cadet Presentation Layer.

---

### 2.7. `src/components/EnrollmentForm.tsx`
- **Purpose**: Public cadet multi-step enrollment form.
- **Responsibilities**: Form validation for personal, academic, physical, and bank DBT fields.
- **Architecture Layer**: Public Registration Layer.

---

### 2.8. `src/components/AiCadreAssistant.tsx`
- **Purpose**: Floating dialog UI for Subedar Major AI Assistant.
- **Responsibilities**: Interacts with `/api/v1/ai-chat` endpoint to provide instant answers on military drill, weapons, and camps.
- **Architecture Layer**: AI Presentation Layer.

---

## 3. Authorship & Maintainer

- **Author & Architect**: **Ravi Ranjan Singh**
- **Role**: Software Engineer • Software Architect • Full Stack Developer • AI SaaS Developer
- **Repository Owner**: **Ravi Ranjan Singh**
