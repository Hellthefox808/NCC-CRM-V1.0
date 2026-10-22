import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { cadetEnrollmentSchema } from "../lib/validation.schemas.ts";

describe("Tier 1: Cadet Enrollment & Form 1 Validation Tests", () => {
  const getValidPayload = (overrides = {}) => ({
    fullName: "Rohan Kumar Sharma",
    gender: "SD" as const,
    dob: "2004-06-15",
    mobile: "9876543210",
    email: "rohan.sharma@sbu.ac.in",
    sbuRollNo: "SBU2401211",
    sbuCourse: "B.Tech Computer Science",
    course: "B.Tech",
    semester: 3,
    marksPercentage10th: 85.5,
    marksPercentage12th: 88.0,
    heightCm: 175,
    weightKg: 68,
    run1600mTime: "05:45",
    pushupsCount: 35,
    bankName: "State Bank of India",
    accountNumber: "38927481920",
    ifscCode: "SBIN0001234",
    aadhaarNumber: "987654321098",
    presentAddress: "Hostel Block B, Sarala Birla University",
    permanentAddress: "Ranchi, Jharkhand",
    pinCode: "834001",
    declarationAccepted: true,
    ...overrides,
  });

  describe("1. Valid Form 1 Payloads", () => {
    it("accepts a fully compliant Senior Division (SD) enrollment payload", () => {
      const payload = getValidPayload({ gender: "SD" });
      const result = cadetEnrollmentSchema.safeParse(payload);
      assert.equal(result.success, true);
    });

    it("accepts a fully compliant Senior Wing (SW) enrollment payload", () => {
      const payload = getValidPayload({
        fullName: "Ananya Priya Singh",
        gender: "SW",
        mobile: "8765432109",
        email: "ananya.singh@sbu.ac.in",
      });
      const result = cadetEnrollmentSchema.safeParse(payload);
      assert.equal(result.success, true);
    });

    it("normalizes mobile numbers containing country code or spaces", () => {
      const payload = getValidPayload({ mobile: "+91 98765 43210" });
      const result = cadetEnrollmentSchema.safeParse(payload);
      assert.equal(result.success, true);
      if (result.success) {
        assert.equal(result.data.mobile, "9876543210");
      }
    });

    it("cleans non-digit characters from Aadhaar numbers", () => {
      const payload = getValidPayload({ aadhaarNumber: "9876-5432-1098" });
      const result = cadetEnrollmentSchema.safeParse(payload);
      assert.equal(result.success, true);
      if (result.success) {
        assert.equal(result.data.aadhaarNumber, "987654321098");
      }
    });
  });

  describe("2. Age Constraint Boundaries (15–28 Years)", () => {
    it("accepts cadet at minimum allowed age boundary (15 years)", () => {
      const currentYear = new Date().getFullYear();
      const payload = getValidPayload({ dob: `${currentYear - 15}-01-01` });
      const result = cadetEnrollmentSchema.safeParse(payload);
      assert.equal(result.success, true);
    });

    it("accepts cadet at maximum allowed age boundary (28 years)", () => {
      const currentYear = new Date().getFullYear();
      const payload = getValidPayload({ dob: `${currentYear - 28}-01-01` });
      const result = cadetEnrollmentSchema.safeParse(payload);
      assert.equal(result.success, true);
    });

    it("rejects underage applicant (< 15 years old)", () => {
      const currentYear = new Date().getFullYear();
      const payload = getValidPayload({ dob: `${currentYear - 12}-01-01` });
      const result = cadetEnrollmentSchema.safeParse(payload);
      assert.equal(result.success, false);
      if (!result.success) {
        assert.ok(result.error.issues.some((i) => i.message.includes("Age must be between 15-28")));
      }
    });

    it("rejects overage applicant (> 28 years old)", () => {
      const currentYear = new Date().getFullYear();
      const payload = getValidPayload({ dob: `${currentYear - 35}-01-01` });
      const result = cadetEnrollmentSchema.safeParse(payload);
      assert.equal(result.success, false);
      if (!result.success) {
        assert.ok(result.error.issues.some((i) => i.message.includes("Age must be between 15-28")));
      }
    });
  });

  describe("3. Contact & Identification Rejection Rules", () => {
    it("rejects invalid mobile numbers (less than 10 digits or invalid starting digit)", () => {
      const shortMobile = getValidPayload({ mobile: "12345" });
      assert.equal(cadetEnrollmentSchema.safeParse(shortMobile).success, false);

      const invalidStart = getValidPayload({ mobile: "1234567890" });
      assert.equal(cadetEnrollmentSchema.safeParse(invalidStart).success, false);
    });

    it("rejects malformed email addresses", () => {
      const badEmail = getValidPayload({ email: "invalid-email-address" });
      assert.equal(cadetEnrollmentSchema.safeParse(badEmail).success, false);

      const doubleDot = getValidPayload({ email: "cadet..name@sbu.ac.in" });
      assert.equal(cadetEnrollmentSchema.safeParse(doubleDot).success, false);
    });

    it("rejects invalid Aadhaar lengths", () => {
      const shortAadhaar = getValidPayload({ aadhaarNumber: "12345" });
      assert.equal(cadetEnrollmentSchema.safeParse(shortAadhaar).success, false);

      const longAadhaar = getValidPayload({ aadhaarNumber: "123456789012345" });
      assert.equal(cadetEnrollmentSchema.safeParse(longAadhaar).success, false);
    });

    it("rejects mismatched passwords when optional password is provided", () => {
      const mismatched = getValidPayload({
        password: "ValidPassword123#",
        confirmPassword: "DifferentPassword456!",
      });
      const result = cadetEnrollmentSchema.safeParse(mismatched);
      assert.equal(result.success, false);
      if (!result.success) {
        assert.ok(result.error.issues.some((i) => i.message === "Passwords do not match"));
      }
    });
  });
});
