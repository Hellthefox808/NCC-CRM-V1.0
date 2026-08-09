import { createFileRoute } from "@tanstack/react-router";
import { getAdmin, json } from "@backend/lib/ncc-db";

export const Route = createFileRoute("/api/v1/auth/login")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
        const { userType, username, password, email } = body as Record<string, string | undefined>;

        if (!userType || (!username && !email) || !password) {
          return json(
            {
              success: false,
              error: "Invalid request payload. Credentials required.",
              code: "AUTH_VALIDATION_FAILED",
            },
            400,
          );
        }

        let authenticated = false;
        let userName = "";
        let userEmail: string = email || username || "";
        let role = "cadet";

        let cadetEnrollmentId: string | null = null;
        let cadetRecord: Record<string, unknown> | null = null;

        // If this identifier has reset its portal password, that stored password
        // is authoritative. Accounts that never reset keep the legacy path.
        const { checkPortalPassword } = await import("@backend/lib/auth-otp.server");
        const storedMatch = await checkPortalPassword(
          String(username || email || ""),
          String(password),
        );
        if (storedMatch === false) {
          return json(
            {
              success: false,
              error: "Invalid email, username, or password.",
              code: "INVALID_CREDENTIALS",
            },
            401,
          );
        }

        if (userType === "admin") {
          if (
            storedMatch === true ||
            ((username === "admin" || email === "admin@sbu.ac.in" || username === "ano.sbu") &&
              (password === "admin123" || password === "ncc19jhr"))
          ) {
            authenticated = true;
            userName = "Associate NCC Officer (ANO)";
            userEmail = "admin@sbu.ac.in";
            role = "admin";
          }
        } else if (userType === "cadet") {
          if (storedMatch === true || String(password).length >= 4) {
            authenticated = true;
            userName = username || email || "SBU Cadet";
            role = "cadet";

            // Link the session to the cadet's row in the unit register when the
            // identifier matches an enrolled cadet (SBU ID, enrollment ID, email, mobile).
            const { findCadetByIdentifier } = await import("@backend/lib/cadet-registry.server");
            cadetRecord = await findCadetByIdentifier(String(username || email || ""));
            if (cadetRecord) {
              cadetEnrollmentId = (cadetRecord["enrollment_id"] as string) || null;
              userName = (cadetRecord["full_name"] as string) || userName;
              userEmail = (cadetRecord["email"] as string) || userEmail;
            }
          }
        }

        if (!authenticated) {
          return json(
            {
              success: false,
              error: "Invalid email, username, or password.",
              code: "INVALID_CREDENTIALS",
            },
            401,
          );
        }

        try {
          const admin = await getAdmin();
          const randomBytes = new Uint8Array(32);
          crypto.getRandomValues(randomBytes);
          const token = `sess_${Array.from(randomBytes)
            .map((b) => b.toString(16).padStart(2, "0"))
            .join("")}`;
          const expiresAt = new Date(Date.now() + 8 * 60 * 60 * 1000);

          const { data, error } = await admin
            .from("app_sessions")
            .insert({
              token,
              email: userEmail,
              display_name: userName,
              role,
              cadet_enrollment_id: cadetEnrollmentId,
              expires_at: expiresAt.toISOString(),
            })
            .select("id")
            .single();

          if (error) throw error;

          const cookieHeader = `ncc_session=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${8 * 3600}; Secure`;

          return json(
            {
              success: true,
              message: "Authentication successful.",
              data: {
                token,
                userType,
                user: {
                  id: data.id,
                  name: userName,
                  email: userEmail,
                  role: userType,
                  enrollmentId: cadetEnrollmentId,
                  registered: Boolean(cadetRecord),
                },
                expiresAt: expiresAt.toISOString(),
              },
            },
            200,
            { "Set-Cookie": cookieHeader },
          );
        } catch {
          return json({ success: false, error: "Authentication system error. Please try again." }, 500);
        }
      },
    },
  },
});
