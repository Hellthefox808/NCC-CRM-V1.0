import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  renderOtpEmail,
  renderWelcomeEmail,
  renderEnrollmentStatusEmail,
  renderEventCreatedEmail,
  renderReminderEmail,
  renderEventCancelledEmail,
  renderApplicationApprovedEmail,
} from "../services/mail/templates";
import { mailer } from "../services/mail/mailer";

describe("Nodemailer Service Unit Tests", () => {
  it("renderOtpEmail() generates valid HTML and plain text with OTP code", () => {
    const { html, text } = renderOtpEmail({
      recipient: "cadet@sbu.ac.in",
      otpCode: "849201",
      recipientName: "Aditya Kumar Singh",
      ttlMinutes: 10,
    });

    assert.ok(html.includes("849201"));
    assert.ok(html.includes("Aditya Kumar Singh"));
    assert.ok(text.includes("849201"));
  });

  it("renderWelcomeEmail() generates branded welcome message", () => {
    const { html, text } = renderWelcomeEmail({
      recipient: "priya.mahto@sbu.ac.in",
      cadetName: "Priya Kumari Mahto",
      enrollmentNo: "JH/26/SW/104513",
    });

    assert.ok(html.includes("Priya Kumari Mahto"));
    assert.ok(html.includes("JH/26/SW/104513"));
    assert.ok(text.includes("Welcome to 19 JHR BN NCC"));
  });

  it("renderApplicationApprovedEmail() generates secure activation link payload", () => {
    const { html, text } = renderApplicationApprovedEmail({
      recipient: "applicant@sbu.ac.in",
      applicantName: "Rohan Kumar",
      cadetId: "JH/26/SD/104515",
      applicationId: "NCC-2026-101",
      activationLink: "http://localhost:8080/activate?token=abc123token",
      expiresInHours: 24,
    });

    assert.ok(html.includes("Rohan Kumar"));
    assert.ok(html.includes("JH/26/SD/104515"));
    assert.ok(html.includes("http://localhost:8080/activate?token=abc123token"));
    assert.ok(text.includes("APPROVED"));
  });

  it("renderEventCreatedEmail() generates event notification template", () => {
    const { html } = renderEventCreatedEmail({
      recipient: "cadet@sbu.ac.in",
      eventTitle: "Independence Day Parade",
      eventType: "Parade",
      startTime: "2026-08-15T09:00:00Z",
      endTime: "2026-08-15T12:00:00Z",
      location: "SBU Parade Ground",
      eventId: "evt_123",
    });

    assert.ok(html.includes("Independence Day Parade"));
    assert.ok(html.includes("SBU Parade Ground"));
  });

  it("renderReminderEmail() generates accurate reminder payload", () => {
    const { html, text } = renderReminderEmail({
      recipient: "cadet@sbu.ac.in",
      eventTitle: "Annual Firing Practice",
      startTime: "2026-08-20T07:00:00Z",
      location: "Short Range, Kanke",
      reminderTimeText: "2 hours before",
      eventId: "evt_456",
    });

    assert.ok(html.includes("2 hours before"));
    assert.ok(text.includes("Annual Firing Practice"));
  });

  it("mailer.sendOtp() executes simulated dispatch in dev mode without throwing", async () => {
    const result = await mailer.sendOtp({
      recipient: "test@sbu.ac.in",
      otpCode: "123456",
    });

    assert.equal(result.success, true);
    assert.ok(result.messageId);
  });
});
