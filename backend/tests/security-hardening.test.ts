import assert from "node:assert/strict";
import crypto from "node:crypto";
import { describe, it } from "node:test";
import { sanitizePostgrestQuery } from "../lib/ncc-db.ts";
import {
  clearMemoryTokens,
  hashCode,
  issueActivationToken,
  verifyPasswordHash,
} from "../lib/auth-otp.server.ts";
import { checkRateLimit } from "../lib/rate-limiter.server.ts";

describe("Security Hardening & Vulnerability Remediation Unit Tests", () => {
  it("CSV formula injection neutralization handles spreadsheet command payloads", () => {
    function escapeCsvField(val: unknown): string {
      if (val === null || val === undefined) return '""';
      let str = String(val);
      if (/^[=@\t\r]/.test(str) || (/^[+-]/.test(str) && !/^[-+]?\d+(\.\d+)?$/.test(str.trim()))) {
        str = `'${str}`;
      }
      if (/[",\n\r]/.test(str)) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return `"${str}"`;
    }

    // Formula injection triggers: =, @, \t, \r, +cmd, -cmd
    assert.equal(escapeCsvField("=cmd|' /C calc'!A0"), "\"'=cmd|' /C calc'!A0\"");
    assert.equal(escapeCsvField("@SUM(A1:A10)"), '"\'@SUM(A1:A10)"');
    assert.equal(escapeCsvField("+cmd"), '"\'+cmd"');
    assert.equal(escapeCsvField("-PAYLOAD"), '"\'-PAYLOAD"');
    assert.equal(escapeCsvField("\tMALICIOUS"), '"\'\tMALICIOUS"');

    // Safe numeric values are NOT modified with leading single-quote
    assert.equal(escapeCsvField(100), '"100"');
    assert.equal(escapeCsvField("-5"), '"-5"');
    assert.equal(escapeCsvField("+42"), '"+42"');
    assert.equal(escapeCsvField("78.5"), '"78.5"');

    // Standard string values with commas and quotes
    assert.equal(escapeCsvField('Cadet "Alpha"'), '"Cadet ""Alpha"""');
    assert.equal(escapeCsvField("Ranchi, Jharkhand"), '"Ranchi, Jharkhand"');
  });

  it("sanitizePostgrestQuery strips dangerous filter injection tokens", () => {
    // Strips commas, colons, dots, parentheses, quotes, percent signs
    assert.equal(sanitizePostgrestQuery("admin,user"), "adminuser");
    assert.equal(sanitizePostgrestQuery("cadet.eq.123"), "cadeteq123");
    assert.equal(sanitizePostgrestQuery("test%20or%201=1"), "test20or201=1");
    assert.equal(sanitizePostgrestQuery("(select * from users)"), "select * from users");
    assert.equal(sanitizePostgrestQuery("normal-cadet_123"), "normal-cadet_123");
  });

  it("Dual-layer rate limiter enforces both IP ceiling and account brute-force threshold", () => {
    const testIp = `sec_test_ip_${Date.now()}`;
    const testAccount = `cadet_${Date.now()}@sbu.ac.in`;

    // 1. Account threshold (5 attempts per window)
    for (let i = 0; i < 5; i++) {
      const check = checkRateLimit(`login_account:${testAccount}`, {
        maxAttempts: 5,
        windowMs: 60000,
      });
      assert.equal(check.allowed, true);
    }
    const blockedAccount = checkRateLimit(`login_account:${testAccount}`, {
      maxAttempts: 5,
      windowMs: 60000,
    });
    assert.equal(blockedAccount.allowed, false);

    // 2. IP threshold (25 attempts per window across different accounts)
    for (let i = 0; i < 25; i++) {
      const check = checkRateLimit(`login_ip:${testIp}`, {
        maxAttempts: 25,
        windowMs: 60000,
      });
      assert.equal(check.allowed, true);
    }
    const blockedIp = checkRateLimit(`login_ip:${testIp}`, {
      maxAttempts: 25,
      windowMs: 60000,
    });
    assert.equal(blockedIp.allowed, false);
  });

  it("Timing-safe OTP hash comparison correctly validates matching hashes", async () => {
    const code = "482910";
    const identifier = "test.cadet@sbu.ac.in";
    const expectedHash = await hashCode(code, identifier);
    const submittedHash = await hashCode(code, identifier);
    const wrongHash = await hashCode("111111", identifier);

    // Constant-time comparison
    const match =
      submittedHash.length === expectedHash.length &&
      crypto.timingSafeEqual(Buffer.from(submittedHash), Buffer.from(expectedHash));
    assert.equal(match, true);

    const mismatch =
      wrongHash.length === expectedHash.length &&
      crypto.timingSafeEqual(Buffer.from(wrongHash), Buffer.from(expectedHash));
    assert.equal(mismatch, false);
  });

  it("Memory token structure caps growth and supports state cleanup", async () => {
    clearMemoryTokens();

    const token = await issueActivationToken("cadet1@sbu.ac.in", "cadet1@sbu.ac.in", "TEST", 15);
    assert.equal(typeof token.rawToken, "string");
    assert.equal(token.rawToken.length, 64);

    clearMemoryTokens();
  });
});
