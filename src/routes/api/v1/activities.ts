import { createFileRoute } from "@tanstack/react-router";
import { getAdmin, json } from "@backend/lib/ncc-db";
import { getOrSetCache, invalidateCachePrefix } from "@backend/lib/cache.server";

export const Route = createFileRoute("/api/v1/activities")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const category = url.searchParams.get("category") || "all";
        const status = url.searchParams.get("status") || "all";
        const cacheKey = `ncc:activities:${category}:${status}`;

        try {
          const activities = await getOrSetCache(cacheKey, 60, async () => {
            const admin = await getAdmin();
            let query = admin
              .from("activities")
              .select("*")
              .order("start_time", { ascending: false });

            if (category !== "all") query = query.eq("category", category);
            if (status !== "all") query = query.eq("status", status);

            const { data, error } = await query;
            if (error) throw error;
            return data ?? [];
          });

          return json(
            {
              success: true,
              data: { activities },
            },
            200,
            { "Cache-Control": "public, max-age=60, stale-while-revalidate=180" },
          );
        } catch {
          return json({ success: false, error: "Failed to fetch activities" }, 500);
        }
      },

      POST: async ({ request }) => {
        const { requireOfficer } = await import("@backend/lib/cadet-registry.server");
        const gate = await requireOfficer(request);
        if (!gate.ok) return json({ success: false, error: gate.error }, gate.status);

        const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
        const title = typeof body.title === "string" ? body.title : "";
        const startTime = typeof body.startTime === "string" ? body.startTime : "";
        if (!title || !startTime) {
          return json({ success: false, error: "Title and startTime are required." }, 400);
        }

        try {
          const admin = await getAdmin();
          const { data, error } = await admin
            .from("activities")
            .insert({
              title,
              category: (body.category as string) || "Institutional",
              description: (body.description as string) || "",
              image_url: (body.imageUrl as string) || "",
              location: (body.location as string) || "SBU Parade Ground",
              start_time: startTime,
              end_time: (body.endTime as string) || null,
              status: (body.status as string) || "PLANNED",
              organizer: (body.organizer as string) || "19 JHR BN NCC",
            })
            .select("*")
            .single();

          if (error) throw error;

          // Invalidate cached activities list
          await invalidateCachePrefix("ncc:activities");

          const { logAuditEvent } = await import("@backend/lib/audit-log.server");
          logAuditEvent({
            actor: "officer",
            action: "cadet_modified",
            target: `activity:${data.id}`,
            metadata: { title: body.title },
          });

          return json({ success: true, data: { activity: data } }, 201);
        } catch {
          return json({ success: false, error: "Failed to create activity" }, 500);
        }
      },
    },
  },
});
