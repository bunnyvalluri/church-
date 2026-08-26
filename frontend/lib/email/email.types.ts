/**
 * frontend/lib/email/email.types.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Kingdom of Christ Ministries (KCM) — Universal Transactional Email Types
 * 
 * Strict TypeScript definitions for all 20 professional email templates (A–T),
 * provider interfaces, delivery outcomes, and database audit logs.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export type EmailTemplateType =
  | 'WELCOME'                      // A. Welcome Email
  | 'EMAIL_VERIFICATION'          // B. Email Verification
  | 'PASSWORD_RESET'             // C. Password Reset
  | 'LOGIN_ALERT'                // D. Login / Security Notification
  | 'EVENT_CREATED'              // E. Event Created
  | 'EVENT_UPDATED'              // F. Event Updated
  | 'EVENT_REMINDER'             // G. Event Reminder
  | 'EVENT_CANCELLED'            // H. Event Cancellation
  | 'PRAYER_CONFIRMATION'        // I. Prayer Request Confirmation
  | 'PRAYER_STATUS_UPDATE'       // J. Prayer Request Status Update
  | 'DONATION_CONFIRMATION'      // K. Donation Confirmation
  | 'DONATION_RECEIPT'           // L. Donation Receipt
  | 'VOLUNTEER_CONFIRMATION'     // M. Volunteer Application Confirmation
  | 'VOLUNTEER_APPROVAL'         // N. Volunteer Approval
  | 'MEMBERSHIP_CONFIRMATION'    // O. Membership Request Confirmation
  | 'MEMBERSHIP_APPROVAL'        // P. Membership Approval
  | 'NEW_SERMON'                 // Q. New Sermon Notification
  | 'CHURCH_ANNOUNCEMENT'        // R. Church Announcement
  | 'MINISTRY_NOTIFICATION'      // S. Important Ministry Notification
  | 'SECURITY_ALERT';            // T. Account Security Alert

export type EmailDeliveryStatus =
  | 'PENDING'
  | 'SENT'
  | 'FAILED'
  | 'RETRYING'
  | 'SKIPPED';

export type EmailProviderName = 'resend' | 'smtp' | 'mock';

// ── Base Personalization Payload ─────────────────────────────────────────────
export interface BaseEmailData {
  firstName?: string;
  lastName?: string;
  fullName?: string;
  email: string;
  churchName?: string;
  supportEmail?: string;
  portalUrl?: string;
}

// ── Specific Template Payloads ───────────────────────────────────────────────

export interface WelcomeEmailData extends BaseEmailData {
  visitUrl?: string;
}

export interface EmailVerificationData extends BaseEmailData {
  verificationUrl: string;
  expirationTime?: string; // e.g. "24 hours"
}

export interface PasswordResetData extends BaseEmailData {
  resetUrl: string;
  expirationTime?: string; // e.g. "1 hour"
}

export interface LoginAlertData extends BaseEmailData {
  loginDateTime?: string;
  loginMethod?: string;
  device?: string;
  browser?: string;
  ipAddress?: string;
  approxLocation?: string;
  reviewActivityUrl?: string;
}

export interface EventCreatedData extends BaseEmailData {
  eventName: string;
  eventDate: string;
  eventTime?: string;
  eventLocation: string;
  eventDescription?: string;
  eventUrl: string;
  branchName?: string;
}

export interface EventUpdatedData extends BaseEmailData {
  eventName: string;
  eventDate: string;
  eventTime?: string;
  eventLocation: string;
  updateSummary: string;
  eventUrl: string;
}

export interface EventReminderData extends BaseEmailData {
  eventName: string;
  eventDate: string;
  eventTime?: string;
  eventLocation: string;
  eventUrl: string;
  googleMapsUrl?: string;
}

export interface EventCancelledData extends BaseEmailData {
  eventName: string;
  eventDate: string;
  cancellationReason?: string;
  calendarUrl?: string;
}

export interface PrayerConfirmationData extends BaseEmailData {
  prayerRequestId: string;
  title?: string;
  category?: string;
  submittedAt?: string;
  myRequestsUrl?: string;
}

export interface PrayerStatusUpdateData extends BaseEmailData {
  prayerRequestId: string;
  title?: string;
  status: string; // e.g. "Praying", "Answered", "Reviewed"
  pastoralNote?: string;
  myRequestsUrl?: string;
}

export interface DonationConfirmationData extends BaseEmailData {
  donationAmount: string; // e.g. "₹2,500.00"
  transactionId: string;
  date: string;
  purpose?: string;
  paymentMethod?: string;
  receiptUrl?: string;
}

export interface DonationReceiptData extends BaseEmailData {
  receiptNumber: string;
  donationAmount: string;
  transactionId: string;
  date: string;
  purpose: string;
  verificationCode: string;
  utr?: string;
  donorName?: string;
  receiptUrl: string;
  downloadPdfUrl?: string;
}

export interface VolunteerConfirmationData extends BaseEmailData {
  ministry: string;
  appliedAt?: string;
  statusUrl?: string;
}

export interface VolunteerApprovalData extends BaseEmailData {
  ministry: string;
  coordinatorName?: string;
  coordinatorContact?: string;
  orientationDate?: string;
  volunteerPortalUrl?: string;
}

export interface MembershipConfirmationData extends BaseEmailData {
  applicationId?: string;
  appliedAt?: string;
  statusUrl?: string;
}

export interface MembershipApprovalData extends BaseEmailData {
  memberId?: string;
  approvalDate?: string;
  memberPortalUrl?: string;
}

export interface NewSermonData extends BaseEmailData {
  sermonTitle: string;
  preacher?: string;
  series?: string;
  date?: string;
  sermonUrl: string;
  keyVerse?: string;
}

export interface ChurchAnnouncementData extends BaseEmailData {
  announcementTitle: string;
  announcementBody: string;
  announcementDate?: string;
  actionUrl?: string;
  actionLabel?: string;
}

export interface MinistryNotificationData extends BaseEmailData {
  ministryName: string;
  notificationTitle: string;
  notificationBody: string;
  actionUrl?: string;
  actionLabel?: string;
}

export interface SecurityAlertData extends BaseEmailData {
  securityAction: string; // e.g. "Password changed", "Two-factor settings modified"
  dateTime?: string;
  device?: string;
  ipAddress?: string;
  approxLocation?: string;
  secureAccountUrl?: string;
}

// ── Generic Template Map ─────────────────────────────────────────────────────
export type TemplateDataMap = {
  WELCOME: WelcomeEmailData;
  EMAIL_VERIFICATION: EmailVerificationData;
  PASSWORD_RESET: PasswordResetData;
  LOGIN_ALERT: LoginAlertData;
  EVENT_CREATED: EventCreatedData;
  EVENT_UPDATED: EventUpdatedData;
  EVENT_REMINDER: EventReminderData;
  EVENT_CANCELLED: EventCancelledData;
  PRAYER_CONFIRMATION: PrayerConfirmationData;
  PRAYER_STATUS_UPDATE: PrayerStatusUpdateData;
  DONATION_CONFIRMATION: DonationConfirmationData;
  DONATION_RECEIPT: DonationReceiptData;
  VOLUNTEER_CONFIRMATION: VolunteerConfirmationData;
  VOLUNTEER_APPROVAL: VolunteerApprovalData;
  MEMBERSHIP_CONFIRMATION: MembershipConfirmationData;
  MEMBERSHIP_APPROVAL: MembershipApprovalData;
  NEW_SERMON: NewSermonData;
  CHURCH_ANNOUNCEMENT: ChurchAnnouncementData;
  MINISTRY_NOTIFICATION: MinistryNotificationData;
  SECURITY_ALERT: SecurityAlertData;
};

// ── Rendered Email Structure ─────────────────────────────────────────────────
export interface RenderedEmail {
  subject: string;
  previewText: string;
  html: string;
  text: string;
}

// ── Provider Contract ────────────────────────────────────────────────────────
export interface EmailSendOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
  from?: string;
  tags?: Array<{ name: string; value: string }>;
  idempotencyKey?: string;
}

export interface EmailSendResult {
  success: boolean;
  messageId?: string;
  provider: EmailProviderName;
  error?: string;
  sandboxRedirected?: boolean;
  originalRecipient?: string;
  fallbackRecipient?: string;
}

// ── High-Level Service Options ───────────────────────────────────────────────
export interface SendTemplateOptions<T extends EmailTemplateType = EmailTemplateType> {
  template: T;
  to: string;
  data: TemplateDataMap[T];
  userId?: string;
  eventId?: string;
  donationId?: string;
  receiptId?: string;
  forceSend?: boolean; // Bypass idempotency if necessary (e.g. manual admin retry)
}
