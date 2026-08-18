export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import {
  generateGoogleLoginEmailHtml,
  shouldSendLoginEmail,
  getFormattedLoginDateTime,
  sendGoogleLoginConfirmationEmail,
} from '@/lib/authEmailService';
import { logger } from '@/lib/logger';

const getResendClient = () => {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || apiKey.trim().length === 0 || apiKey.startsWith('your_')) {
    return null;
  }
  return new Resend(apiKey.trim());
};

const PORTAL_URL = process.env.NEXTAUTH_URL || 'https://kcmchurch.vercel.app';
const CHURCH_NAME = 'Kingdom of Christ Ministries';
const CHURCH_EMAIL = process.env.EMAIL_REPLY_TO || 'kingofchristministries23@gmail.com';
const CHURCH_PHONE = '+91 97040 90069 | +91 96409 43777';
const CHURCH_ADDR = '15-201, Vivekananda Nagar, Srinivas Nagar, Jeedimetla, Hyderabad, Telangana 500055';
const FROM_EMAIL =
  process.env.EMAIL_FROM ||
  process.env.RESEND_FROM_EMAIL ||
  'Kingdom of Christ Ministries <onboarding@resend.dev>';
const NOTIFY_EMAIL = process.env.EMAIL_REPLY_TO || 'kingofchristministries23@gmail.com';

const BRAND = {
  primary: '#4F46E5',
  accent: '#7C3AED',
  dark: '#0F0F1A',
  surface: '#FFFFFF',
  muted: '#6B7280',
  border: '#E5E7EB',
  success: '#10B981',
  warning: '#F59E0B',
};

function emailShell(content: string, preheader = ''): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${CHURCH_NAME}</title>
  <!--[if mso]><noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript><![endif]-->
