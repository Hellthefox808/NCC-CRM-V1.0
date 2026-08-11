/**
 * Intrusion Detection System (IDS) Unit Tests
 *
 * OWASP A09:2025 (Security Logging & Alerting Failures) Verification
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { recordSecurityEvent } from "../services/ids/ids.service.ts";
import { getAlertLevelForScore, IDS_RULES } from "../services/ids/ids.rules.ts";

describe("Intrusion Detection System (IDS) Unit Tests", () => {
  it("getAlertLevelForScore() correctly maps numerical scores to risk levels", () => {
    assert.equal(getAlertLevelForScore(10), "LOW");
    assert.equal(getAlertLevelForScore(30), "MEDIUM");
    assert.equal(getAlertLevelForScore(60), "HIGH");
    assert.equal(getAlertLevelForScore(90), "CRITICAL");
  });

  it("IDS_RULES defines complete threat triggers for key security events", () => {
    assert.ok(IDS_RULES["AUTH_FAILURE"], "AUTH_FAILURE rule must be defined");
    assert.ok(IDS_RULES["IDOR_ATTEMPT"], "IDOR_ATTEMPT rule must be defined");
    assert.ok(IDS_RULES["STORAGE_TOKEN_REPLAY"], "STORAGE_TOKEN_REPLAY rule must be defined");
    assert.ok(IDS_RULES["UNAUTHORIZED_EXPORT"], "UNAUTHORIZED_EXPORT rule must be defined");

    assert.equal(
      IDS_RULES["IDOR_ATTEMPT"].containmentAction,
      "REVOKE_SESSION",
      "IDOR must trigger session revocation",
    );
    assert.equal(
      IDS_RULES["STORAGE_TOKEN_REPLAY"].containmentAction,
      "QUARANTINE_OBJECT",
      "Token replay must quarantine object",
    );
  });

  it("recordSecurityEvent() records events, calculates cumulative risk, and triggers alerts", async () => {
    const testIp = "192.168.1.99";

    // 1st AUTH_FAILURE event
    const res1 = await recordSecurityEvent({
      eventType: "AUTH_FAILURE",
      actorIp: testIp,
      details: { attemptedUser: "cadet@sbu.ac.in" },
    });
    assert.ok(res1.eventId, "Must generate an event ID");
    assert.equal(res1.riskScore, 15, "Base risk score for 1 failure is 15");
    assert.equal(res1.alertTriggered, false, "1 failure should not trigger alert");

    // Repeat AUTH_FAILURE to hit threshold (5 attempts)
    await recordSecurityEvent({ eventType: "AUTH_FAILURE", actorIp: testIp });
    await recordSecurityEvent({ eventType: "AUTH_FAILURE", actorIp: testIp });
    await recordSecurityEvent({ eventType: "AUTH_FAILURE", actorIp: testIp });
    const res5 = await recordSecurityEvent({ eventType: "AUTH_FAILURE", actorIp: testIp });

    assert.equal(res5.riskScore, 75, "5 failures accumulates to risk score 75");
    assert.equal(res5.alertTriggered, true, "5 failures must trigger security alert");
    assert.equal(res5.alertLevel, "CRITICAL", "Score 75 must be CRITICAL level");
    assert.equal(
      res5.containmentExecuted,
      "RATE_LIMIT_IP",
      "Must execute RATE_LIMIT_IP containment",
    );
  });

  it("recordSecurityEvent() immediately triggers CRITICAL alert for unauthorized export attempt", async () => {
    const res = await recordSecurityEvent({
      eventType: "UNAUTHORIZED_EXPORT",
      actorId: "cadet_attacker",
      actorIp: "10.0.0.50",
      details: { exportType: "FINANCIAL_ROLL" },
    });

    assert.equal(res.riskScore, 50, "Base risk score for unauthorized export is 50");
    assert.equal(res.alertTriggered, true, "Unauthorized export must trigger instant alert");
    assert.equal(res.alertLevel, "HIGH", "Score 50 maps to HIGH level");
    assert.equal(
      res.containmentExecuted,
      "REVOKE_SESSION",
      "Must execute REVOKE_SESSION containment",
    );
  });
});
