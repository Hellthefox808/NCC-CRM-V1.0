import { createFileRoute } from "@tanstack/react-router";
import { bearerToken, getAdmin, json } from "@backend/lib/ncc-db";
import { getOrSetCache } from "@backend/lib/cache.server";
import { invalidateSessionCache } from "@backend/lib/cadet-registry.server";

export const Route = createFileRoute("/api/v1/auth/me")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const token = bearerToken(request);
        if (!token) {
          return json({ success: false, error: "Unauthorized.", code: "UNAUTHORIZED" }, 401);
        }

        try {
          const session = await getOrSetCache(`ncc:session:${token}`, 300, async () => {
            const admin = await getAdmin();
            const { data } = await admin
              .from("app_sessions")
              .select("*")
              .eq("token", token)
              .maybeSingle();
            return data ?? null;
          });

          if (!session) {
            return json({ success: false, error: "Session not found.", code: "UNAUTHORIZED" }, 401);
          }

          if (Date.now() > new Date(session.expires_at).getTime()) {
            const admin = await getAdmin();
            await admin.from("app_sessions").delete().eq("id", session.id);
            await invalidateSessionCache(token);
            return json(
              { success: false, error: "Session expired.", code: "SESSION_EXPIRED" },
              401,
            );
          }

          return json({
            success: true,
            data: {
              userType: session.role === "admin" ? "admin" : "cadet",
              user: {
                id: session.id,
                name: session.display_name || session.email,
                email: session.email,
                role: session.role,
              },
              expiresAt: new Date(session.expires_at).toISOString(),
            },
          });
        } catch {
          return json({ success: false, error: "Database error" }, 500);
        }
      },
    },
  },
});
