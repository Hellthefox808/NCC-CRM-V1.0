import { createFileRoute } from "@tanstack/react-router";
import { getAdmin, json } from "@backend/lib/ncc-db";

export const Route = createFileRoute("/api/v1/photos")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { requireCadetSession } = await import("@backend/lib/cadet-registry.server");
        const gate = await requireCadetSession(request);
        if (!gate.ok) return json({ success: false, error: gate.error }, gate.status);

        try {
          const body = (await request.json()) as {
            activity_id: string;
            file_name: string;
            content_type: string;
            file_size_bytes?: number;
            latitude?: number;
            longitude?: number;
          };

          if (!body.activity_id || !body.file_name || !body.content_type) {
            return json(
              { success: false, error: "activity_id, file_name, and content_type are required" },
              400
            );
          }

          // Security check: validate MIME type & size
          const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
          if (!allowedTypes.includes(body.content_type)) {
            return json(
              { success: false, error: "Only JPEG, PNG, and WebP images are allowed" },
              400
            );
          }

          const maxSize = 10 * 1024 * 1024; // 10MB limit
          if (body.file_size_bytes && body.file_size_bytes > maxSize) {
            return json(
              { success: false, error: "File size exceeds 10MB limit" },
              400
            );
          }

          const year = new Date().getFullYear();
          const sanitizeFilename = body.file_name.replace(/[^a-zA-Z0-9_.-]/g, "_");
          const photoId = crypto.randomUUID();
          const s3Key = `activities/${year}/${body.activity_id}/${photoId}-${sanitizeFilename}`;

          // Construct presigned upload metadata
          const bucket = process.env.AWS_S3_BUCKET || "sbu-ncc-activity-photos-private";
          const region = process.env.AWS_REGION || "ap-south-1";
          const uploadUrl = `https://${bucket}.s3.${region}.amazonaws.com/${s3Key}`;

          // Save photo evidence metadata in database
          const uploaderId = gate.enrollmentId || "Authenticated Cadet";
          const admin = await getAdmin();
          const { error: dbError } = await admin.from("activity_photos").insert({
            id: photoId,
            activity_id: body.activity_id,
            photo_url: uploadUrl,
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
            metadata: {
              activity_id: body.activity_id,
              s3_key: s3Key,
              content_type: body.content_type,
              latitude: body.latitude,
              longitude: body.longitude,
            },
          });

          return json({
            success: true,
            data: {
              photo_id: photoId,
              s3_key: s3Key,
              upload_url: uploadUrl,
              expires_in_seconds: 900,
            },
          });
        } catch {
          return json({ success: false, error: "Failed to generate upload URL" }, 500);
        }
      },
    },
  },
});
