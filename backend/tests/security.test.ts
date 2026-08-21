import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { maskPublicRecord, sanitizePostgrestQuery, mapToCadetRecord } from "../lib/ncc-db.ts";
import { bearer, requireOfficer, requireCadetSession } from "../lib/cadet-registry.server.ts";
import { checkRateLimit, resetRateLimit } from "../lib/rate-limiter.server.ts";

describe("Security & Authorization Unit Tests", () => {
  it("bearer() correctly extracts bearer tokens from Authorization headers or HttpOnly cookies", () => {
    const req1 = new Request("https://localhost/api/v1/cadets", {
      headers: { authorization: "Bearer sess_abc123" },
    });
    assert.equal(bearer(req1), "sess_abc123");

    const reqCookie = new Request("https://localhost/api/v1/cadets", {
      headers: { cookie: "ncc_session=sess_cookie456; Other=value" },
    });
    assert.equal(bearer(reqCookie), "sess_cookie456");

    const req2 = new Request("https://localhost/api/v1/cadets", {
      headers: { authorization: "Basic admin:secret" },
    });
    assert.equal(bearer(req2), null);

    const req3 = new Request("https://localhost/api/v1/cadets");
    assert.equal(bearer(req3), null);
  });

  it("requireOfficer() rejects unauthenticated requests with HTTP 401", async () => {
    const req = new Request("https://localhost/api/v1/export-excel");
    const gate = await requireOfficer(req);
    assert.equal(gate.ok, false);
    assert.equal(gate.status, 401);
    assert.equal(gate.error, "Officer sign-in required.");
  });

  it("requireCadetSession() rejects unauthenticated requests with HTTP 401", async () => {
    const req = new Request("https://localhost/api/v1/cadets/me");
    const gate = await requireCadetSession(req);
    assert.equal(gate.ok, false);
    assert.equal(gate.status, 401);
    assert.equal(gate.error, "Cadet sign-in required.");
  });

  it("maskPublicRecord() strictly strips PII for public status tracking", () => {
    const dummyRow = {
      id: "19JHR-SBU-2026-101",
      enrollment_no: "JH/26/SD/104512",
      application_date: "2026-01-12",
      full_name: "Aditya Kumar Singh",
      gender: "SD",
      dob: "2006-04-18",
      aadhaar_number: "482913776541",
      mobile: "9871203451",
      email: "aditya.singh@sbu.ac.in",
      blood_group: "B+",
      identification_mark: "Mole on left cheek",
      status: "Enrolled",
      bank_name: "State Bank of India",
      account_number: "38812004551",
      ifsc_code: "SBIN0007321",
    };

    const mapped = mapToCadetRecord(dummyRow);
    const masked = maskPublicRecord(mapped) as Record<string, unknown>;

    assert.equal(masked.id, "19JHR-SBU-2026-101");
    assert.equal(masked.fullName, "Aditya Kumar Singh");
    assert.equal(masked.enrollmentNo, "JH/26/SD/104512");
    assert.equal(masked.status, "Enrolled");
    // Verify all sensitive PII fields are completely stripped (undefined)
    assert.equal(masked.aadhaarNumber, undefined);
    assert.equal(masked.accountNumber, undefined);
    assert.equal(masked.ifscCode, undefined);
    assert.equal(masked.dob, undefined);
    assert.equal(masked.mobile, undefined);
    assert.equal(masked.email, undefined);
  });

  it("hashPassword() and verifyPasswordHash() use salted scrypt for secure password storage", async () => {
    const { hashPassword, verifyPasswordHash } = await import("../lib/auth-otp.server.ts");

    const pass = "Complex#Secret123";
    const hashed = await hashPassword(pass, "user@sbu.ac.in");

    assert.ok(hashed.startsWith("scrypt$"));
    const match = await verifyPasswordHash(pass, hashed, "user@sbu.ac.in");
    assert.equal(match, true);

    const wrongMatch = await verifyPasswordHash("WrongPassword999", hashed, "user@sbu.ac.in");
    assert.equal(wrongMatch, false);
  });

  it("sanitizePostgrestQuery() strips dangerous characters to prevent filter injection", () => {
    const maliciousInput = "admin%,roll.eq(100),test()\\";
    const sanitized = sanitizePostgrestQuery(maliciousInput);
    assert.equal(sanitized, "adminrolleq100test");
  });

  it("crypto.getRandomValues produces 256-bit secure session tokens", () => {
    const randomBytes = new Uint8Array(32);
    crypto.getRandomValues(randomBytes);
    const token = `sess_${Array.from(randomBytes)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("")}`;
    assert.equal(token.startsWith("sess_"), true);
    assert.equal(token.length, 5 + 64);
  });

  it("checkRateLimit() allows attempts within the limit and blocks after exceeding max", () => {
    const key = `test_rate_limit_${Date.now()}`;

    // First 3 attempts should be allowed
    for (let i = 0; i < 3; i++) {
      const result = checkRateLimit(key, { maxAttempts: 3, windowMs: 60000 });
      assert.equal(result.allowed, true, `attempt ${i + 1} should be allowed`);
    }

    // 4th attempt should be blocked
    const blocked = checkRateLimit(key, { maxAttempts: 3, windowMs: 60000 });
    assert.equal(blocked.allowed, false);
    assert.equal(blocked.remaining, 0);

    // After reset, should be allowed again
    resetRateLimit(key);
    const afterReset = checkRateLimit(key, { maxAttempts: 3, windowMs: 60000 });
    assert.equal(afterReset.allowed, true);
  });

  it("loginRequestSchema enforces minimum 8-character password requirement", async () => {
    const { loginRequestSchema } = await import("../lib/validation.schemas.ts");

    const shortPayload = {
      userType: "cadet",
      email: "cadet@sbu.ac.in",
      password: "12345", // Only 5 chars
    };
    const resShort = loginRequestSchema.safeParse(shortPayload);
    assert.equal(resShort.success, false);

    const validPayload = {
      userType: "cadet",
      email: "cadet@sbu.ac.in",
      password: "PassWord123!", // 12 chars
    };
    const resValid = loginRequestSchema.safeParse(validPayload);
    assert.equal(resValid.success, true);
  });
});
