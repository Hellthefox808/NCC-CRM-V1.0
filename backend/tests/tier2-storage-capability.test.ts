import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  generateStorageToken,
  hashStorageToken,
  validateMagicBytes,
  ALLOWED_MIME_TYPES,
} from "../services/storage/storage.tokens.ts";
import { createUploadIntent } from "../services/storage/storage.service.ts";

describe("Tier 2: Bucket Tokenisation & Storage Capability Security Tests", () => {
  describe("1. 256-Bit Cryptographic Storage Tokens", () => {
    it("generates opaque 256-bit tokens with uniform SHA-256 digests", () => {
      const { token, tokenHash } = generateStorageToken("stok_doc");

      assert.ok(token.startsWith("stok_doc_"));
      assert.equal(token.length, 73); // 9 char prefix + 64 hex chars
      assert.equal(tokenHash.length, 64);

      // Recomputed hash must strictly match
      const recomputed = hashStorageToken(token);
      assert.equal(recomputed, tokenHash);
    });

    it("generates collision-resistant unique tokens across multiple invocations", () => {
      const set = new Set<string>();
      for (let i = 0; i < 500; i++) {
        set.add(generateStorageToken("stok_up").token);
      }
      assert.equal(set.size, 500);
    });
  });

  describe("2. MIME Magic-Byte Verification (OWASP ASVS 5.0 V12)", () => {
    it("passes authentic file headers for PDF, PNG, and JPEG documents", () => {
      // PDF: 25 50 44 46 (%PDF)
      assert.equal(validateMagicBytes("255044462d312e350a", "application/pdf"), true);

      // PNG: 89 50 4E 47 (\x89PNG)
      assert.equal(validateMagicBytes("89504e470d0a1a0a", "image/png"), true);

      // JPEG: FF D8 FF
      assert.equal(validateMagicBytes("ffd8ffe000104a464946", "image/jpeg"), true);
    });

    it("rejects disguised executable binaries and scripts attempting extension spoofing", () => {
      // ELF executable header disguised as PDF
      assert.equal(validateMagicBytes("7f454c4602010100", "application/pdf"), false);

      // Windows PE MZ header disguised as PNG
      assert.equal(validateMagicBytes("4d5a900003000000", "image/png"), false);

      // HTML/Script header disguised as JPEG
      assert.equal(validateMagicBytes("3c21444f43545950", "image/jpeg"), false);
    });

    it("enforces strict allowed MIME type list and forbids dangerous extensions", () => {
      assert.ok(ALLOWED_MIME_TYPES.has("application/pdf"));
      assert.ok(ALLOWED_MIME_TYPES.has("image/jpeg"));
      assert.ok(ALLOWED_MIME_TYPES.has("image/png"));

      // Disallowed types
      assert.equal(ALLOWED_MIME_TYPES.has("application/x-msdownload"), false);
      assert.equal(ALLOWED_MIME_TYPES.has("text/html"), false);
      assert.equal(ALLOWED_MIME_TYPES.has("application/javascript"), false);
    });
  });

  describe("3. Upload Intent Creation & Size Ceilings", () => {
    it("enforces maximum file size limit (10MB)", async () => {
      // Valid size: 2MB
      const valid = await createUploadIntent({
        userId: "cadet-123",
        userRole: "CADET",
        resourceType: "APPLICATION_DOCUMENT",
        resourceId: "app-123",
        mimeType: "application/pdf",
        sizeBytes: 2 * 1024 * 1024,
      });
      assert.ok(valid.uploadToken);
      assert.ok(valid.objectKey);
      assert.ok(!valid.objectKey.includes("..")); // No directory traversal
      assert.equal(valid.bucket, "cadet-documents");

      // Oversized: 15MB (>10MB ceiling for APPLICATION_DOCUMENT)
      await assert.rejects(async () => {
        await createUploadIntent({
          userId: "cadet-123",
          userRole: "CADET",
          resourceType: "APPLICATION_DOCUMENT",
          resourceId: "app-123",
          mimeType: "application/pdf",
          sizeBytes: 15 * 1024 * 1024,
        });
      }, /exceeds maximum limit/);
    });

    it("rejects unapproved MIME types on upload intent", async () => {
      await assert.rejects(async () => {
        await createUploadIntent({
          userId: "cadet-123",
          userRole: "CADET",
          resourceType: "APPLICATION_DOCUMENT",
          resourceId: "app-123",
          mimeType: "application/x-sh",
          sizeBytes: 1024,
        });
      }, /Invalid MIME type/);
    });
  });
});
