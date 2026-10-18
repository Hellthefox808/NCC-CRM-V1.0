import { createFileRoute } from "@tanstack/react-router";
import { json } from "@backend/lib/ncc-db";
import { ChatService, chatStore } from "@backend/services/messaging/chat.service";
import { resolveChatUser } from "@backend/lib/chat-auth.server";

export const Route = createFileRoute("/api/v1/messages/messages/$id")({
  server: {
    handlers: {
      PATCH: async ({ params, request }) => {
        const user = await resolveChatUser(request);
        if (!user) {
          return json({ success: false, error: "Authentication required." }, 401);
        }

        const { id } = params;
        const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
        const content = typeof body.content === "string" ? body.content : "";
        const conversationId = typeof body.conversationId === "string" ? body.conversationId : "";

        // Find conversation if not provided in payload
        let convId = conversationId;
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
          const updatedMessage = await ChatService.editMessage(convId, id, user.id, content);
          return json({ success: true, data: { message: updatedMessage } });
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : "Failed to edit message";
          const status = msg.includes("Unauthorized") ? 403 : 400;
          return json({ success: false, error: msg }, status);
        }
      },

      DELETE: async ({ params, request }) => {
        const user = await resolveChatUser(request);
        if (!user) {
          return json({ success: false, error: "Authentication required." }, 401);
        }

        const { id } = params;
        const url = new URL(request.url);
        let convId = url.searchParams.get("conversationId") || "";

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
          const res = await ChatService.deleteMessage(convId, id, user.id, user.role);
          return json({ success: true, data: res });
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : "Failed to delete message";
          const status = msg.includes("Unauthorized") ? 403 : 400;
          return json({ success: false, error: msg }, status);
        }
      },
    },
  },
});
