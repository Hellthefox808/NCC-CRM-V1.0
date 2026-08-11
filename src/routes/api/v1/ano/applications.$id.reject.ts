import { createFileRoute } from "@tanstack/react-router";
import { getAdmin, json } from "@backend/lib/ncc-db";
import { requireOfficer } from "@backend/lib/cadet-registry.server";
import { queueEmailJob } from "@backend/services/queue/queue.service";

export const Route = createFileRoute("/api/v1/ano/applications/$id/reject")({
  server: {
    handlers: {
      POST: async ({ request, params }) => {
        const gate = await requireOfficer(request);
        if (!gate.ok) return json({ success: false, error: gate.error }, gate.status);

        const applicationId = params.id;
        if (!applicationId) {
          return json({ success: false, error: "Application ID is required" }, 400);
        }

        const body = (await request.json().catch(() => ({}))) as { reason?: string };
        const reason =
          body.reason?.trim() || "Application criteria not met during document review.";

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

          // Update application status to REJECTED
          await admin
            .from("cadet_enrollments")
            .update({
              status: "REJECTED",
              officer_remarks: reason,
              updated_at: new Date().toISOString(),
            })
            .eq("id", applicationId);

          const cadetEmail = app.email || `${app.aadhaar_number}@sbu.ac.in`;

          // Enqueue Rejection Email
          await queueEmailJob("sendApplicationRejected", cadetEmail, {
            recipient: cadetEmail,
            applicantName: app.full_name,
            applicationId: app.id,
            reason,
          });

          // Audit log event
          await admin.from("audit_logs").insert({
            action: "REJECT_CADET_APPLICATION",
            performed_by: gate.officer?.email || "ANO",
            target_id: applicationId,
            details: { reason },
          });

          return json({
            success: true,
            message: "Application rejected.",
            data: { applicationId: app.id, status: "REJECTED" },
          });
        } catch (err: any) {
          console.error("[ANO Reject Error]", err);
          return json(
            { success: false, error: err?.message || "Failed to reject application" },
            500,
          );
        }
      },
    },
  },
});
