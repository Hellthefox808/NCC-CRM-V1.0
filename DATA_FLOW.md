# Enterprise Data Platform v3000 • End-to-End Data Lifecycle

## 1. Request Pipeline
```
User Action
    ↓
Client-side Input Validation (React Forms)
    ↓
Data Platform SDK (`EnterpriseDataPlatform.ts`)
    ↓ [Request Deduplication Check / In-Memory Query Cache]
    ↓
HTTP Request with `X-Request-ID` & Authorization Headers
    ↓
Token Bucket Rate Limiter Middleware
    ↓
Input Schema Sanitization & Validation
    ↓
Server Route Handler
    ↓
In-Memory Repository / Cache Store Mutate
    ↓
Real-Time WebSocket Engine Broadcast (`broadcastWebSocketEvent`)
    ↓
Cache Invalidation & Fresh State Propagation
    ↓
HTTP JSON Response with `X-Response-Time-MS` & `X-Cache`
    ↓
UI Reactive State Update & Toast Notification
```

---

## 2. Invalidation & Synchronization Mechanics
1. **Mutation Trigger**: When `submitEnrollment`, `updateStatus`, or `broadcastNotice` is called via REST, the server immediately invalidates cached query keys tagged with `enrollments` or `notifications`.
2. **WebSocket Dispatch**: The server broadcasts an event (`ENROLLMENT_SUBMITTED`, `STATUS_UPDATED`, or `NOTIFICATION_BROADCAST`) over the persistent WebSocket channel.
3. **Client Reception**: All connected clients (cadet portals, officer dashboards) receive the WebSocket payload in ~10ms.
4. **Optimistic Sync**: React states update seamlessly without full page refreshes or polling.
