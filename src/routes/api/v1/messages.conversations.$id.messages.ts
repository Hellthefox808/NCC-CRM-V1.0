import { createFileRoute } from "@tanstack/react-router";
import { json } from "@backend/lib/ncc-db";
import {
  ChatService,
  type MessageType,
  type CrmCardPayload,
  type AttachmentItem,
} from "@backend/services/messaging/chat.service";
import { resolveChatUser } from "@backend/lib/chat-auth.server";

export const Route = createFileRoute("/api/v1/messages/conversations/$id/messages")({
  server: {
    handlers: {
      GET: async ({ params, request }) => {
        const user = await resolveChatUser(request);
        if (!user) {
          return json({ success: false, error: "Authentication required." }, 401);
        }

        const { id } = params;
        const url = new URL(request.url);
        const limit = Number(url.searchParams.get("limit")) || 50;
        const beforeId = url.searchParams.get("beforeId") || undefined;

        try {
          const messages = await ChatService.listMessages(id, user.id, { limit, beforeId });
          return json({
            success: true,
            data: { messages, count: messages.length },
          });
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : "Failed to load messages";
          const status = msg.includes("Unauthorized") ? 403 : 404;
          return json({ success: false, error: msg }, status);
        }
      },

      POST: async ({ params, request }) => {
        const user = await resolveChatUser(request);
        if (!user) {
          return json({ success: false, error: "Authentication required to send messages." }, 401);
        }

        const { id } = params;
        const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;

        const content = typeof body.content === "string" ? body.content : "";
        const replyToId = typeof body.replyToId === "string" ? body.replyToId : undefined;
        const attachments = Array.isArray(body.attachments)
          ? (body.attachments as AttachmentItem[])
          : undefined;
        const messageType = body.messageType as MessageType | undefined;
        const crmCard = body.crmCard as CrmCardPayload | undefined;

        try {
          const message = await ChatService.sendMessage(id, user, {
            content,
            replyToId,
            attachments,
            messageType,
            crmCard,
          });

          return json({ success: true, data: { message } }, 201);
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : "Failed to send message";
          const status = msg.includes("Unauthorized") ? 403 : 400;
          return json({ success: false, error: msg }, status);
        }
      },
    },
  },
});
