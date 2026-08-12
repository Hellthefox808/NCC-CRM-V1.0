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

| Role | Permissions & Access Boundaries |
| :--- | :--- |
| **APPLICANT** | `application.read.own`, `status.track.own` |
| **CADET** | `profile.read.own`, `profile.update.own`, `documents.read.own`, `attendance.read.own`, `notice.read` |
| **ANO / OFFICER** | `applications.read`, `applications.review`, `applications.approve`, `applications.reject`, `cadets.read`, `cadets.manage`, `attendance.mark`, `notice.publish`, `audit.view` |

> [!IMPORTANT]
> All permissions are strictly validated on the backend API layer (`requireOfficer` / `requireCadetSession`). Client-side UI route hiding is treated only as a UX convenience, never a security boundary.
