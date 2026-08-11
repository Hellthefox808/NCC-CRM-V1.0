# NCC PORTAL — API & ATTACK SURFACE INVENTORY

**Version**: 1.0.0  
**Compliance Standard**: OWASP API Security Top 10:2023 / OWASP ASVS 5.0.0  
**Last Audit Date**: 2026-08-11

---

## 1. Authentication & Session Management Endpoints

### `POST /api/v1/auth/login`

- **Method**: POST
- **Authentication**: None (Public)
- **Authorization**: Public (Rate-limited)
- **Inputs**: `email` (string, verified domain), `password` (string, max 128 chars)
- **Outputs**: `{ success: boolean, data: { user: CadetUser, sessionToken: string }, tokenType: "Bearer" }`
- **Sensitive Data**: Password, Session Bearer Token
- **Rate Limit**: 5 attempts per minute per IP (`auth_login:IP`)
- **Resource Limit**: Payload ceiling 10KB
- **Audit**: Logged as `AUTH_SUCCESS` or `AUTH_FAILURE` in `security_events`
- **Threat Model**: Brute force, credential stuffing, timing attack, session fixation
- **Test Coverage**: `backend/tests/security.test.ts` (Rate limit + scrypt password hash verification)

### `POST /api/v1/auth/verify-activation`

- **Method**: POST
- **Authentication**: None (Public token-gated)
- **Authorization**: Public with valid single-use token
- **Inputs**: `token` (string, hex, 64 chars)
- **Outputs**: `{ success: boolean, data: { cadetName: string, email: string, valid: boolean } }`
- **Sensitive Data**: Single-use activation token hash
- **Rate Limit**: 10 attempts per minute per IP
- **Resource Limit**: Payload ceiling 5KB
- **Audit**: Logged in `audit_logs` as `ACTIVATION_TOKEN_CHECK`
- **Threat Model**: Token enumeration, replay attack, expired token use
- **Test Coverage**: `backend/tests/cadet-lifecycle.test.ts`

### `POST /api/v1/auth/set-password`

- **Method**: POST
- **Authentication**: Single-use token verification
- **Authorization**: Public with valid single-use token
- **Inputs**: `token` (string), `password` (string, min 8 chars, 1 upper, 1 lower, 1 digit, 1 special)
- **Outputs**: `{ success: boolean, message: string }`
- **Sensitive Data**: Salted scrypt password hash
- **Rate Limit**: 5 attempts per minute per IP
- **Resource Limit**: Payload ceiling 5KB
- **Audit**: Logged as `PASSWORD_SETUP_COMPLETED`
- **Threat Model**: Password reuse, weak password policy, double activation
- **Test Coverage**: `backend/tests/cadet-lifecycle.test.ts`

---

## 2. Enrollment & Application Endpoints

### `POST /api/v1/enrollment/apply`

- **Method**: POST
- **Authentication**: None (Public candidate portal)
- **Authorization**: Public applicant
- **Inputs**: Full cadet application payload (`fullName`, `gender`, `dob`, `aadhaarNumber`, `mobile`, `email`, `sbuCourse`, `sbuDepartment`, `sbuRollNo`, `bloodGroup`, `address`)
- **Outputs**: `{ success: boolean, data: { applicationId: string, trackingNumber: string } }`
- **Sensitive Data**: Aadhaar Number (Encrypted/Masked), PII
- **Rate Limit**: 3 applications per hour per IP
- **Resource Limit**: 50KB JSON body
- **Audit**: Logged as `APPLICATION_SUBMITTED`
- **Threat Model**: Automated spam applications, SQL injection, XSS, Aadhaar disclosure
- **Test Coverage**: `backend/tests/cadet-lifecycle.test.ts`

### `GET /api/v1/enrollment/status`

- **Method**: GET
- **Authentication**: None (Challenge-based)
- **Authorization**: Public tracking
- **Inputs**: Query params: `trackingNumber` (string), `dob` (string YYYY-MM-DD)
- **Outputs**: `{ success: boolean, data: MaskedCadetStatus }` (PII strictly masked)
- **Sensitive Data**: Public status badge only (`APPROVED`, `PENDING_ANO_REVIEW`, `REJECTED`)
- **Rate Limit**: 10 requests per minute per IP
- **Resource Limit**: Response capped to 1KB
- **Audit**: Logged in `audit_logs`
- **Threat Model**: Application enumeration, PII leakage
- **Test Coverage**: `backend/tests/security.test.ts` (`maskPublicRecord()`)

