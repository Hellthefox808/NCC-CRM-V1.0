# STORAGE SECURITY SPECIFICATION

**Compliance**: OWASP ASVS 5.0 V12 (File and Storage Security) / AWS S3 Security / Supabase Storage  
**Engine**: `backend/services/storage/storage.service.ts` & `storage.tokens.ts`

---

## 1. Core Principles

- **Private Buckets**: All sensitive storage buckets (`cadet-documents`, `cadet-identity`, `activity-media`, `certificates`) are private with Row Level Security (RLS) enabled.
- **Zero Raw Credentials**: No AWS access keys, S3 secrets, or Supabase service-role keys are exposed to the client application.
- **Temporary Capability Tokens**: Operations are authorized via short-lived (15m TTL), single-purpose 256-bit bearer capabilities (`stok_up_...` and `stok_dl_...`).
- **Server-Side Opaque Keys**: Filenames are generated server-side using SHA-256 hashed user directories and random UUIDs.

---

## 2. Supported MIME Types & Magic Byte Signatures

| Declared MIME Type | File Extension  | Magic Byte Signature (Hex) | Purpose                                |
| :----------------- | :-------------- | :------------------------- | :------------------------------------- |
| `image/jpeg`       | `.jpg`, `.jpeg` | `FF D8 FF`                 | Cadet Photos, Identity Documents       |
| `image/png`        | `.png`          | `89 50 4E 47`              | Cadet Photos, Digital Signatures       |
| `image/webp`       | `.webp`         | `52 49 46 46`              | Optimized Activity Media               |
| `application/pdf`  | `.pdf`          | `25 50 44 46`              | Academic Certificates, Enrolment Forms |

---

## 3. Storage Security Workflow & Verification

1. **Upload Intent Phase**:
   - Client sends `{ resourceType, resourceId, mimeType, sizeBytes }`.
   - Server checks user session authorization and validates MIME & size ceilings.
   - Server registers intent in `storage_upload_intents` and returns upload capability token.

2. **Commit & Verification Phase**:
   - Client uploads binary content.
   - Server verifies token validity, checks file magic bytes against declared MIME type, verifies size limits, marks intent as `VERIFIED`, and registers object metadata in `storage_objects`.

3. **Download Access Grant Phase**:
   - Client requests download grant for `objectId`.
   - Server verifies ownership or officer permission (ABAC).
   - Server returns temporary signed download grant capability token.
