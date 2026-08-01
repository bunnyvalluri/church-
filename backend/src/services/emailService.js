/**
 * backend/src/services/emailService.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Email notification service using Resend (primary) with
 * graceful fallback logging when credentials are absent.
 *
 * Template: "New Church Event - KCM Ministries"
 * ─────────────────────────────────────────────────────────────────────────────
 */

'use strict';

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
require('dotenv').config({ path: path.join(__dirname, '../../../.env') });

const RESEND_API_KEY    = process.env.RESEND_API_KEY;
const FROM_EMAIL        = process.env.RESEND_FROM_EMAIL || 'KCM Ministries <noreply@kcmministries.org>';
const CHURCH_NAME       = process.env.NEXT_PUBLIC_CHURCH_NAME || 'Kingdom of Christ Ministries';
const FRONTEND_URL      = process.env.FRONTEND_URL || 'https://kcmchurch.vercel.app';
const EVENTS_URL        = `${FRONTEND_URL}/#events`;

let _resend = null;

function _initResend() {
  if (_resend) return _resend;
  if (!RESEND_API_KEY || RESEND_API_KEY.includes('yourResendKey')) {
    console.warn('[EMAIL] RESEND_API_KEY not configured — email notifications disabled.');
    return null;
  }
  try {
    const { Resend } = require('resend');
    _resend = new Resend(RESEND_API_KEY);
    console.log('[EMAIL] Resend client initialised.');
    return _resend;
  } catch (err) {
    console.warn('[EMAIL] Resend SDK not installed:', err.message);
    return null;
  }
}

/**
 * Build the HTML email body for an event notification.
 */
function _buildHtmlBody(member, event) {
  const eventDate = event.date
    ? new Date(event.date).toLocaleDateString('en-IN', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
      })
    : 'TBA';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>New Church Event — ${CHURCH_NAME}</title>
