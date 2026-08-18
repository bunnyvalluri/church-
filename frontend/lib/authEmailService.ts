/**
 * frontend/lib/authEmailService.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Kingdom of Christ Ministries (KCM) — Transactional Auth Email & Idempotency Service
 *
 * Multi-Transport Architecture:
 * 1. Resend Primary Dispatch: Sends branded HTML emails via Resend API.
 * 2. SMTP Transport (Gmail / Custom SMTP): Seamlessly sends via nodemailer if configured.
 * 3. Smart Sandbox Mirror: If Resend is running in unverified sandbox mode
 *    (onboarding@resend.dev where Resend limits delivery to the account owner),
 *    it gracefully mirrors the notification to the verified test owner inbox
 *    so notifications are NEVER lost during development or testing.
 * 4. Idempotency Cache: 3-minute sliding window to eliminate duplicate emails.
 * 5. Structured Audit Logging: AUTH_SUCCESS, MEMBER_LOGIN, LOGIN_EMAIL_SENT, etc.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { Resend } from 'resend';
import nodemailer from 'nodemailer';
import { logger } from '@/lib/logger';

const CHURCH_NAME = 'Kingdom of Christ Ministries';
const CHURCH_TAGLINE = '"A place of Love, Faith, and Miracles"';
const CHURCH_WEBSITE = 'https://kcmchurch.vercel.app/';
const CHURCH_PORTAL_URL = 'https://kcmchurch.vercel.app/member';
const CHURCH_SUPPORT_EMAIL = process.env.EMAIL_REPLY_TO || 'kingofchristministries23@gmail.com';
const CHURCH_ADDRESS = '15-201, Vivekananda Nagar, Srinivas Nagar, Jeedimetla, Hyderabad, Telangana 500055';
const CHURCH_PHONE = '+91 97040 90069 | +91 96409 43777';

// Fallback owner email for unverified Resend sandbox mode
const RESEND_FALLBACK_OWNER = process.env.RESEND_OWNER_EMAIL || 'rahulgamer.7123@gmail.com';

const getFromEmail = (): string => {
  return (
    process.env.EMAIL_FROM ||
    process.env.RESEND_FROM_EMAIL ||
    'Kingdom of Christ Ministries <onboarding@resend.dev>'
  );
};

const getResendClient = (): Resend | null => {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || apiKey.trim().length === 0 || apiKey.startsWith('your_') || apiKey.startsWith('re_your')) {
    return null;
  }
  return new Resend(apiKey.trim());
};

const getSmtpTransporter = () => {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER || process.env.GMAIL_USER || 'kingofchristministries23@gmail.com';
  const pass = process.env.SMTP_PASS || process.env.SMTP_PASSWORD || process.env.GMAIL_APP_PASSWORD;

  if (pass) {
    return nodemailer.createTransport({
      host: host || 'smtp.gmail.com',
      port: Number(process.env.SMTP_PORT) || 465,
      secure: Number(process.env.SMTP_PORT) === 465 || !process.env.SMTP_PORT,
      auth: {
        user,
        pass,
      },
    });
  }
  return null;
};

// ── Idempotency Deduplication Window (3 minutes per user/email) ───────────────
interface CacheEntry {
  timestamp: number;
  eventId?: string;
}

const sentEmailCache = new Map<string, CacheEntry>();
const DEDUPLICATION_TTL_MS = 3 * 60 * 1000; // 3 minutes

function cleanupCache() {
  const now = Date.now();
  for (const [key, entry] of sentEmailCache.entries()) {
    if (now - entry.timestamp > DEDUPLICATION_TTL_MS) {
      sentEmailCache.delete(key);
    }
  }
}

/**
 * Checks if a login email was recently sent for this user or event.
 * If not, registers the key in the idempotency cache.
 */
export function shouldSendLoginEmail(userKey: string, eventId?: string): boolean {
  cleanupCache();
  const normalizedKey = userKey.toLowerCase().trim();
  const existing = sentEmailCache.get(normalizedKey);

  const now = Date.now();
  if (existing) {
    if (eventId && existing.eventId === eventId) {
      return false; // Duplicate event ID
    }
    if (now - existing.timestamp < DEDUPLICATION_TTL_MS) {
      return false; // Within deduplication window
    }
  }

  sentEmailCache.set(normalizedKey, { timestamp: now, eventId });
  return true;
}

