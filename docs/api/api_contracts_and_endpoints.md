# API Specification & Contracts Directory

**Platform:** 19 Jharkhand Battalion NCC Command Centre  
**Base URL:** `https://ncc.sbu.ac.in/api/v1` (Production) / `http://localhost:3000/api/v1` (Local)  
**Auth Scheme:** Bearer Token (`Authorization: Bearer <session-token>`) or `ncc_session` HttpOnly Cookie  

---

## 1. Authentication & Identity Endpoints

### 1.1 Request One-Time Password (OTP)

- **Method:** `POST /auth/otp/send`
- **Rate Limit:** 10 requests / minute / IP
- **Payload:**

  ```json
  {
    "identifier": "cadet.abhishek@sbu.ac.in",
    "purpose": "onboarding"
  }
  ```

- **Response (200 OK):**

  ```json
  {
    "ok": true,
    "destination": "c***k@sbu.ac.in",
    "expiresAt": "2026-10-23T05:10:00.000Z"
  }
  ```

- **Error Responses:**
  - `429 Too Many Requests`: Resend cooldown (45 seconds) active.
  - `400 Bad Request`: Invalid email format or purpose.

### 1.2 Verify One-Time Password (OTP)

- **Method:** `POST /auth/otp/verify`
- **Payload:**

  ```json
  {
    "identifier": "cadet.abhishek@sbu.ac.in",
    "code": "849201",
    "purpose": "onboarding"
  }
  ```

- **Response (200 OK):**

  ```json
  {
    "ok": true,
    "verified": true
  }
  ```

- **Error Responses:**
  - `400 Bad Request`: `{"ok": false, "code": "OTP_INVALID", "error": "Invalid verification code"}`
  - `403 Forbidden`: `{"ok": false, "code": "OTP_LOCKED", "error": "Too many failed attempts. Code locked."}`
  - `404 Not Found`: `{"ok": false, "code": "OTP_NOT_FOUND", "error": "No pending code found or code expired."}`

### 1.3 Activate Cadet Account

- **Method:** `POST /auth/activate`
- **Payload:**

  ```json
  {
    "token": "a1b2c3d4...64-char-hex-token",
    "password": "Cadet#SecurePassword2026!"
  }
  ```

- **Response (200 OK):**

  ```json
  {
    "ok": true,
    "message": "Account activated successfully."
  }
  ```

---

## 2. Cadet Enrollment & Verification Endpoints

### 2.1 Submit Form 1 Enrollment Application

- **Method:** `POST /enrollments/submit`
- **Payload:** Full Form 1 JSON validated against `cadetEnrollmentSchema` (personal, physical, academic, DBT bank account, Aadhaar).
- **Response (201 Created):**

  ```json
  {
    "ok": true,
    "applicationId": "192026102384910291",
    "status": "PENDING_ANO_REVIEW",
    "submittedAt": "2026-10-23T04:30:00.000Z"
  }
  ```

### 2.2 Public Application Status Tracking

- **Method:** `GET /enrollments/status/:applicationId`
- **Security:** Public endpoint with automatic PII data minimization (`maskPublicRecord`).
- **Response (200 OK):**

  ```json
  {
    "id": "192026102384910291",
    "fullName": "Abhishek Raj",
    "status": "PENDING_ANO_REVIEW",
    "applicationDate": "2026-10-23",
    "sbuCourse": "B.Tech Mechanical",
    "sbuDepartment": "Engineering"
  }
  ```

  *(Note: roll numbers, mobile numbers, Aadhaar numbers, and bank details are strictly omitted).*

---

## 3. Operations & Calendar Endpoints

### 3.1 List Official Calendar Events

- **Method:** `GET /calendar/events`
- **Query Parameters:** `?month=10&year=2026&category=drill`
- **Cache:** L1 cached with 300s TTL.
- **Response (200 OK):**

  ```json
  {
    "events": [
      {
        "id": "evt-101",
        "title": "Combined Annual Training Camp (CATC)",
        "startTime": "2026-11-01T06:00:00.000Z",
        "endTime": "2026-11-10T18:00:00.000Z",
        "location": "Khelgaon Stadium, Ranchi",
        "category": "CAMP"
      }
    ]
  }
  ```

---

## 4. Telemetry, Health & Observability Endpoints

### 4.1 Liveness Probe

- **Method:** `GET /health?type=liveness`
- **Response (200 OK):**

  ```json
  { "status": "ok", "uptime": 84920, "timestamp": "2026-10-23T04:30:00.000Z" }
  ```

### 4.2 Readiness Probe

- **Method:** `GET /health?type=readiness`
- **Response (200 OK):**

  ```json
  {
    "status": "ok",
    "checks": {
      "database": "pass",
      "redis": "pass",
      "memory": "pass"
    }
  }
  ```

### 4.3 Multi-Tier Cache Metrics

- **Method:** `GET /metrics`
- **Response (200 OK):**

  ```json
  {
    "cache": {
      "l1Hits": 1420,
      "l1Misses": 48,
      "l2Hits": 32,
      "l2Misses": 16,
      "l1Size": 384,
      "hitRatio": 96.86
    },
    "queue": {
      "pendingJobs": 0,
      "processedJobs": 512,
      "failedJobs": 0
    }
  }
  ```
