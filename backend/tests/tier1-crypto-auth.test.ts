import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import crypto from "node:crypto";
import {
  hashPassword,
  verifyPasswordHash,
  generateOtp,
  issueOtp,
  verifyOtp,
  issueActivationToken,
  verifyActivationToken,
  consumeActivationToken,
  clearMemoryTokens,
} from "../lib/auth-otp.server.ts";
import { bearer, requireOfficer, requireCadetSession } from "../lib/cadet-registry.server.ts";

describe("Tier 1: Cryptographic Pipeline, Authentication & Token Security Tests", () => {
  beforeEach(() => {
    clearMemoryTokens();
  });

  describe("1. Salted Scrypt Password Hashing & Verification", () => {
    it("derives salted scrypt hash matching N=16384, r=8, p=1 parameters", async () => {
      const password = "NCC#Officer2026!Secure";
      const hash = await hashPassword(password);

      assert.equal(typeof hash, "string");
      assert.ok(hash.startsWith("scrypt$N=16384,r=8,p=1$"));
      const parts = hash.split("$");
      assert.equal(parts.length, 4);
      assert.equal(parts[2].length, 32); // 16-byte hex salt
      assert.equal(parts[3].length, 128); // 64-byte hex derived key
    });

    it("verifies matching password using constant-time comparison", async () => {
      const password = "Cadet@Jharkhand#2026";
      const hash = await hashPassword(password);

      const isValid = await verifyPasswordHash(password, hash);
      assert.equal(isValid, true);
    });

    it("rejects mismatched passwords and tampered hashes", async () => {
      const password = "OriginalSecretPassword123!";
      const hash = await hashPassword(password);

      const isWrong = await verifyPasswordHash("WrongPassword456!", hash);
      assert.equal(isWrong, false);

      const isBlank = await verifyPasswordHash("", hash);
      assert.equal(isBlank, false);

      const isCorrupted = await verifyPasswordHash(
        password,
        "scrypt$N=16384,r=8,p=1$deadbeef$badhash",
      );
      assert.equal(isCorrupted, false);
    });
  });

  describe("2. OTP Lifecycle, Cooldown & Brute-Force Lockout", () => {
    it("generates 6-digit numeric codes with uniform padding", () => {
      for (let i = 0; i < 50; i++) {
        const otp = generateOtp();
        assert.equal(otp.length, 6);
        assert.ok(/^\d{6}$/.test(otp));
      }
    });

    it("issues OTP and validates correct code", async () => {
      const identifier = "cadet.test1@sbu.ac.in";
      const issueRes = await issueOtp(identifier, identifier, "verification");
      assert.ok(issueRes);
      assert.ok(issueRes.code);

      const verifyRes = await verifyOtp(identifier, issueRes.code!, "verification");
      assert.equal(verifyRes.ok, true);
    });

    it("enforces single-use consumption and blocks replay attacks", async () => {
      const identifier = "cadet.replay@sbu.ac.in";
      const issueRes = await issueOtp(identifier, identifier, "onboarding");
      assert.ok(issueRes);
      assert.ok(issueRes.code);

      // First verification succeeds
      const firstTry = await verifyOtp(identifier, issueRes.code!, "onboarding");
      assert.equal(firstTry.ok, true);

      // Replay attempt fails immediately
      const replayTry = await verifyOtp(identifier, issueRes.code!, "onboarding");
      assert.equal(replayTry.ok, false);
      assert.equal(replayTry.code, "OTP_NOT_FOUND");
    });

    it("enforces 5-attempt brute-force lockout threshold", async () => {
      const identifier = "cadet.lockout@sbu.ac.in";
      const issueRes = await issueOtp(identifier, identifier, "password_reset");
      assert.ok(issueRes);
      assert.ok(issueRes.code);

      // Attempt 5 wrong codes
      for (let i = 1; i <= 4; i++) {
        const wrong = await verifyOtp(identifier, "000000", "password_reset");
        assert.equal(wrong.ok, false);
        assert.equal(wrong.code, "OTP_INVALID");
      }

      // 5th failed attempt locks the OTP
      const fifthWrong = await verifyOtp(identifier, "000000", "password_reset");
      assert.equal(fifthWrong.ok, false);

      // Any subsequent attempt (even correct code) is locked out
      const lockedTry = await verifyOtp(identifier, issueRes.code!, "password_reset");
      assert.equal(lockedTry.ok, false);
      assert.equal(lockedTry.code, "OTP_LOCKED");
    });
  });

  describe("3. Single-Use Cryptographic Activation Tokens", () => {
    it("issues 256-bit entropy raw tokens with valid expiration dates", async () => {
      const identifier = "ano.officer@sbu.ac.in";
      const res = await issueActivationToken(identifier, identifier, "ACCOUNT_ACTIVATION", 30);

      assert.equal(typeof res.rawToken, "string");
      assert.equal(res.rawToken.length, 64); // 32 bytes hex
      assert.ok(new Date(res.expiresAt).getTime() > Date.now());
    });

    it("verifies token validity without premature consumption", async () => {
      const identifier = "ano.verify@sbu.ac.in";
      const res = await issueActivationToken(identifier, identifier, "ACCOUNT_ACTIVATION", 30);

      // Pre-check verification
      const check = await verifyActivationToken(res.rawToken, "ACCOUNT_ACTIVATION");
      assert.equal(check.ok, true);
      assert.equal(check.identifier, identifier);

      // Token still exists and is consumable
      const consume = await consumeActivationToken(res.rawToken, "ACCOUNT_ACTIVATION");
      assert.equal(consume.ok, true);
    });

    it("prevents replay attacks by enforcing atomic consumption", async () => {
      const identifier = "cadet.consume@sbu.ac.in";
      const res = await issueActivationToken(identifier, identifier, "ACCOUNT_ACTIVATION", 30);

      const firstConsume = await consumeActivationToken(res.rawToken, "ACCOUNT_ACTIVATION");
      assert.equal(firstConsume.ok, true);

      // Second consumption must fail
      const secondConsume = await consumeActivationToken(res.rawToken, "ACCOUNT_ACTIVATION");
      assert.equal(secondConsume.ok, false);
      assert.equal(secondConsume.code, "TOKEN_NOT_FOUND");
    });
  });

  describe("4. Session Token Extraction & RBAC Gates", () => {
    it("extracts bearer token from Authorization header or cookie", () => {
      const fakeToken = "sess_" + crypto.randomBytes(32).toString("hex");

      const authHeaderReq = new Request("http://localhost", {
        headers: { authorization: `Bearer ${fakeToken}` },
      });
      assert.equal(bearer(authHeaderReq), fakeToken);

      const cookieReq = new Request("http://localhost", {
        headers: { cookie: `ncc_session=${fakeToken}; Path=/` },
      });
      assert.equal(bearer(cookieReq), fakeToken);

      const emptyReq = new Request("http://localhost");
      assert.equal(bearer(emptyReq), null);
    });

    it("requireOfficer() rejects unauthenticated requests with HTTP 401", async () => {
      const emptyReq = new Request("http://localhost");
      const gate = await requireOfficer(emptyReq);
      assert.equal(gate.ok, false);
      assert.equal(gate.status, 401);
      assert.ok(gate.error?.includes("Officer sign-in required"));
    });

    it("requireCadetSession() rejects unauthenticated requests with HTTP 401", async () => {
      const emptyReq = new Request("http://localhost");
      const gate = await requireCadetSession(emptyReq);
      assert.equal(gate.ok, false);
      assert.equal(gate.status, 401);
      assert.ok(gate.error?.includes("Cadet sign-in required"));
    });
  });
});
