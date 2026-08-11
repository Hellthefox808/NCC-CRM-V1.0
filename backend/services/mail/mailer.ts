import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";
import {
  MailOptions,
  MailSendResult,
  SendOtpPayload,
  SendWelcomeEmailPayload,
  SendEnrollmentStatusPayload,
  SendApplicationAcknowledgementPayload,
  SendApplicationApprovedPayload,
  SendApplicationRejectedPayload,
  SendCorrectionRequiredPayload,
  SendOnboardingWelcomePayload,
  SendCalendarInvitationPayload,
  SendEventCreatedPayload,
  SendEventUpdatedPayload,
  SendEventCancelledPayload,
  SendReminderPayload,
  SendImportantNoticePayload,
  SendAttendanceAlertPayload,
  SendPasswordResetPayload,
} from "./types";
import {
  renderOtpEmail,
  renderWelcomeEmail,
  renderEnrollmentStatusEmail,
  renderApplicationAcknowledgementEmail,
  renderApplicationApprovedEmail,
  renderApplicationRejectedEmail,
  renderCorrectionRequiredEmail,
  renderOnboardingWelcomeEmail,
  renderCalendarInvitationEmail,
  renderEventCreatedEmail,
  renderEventUpdatedEmail,
  renderEventCancelledEmail,
  renderReminderEmail,
  renderImportantNoticeEmail,
  renderAttendanceAlertEmail,
  renderPasswordResetEmail,
} from "./templates";

class MailerService {
  private transporter: Transporter | null = null;

