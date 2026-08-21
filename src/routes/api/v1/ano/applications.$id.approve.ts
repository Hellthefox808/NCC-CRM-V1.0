import { createFileRoute } from "@tanstack/react-router";
import { getAdmin, json } from "@backend/lib/ncc-db";
import { requireOfficer } from "@backend/lib/cadet-registry.server";
import { queueEmailJob } from "@backend/services/queue/queue.service";
import crypto from "crypto";

export const Route = createFileRoute("/api/v1/ano/applications/$id/approve")({
  server: {
    handlers: {
      POST: async ({ request, params }) => {
        const gate = await requireOfficer(request);
        if (!gate.ok) return json({ success: false, error: gate.error }, gate.status);

        const applicationId = params.id;
        if (!applicationId) {
          return json({ success: false, error: "Application ID is required" }, 400);
        }

        try {
          const admin = await getAdmin();

          // 1. Fetch & lock application status
          const { data: app, error: fetchErr } = await admin
            .from("cadet_enrollments")
            .select("*")
            .eq("id", applicationId)
            .single();

          if (fetchErr || !app) {
            return json({ success: false, error: "Application not found" }, 404);
          }

          if (app.status === "APPROVED" || app.status === "Enrolled") {
            return json({ success: false, error: "Application is already approved" }, 400);
          }

          // 2. Generate unique Cadet Regimental ID if not present
          const cadetId =
            app.enrollment_no ||
            `JH/${new Date().getFullYear().toString().slice(-2)}/${app.gender || "SD"}/${Math.floor(100000 + Math.random() * 900000)}`;

          // 3. Create cadet_users record with status ACTIVATION_PENDING
          const cadetEmail = app.email || `${app.aadhaar_number}@sbu.ac.in`;
          const { data: user, error: userErr } = await admin
            .from("cadet_users")
            .insert({
              cadet_id: cadetId,
              application_id: app.id,
              email: cadetEmail,
              role: "CADET",
              account_status: "ACTIVATION_PENDING",
            })
            .select("id")
            .single();

          if (userErr && !userErr.message.includes("duplicate")) {
            throw userErr;
          }

          const userId =
            user?.id ||
            (await admin.from("cadet_users").select("id").eq("cadet_id", cadetId).single()).data
              ?.id;

          // 4. Generate cryptographically random single-use activation token
          const rawToken = crypto.randomBytes(32).toString("hex");
          const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
          const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24 hours

          if (userId) {
            await admin.from("account_activation_tokens").insert({
              user_id: userId,
              token_hash: tokenHash,
              expires_at: expiresAt,
            });
          }

          // 5. Update application status to APPROVED
          await admin
            .from("cadet_enrollments")
            .update({
              status: "APPROVED",
              enrollment_no: cadetId,
              officer_remarks: "Approved by ANO. Activation token issued.",
              updated_at: new Date().toISOString(),
            })
            .eq("id", applicationId);

          // 6. Enqueue Approval & Activation Email
          const baseUrl = process.env.APP_URL || "http://localhost:8080";
          const activationLink = `${baseUrl}/activate?token=${rawToken}`;

          await queueEmailJob("sendApplicationApproved", cadetEmail, {
            recipient: cadetEmail,
            applicantName: app.full_name,
            cadetId,
            applicationId: app.id,
            activationLink,
            expiresInHours: 24,
          });

          // 7. Audit log event
          await admin.from("audit_logs").insert({
            action: "APPROVE_CADET_APPLICATION",
            performed_by: gate.officer?.email || "ANO",
            target_id: applicationId,
            details: { cadetId, email: cadetEmail },
          });

          return json({
            success: true,
            message: "Cadet application approved successfully. Activation invitation sent.",
            data: {
              applicationId: app.id,
              cadetId,
              email: cadetEmail,
              accountStatus: "ACTIVATION_PENDING",
            },
          });
        } catch (err: unknown) {
          console.error("[ANO Approve Error]", err);
          const errorMsg = err instanceof Error ? err.message : "Failed to approve application";
          return json({ success: false, error: errorMsg }, 500);
        }
      },
    },
  },
});
