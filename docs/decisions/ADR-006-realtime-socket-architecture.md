# ADR-006: Socket.IO Real-time Architecture & Isolated Room Authorization

**Status**: ACCEPTED  
**Date**: August 11, 2026  
**Context**: OWASP ASVS 5.0 V13 (API & Real-time Security Verification Requirements)

---

## Context & Problem Statement

Real-time notification feeds, active presence counts, and calendar updates must be delivered securely via Socket.IO without allowing clients to join unauthorized user channels or intercept private notifications.

## Decision Outcome

1. **Server-Derived Room Channels**: Clients connect with session authentication tokens (`auth.token`). The Socket.IO server derives user identity on the server and assigns rooms:
   - `user:{userId}` (Personal notifications)
   - `role:{role}` (Role broadcasts for ANO / Cadet)
   - `calendar` (Global training calendar updates)
   - `notification:global` (Unit-wide announcements)
2. **Client-Side SSR Safety**: `frontend/lib/socket.ts` and `frontend/hooks/useSocket.ts` explicitly guard against SSR execution (`typeof window !== "undefined"`), preventing hydration crashes.
3. **Presence Tracking**: Active cadet connections are tracked in memory on the server and broadcast as `PRESENCE_UPDATE` ticks to authorized dashboards.

## Consequences

- **Positive**: Complete prevention of cross-cadet channel eavesdropping.
- **Positive**: SSR-compatible real-time state management across React components.
