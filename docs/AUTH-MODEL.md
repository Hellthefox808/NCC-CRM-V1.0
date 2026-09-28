# NCC Platform — Authentication & Authorization Model

This document outlines the security architecture, identity stages, token lifecycle, and Role-Based Access Control (RBAC) model for the 19 Jharkhand Battalion NCC Portal.

---

## 1. Identity Pipeline Stages

```text
Applicant
   ↓
Application Submission
   ↓
Verification & Document Review
   ↓
ANO Officer Approval
   ↓
Automatic Account Provisioning
   ↓
Single-Use Activation Token Generation [HASH(rawToken)]
   ↓
Transactional Welcome Email Dispatch
   ↓
Secure Password Setup Screen (/activate)
   ↓
Salted Scrypt Hashing & Account Activation
   ↓
Go to NCC Login (No auto-session elevation)
   ↓
Username + Password Verification
   ↓
OTP / Security Verification
   ↓
Session Creation & Server-Enforced RBAC
   ↓
Cadet / ANO Portal
```

---

## 2. Token Security Architecture

1. **High Entropy Token Generation**:
   - `rawToken = crypto.randomBytes(32).toString('hex')` (256-bit cryptographically secure token).
   - Delivered to the user via activation URL `https://ncc.sbu.ac.in/activate?token=<rawToken>`.
2. **Server-Side Token Hashing**:
   - Only `SHA256(rawToken)` is stored in `auth_otp_codes` or `account_activation_tokens`.
3. **Single-Use Enforcement**:
   - Atomic consumption via `consumeActivationToken()`. Re-using a token immediately returns `TOKEN_NOT_FOUND`.
4. **Time-To-Live (TTL)**:
   - Activation & password reset tokens expire after **30 minutes**.

---

## 3. Password Hashing Specification

- **Algorithm**: Salted scrypt.
- **Parameters**: `N=16384`, `r=8`, `p=1`, 64-byte key length, 16-byte random salt.
- **Stored Format**: `scrypt$N=16384,r=8,p=1$<salt_hex>$<derived_hex>`.
- **Verification**: `crypto.timingSafeEqual` against target derived key.

---

## 4. Role-Based Access Control (RBAC) Matrix

| Role              | Permissions & Access Boundaries                                                                                                                                              |
| :---------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **APPLICANT**     | `application.read.own`, `status.track.own`                                                                                                                                   |
| **CADET**         | `profile.read.own`, `profile.update.own`, `documents.read.own`, `attendance.read.own`, `notice.read`                                                                         |
| **ANO / OFFICER** | `applications.read`, `applications.review`, `applications.approve`, `applications.reject`, `cadets.read`, `cadets.manage`, `attendance.mark`, `notice.publish`, `audit.view` |

> [!IMPORTANT]
> All permissions are strictly validated on the backend API layer (`requireOfficer` / `requireCadetSession`). Client-side UI route hiding is treated only as a UX convenience, never a security boundary.

---

## 5. Multi-Purpose OTP Engine & Failover Architecture

1. **Purposes Supported**:
   - `password_reset`: Default self-service password recovery.
   - `onboarding`: Contact verification step during cadet onboarding.
   - `account_activation`: Initial identity verification for provisioned cadets.
   - `verification`: General-purpose step-up identity confirmation.
2. **Dual-Tier Resilient Storage**:
   - Primary: Database table `auth_otp_codes` with index on `(identifier, purpose, consumed_at)`.
   - Failover: Bounded, self-pruning in-memory store with `RESEND_COOLDOWN_MS` (45s) and `MAX_ATTEMPTS` (5) lockout.
3. **Verification Security**:
   - Hash comparison via `crypto.timingSafeEqual` prevents side-channel timing attacks.
   - Atomic consumption prevents replay attacks.

---

## 6. Cadet Onboarding Progression & Auto-Activation Workflow

Cadets progress through a 5-step checklist (`/api/v1/onboarding` and `/api/v1/onboarding/$step`):
1. `profile_completed`: Verification of name, blood group, college roll no.
2. `contact_verified`: Validated via OTP verification (`purpose: "onboarding"`).
3. `documents_verified`: Verification of uploaded marksheets & identification.
4. `declaration_accepted`: Acceptance of NCC Cadet Declaration & Anti-Ragging pledge.
5. `orientation_completed`: Review and sign-off on Battalion standing orders.

**Auto-Activation Trigger**:
- When all 5 steps are marked complete:
  - `cadet_users.account_status` is atomically transitioned to `ACTIVE`.
  - Transactional `sendOnboardingWelcome` email is queued via `queueEmailJob`.
  - Structured audit trail `onboarding_completed` is recorded.

---

## 7. Authoritative Architecture Reference

For the comprehensive 58-section enterprise OTP, MFA, passkey, and authentication architecture, refer to:

- [NCC CRM — Elite Production OTP & Authentication Architecture](file:///c:/Users/ravir/Desktop/PROJECT/Project/NCC/docs/security/NCC_CRM_Elite_OTP_Authentication_Architecture.md)
