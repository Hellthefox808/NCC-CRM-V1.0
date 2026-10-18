import { createFileRoute } from "@tanstack/react-router";
import { json } from "@backend/lib/ncc-db";
import { ChatService } from "@backend/services/messaging/chat.service";
import { resolveChatUser } from "@backend/lib/chat-auth.server";

export const Route = createFileRoute("/api/v1/messages/contacts")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const user = await resolveChatUser(request);
        if (!user) {
          return json({ success: false, error: "Authentication required." }, 401);
        }

        try {
          const contacts = await ChatService.getEligibleContacts();
          return json({
            success: true,
            data: { contacts, count: contacts.length },
          });
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : "Failed to load contacts";
          return json({ success: false, error: msg }, 500);
        }
      },
    },
  },
});
