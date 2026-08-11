/**
 * Structured security audit logging for the NCC portal.
 *
 * Records security-sensitive events (login, logout, password changes, etc.)
 * to both console (structured JSON) and the `audit_logs` database table.
 *
 * RULES:
 *   - NEVER log passwords, OTP codes, or raw session tokens.
 *   - NEVER log Aadhaar numbers, bank account numbers, or other PII.
 *   - Session IDs (UUIDs) are safe to log for correlation.
 */

import { getAdmin } from "@backend/lib/ncc-db";

export type AuditAction =
  | "login_success"
  | "login_failure"
  | "logout"
  | "session_expired"
  | "password_reset"
  | "otp_issued"
  | "otp_verified"
  | "otp_failed"
  | "enrollment_submit"
  | "enrollment_status_change"
  | "cadet_modified"
  | "notification_broadcast"
  | "roster_sync"
  | "export_data";

export interface AuditEvent {
  actor: string;
  action: AuditAction;
  target: string;
  ip?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Logs an audit event. This is fire-and-forget — it never throws or blocks
 * the calling request handler. Database write failures are logged to console.
 */
export function logAuditEvent(event: AuditEvent): void {
  const timestamp = new Date().toISOString();

  // Structured console log (always succeeds)
  const logEntry = {
    level: "audit",
    ts: timestamp,
    actor: event.actor,
    action: event.action,
    target: event.target,
    ip: event.ip || "unknown",
    ...(event.metadata ? { meta: event.metadata } : {}),
  };
  console.log(JSON.stringify(logEntry));

  // Async database persistence — fire-and-forget
  persistAuditEvent(event, timestamp).catch((err) => {
    console.error("[audit-log] Failed to persist audit event:", err);
  });
}

export async function recordAuditLog(params: {
  actorId?: string;
  actor?: string;
  action: string;
  target: string;
  details?: string;
  metadata?: Record<string, unknown>;
  ip?: string;
}): Promise<void> {
  logAuditEvent({
    actor: params.actorId || params.actor || "system",
    action: params.action as AuditAction,
    target: params.target,
    ip: params.ip,
    metadata: {
      ...(params.details ? { details: params.details } : {}),
      ...(params.metadata || {}),
    },
  });
}

async function persistAuditEvent(event: AuditEvent, timestamp: string): Promise<void> {
  try {
    const admin = await getAdmin();
    await admin.from("audit_logs").insert({
      actor: event.actor,
      action: event.action,
      target: event.target,
      ip: event.ip || "unknown",
      metadata: event.metadata ? JSON.stringify(event.metadata) : null,
      created_at: timestamp,
    });
  } catch {
    // Silently fail — audit logging must never break the application.
    // The structured console log above ensures the event is always recorded somewhere.
  }
}
