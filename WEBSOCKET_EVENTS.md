# WebSocket Event Dictionary v3000

## Event Index

| Event Name | Channel | Sender | Description |
|---|---|---|---|
| `CONNECTED` | `system` | Server | Welcome message with connection ID & initial active client count |
| `SUBSCRIBED` | `system` | Server | Confirmation of channel subscription |
| `PRESENCE_UPDATE` | `cadre:presence` | Server | Broadcast containing active cadet & officer count |
| `ENROLLMENT_SUBMITTED` | `cadre:enrollments` | Client/Server | Dispatched when a new enrollment is submitted |
| `STATUS_UPDATED` | `cadre:enrollments` | Server | Dispatched when an officer updates a cadet's status or remarks |
| `NOTIFICATION_BROADCAST` | `cadre:notifications` | Server | Dispatched when an official parade order or alert is posted |
| `METRICS_TICK` | `cadre:metrics` | Server | Periodic system latency & memory observability broadcast |
| `pong` | `system` | Server | Round-trip latency verification response |

---

## Event Payload Schemas

### 1. `NOTIFICATION_BROADCAST`
```json
{
  "event": "NOTIFICATION_BROADCAST",
  "channel": "cadre:notifications",
  "payload": {
    "id": "N101",
    "title": "URGENT: Annual Inspection Parade",
    "category": "Parade Order",
    "priority": "CRITICAL",
    "date": "2026-08-05 06:00 AM",
    "body": "All cadets report in Working Dress No. 2."
  },
  "timestamp": "2026-08-03T15:30:00.000Z",
  "correlationId": "evt_91823"
}
```

### 2. `STATUS_UPDATED`
```json
{
  "event": "STATUS_UPDATED",
  "channel": "cadre:enrollments",
  "payload": {
    "id": "19JHR-SBU-2026-001",
    "fullName": "Aman Kumar Sharma",
    "status": "Enrolled",
    "officerRemarks": "Medical fitness cleared."
  },
  "timestamp": "2026-08-03T15:30:05.000Z",
  "correlationId": "evt_91824"
}
```
