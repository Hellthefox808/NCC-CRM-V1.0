import { createFileRoute } from "@tanstack/react-router";
import { json } from "@backend/lib/ncc-db";
import { ChatService, chatStore } from "@backend/services/messaging/chat.service";
import { resolveChatUser } from "@backend/lib/chat-auth.server";

export const Route = createFileRoute("/api/v1/messages/conversations/$id")({
  server: {
    handlers: {
      GET: async ({ params, request }) => {
        const user = await resolveChatUser(request);
        if (!user) {
          return json({ success: false, error: "Authentication required." }, 401);
        }

        const { id } = params;
        try {
          const data = await ChatService.getConversation(id, user.id);
          return json({ success: true, data });
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : "Failed to get conversation";
          const status = msg.includes("Unauthorized") ? 403 : 404;
          return json({ success: false, error: msg }, status);
        }
      },

      PATCH: async ({ params, request }) => {
        const user = await resolveChatUser(request);
        if (!user) {
          return json({ success: false, error: "Authentication required." }, 401);
        }

        const { id } = params;
        const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;

        const conv = chatStore.conversations.get(id);
        if (!conv) {
          return json({ success: false, error: "Conversation not found." }, 404);
        }

        const members = chatStore.members.get(id) || [];
        const member = members.find((m) => m.userId === user.id);

        if (!member) {
          return json({ success: false, error: "Unauthorized." }, 403);
        }

        // Handle Pin/Mute user preferences
        if (typeof body.isPinned === "boolean") {
          member.isPinned = body.isPinned;
        }
        if (typeof body.isMuted === "boolean") {
          member.isMuted = body.isMuted;
        }

        // Handle Metadata updates (only creator or admin)
        const isManager =
          member.memberRole === "creator" || member.memberRole === "admin" || user.role === "ADMIN";
        if (body.title && typeof body.title === "string" && isManager) {
          conv.title = body.title.trim();
        }
        if (body.description !== undefined && isManager) {
          conv.description = String(body.description).trim();
        }
        if (typeof body.isArchived === "boolean" && isManager) {
          conv.isArchived = body.isArchived;
        }

        conv.updatedAt = new Date().toISOString();
        return json({
          success: true,
          data: {
            conversation: conv,
            membership: {
              isPinned: member.isPinned,
              isMuted: member.isMuted,
              memberRole: member.memberRole,
            },
          },
        });
      },
    },
  },
});
