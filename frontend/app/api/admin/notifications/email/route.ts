export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminOrDev } from '@/lib/authMiddleware';
import { emailService } from '@/lib/email/email.service';
import { emailConfig } from '@/lib/email/email.config';
import { getEmailProvider } from '@/lib/email/providers';
import { renderEmailTemplate } from '@/lib/email/email.templates';
import { EmailTemplateType, TemplateDataMap } from '@/lib/email/email.types';

// ── Realistic Mock Data for Live Admin Previews of All 20 Templates ──────────
function getSampleDataForTemplate<T extends EmailTemplateType>(template: T): TemplateDataMap[T] {
  const base = {
    firstName: 'Samuel',
    lastName: 'Paul',
    fullName: 'Samuel Paul',
    email: 'samuel.paul@example.com',
  };

  const sampleMap: Record<EmailTemplateType, any> = {
    WELCOME: {
      ...base,
      visitUrl: emailConfig.church.websiteUrl,
    },
    EMAIL_VERIFICATION: {
      ...base,
      verificationUrl: `${emailConfig.church.websiteUrl}/auth/verify?token=sample_token_kcm_2026`,
      expirationTime: '24 hours',
    },
    PASSWORD_RESET: {
      ...base,
      resetUrl: `${emailConfig.church.websiteUrl}/auth/reset-password?token=sample_reset_kcm_2026`,
      expirationTime: '1 hour',
    },
    LOGIN_ALERT: {
      ...base,
      loginDateTime: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) + ' IST',
      loginMethod: 'Google Sign-In',
      device: 'Google Chrome (Windows 11)',
      ipAddress: '152.58.12.84',
      approxLocation: 'Hyderabad, Telangana, India',
    },
    EVENT_CREATED: {
      ...base,
      eventName: 'Grand Easter Sunday Fellowship 2026',
      eventDate: 'Sunday, April 5, 2026',
      eventTime: '9:30 AM – 1:00 PM IST',
      eventLocation: 'Main Sanctuary, Jeedimetla, Hyderabad',
      eventDescription: 'Join us for a spirit-filled celebration of Resurrection Sunday with special worship and fellowship luncheon.',
      eventUrl: `${emailConfig.church.websiteUrl}/events/easter-2026`,
      branchName: 'Main Campus',
    },
    EVENT_UPDATED: {
      ...base,
      eventName: 'Grand Easter Sunday Fellowship 2026',
      eventDate: 'Sunday, April 5, 2026',
      eventTime: '10:00 AM – 1:30 PM IST (Updated start time)',
      eventLocation: 'Main Sanctuary, Jeedimetla, Hyderabad',
      updateSummary: 'The starting time has been adjusted to 10:00 AM to accommodate parking and registration.',
      eventUrl: `${emailConfig.church.websiteUrl}/events/easter-2026`,
    },
    EVENT_REMINDER: {
      ...base,
      eventName: 'Grand Easter Sunday Fellowship 2026',
      eventDate: 'This Sunday, April 5, 2026',
      eventTime: '10:00 AM IST',
      eventLocation: 'Main Sanctuary, 15-201, Vivekananda Nagar, Jeedimetla, Hyderabad',
      eventUrl: `${emailConfig.church.websiteUrl}/events/easter-2026`,
      googleMapsUrl: 'https://maps.google.com/?q=Kingdom+of+Christ+Ministries+Jeedimetla',
    },
    EVENT_CANCELLED: {
      ...base,
      eventName: 'Mid-Week Fasting Prayer',
      eventDate: 'Wednesday, April 1, 2026',
      cancellationReason: 'Cancelled due to facility maintenance and sanctuary audio-visual system upgrades.',
      calendarUrl: `${emailConfig.church.websiteUrl}/events`,
    },
    PRAYER_CONFIRMATION: {
      ...base,
      prayerRequestId: 'PR-2026-8941',
      title: 'Healing for My Mother and Family Peace',
      category: 'Healing & Family',
      submittedAt: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }),
    },
    PRAYER_STATUS_UPDATE: {
      ...base,
      prayerRequestId: 'PR-2026-8941',
      title: 'Healing for My Mother and Family Peace',
      status: 'In Pastoral Prayer',
      pastoralNote: 'Our pastoral team has lifted your mother and family up in prayer during this morning\'s intercession. We stand with you in faith for complete healing.',
    },
    DONATION_CONFIRMATION: {
      ...base,
      donationAmount: '₹5,000.00',
      transactionId: 'pay_KCM9823471029',
      date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }),
      purpose: 'Building Fund & Mission Outreach',
      paymentMethod: 'UPI / Razorpay',
      receiptUrl: `${emailConfig.church.websiteUrl}/donations/receipts/sample`,
    },
    DONATION_RECEIPT: {
      ...base,
      receiptNumber: 'KCM-2026-00482',
      donationAmount: '₹5,000.00',
      transactionId: 'pay_KCM9823471029',
      date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }),
      purpose: 'Building Fund & Mission Outreach',
      verificationCode: 'VRF-9824-A1',
      utr: 'UTR409283749201',
      donorName: 'Samuel Paul',
      receiptUrl: `${emailConfig.church.websiteUrl}/donations/receipts/sample`,
      downloadPdfUrl: `${emailConfig.church.websiteUrl}/api/receipts/sample?download=true`,
    },
    VOLUNTEER_CONFIRMATION: {
      ...base,
      ministry: 'Audio / Visual & Media Production',
      appliedAt: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }),
    },
    VOLUNTEER_APPROVAL: {
      ...base,
      ministry: 'Audio / Visual & Media Production',
      coordinatorName: 'Brother David Raj',
      coordinatorContact: '+91 97040 90069',
      orientationDate: 'Saturday at 4:00 PM in the Media Room',
      volunteerPortalUrl: `${emailConfig.church.websiteUrl}/member?tab=volunteer`,
    },
    MEMBERSHIP_CONFIRMATION: {
      ...base,
      applicationId: 'MEM-APP-2026-118',
      appliedAt: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }),
    },
    MEMBERSHIP_APPROVAL: {
      ...base,
      memberId: 'KCM-M-5082',
      approvalDate: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }),
      memberPortalUrl: emailConfig.church.portalUrl,
    },
    NEW_SERMON: {
      ...base,
      sermonTitle: 'Walking in Unwavering Faith & Divine Favor',
      preacher: 'Senior Pastor',
      series: 'The Power of Living Hope',
      date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }),
      keyVerse: 'Now faith is confidence in what we hope for and assurance about what we do not see. — Hebrews 11:1',
      sermonUrl: `${emailConfig.church.websiteUrl}/sermons/walking-in-faith`,
    },
    CHURCH_ANNOUNCEMENT: {
      ...base,
      announcementTitle: 'Annual General Assembly & Community Thanksgiving Dinner',
      announcementBody: 'We invite all church members and families to attend our upcoming Annual General Assembly followed by a community thanksgiving dinner. We will reflect on God’s goodness, review ministry milestones, and look forward to new outreach initiatives.',
      actionUrl: `${emailConfig.church.websiteUrl}/events`,
      actionLabel: 'RSVP for Dinner',
    },
    MINISTRY_NOTIFICATION: {
      ...base,
      ministryName: 'Youth & Young Adults Ministry',
      notificationTitle: 'Upcoming Youth Camp 2026 Registration Open',
      notificationBody: 'Registration is now officially open for Youth Camp 2026! Three days of worship, teaching, teamwork, and spiritual breakthrough. Early bird registrations close next Sunday.',
      actionUrl: `${emailConfig.church.websiteUrl}/ministries/youth`,
      actionLabel: 'Register for Camp',
    },
    SECURITY_ALERT: {
      ...base,
      securityAction: 'Password Changed Successfully',
      dateTime: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) + ' IST',
      device: 'Chrome on Android',
      ipAddress: '152.58.12.84',
      approxLocation: 'Hyderabad, India',
      secureAccountUrl: `${emailConfig.church.websiteUrl}/member?tab=security`,
    },
  };

  return sampleMap[template] || sampleMap.WELCOME;
}