// ── Format Date & Time for Login Activity (IST / Localized) ───────────────────
export function getFormattedLoginDateTime(): string {
  try {
    return (
      new Date().toLocaleString('en-IN', {
        timeZone: 'Asia/Kolkata',
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      }) + ' IST'
    );
  } catch {
    return new Date().toUTCString();
  }
}

// ── Email Template Parameters ────────────────────────────────────────────────
export interface GoogleLoginEmailParams {
  firstName: string;
  email: string;
  loginDateTime?: string;
  loginMethod?: string;
  memberPortalUrl?: string;
  sandboxNotice?: string;
}

/**
 * Generates an email-client compatible (Gmail, Outlook, Apple Mail, Samsung Email)
 * table-based responsive HTML email for KCM Google Sign-In confirmation.
 */
export function generateGoogleLoginEmailHtml({
  firstName,
  email,
  loginDateTime = getFormattedLoginDateTime(),
  loginMethod = 'Google Sign-In',
  memberPortalUrl = CHURCH_PORTAL_URL,
  sandboxNotice,
}: GoogleLoginEmailParams): string {
  const safeName = firstName || 'Member';
  const safeEmail = email;

  const sandboxBanner = sandboxNotice
    ? `<tr>
        <td style="padding: 12px 20px; background-color: #fef3c7; border-bottom: 1px solid #fde68a; text-align: center;">
          <p style="margin: 0; font-size: 12px; font-weight: 600; color: #92400e;">
            ${sandboxNotice}
          </p>
        </td>
      </tr>`
    : '';

  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="en">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <meta name="format-detection" content="telephone=no"/>
  <meta name="x-apple-disable-message-reformatting"/>
  <title>Welcome to Kingdom of Christ Ministries — Sign-In Successful</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style type="text/css">
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; outline: none; text-decoration: none; }
    body { height: 100% !important; margin: 0 !important; padding: 0 !important; width: 100% !important; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
    @media screen and (max-width: 600px) {
      .email-container { width: 100% !important; margin: auto !important; }
      .mobile-padding { padding-left: 20px !important; padding-right: 20px !important; }
      .btn-cta { width: 100% !important; text-align: center !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; color: #1e293b;">
  <!-- Hidden Preheader -->
  <div style="display: none; font-size: 1px; color: #f8fafc; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden;">
    Your sign-in to Kingdom of Christ Ministries was successful. Access your Member Portal now.
  </div>

  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8fafc; table-layout: fixed;">
    <tr>
      <td align="center" style="padding: 32px 16px;">
        <!-- ── Main Card Container ── -->
        <table border="0" cellpadding="0" cellspacing="0" width="100%" class="email-container" style="max-width: 580px; background-color: #ffffff; border-radius: 20px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05);">
          
          ${sandboxBanner}

          <!-- ── Top Purple Gradient Brand Header ── -->
          <tr>
            <td align="center" style="background: linear-gradient(135deg, #7c3aed 0%, #6366f1 100%); background-color: #7c3aed; padding: 36px 30px 30px; text-align: center;">
              <!-- Cross Logo Badge -->
              <table border="0" cellpadding="0" cellspacing="0" style="margin: 0 auto 14px;">
                <tr>
                  <td align="center" style="width: 52px; height: 52px; background: rgba(255, 255, 255, 0.18); border: 2px solid rgba(255, 255, 255, 0.35); border-radius: 50%; text-align: center; vertical-align: middle;">
                    <span style="font-size: 26px; line-height: 52px; color: #ffffff; font-weight: bold; display: block; font-family: serif;">✝</span>
                  </td>
                </tr>
              </table>
              <h1 style="margin: 0; font-size: 20px; font-weight: 800; color: #ffffff; letter-spacing: 0.05em; text-transform: uppercase; text-shadow: 0 1px 2px rgba(0,0,0,0.15);">
                KINGDOM OF CHRIST MINISTRIES
              </h1>
              <p style="margin: 4px 0 0; font-size: 12px; color: rgba(255, 255, 255, 0.85); letter-spacing: 0.08em; text-transform: uppercase;">
                Hyderabad, Telangana
              </p>
            </td>
          </tr>

          <!-- ── Main Content Area ── -->
          <tr>
            <td class="mobile-padding" style="padding: 36px 36px 28px;">
              
              <!-- Greeting -->
              <h2 style="margin: 0 0 16px; font-size: 22px; font-weight: 800; color: #0f172a; letter-spacing: -0.02em;">
                Welcome, ${safeName}! 👋
              </h2>

              <p style="margin: 0 0 8px; font-size: 15px; line-height: 1.6; color: #334155; font-weight: 600;">
                Your sign-in was successful.
              </p>

              <p style="margin: 0 0 26px; font-size: 14px; line-height: 1.65; color: #64748b;">
                You have successfully signed in to your Kingdom of Christ Ministries member account using Google.
              </p>

              <!-- ── ACCOUNT ACTIVITY BOX ── -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; margin-bottom: 28px;">
                <tr>
                  <td style="padding: 18px 22px; border-bottom: 1px solid #edf2f7;">
                    <span style="font-size: 11px; font-weight: 800; color: #7c3aed; letter-spacing: 0.1em; text-transform: uppercase; display: block;">
                      ACCOUNT ACTIVITY
                    </span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 16px 22px;">
                    <table border="0" cellpadding="0" cellspacing="0" width="100%">
                      <!-- Account -->
                      <tr>
                        <td style="padding: 6px 0; font-size: 13px; color: #64748b; font-weight: 500; width: 130px; vertical-align: top;">
                          Account:
                        </td>
                        <td style="padding: 6px 0; font-size: 13px; color: #0f172a; font-weight: 600; word-break: break-all;">
                          ${safeEmail}
                        </td>
                      </tr>
                      <!-- Sign-in Method -->
                      <tr>
                        <td style="padding: 6px 0; font-size: 13px; color: #64748b; font-weight: 500; vertical-align: top;">
                          Sign-in method:
                        </td>
                        <td style="padding: 6px 0; font-size: 13px; color: #0f172a; font-weight: 600;">
                          ${loginMethod}
                        </td>
                      </tr>
                      <!-- Date & Time -->
                      <tr>
                        <td style="padding: 6px 0; font-size: 13px; color: #64748b; font-weight: 500; vertical-align: top;">
                          Date &amp; Time:
                        </td>
                        <td style="padding: 6px 0; font-size: 13px; color: #0f172a; font-weight: 600;">
                          ${loginDateTime}
                        </td>
                      </tr>
                      <!-- Status -->
                      <tr>
                        <td style="padding: 6px 0; font-size: 13px; color: #64748b; font-weight: 500; vertical-align: middle;">
                          Status:
                        </td>
                        <td style="padding: 6px 0; vertical-align: middle;">
                          <span style="display: inline-block; background-color: #ecfdf5; color: #059669; font-size: 12px; font-weight: 700; padding: 2px 10px; border-radius: 9999px; border: 1px solid #a7f3d0;">
                            ✓ Successful
                          </span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- ── CTA BUTTON: OPEN MEMBER PORTAL ── -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 28px;">
                <tr>
                  <td align="center">
                    <table border="0" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center" style="background: linear-gradient(135deg, #7c3aed 0%, #6366f1 100%); background-color: #7c3aed; border-radius: 12px; box-shadow: 0 4px 14px rgba(124, 58, 237, 0.35);">
                          <a href="${memberPortalUrl}" target="_blank" class="btn-cta" style="display: inline-block; padding: 15px 36px; font-size: 14px; font-weight: 700; color: #ffffff; text-decoration: none; letter-spacing: 0.04em; text-transform: uppercase; border-radius: 12px;">
                            OPEN MEMBER PORTAL →
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Informational description -->
              <p style="margin: 0 0 20px; font-size: 13.5px; line-height: 1.65; color: #475569;">
                You can now access your Kingdom of Christ Ministries Member Portal to manage your profile, view church updates, events, resources, and other available member services.
              </p>

              <!-- Security notice box -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #fffbeb; border-left: 3px solid #f59e0b; border-radius: 0 8px 8px 0; margin-bottom: 26px;">
                <tr>
                  <td style="padding: 12px 16px;">
                    <p style="margin: 0; font-size: 12px; line-height: 1.6; color: #92400e;">
                      <strong>Security Note:</strong> If you did not authorize this sign-in, please secure your Google Account immediately and contact Kingdom of Christ Ministries administration.
                    </p>
                  </td>
                </tr>
              </table>

              <p style="margin: 0 0 6px; font-size: 14px; color: #334155; font-weight: 500;">
                Thank you for being part of our community.
              </p>

              <p style="margin: 0 0 24px; font-size: 14px; color: #334155; font-weight: 600;">
                With love and blessings,
              </p>

              <!-- Church signature block -->
              <div style="border-top: 1px solid #f1f5f9; padding-top: 16px;">
                <p style="margin: 0; font-size: 14px; font-weight: 800; color: #0f172a;">
                  ${CHURCH_NAME}
                </p>
                <p style="margin: 2px 0 6px; font-size: 12.5px; font-style: italic; color: #7c3aed; font-weight: 600;">
                  ${CHURCH_TAGLINE}
                </p>
                <p style="margin: 0; font-size: 12px; color: #64748b;">
                  Website: <a href="${CHURCH_WEBSITE}" target="_blank" style="color: #7c3aed; text-decoration: none; font-weight: 600;">${CHURCH_WEBSITE}</a>
                </p>
              </div>

            </td>
          </tr>

          <!-- ── FOOTER ── -->
          <tr>
            <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 24px 36px; text-align: center;">
              <p style="margin: 0 0 4px; font-size: 12px; font-weight: 700; color: #475569;">
                ${CHURCH_NAME}
              </p>
              <p style="margin: 0 0 4px; font-size: 11px; color: #94a3b8;">
                ${CHURCH_ADDRESS}
              </p>
              <p style="margin: 0 0 12px; font-size: 11px; color: #94a3b8;">
                ${CHURCH_PHONE} &bull; <a href="mailto:${CHURCH_SUPPORT_EMAIL}" style="color: #7c3aed; text-decoration: none;">${CHURCH_SUPPORT_EMAIL}</a>
              </p>
              <p style="margin: 0; font-size: 10.5px; color: #cbd5e1; line-height: 1.4;">
                This is an automated transactional security notification for your member account. Please do not reply directly to this message.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/**
 * Dispatches the branded KCM Google login confirmation email to the user.
 * Supports Resend, SMTP (Gmail/Custom), and smart sandbox fallback.
 */
export async function sendGoogleLoginConfirmationEmail({
  userId,
  email,
  name,
  eventId,
  loginMethod = 'Google Sign-In',
}: {
  userId: string;
  email: string;
  name?: string | null;
  eventId?: string;
  loginMethod?: string;
}): Promise<{ sent: boolean; reason?: string; transport?: string }> {
  const sanitizedEmail = (email || '').toLowerCase().trim();
  if (!sanitizedEmail) {
    logger.warn('[EMAIL/AUTH] Skipped login email: Missing recipient email address', {
      component: 'authEmailService',
      action: 'LOGIN_EMAIL_FAILED',
      userId,
    });
    return { sent: false, reason: 'MISSING_EMAIL' };
  }

  // 1. Idempotency Check: Prevent duplicate sends for the same user within TTL
  const deduplicationKey = `${userId || sanitizedEmail}:google-login`;
  if (!shouldSendLoginEmail(deduplicationKey, eventId)) {
    logger.info('[EMAIL/AUTH] Skipped duplicate login email (deduplicated by idempotency guard)', {
      component: 'authEmailService',
      action: 'LOGIN_EMAIL_DEDUPLICATED',
      userId,
      email: sanitizedEmail,
    });
    return { sent: false, reason: 'DEDUPLICATED' };
  }

  const firstName = (name || '').trim().split(' ')[0] || 'Member';
  const loginDateTime = getFormattedLoginDateTime();
  const subject = 'Welcome to Kingdom of Christ Ministries — Sign-In Successful';

  // ── Transport 1: Check SMTP (Gmail / Custom SMTP) ─────────────────────────
  const smtpTransporter = getSmtpTransporter();
  if (smtpTransporter) {
    try {
      const htmlContent = generateGoogleLoginEmailHtml({
        firstName,
        email: sanitizedEmail,
        loginDateTime,
        loginMethod,
        memberPortalUrl: CHURCH_PORTAL_URL,
      });

      const senderAddress = process.env.SMTP_FROM || `"${CHURCH_NAME}" <${process.env.SMTP_USER || CHURCH_SUPPORT_EMAIL}>`;
      await smtpTransporter.sendMail({
        from: senderAddress,
        to: sanitizedEmail,
        replyTo: CHURCH_SUPPORT_EMAIL,
        subject,
        html: htmlContent,
      });

      logger.info('[EMAIL/AUTH] Successfully sent KCM login confirmation email via SMTP', {
        component: 'authEmailService',
        action: 'LOGIN_EMAIL_SENT',
        userId,
        email: sanitizedEmail,
        transport: 'SMTP',
      });

      return { sent: true, transport: 'SMTP' };
    } catch (smtpErr: any) {
      logger.warn(`[EMAIL/AUTH] SMTP dispatch failed, falling back to Resend: ${smtpErr?.message}`, {
        component: 'authEmailService',
        error: smtpErr?.message,
      });
    }
  }

  // ── Transport 2: Resend API ───────────────────────────────────────────────
  const resendClient = getResendClient();
  if (!resendClient) {
    logger.warn('[EMAIL/AUTH] Skipped login email: No email transport configured (RESEND_API_KEY or SMTP)', {
      component: 'authEmailService',
      action: 'LOGIN_EMAIL_FAILED',
      userId,
      email: sanitizedEmail,
    });
    return { sent: false, reason: 'NO_CONFIGURED_TRANSPORT' };
  }

  try {
    const fromAddress = getFromEmail();
    const htmlContent = generateGoogleLoginEmailHtml({
      firstName,
      email: sanitizedEmail,
      loginDateTime,
      loginMethod,
      memberPortalUrl: CHURCH_PORTAL_URL,
    });

    const result = await resendClient.emails.send({
      from: fromAddress,
      to: [sanitizedEmail],
      replyTo: CHURCH_SUPPORT_EMAIL,
      subject,
      html: htmlContent,
    });

    if ((result as any)?.error) {
      const errorObj = (result as any).error;
      const errorMsg = errorObj?.message || 'Resend error';

      // ── Handle Resend Sandbox restriction (when domain is unverified on onboarding@resend.dev)
      if (
        errorObj?.statusCode === 403 ||
        errorMsg.includes('only send testing emails to your own email address')
      ) {
        logger.warn(
          `[EMAIL/AUTH] Resend sandbox restriction: Recipient "${sanitizedEmail}" is not verified. Dispatching to test owner "${RESEND_FALLBACK_OWNER}". To send directly to all members, verify domain at resend.com/domains.`,
          {
            component: 'authEmailService',
            action: 'LOGIN_EMAIL_SANDBOX_REDIRECT',
            originalRecipient: sanitizedEmail,
            fallbackRecipient: RESEND_FALLBACK_OWNER,
          }
        );

        const sandboxHtml = generateGoogleLoginEmailHtml({
          firstName,
          email: sanitizedEmail,
          loginDateTime,
          loginMethod,
          memberPortalUrl: CHURCH_PORTAL_URL,
          sandboxNotice: `⚠️ Test Mode Notice: This email was originally generated for ${sanitizedEmail} and delivered to your verified developer inbox.`,
        });

        const fallbackResult = await resendClient.emails.send({
          from: fromAddress,
          to: [RESEND_FALLBACK_OWNER],
          replyTo: CHURCH_SUPPORT_EMAIL,
          subject: `[Dev Preview for ${sanitizedEmail}] ${subject}`,
          html: sandboxHtml,
        });

        if (!(fallbackResult as any)?.error) {
          logger.info('[EMAIL/AUTH] Successfully delivered sandbox login email to owner inbox', {
            component: 'authEmailService',
            action: 'LOGIN_EMAIL_SENT',
            fallbackRecipient: RESEND_FALLBACK_OWNER,
            originalRecipient: sanitizedEmail,
          });
          return { sent: true, transport: 'RESEND_SANDBOX_FALLBACK' };
        }
      }

      logger.error(`[EMAIL/AUTH] Failed to dispatch login confirmation email: ${errorMsg}`, {
        component: 'authEmailService',
        action: 'LOGIN_EMAIL_FAILED',
        userId,
        email: sanitizedEmail,
      });
      return { sent: false, reason: errorMsg };
    }

    logger.info('[EMAIL/AUTH] Successfully sent KCM Google login confirmation email via Resend', {
      component: 'authEmailService',
      action: 'LOGIN_EMAIL_SENT',
      userId,
      email: sanitizedEmail,
      loginMethod,
      transport: 'RESEND',
    });

    return { sent: true, transport: 'RESEND' };
  } catch (err: any) {
    logger.error(`[EMAIL/AUTH] Unexpected exception during login email dispatch: ${err?.message || err}`, {
      component: 'authEmailService',
      action: 'LOGIN_EMAIL_FAILED',
      userId,
      email: sanitizedEmail,
    });
    return { sent: false, reason: err?.message || 'EXCEPTION' };
  }
}
