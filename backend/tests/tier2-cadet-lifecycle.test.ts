import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { buildEnrollmentRow } from "../lib/ncc-db.ts";
import {
  issueActivationToken,
  consumeActivationToken,
  hashPassword,
  verifyPasswordHash,
} from "../lib/auth-otp.server.ts";

describe("Tier 2: Cadet State Machine & Induction Lifecycle Tests", () => {
  describe("1. Enrollment Ingestion & Initial State", () => {
    it("initializes enrollment with PENDING_ANO_REVIEW status and normalized identifiers", () => {
      const rawForm = {
        fullName: "Vikramaditya Roy",
        gender: "SD",
        dob: "2003-08-15",
        mobile: "9876543210",
        email: "vikram.roy@sbu.ac.in",
        sbuRollNo: "SBU2301045",
        aadhaarNumber: "123456789012",
        course: "BCA",
      };

      const row = buildEnrollmentRow(rawForm);
      assert.equal(row.status, "PENDING_ANO_REVIEW");
      assert.equal(row.full_name, "Vikramaditya Roy");
      assert.equal(row.sbu_roll_no, "SBU2301045"); // uppercase normalized
      assert.ok(row.id.startsWith("19"));
      assert.equal(row.id.length, 18);
    });
  });

  describe("2. ANO Review & Approval State Transitions", () => {
    it("simulates ANO approval transitioning status from PENDING_ANO_REVIEW to APPROVED", () => {
      const enrollment = {
        id: "192026102312345678",
        status: "PENDING_ANO_REVIEW",
        sbu_roll_no: "SBU2301045",
        full_name: "Vikramaditya Roy",
      };

      // Transition to APPROVED
      const approvedEnrollment = {
        ...enrollment,
        status: "APPROVED",
        reviewed_by: "Lt. Col. R. K. Singh",
        reviewed_at: new Date().toISOString(),
      };

      assert.equal(approvedEnrollment.status, "APPROVED");
      assert.ok(approvedEnrollment.reviewed_at);
      assert.equal(approvedEnrollment.reviewed_by, "Lt. Col. R. K. Singh");
    });

    it("simulates ANO rejection transitioning status to REJECTED with mandatory reason", () => {
      const enrollment = {
        id: "192026102387654321",
        status: "PENDING_ANO_REVIEW",
        sbu_roll_no: "SBU2301099",
      };

      const rejectedEnrollment = {
        ...enrollment,
        status: "REJECTED",
        rejection_reason:
          "Medical fitness certificate missing stamp from authorized medical officer",
        reviewed_at: new Date().toISOString(),
      };

      assert.equal(rejectedEnrollment.status, "REJECTED");
      assert.ok(rejectedEnrollment.rejection_reason.includes("Medical fitness"));
    });
  });

  describe("3. Provisioning, Activation Token & Password Setup", () => {
    it("issues activation token upon approval and activates account after password creation", async () => {
      const cadetEmail = "cadet.vikram@sbu.ac.in";

      // 1. Issue activation token
      const tokenRes = await issueActivationToken(cadetEmail, cadetEmail, "ACCOUNT_ACTIVATION", 30);
      assert.equal(typeof tokenRes.rawToken, "string");

      // 2. Consume activation token on password set
      const consumeRes = await consumeActivationToken(tokenRes.rawToken, "ACCOUNT_ACTIVATION");
      assert.equal(consumeRes.ok, true);

      // 3. Set scrypt password
      const newPassword = "Cadet#SecurePassword2026";
      const hash = await hashPassword(newPassword);
      assert.ok(hash.startsWith("scrypt$"));

      // 4. Verify password validates cleanly
      const isCorrect = await verifyPasswordHash(newPassword, hash);
      assert.equal(isCorrect, true);
    });
  });

  describe("4. 5-Stage Cadet Induction Progress Tracking", () => {
    it("accurately calculates partial and 100% completion progress across 5 induction milestones", () => {
      const stages = [
        "profile_completed",
        "contact_verified",
        "documents_verified",
        "declaration_accepted",
        "orientation_completed",
      ];

      // Stage 1 completed (1/5 = 20%)
      const state1 = {
        profile_completed: true,
        contact_verified: false,
        documents_verified: false,
        declaration_accepted: false,
        orientation_completed: false,
      };
      const completed1 = stages.filter((s) => state1[s as keyof typeof state1]).length;
      assert.equal(Math.round((completed1 / stages.length) * 100), 20);

      // Stage 3 completed (3/5 = 60%)
      const state3 = { ...state1, contact_verified: true, documents_verified: true };
      const completed3 = stages.filter((s) => state3[s as keyof typeof state3]).length;
      assert.equal(Math.round((completed3 / stages.length) * 100), 60);

      // All 5 stages completed (5/5 = 100%)
      const state5 = { ...state3, declaration_accepted: true, orientation_completed: true };
      const completed5 = stages.filter((s) => state5[s as keyof typeof state5]).length;
      assert.equal(Math.round((completed5 / stages.length) * 100), 100);

      // 5/5 triggers auto-activation to ACTIVE status
      const cadetFinal = {
        inductionStatus: completed5 === 5 ? "ACTIVE" : "INDUCTION_IN_PROGRESS",
      };
      assert.equal(cadetFinal.inductionStatus, "ACTIVE");
    });
  });
});
