# ADR-003: Multi-Tenant RBAC & ABAC Authorization Matrix

**Status**: ACCEPTED  
**Date**: August 11, 2026  
**Context**: OWASP ASVS 5.0 V4 (Access Control Verification Requirements)

---

## Context & Problem Statement

Access control must restrict administrative actions (application approvals, metrics, roster exports) to verified Officers (ANO / CO) while permitting Cadets to manage only their own profiles and assigned activities (Insecure Direct Object Reference / BOLA prevention).

## Permission Matrix

| Role              | Application Review | Account Activation | Cadet Roster | Self Profile  | Battalion Calendar | Attendance Record | Operational Metrics |
| ----------------- | ------------------ | ------------------ | ------------ | ------------- | ------------------ | ----------------- | ------------------- |
| **SUPER_ADMIN**   | FULL               | FULL               | FULL         | FULL          | FULL               | FULL              | FULL                |
| **ANO / OFFICER** | APPROVE / REJECT   | ISSUE TOKENS       | FULL         | READ          | CREATE / UPDATE    | FULL              | READ                |
| **CADET**         | NONE               | SELF ONLY          | READ OWN     | READ / UPDATE | READ ASSIGNED      | READ OWN          | NONE                |
| **APPLICANT**     | SUBMIT OWN         | ACTIVATING         | NONE         | NONE          | NONE               | NONE              | NONE                |

## Decision Outcome

- **Server-Side Enforcement**: `requireOfficer(request)` and `requireCadetSession(request)` middleware handlers execute prior to API handler business logic.
- **ABAC Ownership Policy**: Cadets can only read/update records matching their authenticated `cadetId`. Attempting to access another cadet's ID returns HTTP 403 `FORBIDDEN`.
- **Zero Client-Side Trust**: Role and user identity are derived exclusively from verified server session tokens.

## Consequences

- **Positive**: Complete prevention of BOLA / IDOR vulnerabilities across cadet data.
- **Positive**: Strict separation of officer administrative capabilities.
