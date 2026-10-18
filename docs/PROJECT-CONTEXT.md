# NCC Platform — Project Context & System State

**System Name**: 19 Jharkhand Battalion NCC Portal (Sarala Birla University Sub-Unit)  
**Corpus Name**: Hellthefox808/NCC-CRM-V1.0  
**Branch**: `main`  
**Last Updated**: 2026-10-18  
**Status**: 100% Verified E2E, 109/109 Tests Passing across 18 Test Suites, UIDAI Verhoeff Aadhaar Checksum, Single-Flight Cache Deduplication & Telemetry, Regimental Glassmorphism & Enterprise Data Platform, Dynamic Backend Sync, Hardened Security & Infrastructure

---

## 1. System Architecture Summary

The NCC Portal operates as an integrated, OWASP-compliant identity and management system designed for cadet enrollment, ANO verification, attendance tracking, event scheduling, and security auditing.

```text
                    NCC PRODUCTION SYSTEM
                              │
             ┌────────────────┴────────────────┐
             │                                 │
        APPLICATION                         PLATFORM
             │                                 │
      ┌──────┴──────┐              ┌───────────┴───────────┐
      │             │              │                       │
   Frontend      Backend        Database              Load Balancer
      │             │              │                       │
   UI/UX        APIs/Auth       Redis               Nginx / Multi-Node
      │             │              │                       │
      └──────┬──────┘              └───────────┬───────────┘
             │                                 │
             └──────────────┬──────────────────┘
                            │
                       GitHub / CI-CD
                            │
                    Test → Build → Scan
                            │
                       Staging → Prod
```

---

## 2. Component Stack

- **Frontend**: React 19 + TanStack Router (SSR) + Tailwind CSS v4 + Motion + Regimental Glassmorphic Design System (`.glass-panel`, `.glass-panel-elevated`, `.glass-pill`, `.glass-input`, `.glass-glow-*`) + Dual View Mode (High-Density Table & 6-Stage Interactive Kanban Pipeline)
- **Backend API**: TanStack Start / Nitro (TypeScript Node ESM) with dynamic endpoints (`/api/v1/metrics`, `/api/v1/leaves`, `/api/v1/discipline`, `/api/v1/enrollments`, `/api/v1/calendar`, `/api/v1/notifications`)
- **Real-time Event Architecture**: Socket.IO Engine with dedicated operational channels (`cadre:enrollments`, `cadre:notifications`, `cadre:presence`), real-time status change broadcasts (`emitStatusUpdated`), and auto-synchronization across officer consoles.
- **Database**: Supabase / PostgreSQL (`app_credentials`, `cadet_users`, `cadet_enrollments`, `auth_otp_codes`, `audit_logs`)
- **Multi-Tier Caching & Rate Limiting**: L1 Bounded In-Memory LRU Cache (`MAX_MEMORY_ITEMS = 5000`) with Single-Flight In-Flight Promise Deduplication & Telemetry (`getCacheStats()`) + L2 Redis with Non-Blocking `SCAN` Invalidation (`ncc:session:*`, `ncc:calendar:*`, `ncc:annual_plans:*`, `ncc:activities:*`, `ncc:notifications:*`, `ncc:enrollment:*`, `ratelimit:*`)
- **Load Balancer & Gateway**: Nginx Reverse Proxy with `least_conn` upstream balancing, HTTP/2, Gzip compression, WebSocket sticky affinity, proxy rate limiting, and automated upstream failover (`proxy_next_upstream error timeout invalid_header http_500 http_502 http_503;`)
- **Transactional Mailer**: Nodemailer (Dev simulated dispatch + SMTP pool) with atomic bulk queueing (`queueEmailJobsBatch`)
- **Bundler & Build Tool**: Vite 8.2 + Nitro 3.0
- **Deployment Pipelines**: Docker Multi-Node Cluster (`docker-compose.yml`), Netlify (`netlify.toml` -> `.output/public`), Vercel (`vercel.json` -> `.output/public`)

---

## 3. Active Security & Authentication Subsystems

1. **Multi-Stage Identity Pipeline**:
   `Applicant Registration` → `ANO Verification` → `Account Provisioning` → `Single-Use SHA256 Activation Token` → `Welcome Email` → `Set Password (scrypt)` → `Account Activated` → `Login` → `OTP / Rate Limited Verification` → `RBAC Session`.
2. **Password Security**:
   - Algorithm: Salted scrypt (`scrypt$N=16384,r=8,p=1$...`).
   - OWASP Password Policy: Minimum 8 characters, uppercase, lowercase, number, special character.
