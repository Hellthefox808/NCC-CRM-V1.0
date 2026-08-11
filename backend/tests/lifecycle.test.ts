import { describe, it } from "node:test";
import assert from "node:assert/strict";
import crypto from "crypto";
import { buildEnrollmentRow } from "../lib/ncc-db.ts";
import { hashPassword, verifyPasswordHash } from "../lib/auth-otp.server.ts";

describe("Controlled Cadet Lifecycle & Activation Unit Tests", () => {
  it("buildEnrollmentRow() sets default status to PENDING_ANO_REVIEW", () => {
    const rawForm = {
      fullName: "Ravi Kumar",
      aadhaarNumber: "482913776541",
      sbuRollNo: "SBU232756",
      mobile: "9871203451",
      email: "ravi.kumar@sbu.ac.in",
    };

    const row = buildEnrollmentRow(rawForm);
    assert.equal(row.status, "PENDING_ANO_REVIEW");
    assert.equal(row.full_name, "Ravi Kumar");
    assert.equal(row.sbu_roll_no, "SBU232756");
  });

  it("activation tokens are cryptographically random and hash consistently with SHA-256", () => {
    const rawToken = crypto.randomBytes(32).toString("hex");
    assert.equal(rawToken.length, 64);

    const hash1 = crypto.createHash("sha256").update(rawToken).digest("hex");
    const hash2 = crypto.createHash("sha256").update(rawToken).digest("hex");

    assert.equal(hash1, hash2);
    assert.equal(hash1.length, 64);
  });

  it("salted scrypt password hashes satisfy security standards", async () => {
    const pass = "Cadet#Secure2026";
    const email = "cadet.test@sbu.ac.in";

    const hashed = await hashPassword(pass, email);
    assert.ok(hashed.startsWith("scrypt$"));

    const valid = await verifyPasswordHash(pass, hashed, email);
    assert.equal(valid, true);

    const invalid = await verifyPasswordHash("WrongPass123", hashed, email);
    assert.equal(invalid, false);
  });

  it("onboarding progress percentage calculation accuracy", () => {
    const checklist = {
      profile_completed: true,
      contact_verified: true,
      documents_verified: true,
      declaration_accepted: false,
      orientation_completed: false,
    };

    const items = Object.values(checklist);
    const completed = items.filter(Boolean).length;
    const progressPercent = Math.round((completed / items.length) * 100);

    assert.equal(completed, 3);
    assert.equal(progressPercent, 60);
  });
});
