import { createFileRoute } from "@tanstack/react-router";
import { getAdmin, json } from "@backend/lib/ncc-db";

export const Route = createFileRoute("/api/v1/notifications/$id/read")({
  server: {
    handlers: {
      PATCH: async ({ params }) => {
        const id = params.id;
        if (!id) {
          return json({ success: false, error: "Notification ID required" }, 400);
        }

        try {
          const admin = await getAdmin();
          await admin
            .from("notifications")
            .update({ read: true, read_at: new Date().toISOString() })
            .eq("id", id);

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
