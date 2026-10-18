import { createFileRoute } from "@tanstack/react-router";
import { json } from "@backend/lib/ncc-db";
import { ChatService, chatStore } from "@backend/services/messaging/chat.service";
import { resolveChatUser } from "@backend/lib/chat-auth.server";

export const Route = createFileRoute("/api/v1/messages/messages/$id/convert-task")({
  server: {
    handlers: {
      POST: async ({ params, request }) => {
        const user = await resolveChatUser(request);
        if (!user) {
          return json({ success: false, error: "Authentication required to convert tasks." }, 401);
        }

        const { id } = params;
        const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;

        const title = typeof body.title === "string" ? body.title : "";
        const assignedTo = typeof body.assignedTo === "string" ? body.assignedTo : undefined;
        const dueDate = typeof body.dueDate === "string" ? body.dueDate : undefined;
        const priority = body.priority as "low" | "medium" | "high" | undefined;
        let convId = typeof body.conversationId === "string" ? body.conversationId : "";

        if (!title.trim()) {
          return json({ success: false, error: "Task title is required." }, 400);
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
          const result = await ChatService.convertMessageToTask(convId, id, user, {
            title,
            assignedTo,
            dueDate,
            priority,
          });

          return json({ success: true, data: result }, 201);
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : "Failed to convert message to task";
          const status = msg.includes("Unauthorized") ? 403 : 400;
          return json({ success: false, error: msg }, status);
        }
      },
    },
  },
});
