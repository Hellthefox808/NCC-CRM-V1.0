# THREAT MODEL & RISK ASSESSMENT

**Model Framework**: STRIDE (Spoofing, Tampering, Repudiation, Information Disclosure, Denial of Service, Elevation of Privilege)  
**Project**: 19 Jharkhand Battalion NCC Portal

---

## STRIDE Threat Analysis & Mitigation Matrix

| Threat Category            | Potential Attack Vectors                                                        | Project Risk Level | Implemented Mitigation                                                                                                      |
| :------------------------- | :------------------------------------------------------------------------------ | :----------------: | :-------------------------------------------------------------------------------------------------------------------------- |
| **Spoofing**               | Credential stuffing, session hijacking, unauthenticated WebSocket connections   |        Low         | 256-bit crypto session tokens, IP rate limiting on login/OTP, authenticated Socket.IO handshakes.                           |
| **Tampering**              | Parameter tampering on application status, SQL injection, magic byte bypass     |        Low         | Server-side Zod validation schemas, `sanitizePostgrestQuery()` query sanitizer, `validateMagicBytes()` binary check.        |
| **Repudiation**            | Denying administrative actions or status changes                                |        Low         | Audit log recording (`audit_logs`) capturing timestamp, user ID, client IP, action, and target resource.                    |
| **Information Disclosure** | PII leakage (Aadhaar, Phone), unauthorized storage URL access                   |        Low         | Public status record PII masking (`maskCadet()`), Bucket Tokenisation with opaque keys and 15m download grants.             |
| **Denial of Service**      | OTP flooding, unbounded file uploads, prompt injection flooding                 |        Low         | Shared rate limiters (`checkRateLimit`), 15MB file upload ceiling, 1000 character prompt cap on Subedar Major AI Assistant. |
| **Elevation of Privilege** | Cadets attempting to access ANO/Admin routes or modify other cadets' attendance |        Low         | Role-based middleware gates (`requireOfficer()`), ABAC ownership verification on all resource mutations.                    |
