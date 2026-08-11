# ADR-005: Nodemailer Singleton Transporter & Asynchronous Email Queue Architecture

**Status**: ACCEPTED  
**Date**: August 11, 2026  
**Context**: OWASP ASVS 5.0 V9 (Communications Security)

---

## Context & Problem Statement

Email dispatching for application acknowledgements, activation links, schedule notices, and reminders must be reliable, non-blocking to HTTP application requests, rate-limited, and log audit delivery results.

## Decision Outcome

1. **Singleton Transporter**: `MailerService` maintains a single Nodemailer pool instance with `maxConnections: 5`, `rateLimit: 14`, `disableFileAccess: true`, and `disableUrlAccess: true`.
2. **Database-Backed Job Queue**: Email dispatches are enqueued into the `email_jobs` table via `queueEmailJob()`. HTTP API requests return immediately without waiting for SMTP transport.
3. **Background Worker Processing**: An asynchronous background poller (`processPendingEmailJobs()`) picks up `PENDING` jobs, renders HTML/text templates, sends emails, updates job status (`COMPLETED` or `FAILED`), and records audit logs in `email_delivery_logs`.
4. **Dev Suppressed Mode**: In development environments without configured SMTP credentials, emails are simulated and logged locally without throwing errors.

## Consequences

- **Positive**: Zero HTTP blocking during high-volume email dispatches.
- **Positive**: Automatic retry mechanism and audit logging for failed deliveries.
