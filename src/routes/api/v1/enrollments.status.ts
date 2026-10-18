import { createFileRoute } from "@tanstack/react-router";
import { getAdmin, json, mapToCadetRecord } from "@backend/lib/ncc-db";
import { invalidateCache, invalidateCachePrefix } from "@backend/lib/cache.server";
import { emitStatusUpdated } from "@backend/services/socket/socket.server";
import { recordAuditLog } from "@backend/lib/audit-log.server";

const VALID_CADET_STATUSES = new Set([
  "Submitted",
  "Physical Scheduled",
  "Medical Cleared",
  "Selected",
  "Enrolled",
  "Rejected",
]);

export const Route = createFileRoute("/api/v1/enrollments/status")({
  server: {
    handlers: {
      PATCH: async ({ request }) => {
        const { requireOfficer } = await import("@backend/lib/cadet-registry.server");
        const gate = await requireOfficer(request);
        if (!gate.ok) return json({ success: false, error: gate.error }, gate.status);

        const { id, status, remarks, enrollmentNo } = (await request
          .json()
          .catch(() => ({}))) as Record<string, unknown>;

        if (!id || typeof id !== "string") {
          return json({ success: false, error: "Enrollment id is required." }, 400);
        }

        if (
          status !== undefined &&
          (typeof status !== "string" || !VALID_CADET_STATUSES.has(status))
        ) {
          return json(
            {
              success: false,
              error: `Invalid status. Permitted values: ${Array.from(VALID_CADET_STATUSES).join(", ")}`,
              code: "INVALID_STATUS",
            },
            400,
          );
        }

        try {
          const admin = await getAdmin();
          const patch: {
            status?: string;
            officer_remarks?: string | null;
            enrollment_no?: string | null;
          } = {};
          if (typeof status === "string") patch.status = status;
          if (remarks !== undefined)
            patch.officer_remarks = typeof remarks === "string" ? remarks : null;
          if (enrollmentNo !== undefined)
            patch.enrollment_no = typeof enrollmentNo === "string" ? enrollmentNo : null;

          const { data, error } = await admin
            .from("cadet_enrollments")
            .update(patch)
            .eq("id", id)
            .select("*")
            .maybeSingle();

          if (error || !data) {
            return json(
              { success: false, error: "Enrollment record not found.", code: "NOT_FOUND" },
              404,
            );
          }

          const mapped = mapToCadetRecord(data);

          // Invalidate Multi-tier cache so public search and roster queries immediately reflect the change
          await invalidateCachePrefix("ncc:enrollment:");
          await invalidateCache(`ncc:enrollment:status:${id.toLowerCase()}`);
          if (data.mobile) {
            await invalidateCache(`ncc:enrollment:status:${String(data.mobile).toLowerCase()}`);
          }
          if (data.aadhaar_number) {
            await invalidateCache(
              `ncc:enrollment:status:${String(data.aadhaar_number).toLowerCase()}`,
            );
          }
          if (data.enrollment_no) {
            await invalidateCache(
              `ncc:enrollment:status:${String(data.enrollment_no).toLowerCase()}`,
            );
          }

          // Broadcast real-time status update to all connected officer/cadre sessions
          emitStatusUpdated(mapped as unknown as Record<string, unknown>);

          // Record security audit log entry
          await recordAuditLog({
            actorId: gate.officerName || "officer",
            actor: gate.officerName || "officer",
            action: "enrollment_status_change",
            target: id,
            details: `Status transitioned to ${patch.status || "updated"} with remarks: ${patch.officer_remarks || "none"}`,
            metadata: {
              status: patch.status,
              enrollmentNo: patch.enrollment_no,
              officerRemarks: patch.officer_remarks,
            },
          });

          return json({ success: true, data: { updated: mapped } });
        } catch {
          return json(
            { success: false, error: "Enrollment record not found.", code: "NOT_FOUND" },
            404,
          );
        }
      },
    },
  },
});