  /** Initialize or return singleton Nodemailer Transporter instance. */
  private getTransporter(): Transporter {
    if (this.transporter) return this.transporter;

    const host = process.env.SMTP_HOST || "smtp.gmail.com";
    const port = parseInt(process.env.SMTP_PORT || "587", 10);
    const user = process.env.SMTP_USER || "";
    const pass = process.env.SMTP_PASSWORD || "";

    // 465 uses direct TLS; 587 uses STARTTLS
    const secure = port === 465;

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: user ? { user, pass } : undefined,
      pool: true,
      maxConnections: 5,
      maxMessages: 100,
      rateLimit: 14,
      disableFileAccess: true,
      disableUrlAccess: true,
    });

    return this.transporter;
  }

  /** Generic send email wrapper with safety checks. */
  public async sendMail(options: MailOptions): Promise<MailSendResult> {
    try {
      const from = process.env.SMTP_FROM || `"19 JHR BN NCC" <noreply@ncc-sbu.in>`;
      const replyTo = options.replyTo || process.env.SMTP_REPLY_TO || "support@ncc-sbu.in";

      if (!process.env.SMTP_USER && process.env.NODE_ENV !== "production") {
        console.log(
          `[Dev Mailer Suppressed Dispatch] To: ${options.to} | Subject: ${options.subject}`,
        );
        return {
          success: true,
          messageId: `dev-simulated-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        };
      }

      const transporter = this.getTransporter();
      const info = await transporter.sendMail({
        from,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
        replyTo,
        headers: options.headers,
      });

      return {
        success: true,
        messageId: info.messageId,
      };
    } catch (err: any) {
      console.error("[Mailer Error]", err?.message || err);
      return {
        success: false,
        error: err?.message || "Failed to send email",
      };
    }
  }

  // 1. Send OTP
  public async sendOtp(payload: SendOtpPayload): Promise<MailSendResult> {
    const { html, text } = renderOtpEmail(payload);
    return this.sendMail({
      to: payload.recipient,
      subject: `[19 JHR BN NCC] Your Security Verification Code: ${payload.otpCode}`,
      html,
      text,
    });
  }

  // 2. Send Application Acknowledgement
  public async sendApplicationAcknowledgement(
    payload: SendApplicationAcknowledgementPayload,
  ): Promise<MailSendResult> {
    const { html, text } = renderApplicationAcknowledgementEmail(payload);
    return this.sendMail({
      to: payload.recipient,
      subject: `[19 JHR BN] Enrollment Application Received — ${payload.applicationId}`,
      html,
      text,
    });
  }

  // 3. Send Application Approved (with Activation Link)
  public async sendApplicationApproved(
    payload: SendApplicationApprovedPayload,
  ): Promise<MailSendResult> {
    const { html, text } = renderApplicationApprovedEmail(payload);
    return this.sendMail({
      to: payload.recipient,
      subject: `[19 JHR BN] Application Approved — Activate Your Cadet Account`,
      html,
      text,
    });
  }

  // 4. Send Application Rejected
  public async sendApplicationRejected(
    payload: SendApplicationRejectedPayload,
  ): Promise<MailSendResult> {
    const { html, text } = renderApplicationRejectedEmail(payload);
    return this.sendMail({
      to: payload.recipient,
      subject: `[19 JHR BN] Enrollment Application Decision — ${payload.applicationId}`,
      html,
      text,
    });
  }

  // 5. Send Correction Required
  public async sendCorrectionRequired(
    payload: SendCorrectionRequiredPayload,
  ): Promise<MailSendResult> {
    const { html, text } = renderCorrectionRequiredEmail(payload);
    return this.sendMail({
      to: payload.recipient,
      subject: `[19 JHR BN] Action Required: Application Verification — ${payload.applicationId}`,
      html,
      text,
    });
  }

  // 6. Send Onboarding Welcome
  public async sendOnboardingWelcome(
    payload: SendOnboardingWelcomePayload,
  ): Promise<MailSendResult> {
    const { html, text } = renderOnboardingWelcomeEmail(payload);
    return this.sendMail({
      to: payload.recipient,
      subject: `Welcome to the 19 JHR BN NCC Cadet Command Portal`,
      html,
      text,
    });
  }

  // 7. Send Welcome Email
  public async sendWelcomeEmail(payload: SendWelcomeEmailPayload): Promise<MailSendResult> {
    const { html, text } = renderWelcomeEmail(payload);
    return this.sendMail({
      to: payload.recipient,
      subject: `Welcome to 19 JHR BN NCC Cadre Portal`,
      html,
      text,
    });
  }

  // 8. Send Enrollment Status
  public async sendEnrollmentStatus(payload: SendEnrollmentStatusPayload): Promise<MailSendResult> {
    const { html, text } = renderEnrollmentStatusEmail(payload);
    return this.sendMail({
      to: payload.recipient,
      subject: `[19 JHR BN] Enrollment Application Status: ${payload.status}`,
      html,
      text,
    });
  }

  // 9. Send Calendar Invitation
  public async sendCalendarInvitation(
    payload: SendCalendarInvitationPayload,
  ): Promise<MailSendResult> {
    const { html, text } = renderCalendarInvitationEmail(payload);
    return this.sendMail({
      to: payload.recipient,
      subject: `[Event Invitation] ${payload.eventTitle}`,
      html,
      text,
    });
  }

  // 10. Send Event Created
  public async sendEventCreated(payload: SendEventCreatedPayload): Promise<MailSendResult> {
    const { html, text } = renderEventCreatedEmail(payload);
    return this.sendMail({
      to: payload.recipient,
      subject: `[New Event] ${payload.eventTitle} (${payload.eventType})`,
      html,
      text,
    });
  }

  // 11. Send Event Updated
  public async sendEventUpdated(payload: SendEventUpdatedPayload): Promise<MailSendResult> {
    const { html, text } = renderEventUpdatedEmail(payload);
    return this.sendMail({
      to: payload.recipient,
      subject: `[Schedule Change] ${payload.eventTitle}`,
      html,
      text,
    });
  }

  // 12. Send Event Cancelled
  public async sendEventCancelled(payload: SendEventCancelledPayload): Promise<MailSendResult> {
    const { html, text } = renderEventCancelledEmail(payload);
    return this.sendMail({
      to: payload.recipient,
      subject: `[EVENT CANCELLED] ${payload.eventTitle}`,
      html,
      text,
    });
  }

  // 13. Send Reminder
  public async sendReminder(payload: SendReminderPayload): Promise<MailSendResult> {
    const { html, text } = renderReminderEmail(payload);
    return this.sendMail({
      to: payload.recipient,
      subject: `[Reminder ${payload.reminderTimeText}] ${payload.eventTitle}`,
      html,
      text,
    });
  }

  // 14. Send Important Notice
  public async sendImportantNotice(payload: SendImportantNoticePayload): Promise<MailSendResult> {
    const { html, text } = renderImportantNoticeEmail(payload);
    return this.sendMail({
      to: payload.recipient,
      subject: `[${payload.priority}] ${payload.title}`,
      html,
      text,
    });
  }

  // 15. Send Attendance Alert
  public async sendAttendanceAlert(payload: SendAttendanceAlertPayload): Promise<MailSendResult> {
    const { html, text } = renderAttendanceAlertEmail(payload);
    return this.sendMail({
      to: payload.recipient,
      subject: `[Attendance Alert] Status: ${payload.status} - ${payload.eventTitle}`,
      html,
      text,
    });
  }

  // 16. Send Password Reset
  public async sendPasswordReset(payload: SendPasswordResetPayload): Promise<MailSendResult> {
    const { html, text } = renderPasswordResetEmail(payload);
    return this.sendMail({
      to: payload.recipient,
      subject: `[19 JHR BN NCC] Password Reset Request`,
      html,
      text,
    });
  }
}

export const mailer = new MailerService();
