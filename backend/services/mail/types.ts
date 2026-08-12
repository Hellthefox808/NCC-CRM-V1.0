export interface MailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
  headers?: Record<string, string>;
}

export interface SendOtpPayload {
  recipient: string;
  otpCode: string;
  recipientName?: string;
  purpose?: string;
  ttlMinutes?: number;
}

export interface SendWelcomeEmailPayload {
  recipient: string;
  cadetName: string;
  enrollmentNo?: string;
  unitName?: string;
}

export interface SendEnrollmentStatusPayload {
  recipient: string;
  cadetName: string;
  status: string;
  remarks?: string;
  enrollmentNo?: string;
}

export interface SendApplicationAcknowledgementPayload {
  recipient: string;
  applicantName: string;
  applicationId: string;
  submissionDate: string;
}

export interface SendApplicationApprovedPayload {
  recipient: string;
  applicantName: string;
  cadetId: string;
  applicationId: string;
  activationLink: string;
  expiresInHours: number;
}

export interface SendApplicationRejectedPayload {
  recipient: string;
  applicantName: string;
  applicationId: string;
  reason: string;
}

export interface SendCorrectionRequiredPayload {
  recipient: string;
  applicantName: string;
  applicationId: string;
  remarks: string;
}

export interface SendOnboardingWelcomePayload {
  recipient: string;
  cadetName: string;
  cadetId: string;
  unitName?: string;
}

export interface SendCalendarInvitationPayload {
  recipient: string;
  cadetName: string;
  eventTitle: string;
  startTime: string;
  endTime: string;
  location: string;
  description?: string;
  eventId: string;
}

export interface SendEventCreatedPayload {
  recipient: string;
  eventTitle: string;
  eventType: string;
  startTime: string;
  endTime: string;
  location: string;
  description?: string;
  eventId: string;
}

export interface SendEventUpdatedPayload {
  recipient: string;
  eventTitle: string;
  oldStartTime?: string;
  newStartTime: string;
  newEndTime: string;
  newLocation: string;
  changeSummary?: string;
  eventId: string;
}

export interface SendEventCancelledPayload {
  recipient: string;
  eventTitle: string;
  startTime: string;
  reason?: string;
  eventId: string;
}

export interface SendReminderPayload {
  recipient: string;
  eventTitle: string;
  startTime: string;
  location: string;
  reminderTimeText: string;
  eventId: string;
}

export interface SendImportantNoticePayload {
  recipient: string;
  title: string;
  category: string;
  priority: string;
  body: string;
  actionLabel?: string;
}

export interface SendAttendanceAlertPayload {
  recipient: string;
  cadetName: string;
  eventTitle: string;
  date: string;
  status: "ABSENT" | "EXCUSED" | "LATE";
  remarks?: string;
}

export interface SendPasswordResetPayload {
  recipient: string;
  recipientName: string;
  resetTokenOrLink: string;
  expiresInMinutes: number;
}

export interface SendAccountActivationEmailPayload {
  recipient: string;
  recipientName?: string;
  username: string;
  userType: "Applicant / Cadet" | "ANO Officer";
  activationLink: string;
  expiresInMinutes: number;
}

export interface SendPasswordChangedPayload {
  recipient: string;
  recipientName?: string;
  username: string;
  timestamp: string;
}

export interface MailSendResult {
  success: boolean;
  messageId?: string;
  error?: string;
}
