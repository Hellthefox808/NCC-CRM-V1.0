import { createFileRoute } from "@tanstack/react-router";
import {
  getAdmin,
  json,
  mapToCadetRecord,
  maskPublicRecord,
  sanitizePostgrestQuery,
} from "@backend/lib/ncc-db";

export const Route = createFileRoute("/api/v1/enrollments/status/$query")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const rawQuery = decodeURIComponent(params.query || "").trim();
        const query = sanitizePostgrestQuery(rawQuery);
        if (!query) {
          return json(
            { success: false, error: "Search query required.", code: "RECORD_NOT_FOUND" },
            404,
          );
        }

        try {
          const admin = await getAdmin();
          const { data, error } = await admin
            .from("cadet_enrollments")
            .select("*")
            .or(
              [
                `id.ilike.${query}`,
                `aadhaar_number.eq.${query}`,
                `enrollment_no.ilike.${query}`,
                `mobile.eq.${query}`,
                `sbu_roll_no.ilike.${query}`,
              ].join(","),
            )
            .limit(1)
            .maybeSingle();

          if (error) throw error;
          if (!data) {
            return json(
              {
                success: false,
                error: "No NCC Enrollment record found matching query.",
                code: "RECORD_NOT_FOUND",
              },
              404,
            );
          }

          return json({
            success: true,
            data: { record: maskPublicRecord(mapToCadetRecord(data)) },
          });
        } catch {
          return json({ success: false, error: "Database error" }, 500);
        }
      },
    },
  },
});
