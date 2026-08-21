import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { buildEnrollmentRow, generate18DigitApplicationNo } from "../lib/ncc-db.ts";
import {
  formatApplicationNo,
  sendMultiChannelApplicationConfirmation,
} from "../services/messaging/multichannel.service.ts";

describe("Multi-Channel Dispatch & 18-Digit Application Number Unit Tests", () => {
  it("generate18DigitApplicationNo() produces valid 18-digit numeric strings starting with 19", () => {
    const appNo = generate18DigitApplicationNo();
    assert.equal(appNo.length, 18);
    assert.match(appNo, /^19\d{16}$/);
  });

  it("buildEnrollmentRow() generates valid 18-digit application numbers", () => {
    const payload = {
      fullName: "Rahul Verma",
      aadhaarNumber: "123456789012",
      mobile: "9876543210",
      email: "rahul.verma@sbu.ac.in",
    };
    const row = buildEnrollmentRow(payload);
    assert.equal(row.id.length, 18);
    assert.match(row.id, /^19\d{16}$/);
    assert.equal(row.full_name, "Rahul Verma");
    assert.equal(row.status, "PENDING_ANO_REVIEW");
  });

  it("formatApplicationNo() formats 18-digit numbers cleanly", () => {
    const appNo = "192026081298471625";
    const formatted = formatApplicationNo(appNo);
    assert.equal(formatted, "192026-0812-98471625");
  });

  it("sendMultiChannelApplicationConfirmation() dispatches Email, WhatsApp, and SMS notifications", async () => {
    const appNo = generate18DigitApplicationNo();
    const result = await sendMultiChannelApplicationConfirmation({
      applicationId: appNo,
      fullName: "Priya Sharma",
      email: "priya.sharma@sbu.ac.in",
      mobile: "9123456789",
      sbuCourse: "B.Sc IT",
    });

    assert.ok(result.email);
    assert.ok(result.whatsapp);
    assert.ok(result.sms);
    assert.equal(result.whatsapp.status, "DISPATCHED");
    assert.equal(result.sms.status, "DISPATCHED");
  });

  it("cadetEnrollmentSchema validates real Form 1 submissions for SD and SW cadets", async () => {
    const { cadetEnrollmentSchema, validateRequestBody } = await import(
      "../lib/validation.schemas.ts"
    );

    const sdSubmission = {
      fullName: "Aditya Kumar Singh",
      gender: "SD",
      dob: "2005-04-12",
      aadhaarNumber: "4829 1377 6541",
      mobile: "+91 98765 43210",
      email: "aditya.singh@sbu.ac.in",
      fatherName: "Rajesh Kumar Singh",
      bloodGroup: "B+",
      sbuCourse: "B.Tech Computer Science & Engineering",
      sbuRollNo: "SBU2401211",
      sbuDepartment: "School of Engineering",
      marksPercentage10th: 88.4,
      marksPercentage12th: 85.2,
      heightCm: 175,
      weightKg: 65,
      bankName: "State Bank of India (SBI)",
      accountNumber: "38812004551",
      ifscCode: "SBIN0004512",
      presentAddress: "Boys Hostel 1, SBU Campus, Ranchi",
    };

    const res = validateRequestBody(cadetEnrollmentSchema, sdSubmission, "cadet enrollment");
    assert.equal(res.success, true);
    if (res.success) {
      assert.equal(res.data.gender, "SD");
      assert.equal(res.data.aadhaarNumber, "482913776541");
      assert.equal(res.data.mobile, "9876543210");
    }

    const swSubmission = {
      fullName: "Ananya Kumari",
      gender: "SW",
      dob: "2006-08-20",
      aadhaarNumber: "551234998877",
      mobile: "9430112233",
      email: "ananya.kumari@sbu.ac.in",
      sbuCourse: "BCA",
      sbuRollNo: "SBU2401099",
      heightCm: 162,
      weightKg: 52,
    };

    const swRes = validateRequestBody(cadetEnrollmentSchema, swSubmission, "cadet enrollment");
    assert.equal(swRes.success, true);
    if (swRes.success) {
      assert.equal(swRes.data.gender, "SW");
    }
  });

  it("cadetEnrollmentSchema rejects malformed phone and short names", async () => {
    const { cadetEnrollmentSchema, validateRequestBody } = await import(
      "../lib/validation.schemas.ts"
    );

    const invalidSubmission = {
      fullName: "A",
      gender: "SD",
      dob: "2005-04-12",
      aadhaarNumber: "12345", // too short
      mobile: "123", // invalid
      email: "not-an-email",
      sbuRollNo: "SBU2401211",
    };

    const res = validateRequestBody(cadetEnrollmentSchema, invalidSubmission, "cadet enrollment");
    assert.equal(res.success, false);
    if (!res.success) {
      assert.ok(res.issues.length >= 3);
    }
  });
});

