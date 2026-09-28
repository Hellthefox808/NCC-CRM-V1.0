import { createFileRoute } from "@tanstack/react-router";
import { getAdmin, json } from "@backend/lib/ncc-db";
import { requireCadetSession } from "@backend/lib/cadet-registry.server";
import {
  onboardingBatchSchema,
  validateRequestBody,
  extractClientIp,
} from "@backend/lib/validation.schemas";

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
  completed_at?: string | null;
  updated_at: string;
}

// In-memory fallback map for test/offline resilience
const memoryOnboardingStore = new Map<string, OnboardingProgressRecord>();

function getNextActionableStep(checklist: {
  profileCompleted: boolean;
  contactVerified: boolean;
  documentsVerified: boolean;
  declarationAccepted: boolean;
  orientationCompleted: boolean;
}): { step: string; title: string; route: string } | null {
  if (!checklist.profileCompleted) {
    return { step: "profile_completed", title: "Complete Personal Profile", route: "/profile" };
  }
  if (!checklist.contactVerified) {
    return { step: "contact_verified", title: "Verify Contact (Email & Phone)", route: "/profile" };
  }
  if (!checklist.documentsVerified) {
    return { step: "documents_verified", title: "Upload & Verify Documents", route: "/documents" };
  }
  if (!checklist.declarationAccepted) {
    return {
      step: "declaration_accepted",
      title: "Accept NCC Cadet Declaration",
      route: "/onboarding/declaration",
    };
  }
  if (!checklist.orientationCompleted) {
    return {
      step: "orientation_completed",
      title: "Complete Cadet Orientation",
      route: "/onboarding/orientation",
    };
  }
  return null;
}

