# ADR-009: AI Assistant Gateway Boundaries & Read-Only RAG Architecture

**Status**: ACCEPTED  
**Date**: August 11, 2026  
**Context**: OWASP ASVS 5.0 V5 (Validation) & V11 (Business Logic Security)

---

## Context & Problem Statement

The AI Assistant service provides cadets and staff with answers regarding NCC drill manuals, battalion schedules, and SBU guidelines. The AI must act strictly as an informational assistant and must **NEVER** possess authority to execute administrative decisions (e.g., approving applications, marking attendance, changing roles).

## Decision Outcome

1. **Read-Only Informational Scope**: The AI service (`agent/services/ai-chat.service.ts`) operates strictly in read-only informational mode. It has zero mutation tools or administrative API rights.
2. **Prompt Boundary & Quota Enforcement**:
   - Prompt length ceiling: Max 1,000 characters per request.
   - History turn ceiling: Max 4 previous dialog turns.
   - IP Rate Limiting: 10 requests per minute.
3. **Input Sanitization**: User prompts are sanitized to remove control tokens, injection payloads, and system prompt override attempts.

## Consequences

- **Positive**: Complete protection against administrative prompt injection attacks.
- **Positive**: Strict rate limiting prevents token quota exhaustion.