3. **Anti-Enumeration Recovery**:
   - Uniform response on password recovery: _"If an account matches the information provided, recovery instructions will be sent."_
4. **Role-Based Access Control (RBAC) & Session Caching**:
   - Server-enforced middleware (`requireOfficer` vs `requireCadetSession`) with 300s multi-tier session caching reducing DB overhead by >85%.
   - Instant token invalidation across all nodes on logout.
   - Zero frontend-only privilege boundaries.
5. **IDOR & Broken Object Level Authorization Mitigation**:
   - Strict session scoping on `/api/v1/discipline` (cadets can only access their own records; cross-cadet lookups trigger IDS alert `IDOR_ATTEMPT` and 403 Forbidden).
   - Session authentication and ownership verification on notification acknowledgment (`/api/v1/notifications/:id/read`).
6. **CWE-1236 CSV Formula Injection Neutralization**:
   - All user-supplied fields in Excel/CSV exports starting with `=`, `@`, `\t`, `\r`, `+`, or `-` are prepended with apostrophe `'`.
7. **Dual-Layer Rate Limiting & Anti-Brute-Force / Anti-Enumeration**:
   - Login protected by network IP ceiling (25 req/15min) + target account ceiling (5 req/15min).
   - Public enrollment status search rate limited (20 req/min per IP) to prevent Aadhaar / phone number enumeration.
   - Enrollment form submission rate limited (5 req/15min per IP).
   - OTP requests rate limited (5 req/10min per IP).
   - Bounded LRU capacity ceiling (`MAX_RATE_LIMITER_ITEMS = 5000`) preventing memory exhaustion under distributed IP bursts.
8. **UIDAI Verhoeff Checksum & Aadhaar Sanitization**:
   - Cryptographic Dihedral group $D_5$ algorithm (`validateVerhoeff`) validating 12-digit Aadhaar numbers against transcription and transposition errors.
9. **PostgREST Query Injection Defense**:
   - Strict sanitization stripping PostgREST reserved operators (`.eq.`, `()`, `,`, etc.) across all identifier queries.
10. **Timing Attack & Memory Safety**:
    - Constant-time `crypto.timingSafeEqual` comparison on OTP hash verification.
    - Hard memory ceilings (`MAX_MEMORY_TOKENS = 1000`, `MAX_IDS_EVENT_HISTORY = 5000`) and automatic pruning to prevent heap exhaustion.
11. **Infrastructure Hardening**:
    - Redis loopback binding (`127.0.0.1:6379`) with password protection in `docker-compose.yml`.
    - Nginx `api_status_limit` zone, HSTS, and Permissions-Policy headers.
    - Seamless reverse proxy failover for `/api/v1/health`, `/api/v1/auth/`, and `/api/v1/enrollments/status/`.
    - Content-Security-Policy (CSP) header enforced on Nitro SSR responses.

---

## 4. Test Suite & Verification Metrics

- **Backend & Service Unit Tests**: **131 / 131 Pass (100%)** across 24 test suites (including Suite 20: Internationalization & Localization Engine tests; Suite 19: Real-time Communication Hub, Interactive Polls, Pinned Messages, Group Administration, and Message-to-Task Conversion tests; Suite 18: UIDAI Verhoeff Aadhaar Checksum, Single-Flight Cache Deduplication, Cache Telemetry, LRU/IDS Memory Bounds; Enterprise Data Platform & MongoDB Client, Onboarding Batch, Security Hardening, Multi-Tier Cache, Prompter Scheduler, Storage Capability, and Multi-Channel Dispatch tests).
- **ESLint Static Code Analysis**: **0 Errors (100% clean type-safety & Prettier compliance)**.
- **TypeScript Static Verification**: **`npm run typecheck` (`tsc --noEmit`) 100% clean**.
- **Frontend UI/UX & A11y Modernization**: Regimental Glassmorphism design system deployed across public landing page, Admin Command Portal, Cadet Portal, and Cadre Communication Hub with WCAG 2.2 AA compliance, keyboard navigation, non-blocking toast alerts, and dark ambient adaptation.
- **CI/CD Automation**: Production-grade GitHub Actions matrix automating lint, typecheck, test, Prisma validation, production compilation, immutable container packaging, scheduled security scans, and deployment health/smoke checks.
- **Form 1 Enrollment Validation**: Full coverage for SD/SW cadet registration, 18-digit Application Number generation, phone/Aadhaar normalization, and multi-channel dispatches (Email + WhatsApp + SMS).
- **Production Build Status**: **Success (Vite + Nitro SSR Bundle)** with zero blocking warnings.

