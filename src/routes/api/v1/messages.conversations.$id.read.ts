import { createFileRoute } from "@tanstack/react-router";
import { json } from "@backend/lib/ncc-db";
import { ChatService } from "@backend/services/messaging/chat.service";
import { resolveChatUser } from "@backend/lib/chat-auth.server";

export const Route = createFileRoute("/api/v1/messages/conversations/$id/read")({
  server: {
    handlers: {
      POST: async ({ params, request }) => {
        const user = await resolveChatUser(request);
        if (!user) {
          return json({ success: false, error: "Authentication required." }, 401);
        }

        const { id } = params;
        const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
        const messageId = typeof body.messageId === "string" ? body.messageId : undefined;

        try {
          const res = await ChatService.markAsRead(id, user.id, messageId);
          return json({ success: true, data: res });
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : "Failed to mark as read";
          return json({ success: false, error: msg }, 400);
        }
      },
    },
  },
});
