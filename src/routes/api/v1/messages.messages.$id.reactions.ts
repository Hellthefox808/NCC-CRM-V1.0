import { createFileRoute } from "@tanstack/react-router";
import { json } from "@backend/lib/ncc-db";
import { ChatService, chatStore } from "@backend/services/messaging/chat.service";
import { resolveChatUser } from "@backend/lib/chat-auth.server";

export const Route = createFileRoute("/api/v1/messages/messages/$id/reactions")({
  server: {
    handlers: {
      POST: async ({ params, request }) => {
        const user = await resolveChatUser(request);
        if (!user) {
          return json({ success: false, error: "Authentication required." }, 401);
        }

        const { id } = params;
        const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
        const emoji = typeof body.emoji === "string" ? body.emoji : "";
        let convId = typeof body.conversationId === "string" ? body.conversationId : "";

        if (!emoji) {
          return json({ success: false, error: "Emoji string is required." }, 400);
        }

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
          const reactions = await ChatService.toggleReaction(
            convId,
            id,
            { id: user.id, name: user.name },
            emoji,
          );
          return json({ success: true, data: { reactions } });
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : "Failed to toggle reaction";
          return json({ success: false, error: msg }, 400);
        }
      },
    },
  },
});
