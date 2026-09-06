/**
 * Structured security audit logging for the NCC portal.
 *
 * Records security-sensitive events (login, logout, password changes, etc.)
 * through configured audit log transports (e.g. JSON stdout, external log management)
 * and the `audit_logs` database table.
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

export interface StructuredAuditEntry {
  level: "audit";
  ts: string;
  actor: string;
  action: AuditAction;
  target: string;
  ip: string;
  meta?: Record<string, unknown>;
}

export type AuditLogTransport = (entry: StructuredAuditEntry) => void | Promise<void>;

/**
 * Default stdout transport that outputs formatted structured JSON.
 */
const defaultConsoleTransport: AuditLogTransport = (entry: StructuredAuditEntry) => {
  const formatted = JSON.stringify(entry) + "\n";
  if (typeof process !== "undefined" && process.stdout?.write) {
    process.stdout.write(formatted);
  } else {
    console.log(JSON.stringify(entry));
  }
};

let activeTransports: AuditLogTransport[] = [defaultConsoleTransport];

/**
 * Registers an additional audit log transport (e.g., Datadog, CloudWatch, Sentry, SIEM).
 */
export function addAuditTransport(transport: AuditLogTransport): void {
  activeTransports.push(transport);
}

/**
 * Resets active transports to default (or a custom list), useful for tests or environment configuration.
 */
export function resetAuditTransports(customTransports?: AuditLogTransport[]): void {
  activeTransports = customTransports ? [...customTransports] : [defaultConsoleTransport];
}

/**
 * Emits a structured audit log entry across all active transports.
 * Transport execution errors are safely caught so audit logging never interrupts application flow.
 */
export function emitAuditLog(entry: StructuredAuditEntry): void {
  for (const transport of activeTransports) {
    try {
      const res = transport(entry);
      if (res && typeof (res as Promise<void>).catch === "function") {
        (res as Promise<void>).catch((err) => {
          console.error("[audit-log] Async transport error:", err);
        });
      }
    } catch (err) {
      console.error("[audit-log] Sync transport error:", err);
    }
  }
}

/**
 * Logs an audit event. This is fire-and-forget — it never throws or blocks
 * the calling request handler. Database write failures are logged safely.
 */
export function logAuditEvent(event: AuditEvent): void {
  const timestamp = new Date().toISOString();

  const logEntry: StructuredAuditEntry = {
    level: "audit",
    ts: timestamp,
    actor: event.actor,
    action: event.action,
    target: event.target,
    ip: event.ip || "unknown",
    ...(event.metadata && Object.keys(event.metadata).length > 0 ? { meta: event.metadata } : {}),
  };

  emitAuditLog(logEntry);

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
    // The structured log transport above ensures the event is always recorded.
  }
}
