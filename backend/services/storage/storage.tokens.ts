/**
 * Cryptographic helpers for Storage Capability Tokens & Opaque Identifiers
 *
 * Implements 256-bit entropy token generation, SHA-256 resting token hashes,
 * and opaque resource path sanitization for AWS S3 and Supabase Storage.
 */

import crypto from "crypto";

export interface StorageTokenPair {
  token: string; // Opaque 256-bit bearer capability token returned to authorized client
  tokenHash: string; // SHA-256 hash stored at rest in database
}

/** Generates a 256-bit cryptographically secure token and its SHA-256 hash */
export function generateStorageToken(prefix = "stok"): StorageTokenPair {
  const rawBytes = crypto.randomBytes(32);
  const token = `${prefix}_${rawBytes.toString("hex")}`;
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  return { token, tokenHash };
}

/** Computes SHA-256 hash of a provided token for DB lookup */
export function hashStorageToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

/** Generates an opaque random UUID-backed object ID */
export function generateOpaqueObjectId(prefix = "obj"): string {
  return `${prefix}_${crypto.randomUUID().replace(/-/g, "")}`;
}

/** Validates and normalizes MIME types against allowlists */
export const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
]);

/** Magic byte signature validation table */
export const MAGIC_BYTES: Record<string, string[]> = {
  "image/jpeg": ["ffd8ff"],
  "image/png": ["89504e47"],
  "image/webp": ["52494646"], // RIFF header
  "application/pdf": ["25504446"], // %PDF
};

/** Validates buffer header against expected MIME magic bytes */
export function validateMagicBytes(bufferHex: string, mimeType: string): boolean {
  const expectedSignatures = MAGIC_BYTES[mimeType];
  if (!expectedSignatures) return false;
  const cleanHex = bufferHex.toLowerCase().replace(/[^a-f0-9]/g, "");
  return expectedSignatures.some((sig) => cleanHex.startsWith(sig));
}
