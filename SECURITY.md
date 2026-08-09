# Security Policy — 19 JHR BN NCC Command Portal

## Supported Versions

The following table lists the release versions of the 19 JHR BN NCC Command Portal currently receiving security updates:

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

---

## Reporting a Vulnerability

We take the security of our cadet management infrastructure and user data extremely seriously.

If you discover a security vulnerability or potential privacy issue in this portal:

1. **DO NOT** create a public GitHub Issue.
2. Email your findings directly to the Battalion Cyber Security Team at `security@sbu.ac.in` or `ano.ncc@sbu.ac.in`.
3. Include a detailed description of the issue, steps to reproduce, and proof-of-concept payload if applicable.

---

## Security Best Practices Enforced

- **Defense in Depth**: Strict server-side authorization checks (`requireOfficer`, `requireCadetSession`).
- **PII Protection**: Automatic data masking (`maskPublicRecord`) for Aadhaar numbers and bank accounts on public status queries.
- **Session Hygiene**: 256-bit cryptographically random tokens (`crypto.getRandomValues`) with HTTP-Only, SameSite=Lax cookies.
- **Zero Raw Credentials**: One-Time Passwords (OTP) and passwords are stored exclusively as SHA-256 salted hashes.
