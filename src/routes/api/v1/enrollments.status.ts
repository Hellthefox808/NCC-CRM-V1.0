import { createFileRoute } from "@tanstack/react-router";
import { getAdmin, json, mapToCadetRecord } from "@backend/lib/ncc-db";

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

        if (!id) {
          return json({ success: false, error: "Enrollment id is required." }, 400);
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
            .eq("id", String(id))
            .select("*")
            .maybeSingle();

          if (error || !data) {
            return json(
              { success: false, error: "Enrollment record not found.", code: "NOT_FOUND" },
              404,
            );
          }

          return json({ success: true, data: { updated: mapToCadetRecord(data) } });
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
