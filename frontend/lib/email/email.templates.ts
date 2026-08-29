/**
 * frontend/lib/email/email.templates.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Kingdom of Christ Ministries (KCM) — 20 Professional Email Templates (A–T)
 * 
 * Each template generates subject, preheader, responsive HTML, and plain-text fallback.
 * Strictly adheres to church brand tone: warm, welcoming, respectful, professional,
 * faith-centered, and free of spam-like wording or excessive punctuation.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import {
  EmailTemplateType,
  TemplateDataMap,
  RenderedEmail,
} from './email.types';
import { emailConfig } from './email.config';
import { renderMasterEmailHtml, htmlToPlainText, escapeHtml } from './email.renderer';

export { escapeHtml };

function resolveFirstName(data: { firstName?: string; fullName?: string; email: string }): string {
  if (data.firstName && data.firstName.trim().length > 0) {
    return data.firstName.trim();
  }
  if (data.fullName && data.fullName.trim().length > 0) {
    return data.fullName.trim().split(' ')[0];
  }
  const localPart = data.email ? data.email.split('@')[0] : '';
  if (localPart && !localPart.includes('+') && localPart.length > 1) {
    // Capitalize first letter of local part if it looks like a name
    return localPart.charAt(0).toUpperCase() + localPart.slice(1);
  }
  return 'Beloved Member';
}

export function renderEmailTemplate<T extends EmailTemplateType>(
  type: T,
  data: TemplateDataMap[T]
): RenderedEmail {
  const firstName = resolveFirstName(data);
  const church = emailConfig.church;

  switch (type) {
    // ─────────────────────────────────────────────────────────────────────────
    // A. WELCOME EMAIL
    // ─────────────────────────────────────────────────────────────────────────
    case 'WELCOME': {
      const d = data as TemplateDataMap['WELCOME'];
      const subject = `Welcome to Kingdom of Christ Ministries`;
      const previewText = `We are glad to have you with us.`;
      const visitUrl = d.visitUrl || church.websiteUrl;

      const bodyHtml = `
        <p style="margin: 0 0 16px; font-size: 15px; line-height: 1.65; color: #334155;">
          Welcome to Kingdom of Christ Ministries.
        </p>
        <p style="margin: 0 0 18px; font-size: 14.5px; line-height: 1.65; color: #475569;">
          We are grateful that you have chosen to connect with our church community. Our website is designed to help you stay connected with worship services, sermons, events, prayer, ministries, volunteer opportunities, and our church community.
        </p>
        <p style="margin: 0 0 16px; font-size: 14.5px; line-height: 1.65; color: #1e293b; font-weight: 600;">
          Your account has been successfully created.
        </p>
        <p style="margin: 0 0 10px; font-size: 14px; color: #334155; font-weight: 600;">
          With your account, you can:
        </p>
        <ul style="margin: 0 0 22px 20px; padding: 0; font-size: 13.5px; line-height: 1.8; color: #475569;">
          <li>Stay updated about upcoming events</li>
          <li>Watch and access sermons</li>
          <li>Submit prayer requests</li>
          <li>Explore ministry opportunities</li>
          <li>Volunteer for church activities</li>
          <li>Manage your member profile</li>
          <li>Stay connected with Kingdom of Christ Ministries</li>
        </ul>
      `;

      const html = renderMasterEmailHtml({
        subject,
        previewText,
        badgeText: 'New Member Welcome',
        badgeType: 'success',
        greeting: `Hello ${firstName},`,
        bodyHtml,
        ctaButton: {
          label: 'Visit Kingdom of Christ Ministries',
          url: visitUrl,
        },
        calloutBox: {
          type: 'note',
          message: `If you did not create this account, please contact our support team immediately at <a href="mailto:${escapeHtml(church.supportEmail)}" style="color:#7c3aed;font-weight:600;text-decoration:none;">${escapeHtml(church.supportEmail)}</a>.`,
        },
        closingText: 'May God bless you and your family.',
        showUnsubscribe: false,
      });

      return { subject, previewText, html, text: htmlToPlainText(html) };
    }

    // ─────────────────────────────────────────────────────────────────────────
    // B. EMAIL VERIFICATION
    // ─────────────────────────────────────────────────────────────────────────
    case 'EMAIL_VERIFICATION': {
      const d = data as TemplateDataMap['EMAIL_VERIFICATION'];
      const subject = `Verify Your Kingdom of Christ Ministries Account`;
      const previewText = `Please verify your email address to activate your account.`;
      const expTime = d.expirationTime || '24 hours';

      const bodyHtml = `
        <p style="margin: 0 0 16px; font-size: 15px; line-height: 1.65; color: #334155;">
          Welcome to Kingdom of Christ Ministries.
        </p>
        <p style="margin: 0 0 18px; font-size: 14.5px; line-height: 1.65; color: #475569;">
          Please verify your email address to activate your account and complete your member registration.
        </p>
      `;

      const html = renderMasterEmailHtml({
        subject,
        previewText,
        badgeText: 'Action Required',
        badgeType: 'info',
        greeting: `Hello ${firstName},`,
        bodyHtml,
        ctaButton: {
          label: 'Verify Email Address',
          url: d.verificationUrl,
        },
        calloutBox: {
          type: 'note',
          message: `This verification link will expire after <strong>${escapeHtml(expTime)}</strong>.<br/>If you did not create this account, you can safely ignore this email.`,
        },
        showUnsubscribe: false,
      });

      return { subject, previewText, html, text: htmlToPlainText(html) };
    }

    // ─────────────────────────────────────────────────────────────────────────
    // C. PASSWORD RESET
    // ─────────────────────────────────────────────────────────────────────────
    case 'PASSWORD_RESET': {
      const d = data as TemplateDataMap['PASSWORD_RESET'];
      const subject = `Reset Your Kingdom of Christ Ministries Password`;
      const previewText = `Reset your account password.`;
      const expTime = d.expirationTime || '1 hour';

      const bodyHtml = `
        <p style="margin: 0 0 16px; font-size: 14.5px; line-height: 1.65; color: #334155;">
          We received a request to reset your account password for Kingdom of Christ Ministries.
        </p>
        <p style="margin: 0 0 18px; font-size: 14px; line-height: 1.65; color: #64748b;">
          Click the button below to choose a new strong password. For your security, this password reset link is single-use only.
        </p>
      `;

      const html = renderMasterEmailHtml({
        subject,
        previewText,
        badgeText: 'Password Recovery',
        badgeType: 'warning',
        greeting: `Hello ${firstName},`,
        bodyHtml,
        ctaButton: {
          label: 'Reset Password',
          url: d.resetUrl,
        },
        calloutBox: {
          type: 'alert',
          message: `This link will expire after <strong>${escapeHtml(expTime)}</strong>.<br/>If you did not request a password reset, no action is required. Your account remains secure.`,
        },
        showUnsubscribe: false,
      });

      return { subject, previewText, html, text: htmlToPlainText(html) };
    }

    // ─────────────────────────────────────────────────────────────────────────
    // D. LOGIN / SECURITY NOTIFICATION
    // ─────────────────────────────────────────────────────────────────────────
    case 'LOGIN_ALERT': {
      const d = data as TemplateDataMap['LOGIN_ALERT'];
      const subject = `New Sign-In to Your Kingdom of Christ Ministries Account`;
      const previewText = `Security Notice: Successful sign-in to your Kingdom of Christ Ministries account.`;

      const bodyHtml = `
        <p style="margin: 0 0 16px; font-size: 14.5px; line-height: 1.65; color: #334155;">
          We detected a successful sign-in to your Kingdom of Christ Ministries account.
        </p>
      `;

      const rows: Array<{ label: string; value: string; isBold?: boolean; isMono?: boolean; color?: string }> = [
        { label: 'Account', value: escapeHtml(d.email) },
        { label: 'Sign-In Method', value: escapeHtml(d.loginMethod || 'Google Sign-In') },
        { label: 'Date & Time', value: escapeHtml(d.loginDateTime || new Date().toUTCString()) },
      ];

      const deviceStr = [d.device, d.browser].filter(Boolean).join(' • ');
      if (deviceStr) {
        rows.push({ label: 'Device / Browser', value: escapeHtml(deviceStr) });
      }
      if (d.ipAddress) {
        rows.push({ label: 'IP Address', value: escapeHtml(d.ipAddress), isMono: true });
      }
      if (d.approxLocation) {
        rows.push({ label: 'Location', value: escapeHtml(d.approxLocation) });
      }

      const html = renderMasterEmailHtml({
        subject,
        previewText,
        badgeText: 'Security Notice',
        badgeType: 'info',
        greeting: `Hello ${firstName},`,
        bodyHtml,
        dataBox: {
          title: 'Sign-In Details',
          rows,
        },
        calloutBox: {
          type: 'alert',
          message: `If this was you, no action is required.<br/>If you do not recognize this activity, secure your account immediately and contact Kingdom of Christ Ministries at <a href="mailto:${escapeHtml(church.supportEmail)}" style="color:#b45309;font-weight:600;text-decoration:none;">${escapeHtml(church.supportEmail)}</a>.`,
        },
        ctaButton: {
          label: 'Open Member Portal',
          url: d.reviewActivityUrl || church.portalUrl,
        },
      });

      return { subject, previewText, html, text: htmlToPlainText(html) };
    }

    // ─────────────────────────────────────────────────────────────────────────
    // E. EVENT CREATED
    // ─────────────────────────────────────────────────────────────────────────
    case 'EVENT_CREATED': {
      const d = data as TemplateDataMap['EVENT_CREATED'];
      const subject = `You're Invited: ${d.eventName}`;
      const previewText = `Join us for ${d.eventName} at Kingdom of Christ Ministries.`;

      const bodyHtml = `
        <p style="margin: 0 0 16px; font-size: 15px; line-height: 1.65; color: #334155;">
          We are pleased to invite you to:
        </p>
        <p style="margin: 0 0 20px; font-size: 18px; font-weight: 700; color: #7c3aed;">
          ${escapeHtml(d.eventName)}
        </p>
        ${
          d.eventDescription
            ? `<p style="margin: 0 0 18px; font-size: 14px; line-height: 1.65; color: #475569;">${escapeHtml(d.eventDescription)}</p>`
            : ''
        }
        <p style="margin: 0 0 10px; font-size: 14px; color: #334155;">
          We would love to have you join us.
        </p>
      `;

      const rows = [
        { label: 'Date', value: escapeHtml(d.eventDate), isBold: true },
        ...(d.eventTime ? [{ label: 'Time', value: escapeHtml(d.eventTime) }] : []),
        { label: 'Location', value: escapeHtml(d.eventLocation) },
        ...(d.branchName ? [{ label: 'Branch', value: escapeHtml(d.branchName) }] : []),
      ];

      const html = renderMasterEmailHtml({
        subject,
        previewText,
        badgeText: 'Church Event',
        badgeType: 'default',
        greeting: `Hello ${firstName},`,
        bodyHtml,
        dataBox: {
          title: 'Event Information',
          rows,
        },
        ctaButton: {
          label: 'View Event Details',
          url: d.eventUrl || church.websiteUrl,
        },
        closingText: 'May God bless you and your family as we prepare to fellowship together.',
      });

      return { subject, previewText, html, text: htmlToPlainText(html) };
    }

    // ─────────────────────────────────────────────────────────────────────────
    // F. EVENT UPDATED
    // ─────────────────────────────────────────────────────────────────────────
    case 'EVENT_UPDATED': {
      const d = data as TemplateDataMap['EVENT_UPDATED'];
      const subject = `Important Update: ${d.eventName}`;
      const previewText = `Changes to ${d.eventName} details.`;

      const bodyHtml = `
        <p style="margin: 0 0 16px; font-size: 14.5px; line-height: 1.65; color: #334155;">
          Please note that details for the upcoming event <strong>${escapeHtml(d.eventName)}</strong> have been updated.
        </p>
      `;

      const rows = [
        { label: 'Event', value: escapeHtml(d.eventName), isBold: true },
        { label: 'Date', value: escapeHtml(d.eventDate) },
        ...(d.eventTime ? [{ label: 'Time', value: escapeHtml(d.eventTime) }] : []),
        { label: 'Location', value: escapeHtml(d.eventLocation) },
      ];

      const html = renderMasterEmailHtml({
        subject,
        previewText,
        badgeText: 'Schedule Update',
        badgeType: 'warning',
        greeting: `Hello ${firstName},`,
        bodyHtml,
        calloutBox: {
          type: 'note',
          message: `<strong>Update Notice:</strong> ${escapeHtml(d.updateSummary)}`,
        },
        dataBox: {
          title: 'Updated Event Details',
          rows,
        },
        ctaButton: {
          label: 'View Updated Details',
          url: d.eventUrl || church.websiteUrl,
        },
      });

      return { subject, previewText, html, text: htmlToPlainText(html) };
    }

    // ─────────────────────────────────────────────────────────────────────────
    // G. EVENT REMINDER
    // ─────────────────────────────────────────────────────────────────────────
    case 'EVENT_REMINDER': {
      const d = data as TemplateDataMap['EVENT_REMINDER'];
      const subject = `Reminder: ${d.eventName} is Coming Up`;
      const previewText = `We look forward to seeing you at ${d.eventName}.`;

      const bodyHtml = `
        <p style="margin: 0 0 16px; font-size: 14.5px; line-height: 1.65; color: #334155;">
          This is a friendly reminder that <strong>${escapeHtml(d.eventName)}</strong> will take place on <strong>${escapeHtml(d.eventDate)}</strong>.
        </p>
        <p style="margin: 0 0 14px; font-size: 14px; line-height: 1.65; color: #475569;">
          We are preparing a blessed time of fellowship and worship, and we look forward to having you with us.
        </p>
      `;

      const rows = [
        { label: 'Event', value: escapeHtml(d.eventName), isBold: true },
        { label: 'Date', value: escapeHtml(d.eventDate) },
        ...(d.eventTime ? [{ label: 'Time', value: escapeHtml(d.eventTime) }] : []),
        { label: 'Location', value: escapeHtml(d.eventLocation) },
      ];

      const html = renderMasterEmailHtml({
        subject,
        previewText,
        badgeText: 'Event Reminder',
        badgeType: 'info',
        greeting: `Hello ${firstName},`,
        bodyHtml,
        dataBox: {
          title: 'Event Schedule',
          rows,
        },
        ctaButton: {
          label: 'View Event Details',
          url: d.eventUrl || church.websiteUrl,
        },
        secondaryButton: d.googleMapsUrl
          ? {
              label: 'Get Directions',
              url: d.googleMapsUrl,
            }
          : undefined,
      });

      return { subject, previewText, html, text: htmlToPlainText(html) };
    }

    // ─────────────────────────────────────────────────────────────────────────
    // H. EVENT CANCELLATION
    // ─────────────────────────────────────────────────────────────────────────
    case 'EVENT_CANCELLED': {
      const d = data as TemplateDataMap['EVENT_CANCELLED'];
      const subject = `Cancelled: ${d.eventName} Notice`;
      const previewText = `Important update regarding ${d.eventName}.`;

      const bodyHtml = `
        <p style="margin: 0 0 16px; font-size: 14.5px; line-height: 1.65; color: #334155;">
          We regret to inform you that <strong>${escapeHtml(d.eventName)}</strong> originally scheduled for <strong>${escapeHtml(d.eventDate)}</strong> has been cancelled.
        </p>
        <p style="margin: 0 0 14px; font-size: 14px; line-height: 1.65; color: #64748b;">
          We sincerely apologize for any inconvenience this may cause. Please check our website calendar for other upcoming worship services and gatherings.
        </p>
      `;

      const html = renderMasterEmailHtml({
        subject,
        previewText,
        badgeText: 'Cancellation Notice',
        badgeType: 'warning',
        greeting: `Hello ${firstName},`,
        bodyHtml,
        calloutBox: d.cancellationReason
          ? {
              type: 'note',
              message: `<strong>Reason for cancellation:</strong> ${escapeHtml(d.cancellationReason)}`,
            }
          : undefined,
        ctaButton: {
          label: 'View Church Calendar',
          url: d.calendarUrl || church.websiteUrl,
        },
      });

      return { subject, previewText, html, text: htmlToPlainText(html) };
    }

    // ─────────────────────────────────────────────────────────────────────────
    // I. PRAYER REQUEST CONFIRMATION
    // ─────────────────────────────────────────────────────────────────────────
    case 'PRAYER_CONFIRMATION': {
      const d = data as TemplateDataMap['PRAYER_CONFIRMATION'];
      const subject = `Your Prayer Request Has Been Received`;
      const previewText = `Our ministry team has received your prayer request.`;

      const bodyHtml = `
        <p style="margin: 0 0 16px; font-size: 14.5px; line-height: 1.65; color: #334155;">
          Thank you for sharing your prayer request with Kingdom of Christ Ministries.
        </p>
        <p style="margin: 0 0 16px; font-size: 14.5px; line-height: 1.65; color: #334155;">
          Your request has been successfully received by our ministry team.
        </p>
        <p style="margin: 0 0 18px; font-size: 14px; line-height: 1.65; color: #64748b;">
          Our team will review your request and keep it confidential according to our ministry policies.
        </p>
      `;

      const rows = [
        { label: 'Prayer Request ID', value: escapeHtml(d.prayerRequestId), isBold: true, isMono: true },
        ...(d.title ? [{ label: 'Title', value: escapeHtml(d.title) }] : []),
        ...(d.category ? [{ label: 'Category', value: escapeHtml(d.category) }] : []),
        ...(d.submittedAt ? [{ label: 'Submitted Date', value: escapeHtml(d.submittedAt) }] : []),
      ];

      const html = renderMasterEmailHtml({
        subject,
        previewText,
        badgeText: 'Prayer Ministry',
        badgeType: 'default',
        greeting: `Hello ${firstName},`,
        bodyHtml,
        dataBox: {
          title: 'Request Reference',
          rows,
        },
        ctaButton: {
          label: 'View My Prayer Requests',
          url: d.myRequestsUrl || `${church.portalUrl}?tab=prayers`,
        },
        closingText: 'May you experience God’s peace and strength.',
      });

      return { subject, previewText, html, text: htmlToPlainText(html) };
    }

    // ─────────────────────────────────────────────────────────────────────────
    // J. PRAYER REQUEST STATUS UPDATE
    // ─────────────────────────────────────────────────────────────────────────
    case 'PRAYER_STATUS_UPDATE': {
      const d = data as TemplateDataMap['PRAYER_STATUS_UPDATE'];
      const subject = `Update on Your Prayer Request #${d.prayerRequestId}`;
      const previewText = `Our prayer team has an update on your request.`;

      const bodyHtml = `
        <p style="margin: 0 0 16px; font-size: 14.5px; line-height: 1.65; color: #334155;">
          We wanted to let you know that our pastoral and prayer team has updated the status of your prayer request.
        </p>
      `;

      const rows = [
        { label: 'Prayer Request ID', value: escapeHtml(d.prayerRequestId), isMono: true },
        ...(d.title ? [{ label: 'Title', value: escapeHtml(d.title) }] : []),
        { label: 'Current Status', value: escapeHtml(d.status), isBold: true, color: '#059669' },
      ];

      const html = renderMasterEmailHtml({
        subject,
        previewText,
        badgeText: 'Prayer Ministry Update',
        badgeType: 'success',
        greeting: `Hello ${firstName},`,
        bodyHtml,
        dataBox: {
          title: 'Prayer Status',
          rows,
        },
        calloutBox: d.pastoralNote
          ? {
              type: 'note',
              message: `<strong>Pastoral Note:</strong> ${escapeHtml(d.pastoralNote)}`,
            }
          : undefined,
        ctaButton: {
          label: 'View Prayer Status',
          url: d.myRequestsUrl || `${church.portalUrl}?tab=prayers`,
        },
        closingText: 'We continue to stand with you in faith and prayer.',
      });

      return { subject, previewText, html, text: htmlToPlainText(html) };
    }

    // ─────────────────────────────────────────────────────────────────────────
    // K. DONATION CONFIRMATION
    // ─────────────────────────────────────────────────────────────────────────
    case 'DONATION_CONFIRMATION': {
      const d = data as TemplateDataMap['DONATION_CONFIRMATION'];
      const subject = `Thank You for Your Generosity`;
      const previewText = `Your donation to Kingdom of Christ Ministries has been received.`;

      const bodyHtml = `
        <p style="margin: 0 0 16px; font-size: 14.5px; line-height: 1.65; color: #334155;">
          Thank you for your generous contribution to Kingdom of Christ Ministries.
        </p>
        <p style="margin: 0 0 18px; font-size: 14px; line-height: 1.65; color: #64748b;">
          Your generosity helps support the ministry and the people we serve across our community.
        </p>
      `;

      const rows = [
        { label: 'Donation Amount', value: escapeHtml(d.donationAmount), isBold: true, color: '#059669' },
        { label: 'Transaction ID', value: escapeHtml(d.transactionId), isMono: true },
        { label: 'Date', value: escapeHtml(d.date) },
        ...(d.purpose ? [{ label: 'Cause / Purpose', value: escapeHtml(d.purpose) }] : []),
        ...(d.paymentMethod ? [{ label: 'Payment Method', value: escapeHtml(d.paymentMethod) }] : []),
      ];

      const html = renderMasterEmailHtml({
        subject,
        previewText,
        badgeText: 'Donation Received',
        badgeType: 'success',
        greeting: `Hello ${firstName},`,
        bodyHtml,
        dataBox: {
          title: 'Donation Details',
          rows,
        },
        ctaButton: {
          label: 'View Donation Details',
          url: d.receiptUrl || church.portalUrl,
        },
        closingText: 'May the Lord richly bless and reward your cheerful heart.',
      });

      return { subject, previewText, html, text: htmlToPlainText(html) };
    }

    // ─────────────────────────────────────────────────────────────────────────
    // L. DONATION RECEIPT
    // ─────────────────────────────────────────────────────────────────────────
    case 'DONATION_RECEIPT': {
      const d = data as TemplateDataMap['DONATION_RECEIPT'];
      const subject = `Official Donation Receipt: ${d.receiptNumber}`;
      const previewText = `Tax exemption donation receipt for your records.`;

      const bodyHtml = `
        <p style="margin: 0 0 16px; font-size: 14.5px; line-height: 1.65; color: #334155;">
          Thank you for your faithful gift to Kingdom of Christ Ministries. Please find your official donation receipt details below for your records and tax filing purposes.
        </p>
      `;

      const rows = [
        { label: 'Receipt Number', value: escapeHtml(d.receiptNumber), isBold: true, isMono: true, color: '#7c3aed' },
        { label: 'Amount', value: escapeHtml(d.donationAmount), isBold: true, color: '#059669' },
        { label: 'Donation Cause', value: escapeHtml(d.purpose) },
        { label: 'Date', value: escapeHtml(d.date) },
        { label: 'Verification Code', value: escapeHtml(d.verificationCode), isMono: true },
        ...(d.utr ? [{ label: 'Bank Ref / UTR', value: escapeHtml(d.utr), isMono: true }] : []),
      ];

      const html = renderMasterEmailHtml({
        subject,
        previewText,
        badgeText: 'Official Receipt',
        badgeType: 'success',
        greeting: `Dear ${escapeHtml(d.donorName || firstName)},`,
        bodyHtml,
        dataBox: {
          title: 'Official Receipt Summary',
          rows,
        },
        calloutBox: {
          type: 'note',
          message: `<strong>80G Tax Exemption:</strong> Donations to Kingdom of Christ Ministries are eligible for tax deductions under Section 80G of the Indian Income Tax Act. Please retain this receipt for your annual tax filing.`,
        },
        ctaButton: {
          label: 'View Official Receipt',
          url: d.receiptUrl,
        },
        secondaryButton: d.downloadPdfUrl
          ? {
              label: 'Download PDF',
              url: d.downloadPdfUrl,
            }
          : undefined,
      });

      return { subject, previewText, html, text: htmlToPlainText(html) };
    }

    // ─────────────────────────────────────────────────────────────────────────
    // M. VOLUNTEER APPLICATION CONFIRMATION
    // ─────────────────────────────────────────────────────────────────────────
    case 'VOLUNTEER_CONFIRMATION': {
      const d = data as TemplateDataMap['VOLUNTEER_CONFIRMATION'];
      const subject = `Volunteer Application Received: ${d.ministry}`;
      const previewText = `Thank you for your willingness to serve with us.`;

      const bodyHtml = `
        <p style="margin: 0 0 16px; font-size: 14.5px; line-height: 1.65; color: #334155;">
          Thank you for offering your heart and hands to serve with Kingdom of Christ Ministries.
        </p>
        <p style="margin: 0 0 16px; font-size: 14.5px; line-height: 1.65; color: #475569;">
          We have received your volunteer application for the <strong>${escapeHtml(d.ministry)}</strong> team.
        </p>
        <p style="margin: 0 0 18px; font-size: 14px; line-height: 1.65; color: #64748b;">
          Our ministry leadership will review your application and connect with you regarding team orientation and service opportunities.
        </p>
      `;

      const rows = [
        { label: 'Ministry Department', value: escapeHtml(d.ministry), isBold: true },
        ...(d.appliedAt ? [{ label: 'Application Date', value: escapeHtml(d.appliedAt) }] : []),
        { label: 'Current Status', value: 'Under Review', isBold: true, color: '#b45309' },
      ];

      const html = renderMasterEmailHtml({
        subject,
        previewText,
        badgeText: 'Volunteer Ministry',
        badgeType: 'info',
        greeting: `Hello ${firstName},`,
        bodyHtml,
        dataBox: {
          title: 'Application Reference',
          rows,
        },
        ctaButton: {
          label: 'View Application Status',
          url: d.statusUrl || church.portalUrl,
        },
        closingText: '“Each of you should use whatever gift you have received to serve others.” — 1 Peter 4:10',
      });

      return { subject, previewText, html, text: htmlToPlainText(html) };
    }

    // ─────────────────────────────────────────────────────────────────────────
    // N. VOLUNTEER APPROVAL
    // ─────────────────────────────────────────────────────────────────────────
    case 'VOLUNTEER_APPROVAL': {
      const d = data as TemplateDataMap['VOLUNTEER_APPROVAL'];
      const subject = `Welcome to the Ministry Team: ${d.ministry}`;
      const previewText = `Your volunteer application has been approved!`;

      const bodyHtml = `
        <p style="margin: 0 0 16px; font-size: 15px; line-height: 1.65; color: #334155;">
          Praise God! We are thrilled to inform you that your volunteer application for the <strong>${escapeHtml(d.ministry)}</strong> team has been approved.
        </p>
        <p style="margin: 0 0 18px; font-size: 14px; line-height: 1.65; color: #475569;">
          We are excited to serve the Lord alongside you. You can now access volunteer resources and schedules via the member portal.
        </p>
      `;

      const rows = [
        { label: 'Ministry', value: escapeHtml(d.ministry), isBold: true },
        ...(d.coordinatorName ? [{ label: 'Coordinator', value: escapeHtml(d.coordinatorName) }] : []),
        ...(d.coordinatorContact ? [{ label: 'Contact', value: escapeHtml(d.coordinatorContact) }] : []),
        ...(d.orientationDate ? [{ label: 'Orientation', value: escapeHtml(d.orientationDate) }] : []),
      ];

      const html = renderMasterEmailHtml({
        subject,
        previewText,
        badgeText: 'Application Approved',
        badgeType: 'success',
        greeting: `Congratulations ${firstName}!`,
        bodyHtml,
        dataBox: {
          title: 'Team Details',
          rows,
        },
        ctaButton: {
          label: 'Access Volunteer Portal',
          url: d.volunteerPortalUrl || church.portalUrl,
        },
        closingText: 'We pray that your service brings great blessing to both you and our church family.',
      });

      return { subject, previewText, html, text: htmlToPlainText(html) };
    }

    // ─────────────────────────────────────────────────────────────────────────
    // O. MEMBERSHIP REQUEST CONFIRMATION
    // ─────────────────────────────────────────────────────────────────────────
    case 'MEMBERSHIP_CONFIRMATION': {
      const d = data as TemplateDataMap['MEMBERSHIP_CONFIRMATION'];
      const subject = `Membership Application Received`;
      const previewText = `Thank you for requesting to join Kingdom of Christ Ministries.`;

      const bodyHtml = `
        <p style="margin: 0 0 16px; font-size: 14.5px; line-height: 1.65; color: #334155;">
          Thank you for expressing your desire to become an official member of Kingdom of Christ Ministries.
        </p>
        <p style="margin: 0 0 18px; font-size: 14px; line-height: 1.65; color: #475569;">
          Your membership request has been submitted to the pastoral leadership team. We look forward to walking this spiritual journey with you.
        </p>
      `;

      const rows = [
        ...(d.applicationId ? [{ label: 'Application ID', value: escapeHtml(d.applicationId), isMono: true }] : []),
        ...(d.appliedAt ? [{ label: 'Submitted Date', value: escapeHtml(d.appliedAt) }] : []),
        { label: 'Status', value: 'Under Pastoral Review', isBold: true, color: '#b45309' },
      ];

      const html = renderMasterEmailHtml({
        subject,
        previewText,
        badgeText: 'Church Membership',
        badgeType: 'default',
        greeting: `Hello ${firstName},`,
        bodyHtml,
        dataBox: {
          title: 'Request Details',
          rows,
        },
        ctaButton: {
          label: 'Check Membership Status',
          url: d.statusUrl || church.portalUrl,
        },
        closingText: 'May the Lord guide and bless you in all your ways.',
      });

      return { subject, previewText, html, text: htmlToPlainText(html) };
    }

    // ─────────────────────────────────────────────────────────────────────────
    // P. MEMBERSHIP APPROVAL
    // ─────────────────────────────────────────────────────────────────────────
    case 'MEMBERSHIP_APPROVAL': {
      const d = data as TemplateDataMap['MEMBERSHIP_APPROVAL'];
      const subject = `Welcome to Official Church Membership!`;
      const previewText = `Your membership with Kingdom of Christ Ministries is confirmed.`;

      const bodyHtml = `
        <p style="margin: 0 0 16px; font-size: 15px; line-height: 1.65; color: #334155;">
          It is our great joy to officially welcome you as a member of <strong>Kingdom of Christ Ministries</strong>.
        </p>
        <p style="margin: 0 0 18px; font-size: 14px; line-height: 1.65; color: #475569;">
          As a church member, you have full access to all member privileges, Bible studies, family care ministries, and community programs.
        </p>
      `;

      const rows = [
        ...(d.memberId ? [{ label: 'Member ID', value: escapeHtml(d.memberId), isBold: true, isMono: true }] : []),
        ...(d.approvalDate ? [{ label: 'Confirmed On', value: escapeHtml(d.approvalDate) }] : []),
        { label: 'Status', value: 'Active Member', isBold: true, color: '#059669' },
      ];

      const html = renderMasterEmailHtml({
        subject,
        previewText,
        badgeText: 'Welcome to the Family',
        badgeType: 'success',
        greeting: `Welcome, ${firstName}!`,
        bodyHtml,
        dataBox: {
          title: 'Membership Information',
          rows,
        },
        ctaButton: {
          label: 'Open Member Portal',
          url: d.memberPortalUrl || church.portalUrl,
        },
        closingText: '“Consequently, you are no longer foreigners and strangers, but fellow citizens with God’s people and also members of his household.” — Ephesians 2:19',
      });

      return { subject, previewText, html, text: htmlToPlainText(html) };
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Q. NEW SERMON NOTIFICATION
    // ─────────────────────────────────────────────────────────────────────────
    case 'NEW_SERMON': {
      const d = data as TemplateDataMap['NEW_SERMON'];
      const subject = `New Sermon: ${d.sermonTitle}`;
      const previewText = `Watch or listen to the latest message at Kingdom of Christ Ministries.`;

      const bodyHtml = `
        <p style="margin: 0 0 16px; font-size: 14.5px; line-height: 1.65; color: #334155;">
          A new sermon message is now available to watch and listen on our website portal.
        </p>
        <p style="margin: 0 0 18px; font-size: 17px; font-weight: 700; color: #7c3aed;">
          ${escapeHtml(d.sermonTitle)}
        </p>
      `;

      const rows = [
        ...(d.preacher ? [{ label: 'Preacher / Speaker', value: escapeHtml(d.preacher), isBold: true }] : []),
        ...(d.series ? [{ label: 'Sermon Series', value: escapeHtml(d.series) }] : []),
        ...(d.date ? [{ label: 'Delivered On', value: escapeHtml(d.date) }] : []),
      ];

      const html = renderMasterEmailHtml({
        subject,
        previewText,
        badgeText: 'Word of God',
        badgeType: 'default',
        greeting: `Hello ${firstName},`,
        bodyHtml,
        dataBox: {
          title: 'Sermon Details',
          rows,
        },
        calloutBox: d.keyVerse
          ? {
              type: 'note',
              message: `<strong>Key Scripture:</strong> <em>"${escapeHtml(d.keyVerse)}"</em>`,
            }
          : undefined,
        ctaButton: {
          label: 'Watch / Listen to Sermon',
          url: d.sermonUrl || `${church.websiteUrl}/sermons`,
        },
        closingText: 'May this message inspire and strengthen your walk in faith.',
      });

      return { subject, previewText, html, text: htmlToPlainText(html) };
    }

    // ─────────────────────────────────────────────────────────────────────────
    // R. CHURCH ANNOUNCEMENT
    // ─────────────────────────────────────────────────────────────────────────
    case 'CHURCH_ANNOUNCEMENT': {
      const d = data as TemplateDataMap['CHURCH_ANNOUNCEMENT'];
      const subject = `Church Announcement: ${d.announcementTitle}`;
      const previewText = `Important announcement from church leadership.`;

      const bodyHtml = `
        <p style="margin: 0 0 14px; font-size: 16px; font-weight: 700; color: #0f172a;">
          ${escapeHtml(d.announcementTitle)}
        </p>
        <div style="font-size: 14px; line-height: 1.7; color: #475569; margin-bottom: 18px;">
          ${d.announcementBody}
        </div>
      `;

      const html = renderMasterEmailHtml({
        subject,
        previewText,
        badgeText: 'Church Announcement',
        badgeType: 'info',
        greeting: `Hello ${firstName},`,
        bodyHtml,
        ctaButton: d.actionUrl
          ? {
              label: d.actionLabel || 'Read Full Announcement',
              url: d.actionUrl,
            }
          : undefined,
        closingText: 'Thank you for staying connected with Kingdom of Christ Ministries.',
      });

      return { subject, previewText, html, text: htmlToPlainText(html) };
    }

    // ─────────────────────────────────────────────────────────────────────────
    // S. IMPORTANT MINISTRY NOTIFICATION
    // ─────────────────────────────────────────────────────────────────────────
    case 'MINISTRY_NOTIFICATION': {
      const d = data as TemplateDataMap['MINISTRY_NOTIFICATION'];
      const subject = `Ministry Update: ${d.ministryName}`;
      const previewText = `Important notice for members of ${d.ministryName}.`;

      const bodyHtml = `
        <p style="margin: 0 0 14px; font-size: 16px; font-weight: 700; color: #0f172a;">
          ${escapeHtml(d.notificationTitle)}
        </p>
        <div style="font-size: 14px; line-height: 1.7; color: #475569; margin-bottom: 18px;">
          ${d.notificationBody}
        </div>
      `;

      const html = renderMasterEmailHtml({
        subject,
        previewText,
        badgeText: d.ministryName,
        badgeType: 'default',
        greeting: `Hello ${firstName},`,
        bodyHtml,
        ctaButton: d.actionUrl
          ? {
              label: d.actionLabel || 'View Ministry Details',
              url: d.actionUrl,
            }
          : undefined,
      });

      return { subject, previewText, html, text: htmlToPlainText(html) };
    }

    // ─────────────────────────────────────────────────────────────────────────
    // T. ACCOUNT SECURITY ALERT
    // ─────────────────────────────────────────────────────────────────────────
    case 'SECURITY_ALERT': {
      const d = data as TemplateDataMap['SECURITY_ALERT'];
      const subject = `Security Alert for Your KCM Account`;
      const previewText = `Important security notification regarding your account.`;

      const bodyHtml = `
        <p style="margin: 0 0 16px; font-size: 14.5px; line-height: 1.65; color: #334155;">
          We detected an important security-sensitive action on your Kingdom of Christ Ministries member account:
        </p>
        <p style="margin: 0 0 18px; font-size: 16px; font-weight: 700; color: #b45309;">
          ${escapeHtml(d.securityAction)}
        </p>
      `;

      const rows = [
        { label: 'Security Event', value: escapeHtml(d.securityAction), isBold: true },
        { label: 'Date & Time', value: escapeHtml(d.dateTime || new Date().toUTCString()) },
        ...(d.device ? [{ label: 'Device / Browser', value: escapeHtml(d.device) }] : []),
        ...(d.ipAddress ? [{ label: 'IP Address', value: escapeHtml(d.ipAddress), isMono: true }] : []),
        ...(d.approxLocation ? [{ label: 'Approx. Location', value: escapeHtml(d.approxLocation) }] : []),
      ];

      const html = renderMasterEmailHtml({
        subject,
        previewText,
        badgeText: 'Security Alert',
        badgeType: 'warning',
        greeting: `Hello ${firstName},`,
        bodyHtml,
        dataBox: {
          title: 'Event Details',
          rows,
        },
        calloutBox: {
          type: 'alert',
          message: `If you performed this action, no further steps are needed.<br/><strong>If you did NOT perform this action:</strong> Please change your password immediately and contact church support at <a href="mailto:${escapeHtml(church.supportEmail)}" style="color:#b45309;font-weight:600;">${escapeHtml(church.supportEmail)}</a>.`,
        },
        ctaButton: {
          label: 'Secure My Account',
          url: d.secureAccountUrl || church.portalUrl,
        },
        showUnsubscribe: false,
      });

      return { subject, previewText, html, text: htmlToPlainText(html) };
    }

    default:
      throw new Error(`Unsupported email template: ${type}`);
  }
}
