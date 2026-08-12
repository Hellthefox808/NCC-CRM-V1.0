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
});
