import { createFileRoute } from "@tanstack/react-router";
import { json } from "@backend/lib/ncc-db";
import { ChatService, chatStore } from "@backend/services/messaging/chat.service";
import { resolveChatUser } from "@backend/lib/chat-auth.server";

export const Route = createFileRoute("/api/v1/messages/messages/$id/pin")({
  server: {
    handlers: {
      POST: async ({ params, request }) => {
        const user = await resolveChatUser(request);
        if (!user) {
          return json({ success: false, error: "Authentication required to pin messages." }, 401);
        }

        const { id } = params;
        const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
        const isPinned = typeof body.isPinned === "boolean" ? body.isPinned : true;
        let convId = typeof body.conversationId === "string" ? body.conversationId : "";

        if (!convId) {
          for (const [cId, msgs] of chatStore.messages.entries()) {
            if (msgs.some((m) => m.id === id)) {
              convId = cId;
              break;
            }
          }
        }

        if (!convId) {
          return json({ success: false, error: "Conversation not found for message." }, 404);
        }

        try {
          const message = await ChatService.pinMessage(convId, id, user, isPinned);
          return json({ success: true, data: { message } });
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : "Failed to toggle pin state";
          const status = msg.includes("Unauthorized") ? 403 : 400;
          return json({ success: false, error: msg }, status);
        }
      },
    },
  },
});
