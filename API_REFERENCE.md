# API REFERENCE SPECIFICATION • ENTERPRISE DATA PLATFORM v3000

---

## 1. Overview & Base Configuration

- **Base URL**: `/api/v1`
- **Protocol**: HTTP/1.1 & HTTP/2
- **Data Format**: `application/json`
- **Rate Limit**: 120 requests / minute per IP address (enforced via Token Bucket algorithm)
- **Tracing Header**: `X-Request-ID` (injected automatically if missing)
- **Author & Architect**: **Ravi Ranjan Singh**

---

## 2. Standard Response Wrapper

All REST API responses adhere to the standard `ApiResponse<T>` envelope:

```typescript
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  code?: string;
  requestId?: string;
  timestamp?: string;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
    cacheHit?: boolean;
    latencyMs?: number;
  };
}
```

---

## 3. Endpoints Inventory

### 3.1. Health & Readiness Check
- **Endpoint**: `GET /api/v1/health`
- **Purpose**: Observability probe for container readiness and uptime monitoring.
- **Authentication**: None (Public)
- **Rate Limit**: 120 req/min
- **Response Schema**:
  ```json
  {
    "success": true,
    "status": "HEALTHY",
    "service": "19 JHR BN NCC SBU Data Engine",
    "version": "3.0.0",
    "timestamp": "2026-08-04T04:27:00.000Z",
    "uptimeSeconds": 1420,
    "activeWebSocketClients": 4,
    "memoryUsageMb": 42
  }
  ```

---

### 3.2. System Observability Metrics
- **Endpoint**: `GET /api/v1/metrics`
- **Purpose**: Fetches internal performance statistics (cache hit ratio, average latency, request volume).
- **Authentication**: None (Public / Admin)
- **Cache Strategy**: Dynamic (No cache)
- **Response Schema**:
  ```json
  {
    "success": true,
    "data": {
      "uptimeSeconds": 1420,
      "activeWebSocketClients": 4,
      "totalRequests": 184,
      "cacheHitRatioPercent": 88.5,
      "averageLatencyMs": 8,
      "activeEnrollmentsCount": 3,
      "memoryUsageMb": 42
    }
  }
  ```

---

### 3.3. Get All Cadet Enrollments
- **Endpoint**: `GET /api/v1/enrollments`
- **Purpose**: Fetches cadet nominal roll records with filtering, searching, sorting, and pagination.
- **Query Parameters**:
  - `status` (string, optional): Filter by `Submitted` | `Physical Scheduled` | `Medical Cleared` | `Selected` | `Enrolled` | `Rejected`
  - `gender` (string, optional): Filter by `SD` | `SW`
  - `sbuCourse` (string, optional): Filter by course substring (e.g. `B.Tech`)
  - `search` (string, optional): Search across name, ID, roll number, or mobile
  - `sortBy` (string, optional): Sort field (e.g. `fullName`, `applicationDate`, `selectionRank`)
  - `order` (string, optional): `asc` | `desc`
  - `page` (number, default: `1`)
  - `limit` (number, default: `50`)
- **Cache Strategy**: In-Memory ServerCache with 10s TTL. Sets `X-Cache: HIT|MISS`.
- **Response Schema**:
  ```json
  {
    "success": true,
    "data": {
      "enrollments": [ ... ],
      "count": 3,
      "total": 3,
      "page": 1,
      "totalPages": 1
    },
    "meta": {
      "cacheHit": false,
      "requestId": "req_1785829200_a8f9d"
    }
  }
  ```

---

