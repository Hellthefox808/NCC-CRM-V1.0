# Architecture Decision Records (ADRs) Index

This directory indexes all formal Architecture Decision Records governing the 19 Jharkhand Battalion NCC Command Centre Platform.

The authoritative records are maintained under [`docs/decisions/`](../decisions/).

---

## Architecture Decision Records Register

| ADR ID | Title | Status | Scope |
| :--- | :--- | :--- | :--- |
| [ADR-001](../decisions/ADR-001-authentication-model.md) | Multi-Purpose OTP & Scrypt Authentication Model | **ACCEPTED** | Authentication & Identity |
| [ADR-001B](../decisions/ADR-001-onboarding-auth.md) | Single-Use Cryptographic Activation Tokens | **ACCEPTED** | Cadet Onboarding |
| [ADR-002](../decisions/ADR-002-session-management.md) | 256-Bit Bearer Session Tokens & Cache Invalidation | **ACCEPTED** | Session Management |
| [ADR-003](../decisions/ADR-003-rbac-abac-authorization.md) | Role-Based Access Control (RBAC) & Middleware Gates | **ACCEPTED** | Authorization & Security |
| [ADR-004](../decisions/ADR-004-database-security-rls.md) | PostgreSQL Row-Level Security (RLS) & Client Isolation | **ACCEPTED** | Database Security |
| [ADR-005](../decisions/ADR-005-email-infrastructure.md) | Transactional Email & Batch Queue Architecture | **ACCEPTED** | Notifications & Messaging |
| [ADR-006](../decisions/ADR-006-realtime-socket-architecture.md) | Socket.IO Server Engine & Room Authorization | **ACCEPTED** | Real-Time Communications |
| [ADR-007](../decisions/ADR-007-prompter-reminder-engine.md) | Prompter Scheduled Reminder Engine & Rescheduling | **ACCEPTED** | Calendar Operations |
| [ADR-008](../decisions/ADR-008-s3-file-storage.md) | S3 Capability Tokens & Magic-Byte Validation | **ACCEPTED** | File Storage & ASVS 5.0 |
| [ADR-009](../decisions/ADR-009-ai-rag-assistant.md) | NCC Knowledge Base RAG Assistant Architecture | **ACCEPTED** | AI & Search Integration |
| [ADR-010](../decisions/ADR-010-domain-boundaries-state-machines.md) | Cadet Induction State Machine & Invariant Boundaries | **ACCEPTED** | Domain Modeling |