export const Route = createFileRoute("/api/v1/onboarding")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const gate = await requireCadetSession(request);
        if (!gate.ok) return json({ success: false, error: gate.error }, gate.status);

        const rawCadetId = gate.session?.cadetId || gate.enrollmentId || "";
        const { sanitizePostgrestQuery } = await import("@backend/lib/ncc-db");
        const cadetId = sanitizePostgrestQuery(rawCadetId);

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

          const { data: user } = await db
            .from("cadet_users")
            .select("id, cadet_id, email, account_status")
            .or(`cadet_id.eq.${cadetId},email.eq.${cadetId}`)
            .maybeSingle();

          const userId = user?.id || cadetId;
          const { data: progress } = await db
            .from("onboarding_progress")
            .select("*")
            .eq("user_id", userId)
            .maybeSingle();

          const mem = memoryOnboardingStore.get(userId);
          const resolved = progress || mem;

          const checklist = {
            profileCompleted: resolved?.profile_completed ?? false,
            contactVerified: resolved?.contact_verified ?? true,
            documentsVerified: resolved?.documents_verified ?? true,
            declarationAccepted: resolved?.declaration_accepted ?? false,
            orientationCompleted: resolved?.orientation_completed ?? false,
            onboardingCompleted: resolved?.onboarding_completed ?? false,
          };

          const items = [
            checklist.profileCompleted,
            checklist.contactVerified,
            checklist.documentsVerified,
            checklist.declarationAccepted,
            checklist.orientationCompleted,
          ];

          const completedCount = items.filter(Boolean).length;
          const progressPercent = Math.round((completedCount / items.length) * 100);
          checklist.onboardingCompleted = completedCount === items.length;

          return json({
            success: true,
            data: {
              progressPercent,
              completedCount,
              totalSteps: items.length,
              checklist,
              nextStep: getNextActionableStep(checklist),
              accountStatus:
                user?.account_status ||
                (checklist.onboardingCompleted ? "ACTIVE" : "PENDING_ONBOARDING"),
            },
          });
        } catch {
          // Graceful offline fallback
          const mem = memoryOnboardingStore.get(cadetId);
          const checklist = {
            profileCompleted: mem?.profile_completed ?? false,
            contactVerified: mem?.contact_verified ?? true,
            documentsVerified: mem?.documents_verified ?? true,
            declarationAccepted: mem?.declaration_accepted ?? false,
            orientationCompleted: mem?.orientation_completed ?? false,
            onboardingCompleted: mem?.onboarding_completed ?? false,
          };
          const items = [
            checklist.profileCompleted,
            checklist.contactVerified,
            checklist.documentsVerified,
            checklist.declarationAccepted,
            checklist.orientationCompleted,
          ];
          const completedCount = items.filter(Boolean).length;
          const progressPercent = Math.round((completedCount / items.length) * 100);
          checklist.onboardingCompleted = completedCount === items.length;

          return json({
            success: true,
            data: {
              progressPercent,
              completedCount,
              totalSteps: items.length,
              checklist,
              nextStep: getNextActionableStep(checklist),
              accountStatus: checklist.onboardingCompleted ? "ACTIVE" : "PENDING_ONBOARDING",
            },
          });
        }
      },

      PATCH: async ({ request }) => {
        const gate = await requireCadetSession(request);
        if (!gate.ok) return json({ success: false, error: gate.error }, gate.status);

        const rawBody = await request.json().catch(() => ({}));
        const validation = validateRequestBody(
          onboardingBatchSchema,
          rawBody,
          "Onboarding batch update",
        );
        if (!validation.success) {
          return json(
            {
              success: false,
              error: validation.error,
              code: "VALIDATION_FAILED",
              details: validation.issues.map((i) => ({
                field: i.path.join("."),
                message: i.message,
              })),
            },
            400,
          );
        }

        const rawCadetId = gate.session?.cadetId || gate.enrollmentId || "";
        const { sanitizePostgrestQuery } = await import("@backend/lib/ncc-db");
        const cadetId = sanitizePostgrestQuery(rawCadetId);
        const clientIp = extractClientIp(request);
        const { steps } = validation.data;

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
              upsert: (
                record: Record<string, unknown>,
                opts: { onConflict: string },
              ) => {
                select: (cols: string) => {
                  single: () => Promise<{
                    data: OnboardingProgressRecord | null;
                    error: Error | null;
                  }>;
                };
              };
              update: (fields: Record<string, unknown>) => {
                eq: (col: string, val: string) => Promise<unknown>;
              };
            };
          };

          const { data: user } = await db
            .from("cadet_users")
            .select("id, cadet_id, email, account_status")
            .or(`cadet_id.eq.${cadetId},email.eq.${cadetId}`)
            .maybeSingle();

          const userId = user?.id || cadetId;
          const { data: current } = await db
            .from("onboarding_progress")
            .select("*")
            .eq("user_id", userId)
            .maybeSingle();

          const mem = memoryOnboardingStore.get(userId);
          const base = current || mem;

          const updatedState: Record<string, unknown> = {
            user_id: userId,
            profile_completed: steps.profile_completed ?? base?.profile_completed ?? false,
            contact_verified: steps.contact_verified ?? base?.contact_verified ?? true,
            documents_verified: steps.documents_verified ?? base?.documents_verified ?? true,
            declaration_accepted: steps.declaration_accepted ?? base?.declaration_accepted ?? false,
            orientation_completed:
              steps.orientation_completed ?? base?.orientation_completed ?? false,
            updated_at: new Date().toISOString(),
          };

          const allDone =
            Boolean(updatedState.profile_completed) &&
            Boolean(updatedState.contact_verified) &&
            Boolean(updatedState.documents_verified) &&
            Boolean(updatedState.declaration_accepted) &&
            Boolean(updatedState.orientation_completed);

          if (allDone) {
            updatedState.onboarding_completed = true;
            updatedState.completed_at = new Date().toISOString();
          }

          // Save to memory store
          memoryOnboardingStore.set(userId, updatedState as unknown as OnboardingProgressRecord);

          // Save to DB
          await db
            .from("onboarding_progress")
            .upsert(updatedState, { onConflict: "user_id" })
            .select("*")
            .single();

          // If fully onboarded, activate user and dispatch welcome email
          if (allDone && user?.id) {
            await db
              .from("cadet_users")
              .update({ account_status: "ACTIVE", updated_at: new Date().toISOString() })
              .eq("id", user.id);

            const { queueEmailJob } = await import("@backend/services/queue/queue.service");
            const { findCadetByIdentifier } = await import("@backend/lib/cadet-registry.server");
            const cadet = await findCadetByIdentifier(cadetId);
            const recipient = cadet?.email || user?.email || "";
            if (recipient && recipient.includes("@")) {
              await queueEmailJob("sendOnboardingWelcome", recipient, {
                cadetName: cadet?.full_name || cadetId,
                cadetId: cadet?.enrollment_id || cadetId,
                unitName: "19 JHR BN NCC",
              });
            }
          }

          const { logAuditEvent } = await import("@backend/lib/audit-log.server");
          logAuditEvent({
            actor: cadetId,
            action: allDone ? "onboarding_completed" : "onboarding_batch_updated",
            target: "onboarding_progress",
            ip: clientIp,
            metadata: { updatedSteps: Object.keys(steps), allDone },
          });

          const items = [
            updatedState.profile_completed,
            updatedState.contact_verified,
            updatedState.documents_verified,
            updatedState.declaration_accepted,
            updatedState.orientation_completed,
          ];
          const completedCount = items.filter(Boolean).length;
          const progressPercent = Math.round((completedCount / items.length) * 100);

          const checklist = {
            profileCompleted: Boolean(updatedState.profile_completed),
            contactVerified: Boolean(updatedState.contact_verified),
            documentsVerified: Boolean(updatedState.documents_verified),
            declarationAccepted: Boolean(updatedState.declaration_accepted),
            orientationCompleted: Boolean(updatedState.orientation_completed),
            onboardingCompleted: allDone,
          };

          return json({
            success: true,
            message: allDone
              ? "Congratulations! Onboarding completed and account activated."
              : "Onboarding progress updated.",
            data: {
              progressPercent,
              completedCount,
              totalSteps: items.length,
              checklist,
              nextStep: getNextActionableStep(checklist),
              accountStatus: allDone ? "ACTIVE" : user?.account_status || "PENDING_ONBOARDING",
            },
          });
        } catch (err: unknown) {
          const errorMessage =
            err instanceof Error ? err.message : "Failed to update onboarding progress";
          return json({ success: false, error: errorMessage }, 500);
        }
      },
    },
  },
});
