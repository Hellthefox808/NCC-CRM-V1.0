# NCC Platform — Project Context & System State

**System Name**: 19 Jharkhand Battalion NCC Portal (Sarala Birla University Sub-Unit)  
**Corpus Name**: Hellthefox808/NCC-CRM-V1.0  
**Branch**: `main`  
**Last Updated**: 2026-08-21

---

## 1. System Architecture Summary

The NCC Portal operates as an integrated, OWASP-compliant identity and management system designed for cadet enrollment, ANO verification, attendance tracking, event scheduling, and security auditing.

```text
                    NCC PRODUCTION SYSTEM
                              │
             ┌────────────────┴────────────────┐
             │                                 │
        APPLICATION                         PLATFORM
             │                                 │
      ┌──────┴──────┐              ┌───────────┴───────────┐
      │             │              │                       │
   Frontend      Backend        Database                 AWS
      │             │              │                       │
   UI/UX        APIs/Auth       Redis                 Docker
      │             │              │                       │
      └──────┬──────┘              └───────────┬───────────┘
             │                                 │
             └──────────────┬──────────────────┘
                            │
                       GitHub / CI-CD
                            │
                    Test → Build → Scan
                            │
                       Staging → Prod
```

---

## 2. Component Stack

- **Frontend**: React 19 + TanStack Router (SSR) + Tailwind CSS v4 + Motion
- **Backend API**: TanStack Start / Nitro (TypeScript Node ESM)
- **Database**: Supabase / PostgreSQL (`app_credentials`, `cadet_users`, `cadet_enrollments`, `auth_otp_codes`, `audit_logs`)
- **Caching & Rate Limiting**: Redis / Hybrid Memory Store (`ncc:otp:{purpose}:{identifierHash}`)
- **Transactional Mailer**: Nodemailer (Dev simulated dispatch + SMTP pool)
- **Bundler & Build Tool**: Vite 8.2 + Nitro 3.0
- **Deployment Pipelines**: Netlify (`netlify.toml` -> `.output/public`), Vercel (`vercel.json` -> `.output/public`)

---

## 3. Active Security & Authentication Subsystems

1. **Multi-Stage Identity Pipeline**:
   `Applicant Registration` → `ANO Verification` → `Account Provisioning` → `Single-Use SHA256 Activation Token` → `Welcome Email` → `Set Password (scrypt)` → `Account Activated` → `Login` → `OTP / Rate Limited Verification` → `RBAC Session`.
2. **Password Security**:
   - Algorithm: Salted scrypt (`scrypt$N=16384,r=8,p=1$...`).
   - OWASP Password Policy: Minimum 8 characters, uppercase, lowercase, number, special character.
3. **Anti-Enumeration Recovery**:
   - Uniform response on password recovery: _"If an account matches the information provided, recovery instructions will be sent."_
4. **Role-Based Access Control (RBAC)**:
   - Server-enforced middleware (`requireOfficer` vs `requireCadetSession`).
   - Zero frontend-only privilege boundaries.

---

## 4. Test Suite & Verification Metrics

- **Backend Unit Tests**: **47 / 47 Pass (100%)** across 9 test suites.
- **ESLint Static Code Analysis**: **0 Errors (100% clean type-safety)**.
- **Production Build Status**: **Success (Vite + Nitro SSR Bundle)** with zero blocking warnings.
