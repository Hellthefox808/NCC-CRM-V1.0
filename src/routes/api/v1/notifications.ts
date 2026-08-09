import { createFileRoute } from "@tanstack/react-router";
import { getAdmin, json, mapNotification } from "@backend/lib/ncc-db";

export const Route = createFileRoute("/api/v1/notifications")({
  server: {
    handlers: {
      GET: async () => {
        try {
          const admin = await getAdmin();
          const { data, error } = await admin
            .from("notifications")
            .select("*")
            .order("created_at", { ascending: false });

          if (error) throw error;
          const notifications = (data ?? []).map(mapNotification);

          return json({
            success: true,
            data: { notifications, unreadCount: notifications.length },
          });
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

          return json({ success: true, data: { notification: mapNotification(data) } }, 201);
        } catch {
          return json({ success: false, error: "Database error broadcasting notification" }, 500);
        }
      },
    },
  },
});
