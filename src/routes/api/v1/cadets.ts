import { createFileRoute } from "@tanstack/react-router";
import { json, sanitizePostgrestQuery } from "@backend/lib/ncc-db";

export const Route = createFileRoute("/api/v1/cadets")({
  server: {
    handlers: {
      /** Officer-only listing of the unit cadet register. */
      GET: async ({ request }) => {
        const { mapCadet, requireOfficer } = await import("@backend/lib/cadet-registry.server");
        const { getAdmin } = await import("@backend/lib/ncc-db");

        const gate = await requireOfficer(request);
        if (!gate.ok) return json({ success: false, error: gate.error }, gate.status);

        const url = new URL(request.url);
        const rawSearch = url.searchParams.get("search")?.trim();
        const search = rawSearch ? sanitizePostgrestQuery(rawSearch) : null;
        const batch = url.searchParams.get("batch");
        const wing = url.searchParams.get("wing");
        const course = url.searchParams.get("course");
        const page = Math.max(1, parseInt(url.searchParams.get("page") || "1", 10));
        const limit = Math.min(
          200,
          Math.max(1, parseInt(url.searchParams.get("limit") || "25", 10)),
        );

        try {
          const admin = await getAdmin();
          let query = admin.from("cadets").select("*", { count: "exact" });

          if (batch) query = query.eq("batch", batch);
          if (wing) query = query.eq("wing", wing);
          if (course) query = query.eq("course", course);
          if (search) {
            query = query.or(
              [
                `full_name.ilike.%${search}%`,
                `enrollment_id.ilike.%${search}%`,
                `sbu_id.ilike.%${search}%`,
                `mobile.ilike.%${search}%`,
                `email.ilike.%${search}%`,
              ].join(","),
            );
          }

          const { data, count, error } = await query
            .order("full_name", { ascending: true })
            .range((page - 1) * limit, page * limit - 1);
          if (error) throw error;

          return json({
            success: true,
            data: {
              cadets: (data ?? []).map((row) => mapCadet(row)),
              count: (data ?? []).length,
              total: count ?? 0,
              page,
              totalPages: Math.max(1, Math.ceil((count ?? 0) / limit)),
            },
          });
        } catch {
          return json({ success: false, error: "Database error fetching cadet register" }, 500);
        }
      },

      /** Officer-only sync of the shipped nominal roll into the register. */
      POST: async ({ request }) => {
        const { requireOfficer, syncRoster } = await import("@backend/lib/cadet-registry.server");
        const gate = await requireOfficer(request);
        if (!gate.ok) return json({ success: false, error: gate.error }, gate.status);

        try {
          const result = await syncRoster();
          return json({ success: true, data: result });
        } catch {
          return json({ success: false, error: "Roster sync failed" }, 500);
        }
      },
    },
  },
});
