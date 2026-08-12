import { createFileRoute } from "@tanstack/react-router";
import { getAdmin, json } from "@backend/lib/ncc-db";
import { issueActivationToken } from "@backend/lib/auth-otp.server";
import { mailer } from "@backend/services/mail/mailer";
import { checkRateLimitAsync } from "@backend/lib/rate-limiter.server";

export const Route = createFileRoute("/api/v1/auth/forgot-password")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = (await request.json().catch(() => ({}))) as { identifier?: string };
        const rawIdentifier = (body.identifier || "").trim().toLowerCase();

        // Rate limit check
        const ip = request.headers.get("x-forwarded-for") || "unknown";
        const isAllowed = await checkRateLimitAsync(`forgot_pass:${ip}`, 5, 300);
        if (!isAllowed) {
          return json(
            {
              success: false,
              error: "Too many password recovery requests. Please try again later.",
            },
            429,
          );
        }

        // Generic anti-enumeration response
        const genericSuccessMessage =
          "If an account matches the information provided, password recovery instructions will be sent to your registered email address.";

        if (!rawIdentifier) {
          return json({ success: true, message: genericSuccessMessage });
        }

        try {
          const admin = await getAdmin();

          // Search in app_credentials, cadet_users, or cadet_enrollments
          let targetEmail: string | null = null;
          let targetName: string = "Cadet";
          let accountIdentifier: string = rawIdentifier;

          const { data: cred } = await admin
            .from("app_credentials")
            .select("identifier, email")
            .or(`identifier.eq.${rawIdentifier},email.eq.${rawIdentifier}`)
            .maybeSingle();

          if (cred) {
            targetEmail = cred.email || (cred.identifier.includes("@") ? cred.identifier : null);
            accountIdentifier = cred.identifier;
          }

          if (!targetEmail) {
            const { data: user } = await admin
              .from("cadet_users")
              .select("cadet_id, email, application_id")
              .or(`cadet_id.eq.${rawIdentifier.toUpperCase()},email.eq.${rawIdentifier}`)
              .maybeSingle();

            if (user) {
              targetEmail = user.email;
              accountIdentifier = user.cadet_id || user.email;

              if (user.application_id) {
                const { data: app } = await admin
                  .from("cadet_enrollments")
                  .select("full_name")
                  .eq("id", user.application_id)
                  .maybeSingle();
                if (app?.full_name) targetName = app.full_name;
              }
            }
          }

          if (targetEmail) {
            const origin = new URL(request.url).origin;
            const { rawToken } = await issueActivationToken(
              accountIdentifier,
              targetEmail,
              "PASSWORD_RESET",
              30,
            );
            const resetLink = `${origin}/activate?token=${encodeURIComponent(rawToken)}&mode=reset`;

            await mailer.sendPasswordReset({
              recipient: targetEmail,
              recipientName: targetName,
              resetTokenOrLink: resetLink,
              expiresInMinutes: 30,
            });
          }

          return json({ success: true, message: genericSuccessMessage });
        } catch (err: any) {
          console.error("[Forgot Password Handler Error]", err);
          return json({ success: true, message: genericSuccessMessage });
        }
      },
    },
  },
});
