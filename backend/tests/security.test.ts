import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { maskPublicRecord, sanitizePostgrestQuery, mapToCadetRecord } from "../lib/ncc-db.ts";
import { bearer, requireOfficer, requireCadetSession } from "../lib/cadet-registry.server.ts";

describe("Security & Authorization Unit Tests", () => {
  it("bearer() correctly extracts bearer tokens from Authorization headers", () => {
    const req1 = new Request("https://localhost/api/v1/cadets", {
      headers: { authorization: "Bearer sess_abc123" },
    });
    assert.equal(bearer(req1), "sess_abc123");

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

  it("maskPublicRecord() securely masks Aadhaar and bank account PII for public status tracking", () => {
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
    const masked = maskPublicRecord(mapped);

    assert.equal(masked.id, "19JHR-SBU-2026-101");
    assert.equal(masked.fullName, "Aditya Kumar Singh");
    assert.equal(masked.aadhaarNumber, "••••••••6541");
    assert.equal(masked.accountNumber, "•••••••4551");
    assert.equal(masked.ifscCode, "SBIN••••••");
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
});
