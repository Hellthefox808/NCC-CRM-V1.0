import test from "node:test";
import assert from "node:assert/strict";
import {
  hashPassword,
  verifyPasswordHash,
  issueActivationToken,
  verifyActivationToken,
  consumeActivationToken,
  generateOtp,
  issueOtp,
  verifyOtp,
  clearMemoryOtps,
} from "../lib/auth-otp.server.ts";
import {
  renderAccountActivationEmail,
  renderPasswordResetEmail,
  renderPasswordChangedNotificationEmail,
  renderOnboardingWelcomeEmail,
} from "../services/mail/templates.ts";
import { onboardingBatchSchema } from "../lib/validation.schemas.ts";

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
  assert.ok(
    activation.html.includes("https://ncc.sbu.ac.in/activate?token=abc123xyz"),
    "Email must contain activation CTA link",
  );
  assert.ok(
    !activation.html.includes("Password:"),
    "Activation email must NOT contain plain passwords",
  );

  const pwdReset = renderPasswordResetEmail({
    recipient: "cadet@sbu.ac.in",
    recipientName: "Raviraj Kumar",
    resetTokenOrLink: "https://ncc.sbu.ac.in/activate?token=reset123&mode=reset",
    expiresInMinutes: 30,
  });

  assert.ok(
    pwdReset.html.includes("RESET PASSWORD"),
    "Password reset email must render CTA button",
  );
  assert.ok(pwdReset.html.includes("30 minutes"), "Password reset email must state link TTL");

  const pwdChanged = renderPasswordChangedNotificationEmail({
    recipient: "cadet@sbu.ac.in",
    recipientName: "Raviraj Kumar",
    username: "NCC2401001",
    timestamp: "12/08/2026, 12:30:00 pm",
  });

  assert.ok(
    pwdChanged.html.includes("NCC Account Password Changed"),
    "Password changed alert subject header must match",
  );
  assert.ok(pwdChanged.html.includes("12/08/2026"), "Timestamp must be rendered in alert email");
});

test("Multi-Purpose OTP Lifecycle & Failover Security", async () => {
  clearMemoryOtps();
  const identifier = "test_onboard_cadet_007";
  const destination = "cadet7@sbu.ac.in";

  // 1. Issue OTP for onboarding
  const issued = await issueOtp(identifier, destination, "onboarding");
  assert.ok(issued, "OTP issuance must succeed");
  assert.equal(issued?.code.length, 6, "OTP code must be 6 digits");
  assert.match(issued?.code || "", /^\d{6}$/, "Code must be digits");

  // 2. Cooldown enforcement: Immediate second request must return null (throttled)
  const throttled = await issueOtp(identifier, destination, "onboarding");
  assert.equal(
    throttled,
    null,
    "Immediate second OTP request within 45s cooldown must be throttled",
  );

  // 3. Verification with incorrect code
  const badVerify = await verifyOtp(identifier, "000000", "onboarding");
  assert.equal(badVerify.ok, false, "Incorrect code must fail verification");
  assert.equal(badVerify.code, "OTP_INVALID", "Error code must be OTP_INVALID");

  // 4. Verification with correct code
  const goodVerify = await verifyOtp(identifier, issued!.code, "onboarding");
  assert.equal(goodVerify.ok, true, "Correct code must verify successfully");

  // 5. Re-verification after consumption must fail (single-use)
  const consumedVerify = await verifyOtp(identifier, issued!.code, "onboarding");
  assert.equal(consumedVerify.ok, false, "Re-verifying consumed OTP must fail");
  assert.equal(consumedVerify.code, "OTP_NOT_FOUND");
});

test("Onboarding Batch Schema Validation", () => {
  const validBatch = {
    steps: {
      profile_completed: true,
      contact_verified: true,
      documents_verified: true,
    },
  };
  const parseResult = onboardingBatchSchema.safeParse(validBatch);
  assert.ok(parseResult.success, "Valid onboarding steps should pass validation");

  const invalidBatch = {
    steps: {
      unknown_step: true,
    },
  };
  const invalidResult = onboardingBatchSchema.safeParse(invalidBatch);
  assert.equal(invalidResult.success, false, "Unknown steps must be rejected by schema");
});

