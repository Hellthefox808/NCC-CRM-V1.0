# ADR-002: Session Token Management & Revocation Model

**Status**: ACCEPTED  
**Date**: August 11, 2026  
**Context**: OWASP ASVS 5.0 V3 (Session Management Verification Requirements)

---

## Context & Problem Statement

Session tokens must be cryptographically secure, unpredictable, resistant to replay or hijacking attacks, and revocable on demand.

## Decision Drivers

1. Prevention of session token prediction or brute-force enumeration.
2. Timing-safe verification of session credentials across HTTP API handlers.
3. Support for session revocation upon password changes or security events.

## Decision Outcome

### Technical Specification

- **Token Generation**: 256-bit entropy random tokens (`sess_` prefix + 64 hex characters generated via `crypto.getRandomValues()`).
- **Token Storage**: `app_sessions` table in Supabase PostgreSQL with `expires_at`, `revoked_at`, and `last_seen_at` metadata.
- **Authorization Transport**: `Authorization: Bearer sess_<token>` HTTP headers.
- **Server Verification**: Extracted via `bearerToken(request)` helper, validated against `app_sessions` table, ensuring `expires_at > now()` and `revoked_at IS NULL`.
- **Session Revocation**: `POST /api/v1/auth/logout` revokes current session. Password updates immediately invalidate all existing sessions for the target user.

## Consequences

- **Positive**: Cryptographically secure 256-bit entropy prevents session prediction.
- **Positive**: Immediate revocation capability upon security incidents.
