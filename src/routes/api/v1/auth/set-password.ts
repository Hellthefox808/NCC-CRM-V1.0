import { createFileRoute } from "@tanstack/react-router";
import { getAdmin, json } from "@backend/lib/ncc-db";
import { hashPassword } from "@backend/lib/auth-otp.server";
import { queueEmailJob } from "@backend/services/queue/queue.service";
import crypto from "crypto";

export const Route = createFileRoute("/api/v1/auth/set-password")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = (await request.json().catch(() => ({}))) as {
          token?: string;
          password?: string;
        };

        const rawToken = body.token?.trim();
        const password = body.password;

        if (!rawToken || !password) {
          return json(
            { success: false, error: "Activation token and new password are required." },
            400,
          );
        }

        // Validate password against security rules
        const { strongPasswordSchema } = await import("@backend/lib/validation.schemas");
        const passValidation = strongPasswordSchema.safeParse(password);
        if (!passValidation.success) {
          return json(
            {
              success: false,
              error:
                passValidation.error.issues[0]?.message ||
                "Password does not meet security requirements.",
              code: "WEAK_PASSWORD",
            },
            400,
          );
        }

        try {
          const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
          const admin = await getAdmin();
          const now = new Date().toISOString();

          // 1. Try account_activation_tokens table first
          const { data: tokRecord } = await admin
            .from("account_activation_tokens")
            .select("*")
            .eq("token_hash", tokenHash)
            .maybeSingle();

          let userIdentifier: string = "";
          let userEmail: string = "";
          let cadetUserId: string | null = null;

          if (tokRecord) {
            if (tokRecord.used_at) {
              return json(
                {
                  success: false,
                  error: "This activation link has already been used.",
                  code: "TOKEN_ALREADY_USED",
                },
                400,
              );
            }
            if (new Date(tokRecord.expires_at) < new Date()) {
              return json(
                {
                  success: false,
                  error: "This activation link has expired.",
                  code: "TOKEN_EXPIRED",
                },
                400,
              );
            }

            const { data: user } = await admin
              .from("cadet_users")
              .select("*")
              .eq("id", tokRecord.user_id)
              .maybeSingle();

            if (user) {
              cadetUserId = user.id;
              userIdentifier = user.cadet_id || user.email;
              userEmail = user.email;
            }

            // Mark token as used
            await admin
              .from("account_activation_tokens")
              .update({ used_at: now })
              .eq("id", tokRecord.id);
          } else {
            // 2. Fallback to auth_otp_codes tokens
            const { consumeActivationToken } = await import("@backend/lib/auth-otp.server");
            const consumeResult = await consumeActivationToken(rawToken);
            if (!consumeResult.ok) {
              return json(
                {
                  success: false,
                  error: consumeResult.error || "Invalid or expired activation link.",
                  code: consumeResult.code || "INVALID_TOKEN",
                },
                400,
              );
            }
            userIdentifier = consumeResult.identifier || "";
          }

          if (!userIdentifier) {
            return json(
              { success: false, error: "Target user account identifier not found." },
              404,
            );
          }

          // Generate salted scrypt hash
          const saltedHash = await hashPassword(password, userIdentifier);

          // Update app_credentials
          const { data: cred } = await admin
            .from("app_credentials")
            .select("email, role")
            .eq("identifier", userIdentifier)
            .maybeSingle();

          userEmail =
            userEmail || cred?.email || (userIdentifier.includes("@") ? userIdentifier : "");

          await admin.from("app_credentials").upsert(
            {
              identifier: userIdentifier,
              email: userEmail,
              password_hash: saltedHash,
              role: cred?.role || "CADET",
              updated_at: now,
            },
            { onConflict: "identifier" },
          );

          // If linked cadet_users row exists, activate account
          if (cadetUserId) {
            await admin
              .from("cadet_users")
              .update({
                password_hash: saltedHash,
                account_status: "ACTIVE",
                activated_at: now,
                updated_at: now,
              })
              .eq("id", cadetUserId);

            await admin.from("onboarding_progress").upsert(
              {
                user_id: cadetUserId,
                profile_completed: false,
                contact_verified: true,
                documents_verified: true,
                declaration_accepted: false,
                orientation_completed: false,
                onboarding_completed: false,
                updated_at: now,
              },
              { onConflict: "user_id" },
            );
          }

          // Send confirmation email
          if (userEmail) {
            const { mailer } = await import("@backend/services/mail/mailer");
            await mailer.sendPasswordChanged({
              recipient: userEmail,
              username: userIdentifier.toUpperCase(),
              timestamp: new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
            });
          }

          // Audit log
          await admin.from("audit_logs").insert({
            action: "SET_PORTAL_PASSWORD",
            performed_by: userIdentifier,
            target_id: userIdentifier,
            details: { identifier: userIdentifier },
          });

          return json({
            success: true,
            message:
              "Account activated / password set successfully. You can now sign in using your username and password.",
            data: {
              identifier: userIdentifier,
              accountStatus: "ACTIVE",
            },
          });
        } catch (err: any) {
          console.error("[Set Password Error]", err);
          return json(
            {
              success: false,
              error: err?.message || "Failed to set password and activate account",
            },
            500,
          );
        }
      },
    },
  },
});
