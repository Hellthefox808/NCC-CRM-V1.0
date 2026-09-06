import { createFileRoute } from "@tanstack/react-router";
import { getAdmin, json, mapNotification } from "@backend/lib/ncc-db";
import { getOrSetCache, invalidateCache } from "@backend/lib/cache.server";

export const Route = createFileRoute("/api/v1/notifications")({
  server: {
    handlers: {
      GET: async () => {
        try {
          const notifications = await getOrSetCache("ncc:notifications:feed", 30, async () => {
            const admin = await getAdmin();
            const { data, error } = await admin
              .from("notifications")
              .select("*")
              .order("created_at", { ascending: false });

            if (error) throw error;
            return (data ?? []).map(mapNotification);
          });

          return json(
            {
              success: true,
              data: { notifications, unreadCount: notifications.length },
            },
            200,
            { "Cache-Control": "public, max-age=30, stale-while-revalidate=60" },
          );
        } catch {
          return json({ success: false, error: "Database error fetching notifications" }, 500);
        }
      },

      POST: async ({ request }) => {
        const { requireOfficer } = await import("@backend/lib/cadet-registry.server");
        const gate = await requireOfficer(request);
        if (!gate.ok) return json({ success: false, error: gate.error }, gate.status);

        const { title, category, priority, body, actionType, actionLabel } = (await request
          .json()
          .catch(() => ({}))) as Record<string, unknown>;

        if (!title || !body) {
          return json({ success: false, error: "Title and Body are required." }, 400);
        }

        try {
          const admin = await getAdmin();
          const { data, error } = await admin
            .from("notifications")
            .insert({
              title: String(title),
              category: typeof category === "string" ? category : "Urgent Notice",
              priority: typeof priority === "string" ? priority : "NORMAL",
              body: String(body),
              action_type: typeof actionType === "string" ? actionType : "general",
              action_label: typeof actionLabel === "string" ? actionLabel : "View Details",
            })
            .select("*")
            .single();

          if (error) throw error;

          // Invalidate notifications cache
          await invalidateCache("ncc:notifications:feed");

          return json({ success: true, data: { notification: mapNotification(data) } }, 201);
        } catch {
          return json({ success: false, error: "Database error broadcasting notification" }, 500);
        }
      },
    },
  },
});