// ── GET: Stats, Previews, and Paginated Audit Logs ────────────────────────────
export async function GET(req: Request) {
  const auth = await requireAdminOrDev(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const { searchParams } = new URL(req.url);
    const action = searchParams.get('action');

    // 1. Return Statistics & Provider Health
    if (action === 'stats') {
      const [total, sent, failed] = await Promise.all([
        prisma.notificationLog.count({ where: { channel: 'EMAIL' } }),
        prisma.notificationLog.count({ where: { channel: 'EMAIL', status: 'SENT' } }),
        prisma.notificationLog.count({ where: { channel: 'EMAIL', status: 'FAILED' } }),
      ]);

      const pending = total - (sent + failed);
      const deliveryRate = total > 0 ? Math.round((sent / total) * 100) : 100;
      const failureRate = total > 0 ? Math.round((failed / total) * 100) : 0;

      const provider = getEmailProvider();
      const activeProvider = provider.getActiveProviderName();

      return NextResponse.json({
        success: true,
        stats: {
          total,
          sent,
          failed,
          pending: Math.max(0, pending),
          deliveryRate,
          failureRate,
        },
        providerInfo: {
          activeProvider,
          senderName: emailConfig.sender.name,
          senderAddress: emailConfig.sender.address,
          replyTo: emailConfig.sender.replyTo,
          isConfigured: provider.isConfigured(),
        },
      });
    }

    // 2. Return Live HTML / Text Preview for Any of the 20 Templates
    if (action === 'preview') {
      const template = (searchParams.get('template') || 'WELCOME') as EmailTemplateType;
      const sampleData = getSampleDataForTemplate(template);
      const rendered = renderEmailTemplate(template, sampleData);

      return NextResponse.json({
        success: true,
        template,
        subject: rendered.subject,
        previewText: rendered.previewText,
        html: rendered.html,
        text: rendered.text,
      });
    }

    // 3. Paginated Audit Logs Table
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '15', 10)));
    const skip = (page - 1) * limit;

    const status = searchParams.get('status');
    const template = searchParams.get('template');
    const search = searchParams.get('search');

    const where: any = { channel: 'EMAIL' };
    if (status && status !== 'ALL') {
      where.status = status;
    }
    if (template && template !== 'ALL') {
      where.template = template;
    }
    if (search && search.trim().length > 0) {
      where.OR = [
        { recipient_addr: { contains: search.trim(), mode: 'insensitive' } },
        { subject: { contains: search.trim(), mode: 'insensitive' } },
      ];
    }

    const [logs, total] = await Promise.all([
      prisma.notificationLog.findMany({
        where,
        orderBy: { sentAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.notificationLog.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      logs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err: any) {
    console.error('[API/ADMIN/EMAIL] Error:', err);
    return NextResponse.json(
      { error: err?.message || 'Failed to fetch email logs' },
      { status: 500 }
    );
  }
}

// ── POST: Retry Failed Email or Send Live Test Email ──────────────────────────
export async function POST(req: Request) {
  const auth = await requireAdminOrDev(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await req.json();
    const { action } = body;

    // 1. Retry a Previously Failed Email Log
    if (action === 'retry') {
      const { logId } = body;
      if (!logId) {
        return NextResponse.json({ error: 'logId is required' }, { status: 400 });
      }

      const result = await emailService.retryFailedEmail(logId);
      return NextResponse.json({ success: result.success, result });
    }

    // 2. Send Live Test Email to Admin's Chosen Recipient
    if (action === 'test_send') {
      const { template, to } = body;
      if (!template || !to) {
        return NextResponse.json({ error: 'template and recipient (to) are required' }, { status: 400 });
      }

      const sampleData = getSampleDataForTemplate(template as EmailTemplateType);
      sampleData.email = to;

      const result = await emailService.send({
        template: template as EmailTemplateType,
        to,
        data: sampleData,
        forceSend: true, // Bypass deduplication for explicit admin testing
      });

      return NextResponse.json({ success: result.success, result });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (err: any) {
    console.error('[API/ADMIN/EMAIL/POST] Error:', err);
    return NextResponse.json(
      { error: err?.message || 'Error processing email admin action' },
      { status: 500 }
    );
  }
}