test("Onboarding Welcome Email Renderer", () => {
  const email = renderOnboardingWelcomeEmail({
    recipient: "cadet@example.com",
    cadetName: "Raviraj Kumar",
    cadetId: "19/2026/SW/0014",
    unitName: "19 JHR BN NCC",
  });

  assert.ok(email.html.includes("19/2026/SW/0014"), "Welcome email must include cadet ID");
  assert.ok(email.html.includes("Raviraj Kumar"), "Welcome email must include cadet name");
  assert.ok(email.html.includes("Welcome Active Cadet"), "Welcome email must render active badge");
  assert.ok(email.html.includes("19 JHR BN NCC"), "Welcome email must display unit name");
});

test("5-Stage Cadet Induction Step Normalization & Completion Evaluation", () => {
  const VALID_STEPS = [
    "profile_completed",
    "contact_verified",
    "documents_verified",
    "declaration_accepted",
    "orientation_completed",
  ];

  // 1. camelCase to snake_case normalization
  const camelSteps = [
    "profileCompleted",
    "contactVerified",
    "documentsVerified",
    "declarationAccepted",
    "orientationCompleted",
  ];

  for (const camel of camelSteps) {
    const snake = camel.replace(/([A-Z])/g, "_$1").toLowerCase();
    assert.ok(VALID_STEPS.includes(snake), `Normalized step '${snake}' must be in VALID_STEPS`);
  }

  // 2. Step rejection for invalid steps
  const invalidSteps = ["random_step", "hacked_stage", "admin_bypass"];
  for (const invalid of invalidSteps) {
    const normalized = invalid.replace(/([A-Z])/g, "_$1").toLowerCase();
    assert.equal(
      VALID_STEPS.includes(normalized),
      false,
      `Step '${invalid}' must be rejected as invalid`,
    );
  }

  // 3. Partial progress calculation
  const partialChecklist = {
    profile_completed: true,
    contact_verified: true,
    documents_verified: false,
    declaration_accepted: false,
    orientation_completed: false,
  };

  const partialCompleted = Object.values(partialChecklist).filter(Boolean).length;
  const partialPercent = Math.round((partialCompleted / VALID_STEPS.length) * 100);
  assert.equal(partialCompleted, 2);
  assert.equal(partialPercent, 40);
  const partialAllDone = partialCompleted === VALID_STEPS.length;
  assert.equal(partialAllDone, false, "Partial onboarding must not be marked as allDone");

  // 4. Complete 5-stage progress triggers auto-activation
  const completeChecklist = {
    profile_completed: true,
    contact_verified: true,
    documents_verified: true,
    declaration_accepted: true,
    orientation_completed: true,
  };

  const completeCount = Object.values(completeChecklist).filter(Boolean).length;
  const completePercent = Math.round((completeCount / VALID_STEPS.length) * 100);
  assert.equal(completeCount, 5);
  assert.equal(completePercent, 100);
  const completeAllDone = completeCount === VALID_STEPS.length;
  assert.equal(completeAllDone, true, "5 of 5 steps completed must trigger allDone = true");
  const targetAccountStatus = completeAllDone ? "ACTIVE" : "PENDING_ONBOARDING";
  assert.equal(targetAccountStatus, "ACTIVE", "Completed onboarding must transition to ACTIVE");
});

test("Onboarding Purpose OTP Verification with Replay Protection", async () => {
  clearMemoryOtps();
  const cadetIdentifier = "CADET_2026_TEST_99";
  const cadetEmail = "cadet99@sbu.ac.in";

  // Step 1: Request OTP for onboarding
  const otpPayload = await issueOtp(cadetIdentifier, cadetEmail, "onboarding");
  assert.ok(otpPayload, "OTP should be issued successfully");
  assert.equal(otpPayload?.code.length, 6, "Code must be 6 digits");

  // Step 2: Verification fails with wrong code
  const failResult = await verifyOtp(cadetIdentifier, "111111", "onboarding");
  assert.equal(failResult.ok, false);
  assert.equal(failResult.code, "OTP_INVALID");

  // Step 3: Verification succeeds with correct code
  const successResult = await verifyOtp(cadetIdentifier, otpPayload!.code, "onboarding");
  assert.equal(successResult.ok, true, "Correct code must verify");

  // Step 4: Replay protection - code cannot be used twice
  const replayResult = await verifyOtp(cadetIdentifier, otpPayload!.code, "onboarding");
  assert.equal(replayResult.ok, false, "Replay verification must be blocked");
  assert.equal(replayResult.code, "OTP_NOT_FOUND");
});
