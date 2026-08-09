import { createFileRoute } from "@tanstack/react-router";
import { handleAiChatRequest } from "@agent/services/ai-chat.service";

export const Route = createFileRoute("/api/v1/ai-chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        return handleAiChatRequest(request);
      },
    },
  },
});
