import { createFileRoute } from "@tanstack/react-router";
import { getAdmin, json } from "@backend/lib/ncc-db";
import { requireCadetSession } from "@backend/lib/cadet-registry.server";

interface CadetUserRecord {
  id: string;
  cadet_id: string;
  email: string;
  account_status: string;
}

interface OnboardingProgressRecord {
  user_id: string;
  profile_completed: boolean;
  contact_verified: boolean;
  documents_verified: boolean;
  declaration_accepted: boolean;
  orientation_completed: boolean;
  onboarding_completed: boolean;
  updated_at: string;
}

export const Route = createFileRoute("/api/v1/onboarding")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const gate = await requireCadetSession(request);
        if (!gate.ok) return json({ success: false, error: gate.error }, gate.status);

        try {
          const admin = await getAdmin();
          const db = admin as unknown as {
            from: (table: string) => {
              select: (cols: string) => {
                or: (clause: string) => {
                  maybeSingle: () => Promise<{ data: CadetUserRecord | null }>;
                };
                eq: (
                  col: string,
                  val: string,
                ) => {
                  maybeSingle: () => Promise<{ data: OnboardingProgressRecord | null }>;
                };
              };
            };
          };

          const cadetId = gate.session?.cadetId || gate.enrollmentId || "";
          const { data: user } = await db
            .from("cadet_users")
            .select("id, cadet_id, email, account_status")
            .or(`cadet_id.eq.${cadetId},email.eq.${cadetId}`)
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

          const { data: progress } = await db
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
        } catch (err: unknown) {
          const errorMessage =
            err instanceof Error ? err.message : "Failed to fetch onboarding progress";
          console.error("[Get Onboarding Error]", err);
          return json({ success: false, error: errorMessage }, 500);
        }
      },
    },
  },
});
