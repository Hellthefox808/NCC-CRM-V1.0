import { createFileRoute } from "@tanstack/react-router";
import { json } from "@backend/lib/ncc-db";
import { ChatService, type GroupType } from "@backend/services/messaging/chat.service";
import { resolveChatUser } from "@backend/lib/chat-auth.server";

export const Route = createFileRoute("/api/v1/messages/conversations")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const user = await resolveChatUser(request);
        if (!user) {
          return json(
            { success: false, error: "Authentication required to view conversations." },
            401,
          );
        }

        try {
          const conversations = await ChatService.listConversations(user.id);
          return json({
            success: true,
            data: { conversations, count: conversations.length },
          });
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : "Failed to list conversations";
          return json({ success: false, error: msg }, 500);
        }
      },

      POST: async ({ request }) => {
        const user = await resolveChatUser(request);
        if (!user) {
          return json(
            { success: false, error: "Authentication required to create a conversation." },
            401,
          );
        }

        const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
        const type = (body.type as string) || "group";

        try {
          if (type === "direct") {
            const recipientId = body.recipientId as string;
            const recipientName = (body.recipientName as string) || `Cadet (${recipientId})`;
            const recipientRole = (body.recipientRole as string) || "CADET";

            if (!recipientId) {
              return json(
                { success: false, error: "Recipient ID is required for direct messaging." },
                400,
              );
            }

            const conversation = await ChatService.createDirectConversation(user, {
              id: recipientId,
              name: recipientName,
              role: recipientRole,
            });

            return json({ success: true, data: { conversation } }, 201);
          } else {
            // Group or Official Channel Creation
            const title = body.title as string;
            const description = body.description as string | undefined;
            const groupType = (body.groupType as GroupType) || "general";
            const isOfficial = Boolean(body.isOfficial);
            const memberIds = Array.isArray(body.memberIds) ? (body.memberIds as string[]) : [];
            const crmResource = body.crmResource as { type: string; id: string } | undefined;

            const conversation = await ChatService.createGroupConversation(user, {
              title,
              description,
              groupType,
              isOfficial,
              memberIds,
              crmResource,
            });

            return json({ success: true, data: { conversation } }, 201);
          }
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : "Failed to create conversation";
          return json({ success: false, error: msg }, 400);
        }
      },
    },
  },
});
