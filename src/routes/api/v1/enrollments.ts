import { createFileRoute } from "@tanstack/react-router";
import {
  buildEnrollmentRow,
  getAdmin,
  json,
  mapToCadetRecord,
  sanitizePostgrestQuery,
} from "@backend/lib/ncc-db";

export const Route = createFileRoute("/api/v1/enrollments")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const { requireOfficer } = await import("@backend/lib/cadet-registry.server");
        const gate = await requireOfficer(request);
        if (!gate.ok) return json({ success: false, error: gate.error }, gate.status);

        const url = new URL(request.url);
        const status = url.searchParams.get("status");
        const gender = url.searchParams.get("gender");
        const sbuCourse = url.searchParams.get("sbuCourse");
        const search = url.searchParams.get("search");
        const sortBy = url.searchParams.get("sortBy");
        const order = url.searchParams.get("order");
        const page = Math.max(1, parseInt(url.searchParams.get("page") || "1", 10));
        const limit = Math.max(1, parseInt(url.searchParams.get("limit") || "50", 10));

        const SORT_COLUMNS: Record<string, string> = {
          fullName: "full_name",
          applicationDate: "application_date",
          status: "status",
          selectionRank: "selection_rank",
          heightCm: "height_cm",
          marksPercentage12th: "marks_percentage_12th",
        };

        try {
          const admin = await getAdmin();
          let query = admin.from("cadet_enrollments").select("*", { count: "exact" });

          if (status) query = query.eq("status", status);
          if (gender) query = query.eq("gender", gender);
          if (sbuCourse)
            query = query.ilike("sbu_course", `%${sanitizePostgrestQuery(sbuCourse)}%`);
          if (search) {
            const q = sanitizePostgrestQuery(search.trim());
            if (q) {
              query = query.or(
                [
                  `full_name.ilike.%${q}%`,
                  `id.ilike.%${q}%`,
                  `enrollment_no.ilike.%${q}%`,
                  `mobile.ilike.%${q}%`,
                  `sbu_roll_no.ilike.%${q}%`,
                ].join(","),
              );
            }
          }

          const sortColumn = (sortBy && SORT_COLUMNS[sortBy]) || "application_date";
          query = query.order(sortColumn, { ascending: order !== "desc" });
          query = query.range((page - 1) * limit, page * limit - 1);

          const { data, count, error } = await query;
          if (error) throw error;

          const mapped = (data ?? []).map(mapToCadetRecord);
          const total = count ?? mapped.length;

          return json(
            {
              success: true,
              data: {
                enrollments: mapped,
                count: mapped.length,
                total,
                page,
                totalPages: Math.max(1, Math.ceil(total / limit)),
              },
              meta: { cacheHit: false, requestId: request.headers.get("x-request-id") },
            },
            200,
            { "X-Cache": "MISS" },
          );
        } catch {
          return json({ success: false, error: "Database error fetching enrollments" }, 500);
        }
      },

      POST: async ({ request }) => {
        const data = (await request.json().catch(() => ({}))) as Record<string, unknown>;

        if (!data.fullName || !data.aadhaarNumber || !data.sbuRollNo || !data.mobile) {
          return json(
            {
              success: false,
              error: "Missing required fields: fullName, aadhaarNumber, sbuRollNo, mobile.",
              code: "VALIDATION_FAILED",
            },
            400,
          );
        }

        const cleanAadhaar = String(data.aadhaarNumber).replace(/\D/g, "");
        if (cleanAadhaar.length !== 12) {
          return json(
            {
              success: false,
              error: "Aadhaar number must be exactly 12 numeric digits.",
              code: "VALIDATION_FAILED",
            },
            400,
          );
        }

        const cleanMobile = String(data.mobile).replace(/\D/g, "");
        if (cleanMobile.length !== 10) {
          return json(
            {
              success: false,
              error: "Mobile number must be exactly 10 numeric digits.",
              code: "VALIDATION_FAILED",
            },
            400,
          );
        }

        try {
          const admin = await getAdmin();
          const { data: inserted, error } = await admin
            .from("cadet_enrollments")
            .insert(buildEnrollmentRow(data))
            .select("*")
            .single();

          if (error) throw error;

          return json(
            {
              success: true,
              message:
                "NCC Enrollment Application submitted successfully to 19 Jharkhand Battalion, Ranchi.",
              data: { enrollment: mapToCadetRecord(inserted) },
            },
            201,
          );
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : "Failed to submit enrollment.";
          return json({ success: false, error: message }, 500);
        }
      },
    },
  },
});
