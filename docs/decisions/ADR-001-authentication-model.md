# ADR-001: Controlled Authentication Model & Cryptographic Account Activation

**Status**: ACCEPTED  
**Date**: August 11, 2026  
**Context**: OWASP ASVS 5.0 V2 (Authentication Verification Requirements)

---

## Context & Problem Statement

The legacy system permitted first-time cadet logins to authenticate with any password >= 6 characters matching a registered cadet identifier if no password was previously set. This created a critical authentication vulnerability allowing unauthorized account takeover.

## Decision Drivers

1. Elimination of default or auto-generated static passwords sent via unencrypted email.
2. OWASP ASVS 5.0 V2 compliance for cryptographic account activation and password setup.
3. Separation of the Applicant lifecycle (`PENDING_ANO_REVIEW`) from the User Account lifecycle (`ACTIVATION_PENDING` → `ACTIVE`).

## Considered Options

1. **Option 1 (Legacy)**: Auto-generate static password on enrollment submission and email to applicant. (REJECTED - Insecure)
2. **Option 2 (Single-Use Token Activation)**: ANO approval transaction provisions `cadet_users` (`ACTIVATION_PENDING`) and generates a cryptographically random single-use activation token (hashed via SHA-256 in DB, valid for 24h). Cadet sets strong password via activation link. (ACCEPTED)

## Decision Outcome

**Chosen Option**: Option 2.

### Technical Specification

- **Password KDF**: Node native `crypto.scryptSync` with 16-byte random salt per user credential ($N=16384, r=8, p=1$). Format: `scrypt$N=16384,r=8,p=1$<salt-hex>$<hash-hex>`.
- **Activation Token**: 32-byte cryptographically secure random token (`crypto.randomBytes(32).toString('hex')`), stored as a SHA-256 hash in `account_activation_tokens`.
- **Token Invalidation**: Marked as `used_at = now()` immediately upon successful password creation. Expired tokens (> 24h) are rejected.
- **Unactivated Account Guard**: Accounts in `ACTIVATION_PENDING` status are strictly prohibited from logging in with password authentication.

## Consequences

- **Positive**: Complete elimination of default password takeover vulnerabilities.
- **Positive**: Strict alignment with NIST SP 800-63B and OWASP ASVS 5.0 V2.
- **Negative**: Requires cadets to have a functional email address to receive activation links.