</head>
<body style="margin:0;padding:0;background:#F3F4F6;font-family:'Segoe UI',Arial,sans-serif;">
  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">${preheader}&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;</div>
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F3F4F6;min-height:100vh;">
    <tr><td align="center" style="padding:40px 16px;">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
        <tr><td style="background:linear-gradient(135deg,${BRAND.primary} 0%,${BRAND.accent} 100%);border-radius:16px 16px 0 0;padding:36px 40px;text-align:center;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td align="center" style="padding-bottom:16px;">
                <div style="display:inline-block;width:56px;height:56px;background:rgba(255,255,255,0.15);border-radius:50%;border:2px solid rgba(255,255,255,0.3);line-height:56px;font-size:26px;color:#fff;">✝</div>
              </td>
            </tr>
            <tr>
              <td align="center">
                <p style="margin:0;font-size:11px;font-weight:700;color:rgba(255,255,255,0.7);letter-spacing:0.15em;text-transform:uppercase;">Kingdom of Christ</p>
                <p style="margin:2px 0 0;font-size:22px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;">Ministries</p>
                <p style="margin:6px 0 0;font-size:11px;color:rgba(255,255,255,0.65);letter-spacing:0.05em;">Hyderabad · Telangana</p>
              </td>
            </tr>
          </table>
        </td></tr>
        <tr><td style="background:#ffffff;padding:40px 40px 32px;border-left:1px solid ${BRAND.border};border-right:1px solid ${BRAND.border};">
          ${content}
        </td></tr>
        <tr><td style="background:#F9FAFB;border:1px solid ${BRAND.border};border-top:none;border-radius:0 0 16px 16px;padding:28px 40px;text-align:center;">
          <p style="margin:0 0 6px;font-size:13px;font-weight:700;color:#374151;">${CHURCH_NAME}</p>
          <p style="margin:0 0 4px;font-size:12px;color:${BRAND.muted};">${CHURCH_ADDR}</p>
          <p style="margin:0 0 16px;font-size:12px;color:${BRAND.muted};">${CHURCH_PHONE} · <a href="mailto:${CHURCH_EMAIL}" style="color:${BRAND.primary};text-decoration:none;">${CHURCH_EMAIL}</a></p>
          <div style="border-top:1px solid ${BRAND.border};padding-top:16px;">
            <p style="margin:0;font-size:11px;color:#9CA3AF;">This is an automated notification from the KCM Member Portal. Please do not reply to this email.</p>
            <p style="margin:6px 0 0;font-size:11px;color:#9CA3AF;">© ${new Date().getFullYear()} ${CHURCH_NAME}. All rights reserved.</p>
          </div>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function welcomeEmailHtml(name: string, email: string): string {
  const joinDate = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const body = `
    <h1 style="margin:0 0 8px;font-size:26px;font-weight:800;color:#111827;letter-spacing:-0.5px;">Welcome to the Family! 🎉</h1>
    <p style="margin:0 0 28px;font-size:15px;color:${BRAND.muted};line-height:1.6;">We're so glad you've joined <strong style="color:#111827;">Kingdom of Christ Ministries</strong>. Your account has been successfully created.</p>

    <div style="background:linear-gradient(135deg,${BRAND.primary}08,${BRAND.accent}08);border:1px solid ${BRAND.primary}20;border-radius:12px;padding:24px;margin-bottom:28px;">
      <p style="margin:0 0 12px;font-size:11px;font-weight:700;color:${BRAND.primary};letter-spacing:0.12em;text-transform:uppercase;">Your Account Details</p>
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="padding:6px 0;font-size:13px;color:${BRAND.muted};width:120px;">Full Name</td>
          <td style="padding:6px 0;font-size:13px;font-weight:600;color:#111827;">${name}</td>
        </tr>
        <tr>
          <td style="padding:6px 0;font-size:13px;color:${BRAND.muted};">Email</td>
          <td style="padding:6px 0;font-size:13px;font-weight:600;color:#111827;">${email}</td>
        </tr>
        <tr>
          <td style="padding:6px 0;font-size:13px;color:${BRAND.muted};">Joined On</td>
          <td style="padding:6px 0;font-size:13px;font-weight:600;color:#111827;">${joinDate}</td>
        </tr>
        <tr>
          <td style="padding:6px 0;font-size:13px;color:${BRAND.muted};">Role</td>
          <td style="padding:6px 0;">
            <span style="display:inline-block;background:${BRAND.success}15;color:${BRAND.success};font-size:11px;font-weight:700;padding:3px 10px;border-radius:999px;border:1px solid ${BRAND.success}30;letter-spacing:0.05em;">MEMBER</span>
          </td>
        </tr>
      </table>
    </div>

    <div style="border-left:3px solid ${BRAND.primary};padding:12px 20px;margin-bottom:28px;background:#FAFAFA;border-radius:0 8px 8px 0;">
      <p style="margin:0;font-size:14px;font-style:italic;color:#374151;line-height:1.7;">"For where two or three gather in my name, there am I with them."</p>
      <p style="margin:6px 0 0;font-size:12px;font-weight:600;color:${BRAND.primary};">— Matthew 18:20</p>
    </div>

    <div style="text-align:center;margin-bottom:28px;">
      <a href="${PORTAL_URL}/member" style="display:inline-block;background:linear-gradient(135deg,${BRAND.primary},${BRAND.accent});color:#fff;font-size:14px;font-weight:700;padding:14px 36px;border-radius:10px;text-decoration:none;letter-spacing:0.02em;box-shadow:0 4px 14px ${BRAND.primary}40;">
        Access Member Portal →
      </a>
    </div>

    <p style="margin:0;font-size:14px;color:${BRAND.muted};line-height:1.7;">If you didn't create this account, please contact us immediately at <a href="mailto:${CHURCH_EMAIL}" style="color:${BRAND.primary};">${CHURCH_EMAIL}</a>.</p>
    <p style="margin:20px 0 0;font-size:14px;color:#374151;">Blessings in Christ,<br/><strong>Bishop Kurra Kristhu Raju</strong><br/><span style="font-size:12px;color:${BRAND.muted};">Senior Pastor &amp; Founder, KCM</span></p>
  `;
  return emailShell(body, `Welcome to Kingdom of Christ Ministries, ${name}! Your account is ready.`);
}

