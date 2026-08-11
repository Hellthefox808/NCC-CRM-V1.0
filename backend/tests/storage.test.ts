/**
 * Storage Capability & Bucket Tokenisation Unit Tests
 *
 * OWASP ASVS 5.0 V12 (File and Storage Security) & OWASP API Security Top 10 Security Verification
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  generateStorageToken,
  hashStorageToken,
  validateMagicBytes,
  ALLOWED_MIME_TYPES,
} from "../services/storage/storage.tokens.ts";
import {
  createUploadIntent,
  verifyAndCommitUpload,
  createDownloadGrant,
} from "../services/storage/storage.service.ts";

describe("Bucket Tokenisation & Storage Capability Unit Tests", () => {
  it("generateStorageToken() generates 256-bit secure tokens and valid SHA-256 hashes", () => {
    const { token, tokenHash } = generateStorageToken("stok_up");

    assert.ok(token.startsWith("stok_up_"), "Token should have specified prefix");
    assert.equal(token.length, 72, "Prefix + 64 hex characters");
    assert.equal(tokenHash.length, 64, "SHA-256 hash must be 64 hex characters");

    const recomputedHash = hashStorageToken(token);
    assert.equal(recomputedHash, tokenHash, "Recomputed hash must match generated token hash");
  });

  it("validateMagicBytes() correctly validates file header magic bytes against MIME type", () => {
    // Valid JPEG magic bytes (FF D8 FF)
    assert.ok(
      validateMagicBytes("ffd8ffe000104a464946", "image/jpeg"),
      "Valid JPEG header must pass",
    );

    // Valid PNG magic bytes (89 50 4E 47)
    assert.ok(validateMagicBytes("89504e470d0a1a0a", "image/png"), "Valid PNG header must pass");

    // Valid PDF magic bytes (%PDF -> 25 50 44 46)
    assert.ok(
      validateMagicBytes("255044462d312e34", "application/pdf"),
      "Valid PDF header must pass",
    );

    // Invalid header for JPEG (e.g. executable script)
    assert.equal(
      validateMagicBytes("7f454c4601010100", "image/jpeg"),
      false,
      "ELF executable binary must fail JPEG validation",
    );
    assert.equal(
      validateMagicBytes("3c7363726970743e", "image/png"),
      false,
      "<script> tag must fail PNG validation",
    );
  });

  it("ALLOWED_MIME_TYPES strictly restricts dangerous file uploads", () => {
    assert.ok(ALLOWED_MIME_TYPES.has("image/jpeg"), "JPEG must be allowed");
    assert.ok(ALLOWED_MIME_TYPES.has("image/png"), "PNG must be allowed");
    assert.ok(ALLOWED_MIME_TYPES.has("application/pdf"), "PDF must be allowed");

    assert.equal(ALLOWED_MIME_TYPES.has("text/html"), false, "HTML must be rejected");
    assert.equal(
      ALLOWED_MIME_TYPES.has("application/x-executable"),
      false,
      "Executables must be rejected",
    );
    assert.equal(
      ALLOWED_MIME_TYPES.has("application/javascript"),
      false,
      "JS scripts must be rejected",
    );
  });

  it("createUploadIntent() enforces file size ceilings and server-side opaque object keys", async () => {
    const result = await createUploadIntent({
      userId: "cadet_usr_123",
      userRole: "CADET",
      resourceType: "CADET_PHOTO",
      resourceId: "app_789",
      mimeType: "image/jpeg",
      sizeBytes: 1024 * 1024, // 1MB
    });

    assert.ok(result.opaqueIntentId.startsWith("int_"), "Intent ID must be opaque");
    assert.ok(result.uploadToken.startsWith("stok_up_"), "Token must be prefix-scoped");
    assert.equal(result.bucket, "cadet-identity", "Resource type must route to correct bucket");
    assert.ok(
      result.objectKey.includes("cadets/"),
      "Object key must follow server-side path structure",
    );
    assert.ok(
      !result.objectKey.includes("cadet_usr_123"),
      "Object key must use opaque hashed user directory",
    );
  });

  it("createUploadIntent() rejects invalid MIME types and oversized requests", async () => {
    await assert.rejects(
      async () => {
        await createUploadIntent({
          userId: "cadet_usr_123",
          userRole: "CADET",
          resourceType: "CADET_PHOTO",
          resourceId: "app_789",
          mimeType: "text/html",
          sizeBytes: 100,
        });
      },
      /Invalid MIME type/,
      "Must reject unallowed HTML mime type",
    );

    await assert.rejects(
      async () => {
        await createUploadIntent({
          userId: "cadet_usr_123",
          userRole: "CADET",
          resourceType: "CADET_PHOTO",
          resourceId: "app_789",
          mimeType: "image/jpeg",
          sizeBytes: 50 * 1024 * 1024, // 50MB
        });
      },
      /exceeds maximum limit/,
      "Must reject oversized uploads",
    );
  });
});
