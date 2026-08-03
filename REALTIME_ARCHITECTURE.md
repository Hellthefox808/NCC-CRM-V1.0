# Real-time Architecture & WebSocket Protocol Spec v3000

## 1. Connection Lifecycle
- **Endpoint**: `ws://${HOST}/ws/v1` (or `wss://` on TLS)
- **Protocol**: Standard WebSocket (RFC 6455)
- **Multiplexed Channels**:
  - `cadre:notifications` — Real-time parade orders and officer broadcasts
  - `cadre:enrollments` — Real-time cadet application status changes and new submissions
  - `cadre:presence` — Active cadet counter and server health heartbeats
  - `cadre:ai-stream` — Live AI response chunking

---

## 2. Heartbeat & Reconnection Engine
- **Ping/Pong Cycle**: The server sends WebSocket ping frames every 20 seconds. Clients verify L7 application-level heartbeats (`{"action": "ping"}`).
- **Exponential Backoff Reconnect**: When a socket drops, client automatically attempts reconnection at $1000 \times 1.5^n$ ms (capped at 10,000ms).
- **Graceful Termination**: Inactive sockets failing two consecutive ping cycles are closed to preserve server memory.

---

## 3. Presence Mechanics
When a user opens the Cadet or Officer Portal, their client connects to `cadre:presence`. The server broadcasts `PRESENCE_UPDATE` with the updated online count whenever connections open or close.