function loginAdminAlertHtml(name: string, email: string, loginTime: string, method: string): string {
  const body = `
    <div style="text-align:center;margin-bottom:24px;">
      <div style="display:inline-block;width:60px;height:60px;background:${BRAND.warning}15;border:2px solid ${BRAND.warning}30;border-radius:50%;line-height:60px;font-size:28px;">🔔</div>
    </div>
    <h1 style="margin:0 0 8px;font-size:22px;font-weight:800;color:#111827;text-align:center;">Member Login Alert</h1>
    <p style="margin:0 0 28px;font-size:14px;color:${BRAND.muted};text-align:center;line-height:1.6;">A member just signed in to the KCM Member Portal.</p>
    <div style="background:#FAFAFA;border:1px solid ${BRAND.border};border-radius:12px;padding:24px;margin-bottom:24px;">
      <p style="margin:0 0 16px;font-size:11px;font-weight:700;color:${BRAND.primary};letter-spacing:0.12em;text-transform:uppercase;">Login Details</p>
      <table width="100%" cellpadding="0" cellspacing="0">
        ${[
          ['Member Name', name],
          ['Email Address', email],
          ['Login Time', loginTime],
          ['Sign-in Method', method],
          ['Portal', 'KCM Member Portal'],
        ]
          .map(
            ([label, val]) => `
          <tr>
            <td style="padding:8px 0;border-bottom:1px solid ${BRAND.border};font-size:13px;color:${BRAND.muted};width:140px;font-weight:500;">${label}</td>
            <td style="padding:8px 0;border-bottom:1px solid ${BRAND.border};font-size:13px;font-weight:600;color:#111827;">${val}</td>
          </tr>
        `
          )
          .join('')}
      </table>
    </div>
    <div style="background:${BRAND.success}10;border:1px solid ${BRAND.success}25;border-radius:10px;padding:14px 20px;margin-bottom:24px;">
      <p style="margin:0;font-size:13px;color:#065F46;font-weight:600;">✓ Successful authentication.</p>
    </div>
  `;
  return emailShell(body, `Login alert: ${name} (${email}) signed in.`);
}

function newMemberAdminHtml(name: string, email: string, phone: string, regTime: string): string {
  const body = `
    <div style="text-align:center;margin-bottom:24px;">
      <div style="display:inline-block;width:60px;height:60px;background:${BRAND.primary}15;border:2px solid ${BRAND.primary}30;border-radius:50%;line-height:60px;font-size:28px;">🧑‍🤝‍🧑</div>
    </div>
    <h1 style="margin:0 0 8px;font-size:22px;font-weight:800;color:#111827;text-align:center;">New Member Registered! 🎉</h1>
    <p style="margin:0 0 28px;font-size:14px;color:${BRAND.muted};text-align:center;line-height:1.6;">A new member has just joined Kingdom of Christ Ministries.</p>
    <div style="background:linear-gradient(135deg,${BRAND.primary}08,${BRAND.accent}08);border:1px solid ${BRAND.primary}20;border-radius:12px;padding:24px;margin-bottom:24px;">
      <p style="margin:0 0 16px;font-size:11px;font-weight:700;color:${BRAND.primary};letter-spacing:0.12em;text-transform:uppercase;">New Member Details</p>
      <table width="100%" cellpadding="0" cellspacing="0">
        ${[
          ['Full Name', name],
          ['Email Address', email],
          ['Phone Number', phone || 'Not provided'],
          ['Registered At', regTime],
          ['Default Role', 'MEMBER'],
        ]
          .map(
            ([label, val]) => `
          <tr>
            <td style="padding:8px 0;border-bottom:1px solid ${BRAND.border};font-size:13px;color:${BRAND.muted};width:140px;font-weight:500;">${label}</td>
            <td style="padding:8px 0;border-bottom:1px solid ${BRAND.border};font-size:13px;font-weight:600;color:#111827;">${val}</td>
          </tr>
        `
          )
          .join('')}
      </table>
    </div>
    <div style="text-align:center;margin-bottom:24px;">
      <a href="${PORTAL_URL}/admin?tab=members" style="display:inline-block;background:linear-gradient(135deg,${BRAND.primary},${BRAND.accent});color:#fff;font-size:13px;font-weight:700;padding:12px 28px;border-radius:10px;text-decoration:none;letter-spacing:0.02em;">
        View in Admin Panel →
      </a>
    </div>
  `;
  return emailShell(body, `New member registered: ${name} (${email})`);
}

