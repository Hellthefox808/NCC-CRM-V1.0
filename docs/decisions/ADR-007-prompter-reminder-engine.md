# ADR-007: Prompter Durable Reminder Engine Architecture

**Status**: ACCEPTED  
**Date**: August 11, 2026  
**Context**: OWASP ASVS 5.0 V11 (Business Logic Security Requirements)

---

## Context & Problem Statement

Training parades, drill events, and onboarding follow-ups require scheduled multi-channel reminders (24 hours prior, 2 hours prior, 30 minutes prior, and event start). Reminders must survive server restarts, support atomic rescheduling when event times change, and prevent duplicate notifications.

## Decision Outcome

1. **Database-Backed Rules & Reminders**: Reminders are calculated and stored in `calendar_event_reminders` with `scheduled_time`, `trigger_type`, `status` (`PENDING`, `DISPATCHED`, `CANCELLED`).
2. **Prompter Engine Service**: `PrompterService` provides atomic schedule generation (`scheduleEventReminders`), time change recalculation (`recalculateEventReminders`), and cancellation (`cancelEventReminders`).
3. **Multi-Channel Dispatcher**: When a reminder becomes due, `ReminderDispatcher` dispatches via:
   - Async Email Queue (`email_jobs`)
   - Real-time Socket.IO Broadcast (`notification:user:{id}`)
   - In-app Notification Record (`notification_deliveries`)
4. **Idempotency**: Dispatched reminders are atomically marked `status = 'DISPATCHED'` to guarantee at-most-once delivery.

## Consequences

- **Positive**: Complete durability across server restarts.
- **Positive**: Automatic recalculation when officers reschedule calendar events.
