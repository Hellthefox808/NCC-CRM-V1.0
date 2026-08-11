# ADR-010: Explicit Domain Boundaries & Formally Modeled State Machines

**Status**: ACCEPTED  
**Date**: August 11, 2026  
**Context**: Phase 01 Architecture & System Topology

---

## Context & Problem Statement

As the NCC Portal grows to encompass applicant submissions, officer approvals, cadet activations, attendance tracking, realtime broadcasts, background queues, and AI queries, avoiding tight coupling or cross-domain state mutation is paramount.

Without explicit domain boundaries, business logic becomes scattered across API routes, UI hooks, and raw database queries, leading to authorization gaps, illegal state transitions, and unmaintainable code.

## Decision Drivers

1. Strict separation of concerns across 21 explicit domain boundaries.
2. Formal state machines for Cadet Applications, User Account Activations, Calendar Training Events, and File Uploads.
3. Direct mapping of database tables to domain owners with non-overlapping mutation authority.

## Decision Outcome

**Chosen Option**: Formally define 21 domain boundaries in `docs/architecture/DOMAIN_MODEL.md` and enforce state transition validation at the domain service layer before any database state mutation occurs.

### Key Architecture Rules

1. **State Machine Enforcement**: All status transitions (`PENDING_ANO_REVIEW` → `APPROVED`, `ACTIVATION_PENDING` → `ACTIVE`, `DRAFT` → `PUBLISHED`) MUST pass through domain service validation. Direct raw updates to `status` fields outside domain services are prohibited.
2. **Event Dispatch Integration**: Every valid state machine transition automatically emits a corresponding domain event, triggering email notifications, Socket.IO broadcasts, and audit logging asynchronously.
3. **No Direct Database Writes from Routes**: API routes must delegate business logic and state transitions to domain service modules (`backend/services/` and `backend/lib/`).

## Consequences

- **Positive**: Complete elimination of invalid state transitions (e.g. activating an unapproved application or approving a rejected application).
- **Positive**: Clear ownership of database tables per domain.
- **Negative**: Requires strict discipline in domain service layering for all new feature additions.
