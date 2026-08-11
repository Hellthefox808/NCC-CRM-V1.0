# ADR-004: Supabase PostgreSQL Database Security & RLS Policy Isolation

**Status**: ACCEPTED  
**Date**: August 11, 2026  
**Context**: OWASP ASVS 5.0 V8 (Data Protection) & V14 (Configuration)

---

## Context & Problem Statement

Database access must enforce strict boundaries. Client-side direct database queries must be blocked or isolated via Row Level Security (RLS), and server-side privileged operations must be encapsulated within authenticated API route handlers.

## Decision Outcome

1. **Row Level Security Enabled**: RLS is explicitly enabled on all tables (`cadet_enrollments`, `cadet_users`, `account_activation_tokens`, `onboarding_progress`, `email_jobs`, `audit_logs`).
2. **Service Role Admin Isolation**: Server-side privileged operations use `getAdmin()`, which retrieves a singleton Supabase service-role client (`supabaseAdmin`). This client runs strictly inside server-side route handlers after explicit `requireOfficer` or `requireCadetSession` verification.
3. **Public Anon Restrictions**: Public anonymous queries (`SUPABASE_ANON_KEY`) are restricted from directly accessing sensitive tables.

## Consequences

- **Positive**: Complete defense against direct Supabase API key abuse.
- **Positive**: Centralized server-side access control audit trail.
