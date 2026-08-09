import { createFileRoute } from "@tanstack/react-router";
import { bearerToken, getAdmin, json } from "@backend/lib/ncc-db";

export const Route = createFileRoute("/api/v1/auth/logout")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const cookieHeader = request.headers.get("cookie") || "";
        const match = cookieHeader.match(/ncc_session=([^;]+)/);
        const cookieToken = match ? match[1] : null;

        const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
        const token =
          cookieToken ||
          (typeof body.token === "string" ? body.token : null) ||
          bearerToken(request);

        if (token) {
          try {
            const admin = await getAdmin();
            await admin.from("app_sessions").delete().eq("token", token);
          } catch {
            /* token already terminated */
          }
        }

        const expiredCookie = `ncc_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Secure`;

        return json(
          { success: true, message: "Session terminated successfully." },
          200,
          { "Set-Cookie": expiredCookie },
        );
      },
    },
  },
});
