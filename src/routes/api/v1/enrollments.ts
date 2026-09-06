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
        const { cadetEnrollmentSchema, validateRequestBody } =
          await import("@backend/lib/validation.schemas");
        const rawBody = await request.json().catch(() => ({}));
        const validation = validateRequestBody(
          cadetEnrollmentSchema,
          rawBody,
          "cadet enrollment application",
        );

        if (!validation.success) {
          return json(
            {
              success: false,
              error: validation.error,
              code: "VALIDATION_FAILED",
              details: validation.issues.map((issue) => ({
                field: issue.path.join("."),
                message: issue.message,
              })),
            },
            400,
          );
        }

        const data = validation.data;

        try {
          const admin = await getAdmin();
          const { data: inserted, error } = await admin
            .from("cadet_enrollments")
            .insert(buildEnrollmentRow(data))
            .select("*")
            .single();

          if (error) throw error;

          const mapped = mapToCadetRecord(inserted);

          // Multi-Channel Dispatch: Email + WhatsApp + SMS with 18-digit Application Number
          const { sendMultiChannelApplicationConfirmation } =
            await import("@backend/services/messaging/multichannel.service");
          const dispatchResult = await sendMultiChannelApplicationConfirmation({
            applicationId: mapped.id,
            fullName: mapped.fullName,
            email: mapped.email,
            mobile: mapped.mobile,
            sbuCourse: mapped.sbuCourse,
            submissionDate: mapped.applicationDate || new Date().toISOString().split("T")[0],
          });

          return json(
            {
              success: true,
              message:
                "NCC Enrollment Application submitted successfully! 18-digit Application Number generated and sent via Email, WhatsApp, and SMS.",
              data: {
                enrollment: mapped,
                applicationNo: mapped.id,
                dispatches: dispatchResult,
              },
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
