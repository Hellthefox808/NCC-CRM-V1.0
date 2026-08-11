# SECURITY TEST MATRIX

**Project**: 19 Jharkhand Battalion NCC Portal  
**Test Standard**: OWASP ASVS 5.0.0 / Node.js Native Test Runner  
**Status**: **ALL PASS (30 / 30)**

---

## Security Test Suite Breakdown

| Suite Name                                   | Target Module / Service                                                                                     | Test Assertions                                                                                                                                                                                                             | Result         |
| :------------------------------------------- | :---------------------------------------------------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------------- |
| **Data Mapping & Transformation**            | `backend/lib/cadet-registry.server.ts`                                                                      | Row mapping, UUID generation, PII masking defaults (`mapCadet`), nominal roll serialization.                                                                                                                                | **PASS** (4/4) |
| **Controlled Cadet Lifecycle & Activation**  | `backend/lib/validation.schemas.ts`, `backend/services/auth`                                                | Default `PENDING_ANO_REVIEW` status, 256-bit token entropy, SHA-256 resting hashes, salted `scrypt` password KDF ($N=16384, r=8, p=1$), onboarding calculation.                                                             | **PASS** (4/4) |
| **Nodemailer Service**                       | `backend/services/mail/mailer.ts`                                                                           | OTP HTML/text rendering, welcome template branding, activation payload URL escaping, event notifications, reminder templates, dev mode suppression.                                                                         | **PASS** (6/6) |
| **Prompter Reminder Engine**                 | `backend/services/prompter/prompter.service.ts`                                                             | Default 24h, 2h, 30m, and start rule definitions; scheduled offset subtraction calculations.                                                                                                                                | **PASS** (2/2) |
| **Security & Authorization**                 | `backend/lib/validation.middleware.ts`, `backend/lib/sanitization.ts`, `backend/lib/rate-limiter.server.ts` | Bearer token extraction, 401 unauthenticated rejection (`requireOfficer`, `requireCadetSession`), public record PII masking, PostgREST query sanitization, 256-bit session token entropy, sliding-window rate limit checks. | **PASS** (8/8) |
| **Bucket Tokenisation & Storage Capability** | `backend/services/storage/storage.service.ts`, `storage.tokens.ts`                                          | Token entropy & SHA-256 resting hash verification, magic byte header validation (`validateMagicBytes`), MIME allowlist filtering, server-side opaque object key formatting, intent size limit rejections.                   | **PASS** (6/6) |

---

## Total Execution Summary

- **Total Test Suites**: 6
- **Total Tests Run**: 30
- **Passed**: 30
- **Failed**: 0
- **Skipped**: 0
