import { createFileRoute } from "@tanstack/react-router";
import { json } from "@backend/lib/ncc-db";
import { ChatService, chatStore } from "@backend/services/messaging/chat.service";
import { resolveChatUser } from "@backend/lib/chat-auth.server";

export const Route = createFileRoute("/api/v1/messages/messages/$id/poll-vote")({
  server: {
    handlers: {
      POST: async ({ params, request }) => {
        const user = await resolveChatUser(request);
        if (!user) {
          return json({ success: false, error: "Authentication required to vote." }, 401);
        }

        const { id } = params;
        const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
        const optionId = typeof body.optionId === "string" ? body.optionId : "";
        let convId = typeof body.conversationId === "string" ? body.conversationId : "";

        if (!optionId) {
          return json({ success: false, error: "optionId is required." }, 400);
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
          return json({ success: false, error: "Conversation not found for poll." }, 404);
        }

        try {
          const poll = await ChatService.votePoll(
            convId,
            id,
            { id: user.id, name: user.name },
            optionId,
          );
          return json({ success: true, data: { poll } });
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : "Failed to cast vote";
          const status = msg.includes("Unauthorized") ? 403 : 400;
          return json({ success: false, error: msg }, status);
        }
      },
    },
  },
});
