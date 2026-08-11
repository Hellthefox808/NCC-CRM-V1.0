import { createFileRoute } from "@tanstack/react-router";
import { getAdmin, json } from "@backend/lib/ncc-db";
import { requireCadetSession } from "@backend/lib/cadet-registry.server";

export const Route = createFileRoute("/api/v1/onboarding")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const gate = await requireCadetSession(request);
        if (!gate.ok) return json({ success: false, error: gate.error }, gate.status);

        try {
          const admin = await getAdmin();

          // Fetch user record
          const { data: user } = await admin
            .from("cadet_users")
            .select("id, cadet_id, email, account_status")
            .eq("email", gate.session?.cadetId || "")
            .maybeSingle();

          const userId = user?.id;

          if (!userId) {
            // Fallback default checklist state
            return json({
              success: true,
              data: {
                progressPercent: 40,
                checklist: {
                  profileCompleted: false,
                  contactVerified: true,
                  documentsVerified: true,
                  declarationAccepted: false,
                  orientationCompleted: false,
                  onboardingCompleted: false,
                },
              },
            });
          }

          const { data: progress } = await admin
            .from("onboarding_progress")
            .select("*")
            .eq("user_id", userId)
            .maybeSingle();

          const items = [
            progress?.profile_completed,
            progress?.contact_verified ?? true,
            progress?.documents_verified ?? true,
            progress?.declaration_accepted,
            progress?.orientation_completed,
          ];

          const completedCount = items.filter(Boolean).length;
          const progressPercent = Math.round((completedCount / items.length) * 100);

          return json({
            success: true,
            data: {
              progressPercent,
              checklist: {
                profileCompleted: progress?.profile_completed ?? false,
                contactVerified: progress?.contact_verified ?? true,
                documentsVerified: progress?.documents_verified ?? true,
                declarationAccepted: progress?.declaration_accepted ?? false,
                orientationCompleted: progress?.orientation_completed ?? false,
                onboardingCompleted: progress?.onboarding_completed ?? false,
              },
            },
          });
        } catch (err: any) {
          console.error("[Get Onboarding Error]", err);
          return json(
            { success: false, error: err?.message || "Failed to fetch onboarding progress" },
            500,
          );
        }
      },
    },
  },
});
