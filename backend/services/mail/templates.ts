import {
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
  SendAccountActivationEmailPayload,
  SendPasswordChangedPayload,
} from "./types";

const HEADER_HTML = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>19 JHR BN NCC Portal</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f6f9; margin: 0; padding: 0; color: #1e293b; }
    .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08); border: 1px solid #e2e8f0; }
    .header { background: #0b192c; padding: 24px; text-align: center; color: #ffffff; border-bottom: 4px solid #d4af37; }
    .header h1 { margin: 0; font-size: 20px; text-transform: uppercase; letter-spacing: 1px; color: #f8fafc; font-weight: 700; }
    .header p { margin: 4px 0 0 0; font-size: 13px; color: #cbd5e1; }
    .content { padding: 32px 24px; line-height: 1.6; }
    .footer { background: #0f172a; padding: 16px 24px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #1e293b; }
    .badge { display: inline-block; padding: 4px 12px; border-radius: 4px; font-weight: 600; font-size: 12px; text-transform: uppercase; margin-bottom: 12px; }
    .badge-navy { background: #1e3a8a; color: #ffffff; }
    .badge-gold { background: #d4af37; color: #0f172a; }
    .badge-danger { background: #991b1b; color: #ffffff; }
    .badge-success { background: #166534; color: #ffffff; }
    .otp-box { background: #f1f5f9; border: 2px dashed #0b192c; font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #0b192c; text-align: center; padding: 16px; margin: 20px 0; border-radius: 6px; }
    .detail-card { background: #f8fafc; border-left: 4px solid #0b192c; padding: 16px; margin: 16px 0; border-radius: 0 6px 6px 0; }
    .detail-row { margin-bottom: 8px; font-size: 14px; }
    .detail-label { font-weight: 600; color: #475569; display: inline-block; width: 130px; }
    .btn { display: inline-block; background: #0b192c; color: #ffffff !important; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 600; font-size: 14px; margin-top: 16px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>19 Jharkhand Battalion NCC</h1>
      <p>Sarala Birla University Sub-Unit | Official Notification</p>
    </div>
    <div class="content">
`;

const FOOTER_HTML = `
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} 19 JHR BN NCC, Ranchi. All rights reserved.</p>
      <p>This is an automated system dispatch. Please do not reply directly to this message.</p>
    </div>
  </div>
</body>
</html>
`;

export function renderOtpEmail(payload: SendOtpPayload) {
  const html = `
    ${HEADER_HTML}
    <h2>Security Verification Code</h2>
    <p>Jai Hind ${payload.recipientName || "Cadet"},</p>
    <p>Use the one-time verification code below to complete your request on the NCC Portal:</p>
    <div class="otp-box">${payload.otpCode}</div>
    <p style="font-size: 13px; color: #64748b;">This verification code is valid for <strong>${payload.ttlMinutes || 10} minutes</strong>. Do not share this code with anyone, including unit staff.</p>
    ${FOOTER_HTML}
  `;
  const text = `Jai Hind ${payload.recipientName || "Cadet"},\nYour 19 JHR BN NCC verification code is: ${payload.otpCode}\nValid for ${payload.ttlMinutes || 10} minutes.`;
  return { html, text };
}

export function renderApplicationAcknowledgementEmail(
  payload: SendApplicationAcknowledgementPayload,
) {
  const html = `
    ${HEADER_HTML}
    <span class="badge badge-navy">Application Received</span>
    <h2>NCC Enrollment Application Received</h2>
    <p>Jai Hind ${payload.applicantName},</p>
    <p>Your NCC enrollment application has been successfully submitted and logged on the unit register.</p>
    <div class="detail-card">
      <div class="detail-row"><span class="detail-label">Application ID:</span> <strong>${payload.applicationId}</strong></div>
      <div class="detail-row"><span class="detail-label">Submission Date:</span> ${payload.submissionDate}</div>
      <div class="detail-row"><span class="detail-label">Status:</span> <strong>Pending ANO Review</strong></div>
    </div>
    <p>Your application will be reviewed by the Associate NCC Officer (ANO). You will receive an email notification once your documents and eligibility are verified.</p>
    ${FOOTER_HTML}
  `;
  const text = `Jai Hind ${payload.applicantName},\nYour NCC enrollment application (${payload.applicationId}) has been received on ${payload.submissionDate}. Status: Pending ANO Review.`;
  return { html, text };
}

export function renderApplicationApprovedEmail(payload: SendApplicationApprovedPayload) {
  const html = `
    ${HEADER_HTML}
    <span class="badge badge-success">Application Approved</span>
    <h2>NCC Application Approved — Activate Account</h2>
    <p>Jai Hind ${payload.applicantName},</p>
    <p>Congratulations! Your NCC enrollment application has been <strong>APPROVED</strong> by the Associate NCC Officer (ANO).</p>
    <div class="detail-card" style="border-left-color: #166534;">
      <div class="detail-row"><span class="detail-label">Cadet Regimental ID:</span> <strong>${payload.cadetId}</strong></div>
      <div class="detail-row"><span class="detail-label">Application ID:</span> ${payload.applicationId}</div>
      <div class="detail-row"><span class="detail-label">Unit Sub-Unit:</span> 19 JHR BN NCC, SBU Company</div>
    </div>
    <p>Please click the button below to set up your password and activate your cadet portal account:</p>
    <div style="text-align: center; margin: 24px 0;">
      <a href="${payload.activationLink}" class="btn" style="background: #166534;">Activate Cadet Account</a>
    </div>
    <p style="font-size: 13px; color: #64748b;">This secure activation link is valid for single use and expires in <strong>${payload.expiresInHours} hours</strong>.</p>
    ${FOOTER_HTML}
  `;
  const text = `Jai Hind ${payload.applicantName},\nYour NCC application has been APPROVED!\nCadet ID: ${payload.cadetId}\nActivate your account: ${payload.activationLink}\nValid for ${payload.expiresInHours} hours.`;
  return { html, text };
}

export function renderApplicationRejectedEmail(payload: SendApplicationRejectedPayload) {
  const html = `
    ${HEADER_HTML}
    <span class="badge badge-danger">Application Decision</span>
    <h2>Enrollment Application Status Notice</h2>
    <p>Jai Hind ${payload.applicantName},</p>
    <p>We regret to inform you that your NCC enrollment application (ID: <strong>${payload.applicationId}</strong>) was not approved during ANO review.</p>
    <div class="detail-card" style="border-left-color: #991b1b;">
      <div class="detail-row"><span class="detail-label">Reason / Remarks:</span> ${payload.reason}</div>
    </div>
    <p>If you believe there has been an administrative error, please visit the ANO office at SBU Campus during official hours.</p>
    ${FOOTER_HTML}
  `;
  const text = `Jai Hind ${payload.applicantName},\nYour NCC application (${payload.applicationId}) was not approved.\nReason: ${payload.reason}`;
  return { html, text };
}

export function renderCorrectionRequiredEmail(payload: SendCorrectionRequiredPayload) {
  const html = `
    ${HEADER_HTML}
    <span class="badge badge-gold">Correction Required</span>
    <h2>Action Required: Application Verification</h2>
    <p>Jai Hind ${payload.applicantName},</p>
    <p>During document review of your application (ID: <strong>${payload.applicationId}</strong>), the ANO requested corrections before approval.</p>
    <div class="detail-card">
      <div class="detail-row"><span class="detail-label">Requested Fixes:</span> ${payload.remarks}</div>
    </div>
    <p>Please log in to the portal and resubmit your updated details or visit the ANO office.</p>
    ${FOOTER_HTML}
  `;
  const text = `Jai Hind ${payload.applicantName},\nCorrections are required for your NCC application (${payload.applicationId}).\nRemarks: ${payload.remarks}`;
  return { html, text };
}

export function renderOnboardingWelcomeEmail(payload: SendOnboardingWelcomePayload) {
  const html = `
    ${HEADER_HTML}
    <span class="badge badge-gold">Welcome Active Cadet</span>
    <h2>Welcome to NCC Cadet Command Portal</h2>
    <p>Jai Hind Cadet ${payload.cadetName},</p>
    <p>Your cadet account is now <strong>ACTIVATED</strong> and fully ready. You have official access to the 19 JHR BN NCC Cadet Command Portal.</p>
    <div class="detail-card">
      <div class="detail-row"><span class="detail-label">Cadet ID:</span> <strong>${payload.cadetId}</strong></div>
      <div class="detail-row"><span class="detail-label">Unit:</span> ${payload.unitName || "19 JHR BN NCC"}</div>
    </div>
    <h3>Onboarding Checklist:</h3>
    <ul>
      <li>Complete & verify your personal & medical details in Profile</li>
      <li>Review upcoming parade schedules in Calendar</li>
      <li>Check battalion notices and uniform instructions</li>
    </ul>
    ${FOOTER_HTML}
  `;
  const text = `Jai Hind Cadet ${payload.cadetName},\nYour account is now ACTIVE.\nCadet ID: ${payload.cadetId}\nPlease complete your profile and review upcoming schedules on the portal.`;
  return { html, text };
}

export function renderWelcomeEmail(payload: SendWelcomeEmailPayload) {
  const html = `
    ${HEADER_HTML}
    <span class="badge badge-gold">Welcome to 19 JHR BN</span>
    <h2>Welcome to NCC Cadre Portal</h2>
    <p>Jai Hind ${payload.cadetName},</p>
    <p>Welcome to the 19 Jharkhand Battalion National Cadet Corps. Your cadet profile has been initialized successfully on the official SBU portal.</p>
    <div class="detail-card">
      <div class="detail-row"><span class="detail-label">Cadet Name:</span> ${payload.cadetName}</div>
      ${payload.enrollmentNo ? `<div class="detail-row"><span class="detail-label">Regimental No:</span> ${payload.enrollmentNo}</div>` : ""}
      <div class="detail-row"><span class="detail-label">Battalion:</span> ${payload.unitName || "19 JHR BN NCC"}</div>
    </div>
    <p>You can now check drill schedules, training camp notices, and track attendance status directly from your cadet dashboard.</p>
    ${FOOTER_HTML}
  `;
  const text = `Jai Hind ${payload.cadetName},\nWelcome to 19 JHR BN NCC. Your profile has been initialized.\nRegimental No: ${payload.enrollmentNo || "N/A"}`;
  return { html, text };
}

export function renderEnrollmentStatusEmail(payload: SendEnrollmentStatusPayload) {
  const isApproved =
    payload.status.toLowerCase().includes("enrolled") ||
    payload.status.toLowerCase().includes("selected");
  const html = `
    ${HEADER_HTML}
    <span class="badge ${isApproved ? "badge-navy" : "badge-gold"}">Status: ${payload.status}</span>
    <h2>Enrollment Application Status Update</h2>
    <p>Jai Hind ${payload.cadetName},</p>
    <p>Your NCC enrollment application status has been updated to: <strong>${payload.status}</strong>.</p>
    <div class="detail-card">
      <div class="detail-row"><span class="detail-label">Application Status:</span> <strong>${payload.status}</strong></div>
      ${payload.enrollmentNo ? `<div class="detail-row"><span class="detail-label">Regimental No:</span> ${payload.enrollmentNo}</div>` : ""}
      ${payload.remarks ? `<div class="detail-row"><span class="detail-label">Officer Remarks:</span> ${payload.remarks}</div>` : ""}
    </div>
    ${FOOTER_HTML}
  `;
  const text = `Jai Hind ${payload.cadetName},\nYour NCC enrollment status is updated: ${payload.status}\nRemarks: ${payload.remarks || "None"}`;
  return { html, text };
}

export function renderCalendarInvitationEmail(payload: SendCalendarInvitationPayload) {
  const html = `
    ${HEADER_HTML}
    <span class="badge badge-navy">Event Invitation</span>
    <h2>${payload.eventTitle}</h2>
    <p>Jai Hind ${payload.cadetName},</p>
    <p>You have been assigned to participate in the upcoming battalion event:</p>
    <div class="detail-card">
      <div class="detail-row"><span class="detail-label">Event:</span> <strong>${payload.eventTitle}</strong></div>
      <div class="detail-row"><span class="detail-label">Start Time:</span> ${new Date(payload.startTime).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}</div>
      <div class="detail-row"><span class="detail-label">End Time:</span> ${new Date(payload.endTime).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}</div>
      <div class="detail-row"><span class="detail-label">Location:</span> ${payload.location}</div>
      ${payload.description ? `<div class="detail-row"><span class="detail-label">Details:</span> ${payload.description}</div>` : ""}
    </div>
    ${FOOTER_HTML}
  `;
  const text = `Jai Hind ${payload.cadetName},\nYou are invited to ${payload.eventTitle} at ${payload.location} on ${payload.startTime}.`;
  return { html, text };
}

export function renderEventCreatedEmail(payload: SendEventCreatedPayload) {
  const html = `
    ${HEADER_HTML}
    <span class="badge badge-navy">${payload.eventType}</span>
    <h2>New Calendar Event Scheduled: ${payload.eventTitle}</h2>
    <p>Jai Hind,</p>
    <p>A new event has been added to the 19 JHR BN training calendar:</p>
    <div class="detail-card">
      <div class="detail-row"><span class="detail-label">Event Title:</span> <strong>${payload.eventTitle}</strong></div>
      <div class="detail-row"><span class="detail-label">Event Type:</span> ${payload.eventType}</div>
      <div class="detail-row"><span class="detail-label">Start Time:</span> ${new Date(payload.startTime).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}</div>
      <div class="detail-row"><span class="detail-label">End Time:</span> ${new Date(payload.endTime).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}</div>
      <div class="detail-row"><span class="detail-label">Location:</span> ${payload.location}</div>
      ${payload.description ? `<div class="detail-row"><span class="detail-label">Description:</span> ${payload.description}</div>` : ""}
    </div>
    ${FOOTER_HTML}
  `;
  const text = `New NCC Event: ${payload.eventTitle}\nType: ${payload.eventType}\nStart: ${payload.startTime}\nLocation: ${payload.location}`;
  return { html, text };
}

export function renderEventUpdatedEmail(payload: SendEventUpdatedPayload) {
  const html = `
    ${HEADER_HTML}
    <span class="badge badge-gold">Schedule Updated</span>
    <h2>Schedule Change: ${payload.eventTitle}</h2>
    <p>Jai Hind,</p>
    <p>Please note that the schedule for event <strong>${payload.eventTitle}</strong> has been updated by battalion officers:</p>
    <div class="detail-card">
      <div class="detail-row"><span class="detail-label">Event:</span> <strong>${payload.eventTitle}</strong></div>
      <div class="detail-row"><span class="detail-label">New Start Time:</span> <strong>${new Date(payload.newStartTime).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}</strong></div>
      <div class="detail-row"><span class="detail-label">New End Time:</span> ${new Date(payload.newEndTime).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}</div>
      <div class="detail-row"><span class="detail-label">Location:</span> ${payload.newLocation}</div>
      ${payload.changeSummary ? `<div class="detail-row"><span class="detail-label">Notes:</span> ${payload.changeSummary}</div>` : ""}
    </div>
    ${FOOTER_HTML}
  `;
  const text = `Event Schedule Updated: ${payload.eventTitle}\nNew Start: ${payload.newStartTime}\nLocation: ${payload.newLocation}`;
  return { html, text };
}

export function renderEventCancelledEmail(payload: SendEventCancelledPayload) {
  const html = `
    ${HEADER_HTML}
    <span class="badge badge-danger">Event Cancelled</span>
    <h2>Cancellation Notice: ${payload.eventTitle}</h2>
    <p>Jai Hind,</p>
    <p>The following scheduled event has been <strong>CANCELLED</strong>:</p>
    <div class="detail-card" style="border-left-color: #991b1b;">
      <div class="detail-row"><span class="detail-label">Event:</span> <strong>${payload.eventTitle}</strong></div>
      <div class="detail-row"><span class="detail-label">Originally Scheduled:</span> ${new Date(payload.startTime).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}</div>
      ${payload.reason ? `<div class="detail-row"><span class="detail-label">Reason:</span> ${payload.reason}</div>` : ""}
    </div>
    ${FOOTER_HTML}
  `;
  const text = `EVENT CANCELLED: ${payload.eventTitle}\nOriginally: ${payload.startTime}\nReason: ${payload.reason || "N/A"}`;
  return { html, text };
}

export function renderReminderEmail(payload: SendReminderPayload) {
  const html = `
    ${HEADER_HTML}
    <span class="badge badge-gold">Upcoming Event Reminder</span>
    <h2>Reminder: ${payload.eventTitle} (${payload.reminderTimeText})</h2>
    <p>Jai Hind,</p>
    <p>This is a reminder for the upcoming event scheduled in <strong>${payload.reminderTimeText}</strong>:</p>
    <div class="detail-card">
      <div class="detail-row"><span class="detail-label">Event:</span> <strong>${payload.eventTitle}</strong></div>
      <div class="detail-row"><span class="detail-label">Reporting Time:</span> ${new Date(payload.startTime).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}</div>
      <div class="detail-row"><span class="detail-label">Location:</span> ${payload.location}</div>
    </div>
    <p>Please report in full prescribed uniform and turn out punctually.</p>
    ${FOOTER_HTML}
  `;
  const text = `Reminder (${payload.reminderTimeText}): ${payload.eventTitle}\nStart: ${payload.startTime}\nLocation: ${payload.location}`;
  return { html, text };
}

export function renderImportantNoticeEmail(payload: SendImportantNoticePayload) {
  const isUrgent = payload.priority === "URGENT" || payload.priority === "HIGH";
  const html = `
    ${HEADER_HTML}
    <span class="badge ${isUrgent ? "badge-danger" : "badge-navy"}">${payload.category} | ${payload.priority}</span>
    <h2>${payload.title}</h2>
    <p>Jai Hind,</p>
    <div class="detail-card">
      <p style="white-space: pre-wrap; margin: 0;">${payload.body}</p>
    </div>
    ${FOOTER_HTML}
  `;
  const text = `[${payload.priority}] ${payload.title}\nCategory: ${payload.category}\n\n${payload.body}`;
  return { html, text };
}

export function renderAttendanceAlertEmail(payload: SendAttendanceAlertPayload) {
  const html = `
    ${HEADER_HTML}
    <span class="badge badge-danger">Attendance Alert</span>
    <h2>Parade Attendance Recorded: ${payload.status}</h2>
    <p>Jai Hind ${payload.cadetName},</p>
    <p>Your attendance for parade/event <strong>${payload.eventTitle}</strong> on ${payload.date} has been marked as <strong>${payload.status}</strong>.</p>
    <div class="detail-card">
      <div class="detail-row"><span class="detail-label">Cadet:</span> ${payload.cadetName}</div>
      <div class="detail-row"><span class="detail-label">Event:</span> ${payload.eventTitle}</div>
      <div class="detail-row"><span class="detail-label">Status:</span> <strong>${payload.status}</strong></div>
      ${payload.remarks ? `<div class="detail-row"><span class="detail-label">Remarks:</span> ${payload.remarks}</div>` : ""}
    </div>
    ${FOOTER_HTML}
  `;
  const text = `Jai Hind ${payload.cadetName},\nYour attendance status for ${payload.eventTitle} on ${payload.date} is recorded as ${payload.status}.`;
  return { html, text };
}

export function renderPasswordResetEmail(payload: SendPasswordResetPayload) {
  const html = `
    ${HEADER_HTML}
    <span class="badge badge-gold">Account Security</span>
    <h2>Password Reset Request</h2>
    <p>Jai Hind ${payload.recipientName || "Cadet"},</p>
    <p>We received a password reset request for your NCC Portal account. Click the button below to complete your password reset:</p>
    <div style="text-align: center; margin: 24px 0;">
      <a href="${payload.resetTokenOrLink}" class="btn" style="background: #0b192c; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 700; display: inline-block;">RESET PASSWORD</a>
    </div>
    <div class="detail-card">
      <div class="detail-row"><strong>Security Notice:</strong></div>
      <div class="detail-row">• This link expires in <strong>${payload.expiresInMinutes} minutes</strong>.</div>
      <div class="detail-row">• The link can be used only once.</div>
      <div class="detail-row">• Never share your password or reset link with anyone.</div>
    </div>
    <p style="font-size: 13px; color: #64748b;">If you did not request a password reset, you can safely ignore this email.</p>
    ${FOOTER_HTML}
  `;
  const text = `Jai Hind ${payload.recipientName || "Cadet"},\nUse the link below to reset your NCC password:\n${payload.resetTokenOrLink}\nValid for ${payload.expiresInMinutes} minutes.`;
  return { html, text };
}

export function renderAccountActivationEmail(payload: SendAccountActivationEmailPayload) {
  const html = `
    ${HEADER_HTML}
    <span class="badge badge-gold">Account Provisioned</span>
    <h2>Welcome to NCC — Your Account Is Ready</h2>
    <p>Jai Hind ${payload.recipientName || "Cadet"},</p>
    <p>Your NCC account has been successfully created and provisioned.</p>
    <p>You can now complete your account setup and access the NCC Portal.</p>
    
    <div class="detail-card">
      <div style="font-weight: 700; margin-bottom: 8px; color: #0b192c; text-transform: uppercase; font-size: 12px; letter-spacing: 1px;">Account Details</div>
      <div class="detail-row"><span class="detail-label">Username:</span> <strong>${payload.username}</strong></div>
      <div class="detail-row"><span class="detail-label">Account Role:</span> <strong>${payload.userType}</strong></div>
    </div>

    <div style="text-align: center; margin: 28px 0;">
      <a href="${payload.activationLink}" class="btn" style="background: #0b192c; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: 700; font-size: 15px; display: inline-block;">SET UP PASSWORD</a>
    </div>

    <div class="detail-card" style="background: #fff8e6; border-left-color: #d4af37;">
      <div style="font-weight: 600; color: #856404; margin-bottom: 6px;">For your security:</div>
      <ul style="margin: 0; padding-left: 20px; font-size: 13px; color: #555;">
        <li>This link is temporary (expires in ${payload.expiresInMinutes} minutes).</li>
        <li>The link can be used only once.</li>
        <li>Never share your activation link or password.</li>
        <li>NCC staff will never ask for your password.</li>
      </ul>
    </div>

    <p style="font-size: 13px; color: #64748b; margin-top: 20px;">If you did not expect this email, please contact the NCC administration.</p>
    <p style="font-size: 13px; color: #0b192c; font-weight: 600; margin-top: 16px;">Regards,<br>NCC Administration<br>19 Jharkhand Battalion NCC</p>
    ${FOOTER_HTML}
  `;
  const text = `Jai Hind ${payload.recipientName || "Cadet"},\nYour NCC account (${payload.username}) has been created.\nSet up your password to activate access:\n${payload.activationLink}\nLink expires in ${payload.expiresInMinutes} minutes.`;
  return { html, text };
}

export function renderPasswordChangedNotificationEmail(payload: SendPasswordChangedPayload) {
  const html = `
    ${HEADER_HTML}
    <span class="badge badge-navy">Security Alert</span>
    <h2>NCC Account Password Changed</h2>
    <p>Jai Hind ${payload.recipientName || "Cadet"},</p>
    <p>The password for your NCC Portal account (<strong>${payload.username}</strong>) was successfully updated on <strong>${payload.timestamp}</strong>.</p>
    <p>All active sessions have been invalidated for security. You must sign in using your new password.</p>
    <div class="detail-card" style="border-left-color: #991b1b;">
      <p style="margin: 0; font-size: 13px; color: #991b1b; font-weight: 600;">If you did NOT perform this action, contact the 19 Jharkhand Battalion NCC ANO or Unit Admin immediately.</p>
    </div>
    ${FOOTER_HTML}
  `;
  const text = `Jai Hind ${payload.recipientName || "Cadet"},\nThe password for your NCC account (${payload.username}) was changed on ${payload.timestamp}. If you did not make this change, contact unit admin immediately.`;
  return { html, text };
}
