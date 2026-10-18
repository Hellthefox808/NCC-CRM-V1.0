import { createFileRoute } from "@tanstack/react-router";
import { json } from "@backend/lib/ncc-db";
import { ChatService } from "@backend/services/messaging/chat.service";
import { resolveChatUser } from "@backend/lib/chat-auth.server";

export const Route = createFileRoute("/api/v1/messages/conversations/$id/poll")({
  server: {
    handlers: {
      POST: async ({ params, request }) => {
        const user = await resolveChatUser(request);
        if (!user) {
          return json({ success: false, error: "Authentication required to create a poll." }, 401);
        }

        const { id } = params;
        const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;

        const question = typeof body.question === "string" ? body.question : "";
        const options = Array.isArray(body.options) ? (body.options as string[]) : [];
        const allowsMultiple = Boolean(body.allowsMultiple);

        try {
          const pollMessage = await ChatService.createPoll(id, user, {
            question,
            options,
            allowsMultiple,
          });

          return json({ success: true, data: { message: pollMessage } }, 201);
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : "Failed to create poll";
          const status = msg.includes("Unauthorized") ? 403 : 400;
          return json({ success: false, error: msg }, status);
        }
      },
    },
  },
});