### 3.4. Track Application Status
- **Endpoint**: `GET /api/v1/enrollments/status/:query`
- **Purpose**: Public lookup for application verification via Application ID, Aadhaar Number, SBU Roll Number, or Mobile Number.
- **Cache Strategy**: Client SDK cached for 30s (`dataCache`).
- **Response Schema (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "record": {
        "id": "19JHR-SBU-2026-001",
        "fullName": "Aman Kumar Sharma",
        "status": "Enrolled",
        "officerRemarks": "Excellent physical fitness and previous JD experience."
      }
    }
  }
  ```
- **Error Schema (404 Not Found)**:
  ```json
  {
    "success": false,
    "error": "No NCC Enrollment record found matching query.",
    "code": "RECORD_NOT_FOUND"
  }
  ```

---

### 3.5. Submit New Cadet Enrollment
- **Endpoint**: `POST /api/v1/enrollments`
- **Purpose**: Submits a new cadet enrollment form.
- **Related WebSocket Event**: Emits `ENROLLMENT_SUBMITTED` on channel `cadre:enrollments`.
- **Invalidates Cache**: Purges `enrollments` cache tags.
- **Request Payload**:
  ```json
  {
    "fullName": "Rahul Singh Munda",
    "gender": "SD",
    "dob": "2005-09-15",
    "aadhaarNumber": "9102-3344-5566",
    "mobile": "7004123987",
    "email": "rahul.munda@gmail.com",
    "fatherName": "Birsa Munda",
    "motherName": "Parwati Devi",
    "sbuCourse": "BBA",
    "sbuRollNo": "SBU25BBA102",
    "presentAddress": "Tatisilwai, Ranchi, Jharkhand"
  }
  ```
- **Response Schema (201 Created)**:
  ```json
  {
    "success": true,
    "message": "NCC Enrollment Application submitted successfully to 19 Jharkhand Battalion, Ranchi.",
    "data": {
      "enrollment": {
        "id": "19JHR-SBU-2026-942",
        "status": "Submitted",
        "applicationDate": "2026-08-04"
      }
    }
  }
  ```

---

### 3.6. Update Status & Officer Remarks
- **Endpoint**: `PATCH /api/v1/enrollments/status`
- **Purpose**: Officer administration endpoint to update candidate status, remarks, or allocated regimental number.
- **Related WebSocket Event**: Emits `STATUS_UPDATED` on channel `cadre:enrollments`.
- **Invalidates Cache**: Purges `enrollments` & `status` cache tags.
- **Request Payload**:
  ```json
  {
    "id": "19JHR-SBU-2026-003",
    "status": "Selected",
    "remarks": "Cleared physical test 5:30 min 1.6KM run.",
    "enrollmentNo": "JHR/26/SD/19/204803"
  }
  ```

---

### 3.7. Broadcast Official Notice
- **Endpoint**: `POST /api/v1/notifications`
- **Purpose**: Officer broadcast endpoint for posting urgent announcements.
- **Related WebSocket Event**: Emits `NOTIFICATION_BROADCAST` on channel `cadre:notifications`.
- **Request Payload**:
  ```json
  {
    "title": "MANDATORY PARADE: Annual Inspection",
    "category": "Parade Order",
    "priority": "CRITICAL",
    "body": "Report to SBU Ground in Full Ceremonial Uniform.",
    "actionType": "schedule",
    "actionLabel": "View Schedule"
  }
  ```

---

### 3.8. Subedar Major AI Assistant
- **Endpoint**: `POST /api/v1/ai-chat`
- **Purpose**: Interacts with Google Gemini AI (`gemini-3.6-flash` / `gemini-3.1-flash-lite`) to answer cadet queries on drill, weapon manuals, camps, and syllabus.
- **Request Payload**:
  ```json
  {
    "message": "What is the weight of .22 Deluxe Rifle?",
    "lowLatency": false
  }
  ```
- **Response Schema**:
  ```json
  {
    "success": true,
    "data": {
      "reply": "Jai Hind! The weight of the .22 Deluxe Rifle is 6 lbs 2 oz (approx 2.78 kg)..."
    }
  }
  ```

---

### 3.9. Multi-Sheet Excel Nominal Roll Export
- **Endpoint**: `GET /api/v1/export-excel`
- **Purpose**: Generates and downloads a multi-tab `.xlsx` workbook containing Nominal Rolls and Bank DBT records for 19 Jharkhand Battalion HQ.
- **Response**: Binary stream (`application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`).

---

## 4. Error Codes Reference

| Error Code | HTTP Status | Description |
| :--- | :--- | :--- |
| `VALIDATION_FAILED` | 400 Bad Request | Missing or malformed required fields |
| `RECORD_NOT_FOUND` | 404 Not Found | Query matched no record in store |
| `RATE_LIMIT_EXCEEDED` | 429 Too Many Requests | IP exceeded 120 req/min threshold |
| `NETWORK_ERROR` | 504 Gateway Timeout | Upstream service or AI provider timeout |
| `INTERNAL_ERROR` | 500 Internal Server Error | Unhandled server exception |

---

## 5. Authorship

- **Author & Architect**: **Ravi Ranjan Singh**
- **Role**: Software Engineer • Software Architect • Full Stack Developer • AI SaaS Developer
