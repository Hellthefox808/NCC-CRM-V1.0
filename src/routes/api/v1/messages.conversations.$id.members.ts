import { createFileRoute } from "@tanstack/react-router";
import { json } from "@backend/lib/ncc-db";
import { ChatService, type MemberRole } from "@backend/services/messaging/chat.service";
import { resolveChatUser } from "@backend/lib/chat-auth.server";

export const Route = createFileRoute("/api/v1/messages/conversations/$id/members")({
  server: {
    handlers: {
      POST: async ({ params, request }) => {
        const user = await resolveChatUser(request);
        if (!user) {
          return json({ success: false, error: "Authentication required." }, 401);
        }

        const { id } = params;
        const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;

        const targetId = typeof body.userId === "string" ? body.userId : "";
        const targetName = typeof body.name === "string" ? body.name : `Cadet (${targetId})`;
        const targetRole = typeof body.role === "string" ? body.role : "CADET";
        const memberRole = body.memberRole as MemberRole | undefined;

        if (!targetId) {
          return json({ success: false, error: "userId is required to add member." }, 400);
        }

        try {
          const member = await ChatService.addGroupMember(
            id,
            { id: user.id, role: user.role },
            { id: targetId, name: targetName, role: targetRole, memberRole },
          );
          return json({ success: true, data: { member } }, 201);
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : "Failed to add member";
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
        const queryUserId = url.searchParams.get("userId");
        const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
        const targetUserId =
          queryUserId || (typeof body.userId === "string" ? body.userId : user.id);

        try {
          const res = await ChatService.removeGroupMember(
            id,
            { id: user.id, role: user.role },
            targetUserId,
          );
          return json({ success: true, data: res });
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : "Failed to remove member";
          const status = msg.includes("Unauthorized") ? 403 : 400;
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
        const targetUserId = typeof body.userId === "string" ? body.userId : "";
        const newRole = body.memberRole as MemberRole | undefined;

        if (!targetUserId || !newRole) {
          return json({ success: false, error: "userId and memberRole are required." }, 400);
        }

        try {
          const updated = await ChatService.updateMemberRole(
            id,
            { id: user.id, role: user.role },
            targetUserId,
            newRole,
          );
          return json({ success: true, data: { member: updated } });
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : "Failed to update member role";
          const status = msg.includes("Unauthorized") ? 403 : 400;
          return json({ success: false, error: msg }, status);
        }
      },
    },
  },
});
