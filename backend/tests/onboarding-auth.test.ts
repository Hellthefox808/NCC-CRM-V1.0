import test from "node:test";
import assert from "node:assert/strict";
import {
  hashPassword,
  verifyPasswordHash,
  issueActivationToken,
  verifyActivationToken,
  consumeActivationToken,
  generateOtp,
} from "../lib/auth-otp.server.ts";
import {
  renderAccountActivationEmail,
  renderPasswordResetEmail,
  renderPasswordChangedNotificationEmail,
} from "../services/mail/templates.ts";

test("Salted Scrypt Password Hashing & Verification", async () => {
  const plainPassword = "SecurePass123!@#";
  const identifier = "NCC2026001";

  const hashed = await hashPassword(plainPassword, identifier);
  assert.ok(hashed.startsWith("scrypt$"), "Password hash should use scrypt algorithm format");

  const isValid = await verifyPasswordHash(plainPassword, hashed, identifier);
  assert.equal(isValid, true, "Correct password must verify successfully");

  const isInvalid = await verifyPasswordHash("WrongPassword123!", hashed, identifier);
  assert.equal(isInvalid, false, "Incorrect password must be rejected");
});

test("Single-use Cryptographic Activation Token Workflow", async () => {
  const identifier = "cadet_test_token_user";
  const { rawToken, expiresAt } = await issueActivationToken(
    identifier,
    "cadet@sbu.ac.in",
    "ACCOUNT_ACTIVATION",
    15,
  );

  assert.ok(rawToken.length >= 64, "Raw token should be high entropy hex string");
  assert.ok(new Date(expiresAt).getTime() > Date.now(), "ExpiresAt must be in the future");

  // 1. Verify without consuming
  const verify1 = await verifyActivationToken(rawToken, "ACCOUNT_ACTIVATION");
  assert.equal(verify1.ok, true, "Token verification should succeed before consumption");
  assert.equal(verify1.identifier, identifier.toLowerCase());

  // 2. Consume token
  const consume1 = await consumeActivationToken(rawToken, "ACCOUNT_ACTIVATION");
  assert.equal(consume1.ok, true, "First token consumption should succeed");

  // 3. Re-consumption must fail (Single-use enforcement)
  const consume2 = await consumeActivationToken(rawToken, "ACCOUNT_ACTIVATION");
  assert.equal(consume2.ok, false, "Re-consuming a single-use token must be rejected");
  assert.equal(consume2.code, "TOKEN_NOT_FOUND");
});

test("OTP Generator Security Properties", () => {
  const code1 = generateOtp();
  const code2 = generateOtp();
  assert.equal(code1.length, 6, "OTP code must be 6 digits");
  assert.match(code1, /^\d{6}$/, "OTP must be purely numeric");
  assert.notEqual(code1, code2, "Sequential OTPs should be random");
});

test("Transactional Email Template Renderers", () => {
  const activation = renderAccountActivationEmail({
    recipient: "cadet@sbu.ac.in",
    recipientName: "Raviraj Kumar",
    username: "NCC2401001",
    userType: "Applicant / Cadet",
    activationLink: "https://ncc.sbu.ac.in/activate?token=abc123xyz",
    expiresInMinutes: 30,
  });

  assert.ok(activation.html.includes("NCC2401001"), "Activation email must contain username");
  assert.ok(activation.html.includes("https://ncc.sbu.ac.in/activate?token=abc123xyz"), "Email must contain activation CTA link");
  assert.ok(!activation.html.includes("Password:"), "Activation email must NOT contain plain passwords");

  const pwdReset = renderPasswordResetEmail({
    recipient: "cadet@sbu.ac.in",
    recipientName: "Raviraj Kumar",
    resetTokenOrLink: "https://ncc.sbu.ac.in/activate?token=reset123&mode=reset",
    expiresInMinutes: 30,
  });

  assert.ok(pwdReset.html.includes("RESET PASSWORD"), "Password reset email must render CTA button");
  assert.ok(pwdReset.html.includes("30 minutes"), "Password reset email must state link TTL");

  const pwdChanged = renderPasswordChangedNotificationEmail({
    recipient: "cadet@sbu.ac.in",
    recipientName: "Raviraj Kumar",
    username: "NCC2401001",
    timestamp: "12/08/2026, 12:30:00 pm",
  });

  assert.ok(pwdChanged.html.includes("NCC Account Password Changed"), "Password changed alert subject header must match");
  assert.ok(pwdChanged.html.includes("12/08/2026"), "Timestamp must be rendered in alert email");
});
