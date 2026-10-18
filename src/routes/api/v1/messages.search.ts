import { createFileRoute } from "@tanstack/react-router";
import { json } from "@backend/lib/ncc-db";
import { ChatService } from "@backend/services/messaging/chat.service";
import { resolveChatUser } from "@backend/lib/chat-auth.server";

export const Route = createFileRoute("/api/v1/messages/search")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const user = await resolveChatUser(request);
        if (!user) {
          return json({ success: false, error: "Authentication required." }, 401);
        }

        const url = new URL(request.url);
        const query = url.searchParams.get("q") || "";

        try {
          const results = await ChatService.searchMessages(user.id, query);
          return json({
            success: true,
            data: { messages: results, count: results.length },
          });
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : "Search failed";
          return json({ success: false, error: msg }, 500);
        }
      },
    },
  },
});
