# DATA FLOW SPECIFICATION • ENTERPRISE DATA PLATFORM v3000

---

## 1. End-to-End Request Lifecycle

The diagram below illustrates the complete lifecycle of a data request in the **19 JHR BN NCC Portal**:

```
[ User UI Action ]
        │
        ▼
[ Client Validation ]  ──(Invalid)──► [ Display Field Errors ]
        │
     (Valid)
        ▼
[ Optimistic UI State Update ]  (Immediate visual feedback)
        │
        ▼
[ EnterpriseDataPlatform SDK Request ]
        │
        ├─► Check Client QueryCache ──(Hit)──► [ Return Cached Data ]
        │
     (Miss / Deduplicated)
        ▼
[ HTTP Request (Fetch API) ]
   - Headers: X-Request-ID (Correlation ID), Content-Type
   - Retry Policy: Exponential backoff (max 2 retries)
        │
        ▼
[ Express Middleware Pipeline ]
   ├─► Correlation Middleware: Assigns/verifies X-Request-ID
   ├─► Token Bucket Rate Limiter: Checks IP limit (120 req/min)
   └─► Body Parser: Validates JSON payload <= 10MB
        │
        ▼
[ Route Handler & Business Logic ]
   ├─► Input Validation & Sanitization
   ├─► Check ServerCache ──(Hit)──► Set X-Cache: HIT Header & Return
   │
 (Miss)
   ▼
[ Data Operations (In-Memory / Database) ]
   ├─► Read/Write Operations on Cadet Record Store
   ├─► Invalidate ServerCache Tags (on POST/PATCH)
   └─► Trigger WebSocket Broadcast (`broadcastWebSocketEvent`)
        │
        ▼
[ WebSocket Broadcast Engine ]
   └─► Send JSON message to active WebSocket connections on channel
        │
        ▼
[ Client UI Synchronization ]
   ├─► Update Global State & Components
   └─► Resolve Promise & Render Success Notification
```

---

## 2. Real-Time Synchronization Lifecycle

When an Officer updates a candidate's status or broadcasts a new notice:
1. **Officer Submits Form**: `PATCH /api/v1/enrollments/status` or `POST /api/v1/notifications`.
2. **Server Updates Store**: Modifies candidate status in memory or prepends notice to array.
3. **Server Cache Invalidated**: `serverCache.invalidateTag("enrollments")`.
4. **WebSocket Broadcast Fired**: `broadcastWebSocketEvent("cadre:enrollments", "STATUS_UPDATED", updatedRecord)`.
5. **Client Hook Listens**: `useRealtimeData` hook receives message over `/ws/v1`.
6. **UI Auto-Refreshes**: Connected Cadet & Officer dashboards re-render immediately without needing a page refresh.

---

## 3. Data Cache Lifecycle & Invalidation Matrix

| Mutation Event | Invalidated Client Tags | Invalidated Server Tags | Affected UI Components |
| :--- | :--- | :--- | :--- |
| `POST /api/v1/enrollments` | `enrollments` | `enrollments` | `AdminDashboard`, `StatusTrackerModal` |
| `PATCH /api/v1/enrollments/status` | `enrollments`, `status` | `enrollments` | `CadetDashboard`, `AdminDashboard` |
| `POST /api/v1/notifications` | `notifications_feed` | `notifications` | `NotificationsFeed`, `Navbar` |

---

## 4. Authorship

- **Author & Architect**: **Ravi Ranjan Singh**
- **Role**: Software Engineer • Software Architect • Full Stack Developer • AI SaaS Developer