// ── POST /api/auth/send-email ─────────────────────────────────────────────────
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { type, name, email, phone, method } = body;

    if (!type || !email) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const sanitizedEmail = String(email).toLowerCase().trim();
    const displayName = name || sanitizedEmail.split('@')[0];
    const firstName = displayName.split(' ')[0] || 'Member';
    const now = getFormattedLoginDateTime();

    const resendClient = getResendClient();
    if (!resendClient) {
      logger.warn('[EMAIL/API] Skipped email dispatch: RESEND_API_KEY not configured', {
        component: 'SendEmailRoute',
        action: 'EMAIL_SKIPPED',
        type,
        email: sanitizedEmail,
      });
      return NextResponse.json({ success: true, message: 'Email service unconfigured' });
    }

    // ── REGISTER: Welcome email to new member + Alert to admin ────────────────
    if (type === 'REGISTER') {
      const [welcomeResult, adminResult] = await Promise.allSettled([
        resendClient.emails.send({
          from: FROM_EMAIL,
          to: [sanitizedEmail],
          replyTo: CHURCH_EMAIL,
          subject: `✝ Welcome to Kingdom of Christ Ministries, ${firstName}!`,
          html: welcomeEmailHtml(displayName, sanitizedEmail),
        }),
        resendClient.emails.send({
          from: FROM_EMAIL,
          to: [NOTIFY_EMAIL],
          replyTo: CHURCH_EMAIL,
          subject: `🧑‍🤝‍🧑 New Member Registered: ${displayName}`,
          html: newMemberAdminHtml(displayName, sanitizedEmail, phone || '', now),
        }),
      ]);

      logger.info('[EMAIL/API] Registration emails dispatched', {
        component: 'SendEmailRoute',
        action: 'REGISTER_EMAIL_SENT',
        email: sanitizedEmail,
      });

      return NextResponse.json({ success: true });
    }

    // ── LOGIN: Branded login confirmation to user + Admin alert ──────────────
    if (type === 'LOGIN') {
      const loginMethod = method === 'google' ? 'Google Sign-In' : 'Email & Password';

      // Dispatches branded email via multi-transport (SMTP / Resend / Sandbox Fallback)
      const dispatchResult = await sendGoogleLoginConfirmationEmail({
        userId: sanitizedEmail,
        email: sanitizedEmail,
        name: displayName,
        loginMethod,
      });

      // Also trigger admin security alert notification safely
      try {
        await resendClient.emails.send({
          from: FROM_EMAIL,
          to: [NOTIFY_EMAIL],
          replyTo: CHURCH_EMAIL,
          subject: `🔔 Member Login: ${displayName} (${sanitizedEmail})`,
          html: loginAdminAlertHtml(displayName, sanitizedEmail, now, loginMethod),
        });
      } catch (adminAlertErr) {
        // Non-blocking admin notification
      }

      logger.info('[EMAIL/API] Login confirmation email processed', {
        component: 'SendEmailRoute',
        action: 'LOGIN_EMAIL_SENT',
        email: sanitizedEmail,
        loginMethod,
        dispatchResult,
      });

      return NextResponse.json({ success: true, dispatchResult });
    }

    return NextResponse.json({ error: 'Unknown email type' }, { status: 400 });
  } catch (err: any) {
    logger.error('[EMAIL/API] Exception in send-email handler', {
      component: 'SendEmailRoute',
      action: 'LOGIN_EMAIL_FAILED',
      error: err?.message || String(err),
    });
    return NextResponse.json({ error: 'Email delivery encountered an issue' }, { status: 500 });
  }
}
