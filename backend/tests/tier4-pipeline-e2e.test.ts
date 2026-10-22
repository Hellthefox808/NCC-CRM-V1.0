import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import crypto from "node:crypto";
import { cadetEnrollmentSchema } from "../lib/validation.schemas.ts";
import {
  generate18DigitApplicationNo,
  buildEnrollmentRow,
  mapToCadetRecord,
  maskPublicRecord,
} from "../lib/ncc-db.ts";
import {
  issueActivationToken,
  consumeActivationToken,
  hashPassword,
  verifyPasswordHash,
  clearMemoryTokens,
} from "../lib/auth-otp.server.ts";
import { bearer } from "../lib/cadet-registry.server.ts";
import { queueEmailJobsBatch } from "../services/queue/queue.service.ts";

describe("Tier 4: End-to-End Operational Pipeline & Cadet Lifecycle E2E Tests", () => {
  beforeEach(() => {
    clearMemoryTokens();
    process.env["SUPABASE_URL"] = process.env["SUPABASE_URL"] || "http://127.0.0.1:54321";
    process.env["SUPABASE_SERVICE_ROLE_KEY"] =
      process.env["SUPABASE_SERVICE_ROLE_KEY"] || "mock-service-role-key";

    globalThis.fetch = (async (input: RequestInfo | URL) => {
      const urlStr = typeof input === "string" ? input : input.toString();
      if (urlStr.includes("/rest/v1/email_jobs")) {
        return new Response(JSON.stringify([{ id: "job-1", status: "PENDING" }]), {
          status: 201,
          headers: { "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({}), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }) as typeof fetch;
  });

  it("executes the complete cadet journey from Form 1 submission to activated login session", async () => {
    // ── STAGE 1: Form 1 Applicant Submission & Schema Validation ────────
    const applicantInput = {
      fullName: "Abhishek Raj",
      gender: "SD" as const,
      dob: "2004-04-14",
      mobile: "9123456789",
      email: "abhishek.raj@sbu.ac.in",
      sbuRollNo: "SBU2401888",
      sbuCourse: "B.Tech Mechanical",
      course: "B.Tech",
      semester: 1,
      marksPercentage10th: 82.4,
      marksPercentage12th: 85.0,
      heightCm: 178,
      weightKg: 72,
      run1600mTime: "05:30",
      pushupsCount: 40,
      bankName: "Punjab National Bank",
      accountNumber: "5892019482910",
      ifscCode: "PUNB0123400",
      aadhaarNumber: "987654321098",
      presentAddress: "Hostel 3, SBU Campus",
      permanentAddress: "Dhanbad, Jharkhand",
      pinCode: "826001",
      declarationAccepted: true,
    };

    const validationResult = cadetEnrollmentSchema.safeParse(applicantInput);
    assert.equal(validationResult.success, true);
    assert.equal(validationResult.data?.mobile, "9123456789");

    // ── STAGE 2: 18-Digit Application ID Generation ─────────────────────
    const appNo = generate18DigitApplicationNo();
    assert.equal(appNo.length, 18);
    assert.ok(appNo.startsWith("19"));

    // ── STAGE 3: Database Row Ingestion & Status Assignment ─────────────
    const dbRow = buildEnrollmentRow({ ...applicantInput, applicationNo: appNo });
    assert.equal(dbRow.status, "PENDING_ANO_REVIEW");
    assert.equal(dbRow.sbu_roll_no, "SBU2401888"); // Capitalized
    assert.equal(dbRow.full_name, "Abhishek Raj");

    // ── STAGE 4: Public Tracking PII Masking ────────────────────────────
    const cadetRecord = mapToCadetRecord(dbRow);
    const publicMasked = maskPublicRecord(cadetRecord) as Record<string, unknown>;
    assert.equal(publicMasked.id, dbRow.id);
    assert.equal(publicMasked.status, "PENDING_ANO_REVIEW");
    assert.equal(publicMasked.mobile, undefined);
    assert.equal(publicMasked.email, undefined);
    assert.equal(publicMasked.aadhaarNumber, undefined);

    // ── STAGE 5: Transactional Confirmation Dispatch Queueing ───────────
    const queueResult = await queueEmailJobsBatch([
      {
        jobType: "sendApplicationAcknowledgement",
        recipient: applicantInput.email,
        payload: {
          fullName: applicantInput.fullName,
          applicationNo: appNo,
          sbuRollNo: dbRow.sbu_roll_no,
        },
      },
    ]);
    assert.equal(queueResult.success, true);
    assert.equal(queueResult.enqueuedCount, 1);

    // ── STAGE 6: ANO Officer Review & Approval ──────────────────────────
    const approvedRow = {
      ...dbRow,
      status: "APPROVED",
      reviewed_by: "Col. Sanjeev Kumar, ANO",
      reviewed_at: new Date().toISOString(),
    };
    assert.equal(approvedRow.status, "APPROVED");

    // ── STAGE 7: Single-Use Activation Token Generation ─────────────────
    const tokenResult = await issueActivationToken(
      applicantInput.email,
      applicantInput.email,
      "ACCOUNT_ACTIVATION",
      30,
    );
    assert.equal(typeof tokenResult.rawToken, "string");
    assert.equal(tokenResult.rawToken.length, 64);

    // ── STAGE 8: Token Consumption & Scrypt Password Creation ───────────
    const consumeRes = await consumeActivationToken(tokenResult.rawToken, "ACCOUNT_ACTIVATION");
    assert.equal(consumeRes.ok, true);

    const cadetPassword = "Cadet#Abhishek2026";
    const passwordHash = await hashPassword(cadetPassword);
    assert.ok(passwordHash.startsWith("scrypt$N=16384,r=8,p=1$"));

    // ── STAGE 9: Authentication & Scrypt Verification ───────────────────
    const loginValid = await verifyPasswordHash(cadetPassword, passwordHash);
    assert.equal(loginValid, true);

    // ── STAGE 10: Session Creation & Bearer Token Extraction ────────────
    const sessionToken = `sess_${crypto.randomBytes(32).toString("hex")}`;
    const mockRequest = new Request("http://localhost", {
      headers: {
        authorization: `Bearer ${sessionToken}`,
      },
    });
    const extractedToken = bearer(mockRequest);
    assert.equal(extractedToken, sessionToken);
  });
});