---

## 5. Real-Time Communication Hub & Collaboration Architecture

1. **Relational Schema & Row-Level Security (`supabase/migrations/20260812000000_communication_hub.sql`)**:
   - `conversations`: Primary rooms supporting direct messages (`direct`), platoon groups (`group`), and broadcast channels (`channel`).
   - `conversation_members`: Per-user membership roles (`creator`, `admin`, `member`, `read_only`), mute state, pin state, and `last_read_message_id` cursor.
   - `messages`: Chronological timeline records supporting threading (`reply_to_id`), soft deletion (`is_deleted`), edits (`is_edited`, `edited_at`), rich attachments (`jsonb`), embedded CRM context cards (`crm_card`), interactive polls (`poll`), and task links (`converted_task_id`).
   - `message_reactions`: Multi-cadet emoji reaction aggregation (`🫡`, `🇮🇳`, `🎖️`, `🔥`).
2. **Dual-Tier Resilient Persistence Service (`backend/services/messaging/chat.service.ts`)**:
   - Supabase PostgREST client with fallback to an in-memory `ChatStore` state engine.
   - Pre-seeded battalion spaces: *19 JHR BN Official Announcements* and *Purulia Road SBU Company Cadre*.
   - Idempotent canonical pair resolution preventing duplicate 1-to-1 conversation rooms.
   - Core administrative & collaborative methods: `createPoll`, `votePoll`, `pinMessage`, `listPinnedMessages`, `addGroupMember`, `removeGroupMember`, `updateMemberRole`, `convertMessageToTask`.
3. **Full-Duplex Socket.IO Gateway (`backend/services/socket/socket.server.ts`)**:
   - Authenticated room management (`join_conversation`, `leave_conversation`).
   - Real-time broadcasts: `emitChatMessage`, `emitMessageUpdated`, `emitMessageDeleted`, `emitMessageReaction`, `emitConversationUpdated`, `emitPollUpdated`, `emitMessagePinned`, `emitMemberChanged`, `emitMessageConvertedToTask`.
   - Ephemeral typing indicators (`typing_start`, `typing_stop`) with debounced auto-expiry.
4. **REST API Route Matrix (`src/routes/api/v1/messages.*`)**:
   - `/api/v1/messages.conversations`: List and create conversations.
   - `/api/v1/messages.conversations.$id`: Conversation details, metadata updates (pin/mute).
   - `/api/v1/messages.conversations.$id.messages`: Paginated message history and message transmission.
   - `/api/v1/messages.conversations.$id.read`: Read state advancement.
   - `/api/v1/messages.conversations.$id.members`: Add member (POST), remove member (DELETE), update role (PATCH).
   - `/api/v1/messages.conversations.$id.poll`: Create single or multi-choice poll.
   - `/api/v1/messages.messages.$id.poll-vote`: Cast or toggle poll votes.
   - `/api/v1/messages.messages.$id.pin`: Toggle message pinning status.
   - `/api/v1/messages.messages.$id.convert-task`: Convert operational message to CRM task.
   - `/api/v1/messages.messages.$id`: Message edits and soft deletion.
   - `/api/v1/messages.messages.$id.reactions`: Emoji reaction toggling.
   - `/api/v1/messages.search`: Scoped cross-conversation full-text search.
   - `/api/v1/messages.contacts`: Eligible cadre contact directory.
5. **Frontend 3-Pane Adaptive Communication Interface (`frontend/features/Messaging/CommunicationHub.tsx`)**:
   - **Sidebar**: Search, category filters (All, Direct, Groups, Official, Unread), conversation list with active badges, pinned sorting, unread counter badges.
   - **Message Area**: Quoted reply previews, CRM context cards, interactive poll cards with vote progress bars, pinned order badges, task indicators, message editing, soft-deletion masks, emoji reaction bar, attachment mock draft, typing indicator, auto-scroll with reading position preservation.
   - **Context Panel**: Collapsible drawer with group metadata, member roster with role badges & administrative controls (+ Add Cadet, promote/demote, remove), Pinned Orders drawer, CRM linked cards, and security status.
   - **Integrated Modals**: `CreateGroupModal`, `NewDirectChatModal`, `CreatePollModal`, `ConvertToTaskModal`, and `AddMemberModal`.
   - **CRM Integration**: Seamless one-click direct chat launcher from Cadet Profile modal, Nominal Roll CRM Table, and Kanban Board in `AdminDashboard.tsx`, as well as full cadet communication hub in `CadetDashboard.tsx` and standalone route `/messages`.
