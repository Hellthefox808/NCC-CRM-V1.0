# BUCKET TOKENISATION & STORAGE CAPABILITY ARCHITECTURE

**Specification**: OWASP ASVS 5.0 V12 / AWS S3 Security / Supabase Storage Security  
**Engine Implementation**: `backend/services/storage/storage.service.ts` & `storage.tokens.ts`  
**Database Schema**: `supabase/migrations/20260811120000_bucket_tokenisation_storage_security.sql`

---

## 1. Executive Summary

The **Bucket Tokenisation & Storage Capability Architecture** eliminates direct storage access vulnerabilities, raw public S3/Supabase URLs, and client-determined file paths in the NCC Portal.

Under this model, the client browser never receives cloud credentials or direct write/read access to raw buckets. Instead, all storage operations follow a **Tokenized Capability Lifecycle**:

```text
USER (Client)
  │
  ├─ 1. Request Upload Intent (resourceType, mimeType, sizeBytes) ──► Server Authorization Engine
  │                                                                           │
  │                                                                           ▼
  │  ◄─ 2. Receive Scoped Upload Token + Opaque Key (TTL 15m) ◄──────── Issued Capability
  │
  ├─ 3. Upload File Binary to Storage Provider
  │
  ├─ 4. Commit & Verify (uploadToken, magicBytesHex, checksum) ──► Server Magic Bytes & Size Check
  │                                                                           │
  │                                                                           ▼
  │  ◄─ 5. Object Registered & Verified (storage_objects) ◄────────── Verified Status
```

---

## 2. Token Lifecycle & Capability Constraints

| Attribute            | Upload Capability Token                                    | Download Access Grant Token         |
| :------------------- | :--------------------------------------------------------- | :---------------------------------- |
| **Prefix Format**    | `stok_up_<64_hex_chars>`                                   | `stok_dl_<64_hex_chars>`            |
| **Entropy**          | 256 bits (`crypto.randomBytes(32)`)                        | 256 bits (`crypto.randomBytes(32)`) |
| **At-Rest Storage**  | SHA-256 Digest (`token_hash`)                              | SHA-256 Digest (`grant_token_hash`) |
| **Time-To-Live**     | 15 Minutes                                                 | 15 Minutes                          |
| **Reuse Policy**     | Single-Use (Consumed on commit)                            | Single-Use or Time-Bounded          |
| **Path Constraint**  | Server-Generated Opaque Object Key                         | Server-Verified Object ID           |
| **MIME Allowlist**   | `image/jpeg`, `image/png`, `image/webp`, `application/pdf` | Enforced at Upload Intent           |
| **Magic Byte Check** | Server-Verified (`FF D8 FF`, `89 50 4E 47`, etc.)          | Verified at Intent                  |

---

## 3. Database Schema

- **`storage_upload_intents`**: Tracks authorized intent registrations, mime rules, byte ceilings, and token hashes.
- **`storage_objects`**: Immutable registry of verified storage objects with opaque identifiers (`obj_...`) and owner assignments.
- **`storage_access_grants`**: Short-lived, authorized capability tokens issued for downloading/viewing objects.

---

## 4. Opaque Path Structure

Client-supplied filenames or identifiers (such as Aadhaar, Student Email, or original filenames) are **never** used as object keys.

All object keys follow opaque server-side path construction:

```text
cadets/{opaqueUserHash}/documents/{opaqueObjectId}
cadets/{opaqueUserHash}/photos/{opaqueObjectId}
activities/{opaqueActivityHash}/media/{opaqueObjectId}
```

Example:
`cadets/a9f8e71b2c3d4e5f/cadet_photo/obj_8f1e2d3c4b5a6978`

---

## 5. Security Acceptance Checklist

- [x] Sensitive buckets are strictly private (`cadet-documents`, `cadet-identity`, `activity-media`, `certificates`).
- [x] Zero raw cloud credentials or service-role keys exposed to client browser.
- [x] Server-side authorization required prior to intent or grant issuance.
- [x] Upload capability scoped to exact object key, size ceiling, and MIME type.
- [x] Magic byte header validation enforced on commit.
- [x] Single-use semantics enforced on upload tokens (`used_at` timestamp check).
- [x] Download access grants require explicit ABAC ownership / officer role verification (prevents BOLA/IDOR).
- [x] All unit tests pass in `backend/tests/storage.test.ts`.
