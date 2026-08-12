# ADR-001: OWASP-Compliant Account Onboarding, Token Activation, and Anti-Enumeration Architecture

- **Status**: Approved & Implemented
- **Date**: 2026-08-12
- **Deciders**: 19 JHR BN NCC Portal Engineering Team

---

## Context & Problem Statement

Account onboarding, password initialization, and recovery flows must satisfy strict OWASP security guidelines while providing a clean, institutional user experience for Cadets and ANO Officers. Sending temporary passwords in emails or allowing account enumeration during recovery introduces critical vulnerabilities.

---

## Decision Drivers

1. **No Cleartext Passwords in Emails**: Cleartext passwords in emails can be intercepted or exposed in log archives.
2. **Single-Use Activation Links**: Links must expire quickly (30 mins) and be invalid immediately after consumption.
3. **Anti-Enumeration Recovery**: Password reset requests must return uniform generic responses to prevent username/email discovery attacks.
4. **No Auto-Login Post Password Reset**: Per OWASP recommendations, users must log in manually post-reset to prevent session fixation.
5. **Standalone Test & Deployment Resilience**: Token and OTP logic must support fallback in unconfigured environments without breaking unit test suites.

---

## Considered Options

- **Option 1**: Send temporary random password via email on ANO approval. (Rejected — High security risk)
- **Option 2**: Auto-login user immediately upon password creation. (Rejected — Violates OWASP password reset cheat sheet)
- **Option 3**: Cryptographic Single-Use SHA256 Tokens + Salted Scrypt Hashing + Anti-Enumeration Recovery + Manual Login Redirection. (Selected)

---

## Decision Outcome

Option 3 was chosen and implemented across [auth-otp.server.ts](file:///c:/Users/ravir/Desktop/PROJECT/Project/NCC/backend/lib/auth-otp.server.ts), [PasswordSetupPortal.tsx](file:///c:/Users/ravir/Desktop/PROJECT/Project/NCC/frontend/features/PasswordSetupPortal.tsx), and `/api/v1/auth/*` routes.

### Consequences

- **Positive**:
  - OWASP compliant password reset & activation workflow.
  - Zero password leakage over email channels.
  - Uniform recovery response blocks account enumeration.
  - Hybrid storage guarantees resilience in test and production environments.
- **Negative**:
  - Users must take an extra step to log in manually after setting their password.