---

## 3. Storage Security & Bucket Tokenisation Endpoints

### `POST /api/v1/storage/intent`

- **Method**: POST
- **Authentication**: Bearer Session Token
- **Authorization**: Authenticated Cadet / Officer (`CADET`, `INSTRUCTOR`, `ANO`, `ADMIN`)
- **Inputs**: `{ resourceType: string, resourceId: string, mimeType: string, sizeBytes: number, checksum?: string }`
- **Outputs**: `{ success: boolean, data: UploadIntentResult }` (Opaque intent ID, scoped token, opaque key)
- **Sensitive Data**: Temporary Upload Capability Bearer Token (15m TTL)
- **Rate Limit**: 10 intents per 15 minutes per user
- **Resource Limit**: Max size 15MB per file
- **Audit**: Logged as `STORAGE_INTENT_CREATED`
- **Threat Model**: Client key manipulation, path traversal, oversized file upload, MIME spoofing
- **Test Coverage**: `backend/tests/storage.test.ts`

### `POST /api/v1/storage/verify`

- **Method**: POST
- **Authentication**: Storage Upload Token (`stok_up_...`)
- **Authorization**: Token ownership verification
- **Inputs**: `{ uploadToken: string, magicBytesHex: string, actualSizeBytes: number }`
- **Outputs**: `{ success: boolean, data: { objectId: string, bucket: string, objectKey: string } }`
- **Sensitive Data**: Storage Object Metadata
- **Rate Limit**: 10 verifications per 15 minutes per token
- **Resource Limit**: 5KB body
- **Audit**: Logged as `STORAGE_UPLOAD_VERIFIED`
- **Threat Model**: Token reuse, magic bytes bypass, incomplete upload commit
- **Test Coverage**: `backend/tests/storage.test.ts`

### `POST /api/v1/storage/grant`

- **Method**: POST
- **Authentication**: Bearer Session Token
- **Authorization**: Object Owner or ANO/Admin (ABAC check)
- **Inputs**: `{ objectId: string }`
- **Outputs**: `{ success: boolean, data: DownloadGrantResult }` (Scoped 15m download grant)
- **Sensitive Data**: Temporary Download Capability Bearer Token
- **Rate Limit**: 20 grants per 15 minutes per user
- **Resource Limit**: 2KB body
- **Audit**: Logged as `STORAGE_DOWNLOAD_GRANTED`
- **Threat Model**: BOLA / IDOR cross-user document access, long-lived token leak
- **Test Coverage**: `backend/tests/storage.test.ts`

---

## 4. Realtime Socket.IO & AI Endpoints

### `WS /socket.io/`

- **Method**: WebSocket / HTTP Long-Polling
- **Authentication**: Bearer Token in `handshake.auth.token`
- **Authorization**: Room authorization (`user:{id}`, `role:{role}`)
- **Inputs**: Authenticated socket events
- **Outputs**: Realtime calendar updates, notice broadcasts, prompter reminders
- **Sensitive Data**: Internal event notifications
- **Rate Limit**: Max 5 connections per user
- **Audit**: Logged as `SOCKET_CONNECTED` / `SOCKET_DISCONNECTED`
- **Threat Model**: Unauthenticated room join, event spoofing, socket flooding

### `POST /api/v1/agent/chat`

- **Method**: POST
- **Authentication**: None / Optional Bearer
- **Authorization**: Public / Cadet
- **Inputs**: `{ message: string (max 1000 chars), history?: Message[] }`
- **Outputs**: `{ success: boolean, data: { reply: string } }`
- **Sensitive Data**: Prompt context
- **Rate Limit**: 10 requests per minute per IP
- **Resource Limit**: 1000 char prompt ceiling
- **Audit**: Logged in `audit_logs`
- **Threat Model**: Prompt injection, system prompt extraction, token consumption abuse
