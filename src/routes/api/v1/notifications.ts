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

        const rawJson = (await request.json().catch(() => ({}))) as Record<string, unknown>;
        const rawTitle = typeof rawJson.title === "string" ? rawJson.title.trim() : "";
        const rawBody = typeof rawJson.body === "string" ? rawJson.body.trim() : "";
        const rawCategory =
          typeof rawJson.category === "string" ? rawJson.category.trim() : "Urgent Notice";
        const rawPriority =
          typeof rawJson.priority === "string" ? rawJson.priority.trim() : "NORMAL";
        const rawActionType =
          typeof rawJson.actionType === "string" ? rawJson.actionType.trim() : "general";
        const rawActionLabel =
          typeof rawJson.actionLabel === "string" ? rawJson.actionLabel.trim() : "View Details";

        if (!rawTitle || !rawBody) {
          return json({ success: false, error: "Title and Body are required." }, 400);
        }

        if (rawTitle.length > 200 || rawBody.length > 2000) {
          return json(
            { success: false, error: "Title (max 200) or Body (max 2000) exceeds maximum length." },
            400,
          );
        }

        const ALLOWED_PRIORITIES = ["LOW", "NORMAL", "HIGH", "URGENT"];
        const priority = ALLOWED_PRIORITIES.includes(rawPriority.toUpperCase())
          ? rawPriority.toUpperCase()
          : "NORMAL";

        try {
          const admin = await getAdmin();
          const { data, error } = await admin
            .from("notifications")
            .insert({
              title: rawTitle,
              category: rawCategory.slice(0, 50) || "Urgent Notice",
              priority,
              body: rawBody,
              action_type: rawActionType.slice(0, 50) || "general",
              action_label: rawActionLabel.slice(0, 50) || "View Details",
            })
            .select("*")
            .single();

          if (error) throw error;

          // Invalidate notifications cache
          await invalidateCache("ncc:notifications:feed");

          // Audit log broadcast action
          const { logAuditEvent } = await import("@backend/lib/audit-log.server");
          const { extractClientIp } = await import("@backend/lib/validation.schemas");
          logAuditEvent({
            actor: gate.officerName || "Officer",
            action: "notification_broadcast",
            target: `notification:${data.id}`,
            ip: extractClientIp(request),
            metadata: { title: rawTitle, priority },
          });

          return json({ success: true, data: { notification: mapNotification(data) } }, 201);
        } catch {
          return json({ success: false, error: "Database error broadcasting notification" }, 500);
        }
      },
    },
  },
});
