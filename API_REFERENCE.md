# Enterprise Data Platform v3000 • REST & WebSocket API Reference

## 1. Overview
This document serves as the complete technical API reference for the **19 Jharkhand Battalion NCC (SBU Ranchi) Data Engine v3000**. The architecture provides high-throughput, validated REST endpoints alongside real-time bi-directional WebSockets.

---

## 2. Global Headers & Request Pipeline
Every request sent through the Enterprise Data Engine includes:
- `X-Request-ID`: Unique correlation tracking identifier (e.g. `req_171203_x91a`).
- `X-Client-Version`: Version descriptor (`v3000`).
- `X-Response-Time-MS`: Processing latency in milliseconds.
- `X-RateLimit-Limit`: Maximum allowed requests per 60-second window (Default: `120`).
- `X-RateLimit-Remaining`: Remaining request bucket count.
- `X-Cache`: Data cache hit indicator (`HIT` | `MISS`).

---

## 3. REST API Endpoints (`/api/v1`)

### 3.1 `GET /api/v1/health`
**Purpose**: System health check, uptime, memory, and WebSocket client count.
- **Method**: `GET`
- **Authentication**: Public
- **Response Schema**:
```json
{
  "success": true,
  "status": "HEALTHY",
  "service": "19 JHR BN NCC SBU Data Engine",
  "version": "3.0.0",
  "uptimeSeconds": 1420,
  "activeWebSocketClients": 4,
  "memoryUsageMb": 48
}
```

---

### 3.2 `GET /api/v1/metrics`
**Purpose**: System observability metrics, including cache hit ratio and P95 latency.
- **Method**: `GET`
- **Authentication**: Officer / Admin
- **Response Schema**:
```json
{
  "success": true,
  "data": {
    "uptimeSeconds": 1420,
    "activeWebSocketClients": 4,
    "totalRequests": 182,
    "cacheHitRatioPercent": 94.2,
    "averageLatencyMs": 8,
    "activeEnrollmentsCount": 54
  }
}
```

---

### 3.3 `GET /api/v1/enrollments`
**Purpose**: Paginated, filterable, and searchable list of cadet enrollments.
- **Method**: `GET`
- **Parameters**:
  - `status` (optional): Filter by `"Submitted" | "Physical Scheduled" | "Medical Cleared" | "Selected" | "Enrolled" | "Rejected"`
  - `gender` (optional): `"SD" | "SW"`
  - `search` (optional): Query name, roll no, application ID, or regimental number.
  - `page` (optional): Page number (default: `1`).
  - `limit` (optional): Results per page (default: `50`).
  - `sortBy` (optional): Field name to sort by (e.g., `"applicationDate"`).
  - `order` (optional): `"asc" | "desc"`.
- **Response Schema**:
```json
{
  "success": true,
  "data": {
    "enrollments": [ ... ],
    "count": 10,
    "total": 54,
    "page": 1,
    "totalPages": 6
  },
  "meta": { "cacheHit": true, "requestId": "req_102" }
}
```

---

### 3.4 `GET /api/v1/enrollments/status/:query`
**Purpose**: Lookup a single cadet record by ID, Aadhaar number, or SBU Roll Number.
- **Method**: `GET`
- **Path Parameter**: `query` (URL encoded string)
- **Response Schema**:
```json
{
  "success": true,
  "data": {
    "record": {
      "id": "19JHR-SBU-2026-001",
      "fullName": "Aman Kumar Sharma",
      "status": "Enrolled",
      "sbuCourse": "B.Tech Computer Science"
    }
  }
}
```

---

### 3.5 `POST /api/v1/enrollments`
**Purpose**: Submit a new cadet enrollment application.
- **Method**: `POST`
- **Request Body**:
```json
{
  "fullName": "Pooja Roy",
  "gender": "SW",
  "dob": "2006-03-12",
  "aadhaarNumber": "9812-4411-0022",
  "mobile": "9835001122",
  "email": "pooja.roy@sbu.ac.in",
  "sbuCourse": "BCA",
  "sbuRollNo": "SBU25BCA099"
}
```
- **Related WebSocket Event**: Dispatches `ENROLLMENT_SUBMITTED` on `cadre:enrollments`.

---

### 3.6 `PATCH /api/v1/enrollments/status`
**Purpose**: Officer status update and remarks assignment.
- **Method**: `PATCH`
- **Request Body**:
```json
{
  "id": "19JHR-SBU-2026-001",
  "status": "Enrolled",
  "remarks": "Documents verified and physical test cleared.",
  "enrollmentNo": "JHR/26/SD/19/204801"
}
```
- **Related WebSocket Event**: Dispatches `STATUS_UPDATED` on `cadre:enrollments`.

---

### 3.7 `GET /api/v1/notifications`
**Purpose**: Retrieve official officer broadcast notices.
- **Method**: `GET`
- **Response Schema**:
```json
{
  "success": true,
  "data": {
    "notifications": [ ... ],
    "unreadCount": 2
  }
}
```

---

### 3.8 `POST /api/v1/notifications`
**Purpose**: Dispatch real-time parade order / emergency notice.
- **Method**: `POST`
- **Request Body**:
```json
{
  "title": "URGENT: Tomorrow Morning Parade at 06:00 AM",
  "body": "All SD/SW cadets report in full Ceremonial Uniform at SBU Ground.",
  "category": "Parade Order",
  "priority": "CRITICAL"
}
```
- **Related WebSocket Event**: Dispatches `NOTIFICATION_BROADCAST` on `cadre:notifications`.

---

### 3.9 `POST /api/v1/ai-chat`
**Purpose**: Gemini AI Cadre Guide response for cadet queries.
- **Method**: `POST`
- **Request Body**:
```json
{
  "message": "What is the physical run requirement for SW cadets?",
  "lowLatency": true
}
```
- **Response Schema**:
```json
{
  "success": true,
  "data": {
    "reply": "Jai Hind! Senior Wing (SW) female cadets require an 800m / 1.6 KM run..."
  }
}
```

---

### 3.10 `GET /api/v1/export-excel`
**Purpose**: Download complete multi-sheet Excel file (`.xlsx`) containing Nominal Roll, Bank DBT details, and Next of Kin records.
- **Method**: `GET`
- **Response**: Binary Excel File (`application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`).
