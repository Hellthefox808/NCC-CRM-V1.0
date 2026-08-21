import { getAdmin } from "../../lib/ncc-db.ts";
import { mailer } from "../mail/mailer.ts";
import type {
  SendOtpPayload,
  SendApplicationAcknowledgementPayload,
  SendApplicationApprovedPayload,
  SendApplicationRejectedPayload,
  SendCorrectionRequiredPayload,
  SendOnboardingWelcomePayload,
  SendWelcomeEmailPayload,
  SendEnrollmentStatusPayload,
  SendCalendarInvitationPayload,
  SendEventCreatedPayload,
  SendEventUpdatedPayload,
  SendEventCancelledPayload,
  SendReminderPayload,
  SendImportantNoticePayload,
  SendAttendanceAlertPayload,
  SendPasswordResetPayload,
} from "../mail/types.ts";

export interface QueueJobPayload {
  jobType: string;
  recipient: string;
  payload: Record<string, unknown>;
  scheduledAt?: string;
}

/** Enqueues an email job into the database queue without blocking HTTP requests. */
export async function queueEmailJob(
  jobType: string,
  recipient: string,
  payload: Record<string, unknown>,
  scheduledAt?: string,
): Promise<{ success: boolean; jobId?: string; error?: string }> {
  try {
    const admin = await getAdmin();
    const { data, error } = await admin
      .from("email_jobs")
      .insert({
        job_type: jobType,
        recipient,
        payload,
        status: "PENDING",
        scheduled_at: scheduledAt || new Date().toISOString(),
      })
      .select("id")
      .single();

    if (error) throw error;

    // Trigger async non-blocking execution cycle
    setTimeout(() => {
      processPendingEmailJobs().catch((err) => console.error("[Background Job Queue Error]", err));
    }, 50);

    return { success: true, jobId: data.id };
  } catch (err: unknown) {
    console.error("[Queue Enqueue Error]", err);
    const errorMsg = err instanceof Error ? err.message : "Failed to enqueue email job";
    return { success: false, error: errorMsg };
  }
}

/** Processes pending email jobs from the database queue. */
export async function processPendingEmailJobs(): Promise<number> {
  try {
    const admin = await getAdmin();

    // Fetch up to 10 pending jobs scheduled for now or earlier
    const { data: jobs, error } = await admin
      .from("email_jobs")
      .select("*")
      .eq("status", "PENDING")
      .lte("scheduled_at", new Date().toISOString())
      .limit(10);

    if (error || !jobs || jobs.length === 0) return 0;

    let processedCount = 0;

    for (const job of jobs) {
      // Mark as PROCESSING
      await admin
        .from("email_jobs")
        .update({
          status: "PROCESSING",
          attempts: (job.attempts || 0) + 1,
          processed_at: new Date().toISOString(),
        })
        .eq("id", job.id);

      let sendResult: { success: boolean; messageId?: string; error?: string };

      try {
        switch (job.job_type) {
          case "sendOtp":
            sendResult = await mailer.sendOtp(job.payload as unknown as SendOtpPayload);
            break;
          case "sendApplicationAcknowledgement":
            sendResult = await mailer.sendApplicationAcknowledgement(
              job.payload as unknown as SendApplicationAcknowledgementPayload,
            );
            break;
          case "sendApplicationApproved":
            sendResult = await mailer.sendApplicationApproved(
              job.payload as unknown as SendApplicationApprovedPayload,
            );
            break;
          case "sendApplicationRejected":
            sendResult = await mailer.sendApplicationRejected(
              job.payload as unknown as SendApplicationRejectedPayload,
            );
            break;
          case "sendCorrectionRequired":
            sendResult = await mailer.sendCorrectionRequired(
              job.payload as unknown as SendCorrectionRequiredPayload,
            );
            break;
          case "sendOnboardingWelcome":
            sendResult = await mailer.sendOnboardingWelcome(
              job.payload as unknown as SendOnboardingWelcomePayload,
            );
            break;
          case "sendWelcomeEmail":
            sendResult = await mailer.sendWelcomeEmail(
              job.payload as unknown as SendWelcomeEmailPayload,
            );
            break;
          case "sendEnrollmentStatus":
            sendResult = await mailer.sendEnrollmentStatus(
              job.payload as unknown as SendEnrollmentStatusPayload,
            );
            break;
          case "sendCalendarInvitation":
            sendResult = await mailer.sendCalendarInvitation(
              job.payload as unknown as SendCalendarInvitationPayload,
            );
            break;
          case "sendEventCreated":
            sendResult = await mailer.sendEventCreated(
              job.payload as unknown as SendEventCreatedPayload,
            );
            break;
          case "sendEventUpdated":
            sendResult = await mailer.sendEventUpdated(
              job.payload as unknown as SendEventUpdatedPayload,
            );
            break;
          case "sendEventCancelled":
            sendResult = await mailer.sendEventCancelled(
              job.payload as unknown as SendEventCancelledPayload,
            );
            break;
          case "sendReminder":
            sendResult = await mailer.sendReminder(job.payload as unknown as SendReminderPayload);
            break;
          case "sendImportantNotice":
            sendResult = await mailer.sendImportantNotice(
              job.payload as unknown as SendImportantNoticePayload,
            );
            break;
          case "sendAttendanceAlert":
            sendResult = await mailer.sendAttendanceAlert(
              job.payload as unknown as SendAttendanceAlertPayload,
            );
            break;
          case "sendPasswordReset":
            sendResult = await mailer.sendPasswordReset(
              job.payload as unknown as SendPasswordResetPayload,
            );
            break;
          default:
            sendResult = { success: false, error: `Unknown job type: ${job.job_type}` };
        }
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : "Execution error";
        sendResult = { success: false, error: errorMsg };
      }

      if (sendResult.success) {
        await admin
          .from("email_jobs")
          .update({
            status: "COMPLETED",
            processed_at: new Date().toISOString(),
          })
          .eq("id", job.id);

        // Record audit delivery log
        await admin.from("email_delivery_logs").insert({
          email_job_id: job.id,
          recipient: job.recipient,
          subject: job.payload?.subject || job.job_type,
          status: "SENT",
          smtp_message_id: sendResult.messageId || null,
        });

        processedCount++;
      } else {
        const isMaxAttempts = (job.attempts || 0) + 1 >= 3;
        await admin
          .from("email_jobs")
          .update({
            status: isMaxAttempts ? "FAILED" : "PENDING",
            error_message: sendResult.error,
          })
          .eq("id", job.id);

        await admin.from("email_delivery_logs").insert({
          email_job_id: job.id,
          recipient: job.recipient,
          subject: job.payload?.subject || job.job_type,
          status: "FAILED",
          error_details: sendResult.error,
        });
      }
    }

    return processedCount;
  } catch (err) {
    console.error("[Background Email Processor Exception]", err);
    return 0;
  }
}
