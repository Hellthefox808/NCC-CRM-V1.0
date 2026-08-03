# REAL-TIME ARCHITECTURE SPECIFICATION • ENTERPRISE DATA PLATFORM v3000

---

## 1. Engine Overview

The real-time infrastructure of the **19 JHR BN NCC Portal** provides bi-directional event streaming between the Express server and connected browser clients using WebSockets (`ws`).

- **Endpoint Path**: `/ws/v1`
- **Protocol**: `ws://` (Development) / `wss://` (Production with TLS)
- **Primary Channels**: `cadre:notifications`, `cadre:enrollments`, `cadre:presence`
- **Author & Architect**: **Ravi Ranjan Singh**

---

## 2. WebSocket Engine Architecture

```
                               ┌──────────────────────────┐
                               │ Express HTTP Server      │
                               │ (http.createServer)      │
                               └────────────┬─────────────┘
                                            │
                                  Attaches WebSocketServer
                                            │
                                            ▼
                               ┌──────────────────────────┐
                               │ WebSocket Server (/ws/v1)│
                               └────────────┬─────────────┘
                                            │
               ┌────────────────────────────┼────────────────────────────┐
               │                            │                            │
               ▼                            ▼                            ▼
     ┌──────────────────┐         ┌──────────────────┐         ┌──────────────────┐
     │ Connected Client │         │ Connected Client │         │ Connected Client │
     │ (Cadet Portal)   │         │ (Officer UI)     │         │ (Admin Mobile)   │
     └──────────────────┘         └──────────────────┘         └──────────────────┘
```

---

## 3. Connection Lifecycle & Management

### 3.1. Handshake & Welcome Payload
When a client connects to `/ws/v1`:
1. Server assigns a unique `connectionId` (`ws_${timestamp}_${rand}`).
2. Initializes channels: `["cadre:notifications", "cadre:enrollments", "cadre:presence"]`.
3. Sends welcome message:
   ```json
   {
     "event": "CONNECTED",
     "channel": "system",
     "payload": {
       "connectionId": "ws_1785829200_k9x2a",
       "serverTime": "2026-08-04T04:27:00.000Z",
       "message": "Connected to 19 JHR BN NCC Realtime Engine v3000",
       "activeCadetsCount": 4
     }
   }
   ```

### 3.2. Heartbeat & Latency Calculation (Ping-Pong)
- **Client Ping Interval**: The client `useRealtimeData` hook sends a ping every `15,000ms`:
  ```json
  { "action": "ping", "timestamp": "2026-08-04T04:27:15.000Z" }
  ```
- **Server Pong Response**: Server immediately echoes back `pong`:
  ```json
  { "event": "pong", "timestamp": "2026-08-04T04:27:15.005Z" }
  ```
- **Round-Trip Time (RTT)**: Client measures elapsed time between ping send and pong receive to maintain an accurate latency counter (`latencyMs`).

### 3.3. Server Dead-Connection Cleanup
- The server runs a background check every `20,000ms`.
- If a socket has failed to respond to pings (`isAlive === false`), the server closes the socket and removes it from `connectedClients`.

### 3.4. Auto-Reconnection Strategy
If the socket is disconnected unexpectedly:
- `useRealtimeData` transitions state to `RECONNECTING`.
- Employs **exponential backoff**: `delay = Math.min(1000 * (1.5 ^ attempts), 10000)`.
- Automatically re-subscribes to channels upon reconnection.

---

## 4. Authorship

- **Author & Architect**: **Ravi Ranjan Singh**
- **Role**: Software Engineer • Software Architect • Full Stack Developer • AI SaaS Developer
