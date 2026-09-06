import { createFileRoute } from "@tanstack/react-router";
import { getAdmin, json, sanitizePostgrestQuery } from "@backend/lib/ncc-db";

export const Route = createFileRoute("/api/v1/notifications/$id/read")({
  server: {
    handlers: {
      PATCH: async ({ request, params }) => {
        const { requireCadetSession, requireOfficer } =
          await import("@backend/lib/cadet-registry.server");
        const officerGate = await requireOfficer(request);
        if (!officerGate.ok) {
          const cadetGate = await requireCadetSession(request);
          if (!cadetGate.ok) {
            return json({ success: false, error: "Authentication required" }, 401);
          }
        }

        const rawId = params.id?.trim();
        const id = rawId ? sanitizePostgrestQuery(rawId) : "";
        if (!id) {
          return json({ success: false, error: "Notification ID required" }, 400);
        }

        try {
          const admin = await getAdmin();
          const { data, error } = await admin
            .from("notifications")
            .update({ read: true, updated_at: new Date().toISOString() })
            .eq("id", id)
            .select("id")
            .maybeSingle();

          if (error || !data) {
            return json({ success: false, error: "Notification not found" }, 404);
          }

          const { invalidateCache } = await import("@backend/lib/cache.server");
          await invalidateCache("ncc:notifications:feed");

          return json({
            success: true,
            message: "Notification marked as read",
            data: { id, read: true },
          });
        } catch {
          return json({ success: false, error: "Failed to mark notification as read" }, 500);
        }
      },
    },
  },
});
