# WEBSOCKET EVENTS CATALOG • ENTERPRISE DATA PLATFORM v3000

---

## 1. WebSocket Event Envelope

All messages broadcast by the server follow this JSON contract:

```typescript
export interface WebSocketEvent<T = any> {
  event: string;
  channel: string;
  payload: T;
  timestamp: string;
  correlationId?: string;
}
```

---

## 2. Event Catalog

### 2.1. System & Presence Events

#### `CONNECTED`
- **Channel**: `system`
- **Direction**: Server ➔ Client
- **Description**: Fired upon connection establishment.
- **Payload**:
  ```json
  {
    "connectionId": "ws_1785829200_a1b2c",
    "serverTime": "2026-08-04T04:27:00.000Z",
    "message": "Connected to 19 JHR BN NCC Realtime Engine v3000",
    "activeCadetsCount": 5
  }
  ```

#### `PRESENCE_UPDATE`
- **Channel**: `cadre:presence`
- **Direction**: Server ➔ Client
- **Description**: Broadcast when a user connects or disconnects.
- **Payload**:
  ```json
  {
    "activeCadetsCount": 5,
    "serverUptimeSeconds": 1450
  }
  ```

---

### 2.2. Enrollment & Candidate Events

#### `ENROLLMENT_SUBMITTED`
- **Channel**: `cadre:enrollments`
- **Direction**: Server ➔ All Subscribed Clients
- **Trigger**: Fired when a cadet submits a new application (`POST /api/v1/enrollments`).
- **Payload**: `CadetRecord` (Full candidate details object).

#### `STATUS_UPDATED`
- **Channel**: `cadre:enrollments`
- **Direction**: Server ➔ All Subscribed Clients
- **Trigger**: Fired when an ANO/Officer updates a candidate's status or remarks (`PATCH /api/v1/enrollments/status`).
- **Payload**: `CadetRecord` (Updated candidate record).

---

### 2.3. Notification & Alert Events

#### `NOTIFICATION_BROADCAST`
- **Channel**: `cadre:notifications`
- **Direction**: Server ➔ All Subscribed Clients
- **Trigger**: Fired when an Officer broadcasts an urgent notice (`POST /api/v1/notifications`).
- **Payload**: `OfficerNotification` (Notification item object).

---

## 3. Authorship

- **Author & Architect**: **Ravi Ranjan Singh**
- **Role**: Software Engineer • Software Architect • Full Stack Developer • AI SaaS Developer
