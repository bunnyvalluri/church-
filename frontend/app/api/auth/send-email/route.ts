export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import {
  getFormattedLoginDateTime,
} from '@/lib/authEmailService';
import { emailService } from '@/lib/email';
import { emailConfig } from '@/lib/email/email.config';
import { escapeHtml } from '@/lib/email/email.renderer';
import { logger } from '@/lib/logger';

// ── POST /api/auth/send-email ─────────────────────────────────────────────────
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { type, name, email, phone, method } = body;

    if (!type || !email) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const sanitizedEmail = String(email).toLowerCase().trim();
    const displayName = name ? String(name).trim() : sanitizedEmail.split('@')[0];
    const firstName = displayName.split(' ')[0] || 'Member';
    const now = getFormattedLoginDateTime();

    // ── REGISTER: Welcome email to new member ────────────────────────────────
    if (type === 'REGISTER') {
      const welcomeResult = await emailService.sendWelcomeEmail(
        sanitizedEmail,
        firstName,
        undefined
      );

      // Safe admin announcement
      emailService.send({
        template: 'CHURCH_ANNOUNCEMENT',
        to: emailConfig.church.supportEmail,
        forceSend: true,
        data: {
          email: emailConfig.church.supportEmail,
          announcementTitle: `New Member Registered: ${escapeHtml(displayName)}`,
          announcementBody: `<p>A new member has registered on the KCM Portal:</p><ul><li><strong>Name:</strong> ${escapeHtml(displayName)}</li><li><strong>Email:</strong> ${escapeHtml(sanitizedEmail)}</li><li><strong>Phone:</strong> ${escapeHtml(phone || 'Not provided')}</li><li><strong>Date:</strong> ${escapeHtml(now)}</li></ul>`,
          actionLabel: 'View Member in Admin',
          actionUrl: `${emailConfig.church.websiteUrl}/admin?tab=members`,
        },
      }).catch(() => {});

      logger.info('[EMAIL/API] Registration welcome email dispatched via emailService', {
        component: 'SendEmailRoute',
        action: 'REGISTER_EMAIL_SENT',
        email: sanitizedEmail,
        welcomeResult,
      });

      return NextResponse.json({ success: true, welcomeResult });
    }

    // ── LOGIN: Branded login confirmation to user ────────────────────────────
    if (type === 'LOGIN') {
      const loginMethod = method === 'google' ? 'Google Sign-In' : 'Email & Password';

      // Dispatches branded email via multi-transport emailService
      const dispatchResult = await emailService.sendLoginNotification(
        sanitizedEmail,
        displayName,
        {
          loginDateTime: now,
          loginMethod,
        }
      );

      logger.info('[EMAIL/API] Login confirmation email processed via emailService', {
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
