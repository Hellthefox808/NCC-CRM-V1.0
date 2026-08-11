/**
 * Intrusion Detection System (IDS) Threat Rules & Scoring Engine
 *
 * OWASP A09:2025 (Security Logging & Alerting Failures) Compliance
 */

export interface IDSRule {
  eventType: string;
  baseRiskScore: number;
  thresholdCount: number;
  timeWindowMs: number;
  alertLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  containmentAction:
    "LOG" | "ALERT_STAFF" | "RATE_LIMIT_IP" | "REVOKE_SESSION" | "QUARANTINE_OBJECT";
  description: string;
}

export const IDS_RULES: Record<string, IDSRule> = {
  AUTH_FAILURE: {
    eventType: "AUTH_FAILURE",
    baseRiskScore: 15,
    thresholdCount: 5,
    timeWindowMs: 300000, // 5 minutes
    alertLevel: "MEDIUM",
    containmentAction: "RATE_LIMIT_IP",
    description: "Repeated login failures detected within 5-minute window",
  },
  IDOR_ATTEMPT: {
    eventType: "IDOR_ATTEMPT",
    baseRiskScore: 35,
    thresholdCount: 2,
    timeWindowMs: 600000, // 10 minutes
    alertLevel: "HIGH",
    containmentAction: "REVOKE_SESSION",
    description: "Unauthorized object manipulation (BOLA/IDOR) attempted",
  },
  STORAGE_TOKEN_REPLAY: {
    eventType: "STORAGE_TOKEN_REPLAY",
    baseRiskScore: 40,
    thresholdCount: 1,
    timeWindowMs: 60000, // 1 minute
    alertLevel: "HIGH",
    containmentAction: "QUARANTINE_OBJECT",
    description: "Re-use of single-use storage capability token detected",
  },
  RATE_LIMIT_TRIGGERED: {
    eventType: "RATE_LIMIT_TRIGGERED",
    baseRiskScore: 25,
    thresholdCount: 3,
    timeWindowMs: 300000,
    alertLevel: "MEDIUM",
    containmentAction: "RATE_LIMIT_IP",
    description: "API endpoint rate limit triggered multiple times",
  },
  UNAUTHORIZED_EXPORT: {
    eventType: "UNAUTHORIZED_EXPORT",
    baseRiskScore: 50,
    thresholdCount: 1,
    timeWindowMs: 60000,
    alertLevel: "CRITICAL",
    containmentAction: "REVOKE_SESSION",
    description: "Unauthorized sensitive data export attempt detected",
  },
  AI_ABUSE: {
    eventType: "AI_ABUSE",
    baseRiskScore: 20,
    thresholdCount: 3,
    timeWindowMs: 300000,
    alertLevel: "MEDIUM",
    containmentAction: "RATE_LIMIT_IP",
    description: "Prompt injection or token overflow attempt detected on AI Gateway",
  },
};

/** Evaluates overall risk score level */
export function getAlertLevelForScore(totalScore: number): "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" {
  if (totalScore >= 75) return "CRITICAL";
  if (totalScore >= 50) return "HIGH";
  if (totalScore >= 25) return "MEDIUM";
  return "LOW";
}