</head>
<body style="margin:0;padding:0;background:#0f0f1a;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center" style="padding:40px 20px;">
        <table width="600" cellpadding="0" cellspacing="0"
               style="background:#1a1a2e;border-radius:16px;overflow:hidden;
                      box-shadow:0 20px 60px rgba(139,92,246,0.3);">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#7c3aed,#a855f7,#ec4899);
                        padding:40px 40px 30px;text-align:center;">
              <div style="font-size:36px;margin-bottom:8px;">✝️</div>
              <h1 style="color:#fff;margin:0;font-size:26px;font-weight:700;
                          letter-spacing:-0.5px;">
                Kingdom of Christ Ministries
              </h1>
              <p style="color:rgba(255,255,255,0.85);margin:8px 0 0;font-size:14px;">
                A place of Love, Faith &amp; Miracles
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px;">
              <p style="color:#c4b5fd;margin:0 0 20px;font-size:16px;">
                Dear <strong style="color:#fff;">${member.fullName || 'Beloved Member'}</strong>,
              </p>
              <p style="color:#a78bfa;margin:0 0 28px;font-size:15px;line-height:1.6;">
                Praise God! A new event has been added at ${CHURCH_NAME}.
                We warmly invite you and your family to join us.
              </p>

              <!-- Event Card -->
              <div style="background:#0f0f1a;border-radius:12px;border:1px solid #7c3aed;
                          padding:28px;margin-bottom:28px;">
                <div style="color:#a855f7;font-size:12px;font-weight:600;
                             text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;">
                  📅 New Event
                </div>
                <h2 style="color:#fff;margin:0 0 16px;font-size:22px;font-weight:700;">
                  ${event.title}
                </h2>
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding:6px 0;color:#94a3b8;font-size:14px;width:100px;">
                      📍 Branch:
                    </td>
                    <td style="padding:6px 0;color:#e2e8f0;font-size:14px;font-weight:500;">
                      ${event.branchName || event.branch || 'All Branches'}
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:6px 0;color:#94a3b8;font-size:14px;">📆 Date:</td>
                    <td style="padding:6px 0;color:#e2e8f0;font-size:14px;font-weight:500;">
                      ${eventDate}
                    </td>
                  </tr>
                  ${event.time ? `
                  <tr>
                    <td style="padding:6px 0;color:#94a3b8;font-size:14px;">⏰ Time:</td>
                    <td style="padding:6px 0;color:#e2e8f0;font-size:14px;font-weight:500;">
                      ${event.time}
                    </td>
                  </tr>` : ''}
                  ${event.location ? `
                  <tr>
                    <td style="padding:6px 0;color:#94a3b8;font-size:14px;">🏛️ Venue:</td>
                    <td style="padding:6px 0;color:#e2e8f0;font-size:14px;font-weight:500;">
                      ${event.location}
                    </td>
                  </tr>` : ''}
                </table>
                ${event.description ? `
                <p style="color:#94a3b8;font-size:14px;margin:16px 0 0;line-height:1.6;
                           border-top:1px solid #2d2d44;padding-top:16px;">
                  ${event.description.substring(0, 300)}${event.description.length > 300 ? '...' : ''}
                </p>` : ''}
              </div>

              <!-- CTA Button -->
              <div style="text-align:center;margin-bottom:32px;">
                <a href="${EVENTS_URL}"
                   style="display:inline-block;background:linear-gradient(135deg,#7c3aed,#a855f7);
                           color:#fff;text-decoration:none;padding:14px 36px;
                           border-radius:50px;font-size:15px;font-weight:600;
                           letter-spacing:0.3px;">
                  View Event Details →
                </a>
              </div>

              <p style="color:#64748b;font-size:14px;line-height:1.6;margin:0;">
                God bless you and your family. We look forward to worshipping together.
              </p>
              <p style="color:#64748b;font-size:14px;margin:12px 0 0;">
                In His Love,<br/>
                <strong style="color:#94a3b8;">KCM Ministries Team</strong>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#0f0f1a;padding:24px 40px;text-align:center;
                        border-top:1px solid #1e1e38;">
              <p style="color:#475569;font-size:12px;margin:0;">
                ${CHURCH_NAME} · Hyderabad, Telangana<br/>
                <a href="${EVENTS_URL}" style="color:#7c3aed;text-decoration:none;">
                  kcmministries.org
                </a>
                &nbsp;·&nbsp;
                <a href="${EVENTS_URL}/unsubscribe" style="color:#475569;text-decoration:none;">
                  Unsubscribe
                </a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`.trim();
}

/**
 * Build plain-text fallback body.
 */
function _buildTextBody(member, event) {
  const eventDate = event.date
    ? new Date(event.date).toLocaleDateString('en-IN', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
      })
    : 'TBA';

  return [
    `Dear ${member.fullName || 'Beloved Member'},`,
    '',
    'A new event has been added at Kingdom of Christ Ministries.',
    '',
    `Event: ${event.title}`,
    `Branch: ${event.branchName || event.branch || 'All Branches'}`,
    `Date: ${eventDate}`,
    event.time   ? `Time: ${event.time}` : '',
    event.location ? `Venue: ${event.location}` : '',
    '',
    `View Event: ${EVENTS_URL}`,
    '',
    'God bless you.',
    '',
    'KCM Ministries Team',
  ].filter(l => l !== undefined).join('\n');
}

/**
 * Send an event notification email to a single member.
 *
 * @param {import('./sheetsService').KcmMember} member
 * @param {Object} event  – Prisma Event record or plain object
 * @returns {Promise<{success: boolean, messageId?: string, error?: string}>}
 */
async function sendEventEmail(member, event) {
  if (!member.email) {
    return { success: false, error: 'No email address for member' };
  }

  const resend = _initResend();
  if (!resend) {
    console.log(`[EMAIL] Skipped (no client) — would send to: ${member.email}`);
    return { success: false, error: 'Resend client not configured' };
  }

  try {
    const { data, error } = await resend.emails.send({
      from:    FROM_EMAIL,
      to:      member.email,
      subject: `New Church Event - ${CHURCH_NAME}`,
      html:    _buildHtmlBody(member, event),
      text:    _buildTextBody(member, event),
      tags: [
        { name: 'type',     value: 'event-notification' },
        { name: 'branch',   value: event.branch || 'all' },
        { name: 'event_id', value: String(event.id || '') },
      ],
    });

    if (error) {
      console.error(`[EMAIL] Send error for ${member.email}:`, error);
      return { success: false, error: error.message || JSON.stringify(error) };
    }

    console.log(`[EMAIL] ✓ Sent to ${member.email} (messageId: ${data.id})`);
    return { success: true, messageId: data.id };

  } catch (err) {
    console.error(`[EMAIL] Exception sending to ${member.email}:`, err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Send event emails to all eligible members.
 *
 * @param {import('./sheetsService').KcmMember[]} members
 * @param {Object} event
 * @returns {Promise<{sent: number, failed: number, results: Array}>}
 */
async function sendBulkEventEmails(members, event) {
  const emailMembers = members.filter(m => m.email);
  console.log(`[EMAIL] Dispatching bulk event emails to ${emailMembers.length} members...`);

  const results = await Promise.allSettled(
    emailMembers.map(m => sendEventEmail(m, event))
  );

  let sent = 0, failed = 0;
  const details = results.map((r, i) => {
    const outcome = r.status === 'fulfilled' ? r.value : { success: false, error: r.reason?.message };
    if (outcome.success) sent++; else failed++;
    return { email: emailMembers[i].email, ...outcome };
  });

  console.log(`[EMAIL] Bulk result — Sent: ${sent}, Failed: ${failed}`);
  return { sent, failed, results: details };
}

module.exports = { sendEventEmail, sendBulkEventEmails };
