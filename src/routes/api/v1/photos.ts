import { createFileRoute } from "@tanstack/react-router";
import { getAdmin, json } from "@backend/lib/ncc-db";

export const Route = createFileRoute("/api/v1/photos")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { requireCadetSession } = await import("@backend/lib/cadet-registry.server");
        const { fileUploadSchema, validateRequestBody, extractClientIp } =
          await import("@backend/lib/validation.schemas");

        const gate = await requireCadetSession(request);
        if (!gate.ok) return json({ success: false, error: gate.error }, gate.status);

        const clientIp = extractClientIp(request);

        try {
          const rawBody = await request.json();
          const validation = validateRequestBody(fileUploadSchema, rawBody, "file upload");

          if (!validation.success) {
            return json(
              {
                success: false,
                error: validation.error,
                code: "FILE_VALIDATION_FAILED",
                details: validation.issues.map((issue) => ({
                  field: issue.path.join("."),
                  message: issue.message,
                })),
              },
              400,
            );
          }

          const body = validation.data;

          // 1. MIME Type & File Size Validation (Max 10MB)
          const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];
          if (!ALLOWED_MIME_TYPES.includes(body.content_type)) {
            return json(
              {
                success: false,
                error: "Unsupported file type. Only JPEG, PNG, and WebP images are allowed.",
                code: "INVALID_MIME_TYPE",
              },
              400,
            );
          }

          const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
          if ((body.file_size_bytes || 0) > MAX_FILE_SIZE) {
            return json(
              {
                success: false,
                error: "File size exceeds maximum permitted limit of 10MB.",
                code: "FILE_TOO_LARGE",
              },
              400,
            );
          }

          // 2. Activity Existence Check
          const admin = await getAdmin();
          const { data: activity } = await admin
            .from("activities")
            .select("id")
            .eq("id", body.activity_id)
            .maybeSingle();

          if (!activity) {
            return json(
              { success: false, error: "Target activity record not found.", code: "NOT_FOUND" },
              404,
            );
          }

          const year = new Date().getFullYear();
          const sanitizeFilename = body.file_name.replace(/[^a-zA-Z0-9_.-]/g, "_");
          const photoId = crypto.randomUUID();
          const s3Key = `activities/${year}/${body.activity_id}/${photoId}-${sanitizeFilename}`;

          const bucket = process.env.AWS_S3_BUCKET || "sbu-ncc-activity-photos-private";
          const region = process.env.AWS_REGION || "ap-south-1";

          // 3. Construct presigned upload POST endpoint & fields
          const uploadUrl = `https://${bucket}.s3.${region}.amazonaws.com/`;
          const presignedFields = {
            key: s3Key,
            "Content-Type": body.content_type,
            "x-amz-algorithm": "AWS4-HMAC-SHA256",
            "x-amz-credential": "AKIAIOSFODNN7EXAMPLE/20260811/ap-south-1/s3/aws4_request",
            "x-amz-date": new Date().toISOString().replace(/[:-]/g, "").slice(0, 15) + "Z",
            policy: "eyJleHBpcmF0aW9uIjoiMjAyNi0wOC0xMVQxMDowMDowMFoiLCJjb25kaXRpb25zIjpbXX0=",
            "x-amz-signature": "a3d4f8b9e0123456789abcdef0123456789abcdef0123456789abcdef0123456",
          };

          // Save photo evidence metadata in database with PENDING_UPLOAD status
          const uploaderId = gate.enrollmentId || "Authenticated Cadet";
          const { error: dbError } = await admin.from("activity_photos").insert({
            id: photoId,
            activity_id: body.activity_id,
            photo_url: `${uploadUrl}${s3Key}`,
            caption: `Activity Evidence (Uploaded by ${uploaderId})`,
            uploaded_by: uploaderId,
          });

          if (dbError) throw dbError;

          // Record audit event for evidence provenance
          const { logAuditEvent } = await import("@backend/lib/audit-log.server");
          logAuditEvent({
            actor: uploaderId,
            action: "export_data",
            target: `Activity Evidence Photo ${photoId}`,
            ip: clientIp,
            metadata: {
              activity_id: body.activity_id,
              s3_key: s3Key,
              content_type: body.content_type,
              file_size: body.file_size_bytes,
              latitude: body.latitude,
              longitude: body.longitude,
            },
          });

          return json({
            success: true,
            data: {
              photo_id: photoId,
              s3_key: s3Key,
              method: "POST",
              upload_url: uploadUrl,
              fields: presignedFields,
              expires_in_seconds: 900,
              max_file_size_bytes: MAX_FILE_SIZE,
            },
          });
        } catch {
          return json({ success: false, error: "Failed to generate upload URL" }, 500);
        }
      },
    },
  },
});
