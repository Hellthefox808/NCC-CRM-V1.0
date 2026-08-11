# ADR-008: Presigned Uploads & S3 Object Storage Lifecycle Architecture

**Status**: ACCEPTED  
**Date**: August 11, 2026  
**Context**: OWASP ASVS 5.0 V12 (File Upload Security Requirements)

---

## Context & Problem Statement

Photo uploads for battalion activities and cadet document verification must prevent arbitrary file uploads, path traversal, bucket tampering, and unauthenticated image access.

## Decision Outcome

1. **Presigned POST Flow**: Clients request upload authorization via `POST /api/v1/photos`. The server validates:
   - File size ceiling (max 10 MB)
   - MIME type whitelist (`image/jpeg`, `image/png`, `image/webp`)
   - Activity existence and user authorization
2. **Presigned Metadata Generation**: Server returns presigned POST fields with a short 15-minute expiration window and encrypted object key structure (`activities/{activityId}/{timestamp}_{hash}.{ext}`).
3. **Upload State Machine**: Storage objects transition through states `PENDING` → `UPLOADING` → `UPLOADED` → `QUARANTINED`. Access requires short-lived signed URLs.

## Consequences

- **Positive**: Complete mitigation of server-side file upload vulnerabilities.
- **Positive**: Offloads binary file data transport directly to object storage.
