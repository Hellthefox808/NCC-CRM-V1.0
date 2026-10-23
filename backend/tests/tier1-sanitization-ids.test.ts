import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  validateVerhoeff,
  generateVerhoeffCheckDigit,
  sanitizeAadhaar,
  sanitizeString,
  sanitizeSearchQuery,
} from "../lib/sanitization.ts";
import {
  generate18DigitApplicationNo,
  sanitizePostgrestQuery,
  maskPublicRecord,
  mapToCadetRecord,
} from "../lib/ncc-db.ts";
import { mapCadet } from "../lib/cadet-registry.server.ts";

describe("Tier 1: Data Sanitization, UIDAI Verhoeff Checksum & ID Security Tests", () => {
  describe("1. UIDAI Verhoeff Checksum Algorithm (Dihedral Group D5)", () => {
    it("validates standard mathematical Verhoeff check vectors", () => {
      assert.equal(validateVerhoeff("2363"), true);
      assert.equal(validateVerhoeff("2364"), false);
      assert.equal(validateVerhoeff("0"), true);
      assert.equal(validateVerhoeff(""), false);
      assert.equal(validateVerhoeff("non-numeric"), false);
    });

    it("generates correct check digit and verifies full 12-digit Aadhaar string", () => {
      const base11 = "98765432109";
      const checkDigit = generateVerhoeffCheckDigit(base11);
      const fullAadhaar = `${base11}${checkDigit}`;

      assert.equal(typeof checkDigit, "number");
      assert.ok(checkDigit >= 0 && checkDigit <= 9);
      assert.equal(validateVerhoeff(fullAadhaar), true);
    });

    it("sanitizeAadhaar() normalizes whitespace and validates checksum", () => {
      const base11 = "12345678901";
      const checkDigit = generateVerhoeffCheckDigit(base11);
      const fullAadhaar = `${base11}${checkDigit}`;
      const formatted = ` ${fullAadhaar.slice(0, 4)} - ${fullAadhaar.slice(4, 8)} - ${fullAadhaar.slice(8)} `;

      const sanitized = sanitizeAadhaar(formatted);
      assert.equal(sanitized, fullAadhaar);
      assert.equal(sanitized.length, 12);
    });

    it("sanitizeAadhaar() throws on invalid length or incorrect check digit", () => {
      assert.throws(() => sanitizeAadhaar("1234567890"), /must be exactly 12 digits/);
      assert.throws(() => sanitizeAadhaar("9876543210987"), /must be exactly 12 digits/);
      // Tampered check digit
      assert.throws(() => sanitizeAadhaar("987654321090"), /checksum/i);
    });
  });

  describe("2. 18-Digit Unique Application ID Generation", () => {
    it("generates 18-digit numeric string with standard prefix '19' + YYYYMMDD", () => {
      const appNo = generate18DigitApplicationNo();
      assert.equal(typeof appNo, "string");
      assert.equal(appNo.length, 18);
      assert.ok(appNo.startsWith("19"));
      assert.ok(/^\d{18}$/.test(appNo));

      // Date segment validation
      const datePart = appNo.slice(2, 10);
      assert.ok(/^\d{8}$/.test(datePart));
    });

    it("generates 1,000 collision-resistant random IDs", () => {
      const set = new Set<string>();
      for (let i = 0; i < 1000; i++) {
        set.add(generate18DigitApplicationNo());
      }
      assert.equal(set.size, 1000);
    });
  });

  describe("3. PII Masking & Data Minimization", () => {
    it("maskPublicRecord() strips PII for unauthenticated status tracking", () => {
      const rawRecord = {
        id: "192026102312345678",
        full_name: "Amitabh Kumar",
        status: "APPROVED",
        sbu_roll_no: "SBU2401299",
        course: "BCA",
        mobile: "9876543210",
        email: "amitabh@sbu.ac.in",
        aadhaar_number: "987654321098",
        bank_account_number: "123456789012",
        guardian_mobile: "9876543211",
        created_at: new Date().toISOString(),
      };

      const mapped = mapToCadetRecord(rawRecord);
      const masked = maskPublicRecord(mapped) as Record<string, unknown>;

      assert.equal(masked.id, rawRecord.id);
      assert.equal(masked.fullName, rawRecord.full_name);
      assert.equal(masked.status, rawRecord.status);
      // PII must be completely stripped / undefined, including roll number in public status lookup
      assert.equal(masked.sbuRollNo, undefined);
      assert.equal(masked.mobile, undefined);
      assert.equal(masked.email, undefined);
      assert.equal(masked.aadhaarNumber, undefined);
      assert.equal(masked.bankAccountNumber, undefined);
      assert.equal(masked.guardianMobile, undefined);
    });

    it("mapCadet() masks sensitive identifiers when revealSensitive is false", () => {
      const row = {
        id: "cadet-uuid-1",
        full_name: "Pooja Kumari",
        bank_account_number: "987654321098",
        aadhaar_number: "123456789012",
        rank: "Cadet",
        batch: "Batch-II",
      };

      const masked = mapCadet(row, false);
      assert.ok(String(masked.bankAccountNumber).startsWith("•"));
      assert.ok(String(masked.bankAccountNumber).endsWith("1098"));
      assert.ok(String(masked.aadhaarNumber).startsWith("•"));
      assert.ok(String(masked.aadhaarNumber).endsWith("9012"));

      // When revealSensitive is true, unmasked values are preserved
      const unmasked = mapCadet(row, true);
      assert.equal(unmasked.bankAccountNumber, "987654321098");
      assert.equal(unmasked.aadhaarNumber, "123456789012");
    });
  });

  describe("4. PostgREST & Query Injection Protection", () => {
    it("sanitizePostgrestQuery() strips reserved injection tokens and special PostgREST characters", () => {
      const malicious = "SBU2401211.eq.1; (DROP TABLE cadet_enrollments\\); %20";
      const sanitized = sanitizePostgrestQuery(malicious);

      assert.ok(!sanitized.includes(".eq."));
      assert.ok(!sanitized.includes("."));
      assert.ok(!sanitized.includes("%"));
      assert.ok(!sanitized.includes("("));
      assert.ok(!sanitized.includes(")"));
      assert.ok(!sanitized.includes("\\"));
    });

    it("sanitizeSearchQuery() strips quotes and operators while preserving valid text", () => {
      const query = " ' OR 1=1; SELECT * FROM users; (test) %20 ";
      const sanitized = sanitizeSearchQuery(query);

      assert.ok(!sanitized.includes("'"));
      assert.ok(!sanitized.includes(";"));
      assert.ok(!sanitized.includes("%"));
      assert.ok(!sanitized.includes("("));
      assert.ok(!sanitized.includes(")"));
    });
  });
});
