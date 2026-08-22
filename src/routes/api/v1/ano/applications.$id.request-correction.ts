import { createFileRoute } from "@tanstack/react-router";
import { getAdmin, json } from "@backend/lib/ncc-db";
import { requireOfficer } from "@backend/lib/cadet-registry.server";
import { queueEmailJob } from "@backend/services/queue/queue.service";

export const Route = createFileRoute("/api/v1/ano/applications/$id/request-correction")({
  server: {
    handlers: {
      POST: async ({ request, params }) => {
        const gate = await requireOfficer(request);
        if (!gate.ok) return json({ success: false, error: gate.error }, gate.status);

        const applicationId = params.id;
        if (!applicationId) {
          return json({ success: false, error: "Application ID is required" }, 400);
        }

        const body = (await request.json().catch(() => ({}))) as { remarks?: string };
        const remarks =
          body.remarks?.trim() || "Please verify and re-upload clear document copies.";

        try {
          const admin = await getAdmin();
          const { data: app, error: fetchErr } = await admin
            .from("cadet_enrollments")
            .select("*")
            .eq("id", applicationId)
            .single();

          if (fetchErr || !app) {
            return json({ success: false, error: "Application not found" }, 404);
          }

          // Update application status to CORRECTION_REQUIRED
          await admin
            .from("cadet_enrollments")
            .update({
              status: "CORRECTION_REQUIRED",
              officer_remarks: remarks,
              updated_at: new Date().toISOString(),
            })
            .eq("id", applicationId);

          const cadetEmail = app.email || `${app.aadhaar_number}@sbu.ac.in`;

          // Enqueue Correction Required Email
          await queueEmailJob("sendCorrectionRequired", cadetEmail, {
            recipient: cadetEmail,
            applicantName: app.full_name,
            applicationId: app.id,
            remarks,
          });

          // Audit log event
          await admin.from("audit_logs").insert({
            action: "REQUEST_APPLICATION_CORRECTION",
            actor: gate.officerName || "ANO",
            target: applicationId,
            ip: request.headers.get("x-forwarded-for") || "unknown",
            metadata: { remarks },
          });

          return json({
            success: true,
            message: "Correction requested from applicant.",
            data: { applicationId: app.id, status: "CORRECTION_REQUIRED" },
          });
        } catch (err: unknown) {
          console.error("[ANO Correction Error]", err);
          const errorMsg = err instanceof Error ? err.message : "Failed to request correction";
          return json({ success: false, error: errorMsg }, 500);
        }
      },
    },
  },
});
