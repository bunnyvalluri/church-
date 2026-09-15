export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/authMiddleware';
import { isRateLimited, rateLimitHeaders } from '@/lib/rateLimit';
import { logSecurityAudit } from '@/lib/auditLogger';
import {
  generateReportId,
  generateCorrelationId,
  sanitizeDiagnosticText,
} from '@/lib/issueDiagnostics';
import {
  createIssueReport,
  getUserReports,
  findDuplicateReport,
} from '@/lib/issueService';
import { z } from 'zod';

const ALLOWED_CATEGORIES = [
  'SOMETHING_IS_BROKEN',
  'PAGE_NOT_LOADING',
  'LOGIN_ACCOUNT',
  'MOBILE_RESPONSIVE',
  'WEBSITE_DISPLAY',
  'NETWORK_CONNECTION',
  'BUG_UNEXPECTED',
  'SUGGESTION',
  'OTHER',
] as const;

const ALLOWED_SEVERITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const;

const createReportSchema = z.object({
  category: z.enum(ALLOWED_CATEGORIES, {
    errorMap: () => ({ message: 'Please select a valid report category.' }),
  }),
  title: z
    .string()
    .min(3, 'Title must be at least 3 characters.')
    .max(200, 'Title cannot exceed 200 characters.')
    .trim(),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters.')
    .max(5000, 'Description cannot exceed 5000 characters.')
    .trim(),
  severity: z.enum(ALLOWED_SEVERITIES, {
    errorMap: () => ({ message: 'Please select a valid severity level.' }),
  }),
  expectedBehavior: z.string().max(3000).optional().nullable(),
  actualBehavior: z.string().max(3000).optional().nullable(),
  pageUrl: z.string().max(2000).optional().nullable(),
  pagePath: z.string().max(500).optional().nullable(),
  pageTitle: z.string().max(500).optional().nullable(),
  referrer: z.string().max(2000).optional().nullable(),
  browser: z.string().max(100).optional().nullable(),
  browserVersion: z.string().max(50).optional().nullable(),
  operatingSystem: z.string().max(100).optional().nullable(),
  deviceType: z.string().max(50).optional().nullable(),
  viewportWidth: z.number().int().optional().nullable(),
  viewportHeight: z.number().int().optional().nullable(),
  screenWidth: z.number().int().optional().nullable(),
  screenHeight: z.number().int().optional().nullable(),
  timezone: z.string().max(100).optional().nullable(),
  language: z.string().max(20).optional().nullable(),
  onlineStatus: z.boolean().optional().nullable(),
  connectionType: z.string().max(50).optional().nullable(),
  appVersion: z.string().max(50).optional().nullable(),
  errorType: z.string().max(150).optional().nullable(),
  errorMessage: z.string().max(4000).optional().nullable(),
  errorStack: z.string().max(4000).optional().nullable(),
  screenshotUrl: z.string().max(2000).optional().nullable(),
});

/**
 * GET /api/member/reports
 * Returns list of reports submitted by the authenticated member.
 */
export async function GET(req: Request) {
  try {
    const auth = await requireAuth(req);
    if (auth instanceof NextResponse) return auth;

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);

    const { reports, total } = await getUserReports(auth.uid, { page, limit });

    // Sanitize output for normal member: remove internal notes and internal stack traces
    const sanitizedReports = reports.map((r) => ({
      reportId: r.reportId,
      category: r.category,
      title: r.title,
      description: r.description,
      severity: r.severity,
      status: r.status,
      pagePath: r.pagePath,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
      resolvedAt: r.resolvedAt,
    }));

    return NextResponse.json({
      success: true,
      reports: sanitizedReports,
      total,
      page,
      limit,
    });
  } catch (err: any) {
    console.error('[API/MEMBER/REPORTS/GET] Error:', err);
    return NextResponse.json(
      { error: 'Failed to retrieve reports. Please try again.' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/member/reports
 * Submits a real issue report into Neon PostgreSQL.
 */
export async function POST(req: Request) {
  try {
    const auth = await requireAuth(req);
    if (auth instanceof NextResponse) return auth;

    // Rate Limiting: Max 10 reports per user / IP per 15 minutes
    const clientIp =
      req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
      req.headers.get('x-real-ip') ||
      auth.uid;

    const rateLimitOpts = { windowMs: 15 * 60 * 1000, maxRequests: 10 };
    if (isRateLimited(`report_${auth.uid}_${clientIp}`, rateLimitOpts)) {
      return NextResponse.json(
        {
          error:
            'Too many reports submitted. To prevent abuse, please wait 15 minutes before submitting again.',
        },
        { status: 429, headers: rateLimitHeaders(`report_${auth.uid}_${clientIp}`, rateLimitOpts) }
      );
    }

    const body = await req.json();
    const parsed = createReportSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Validation failed' },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // Check for duplicate reports in past 7 days
    const duplicate = await findDuplicateReport(auth.uid, data.category, data.title);

    const reportId = generateReportId();
    const correlationId = generateCorrelationId();
    const recordId = `rep_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    // Sanitize technical diagnostics
    const sanitizedErrorMsg = sanitizeDiagnosticText(data.errorMessage);
    const sanitizedErrorStack = sanitizeDiagnosticText(data.errorStack);

    const report = await createIssueReport({
      id: recordId,
      reportId,
      userId: auth.uid,
      category: data.category,
      title: data.title,
      description: data.description,
      expectedBehavior: data.expectedBehavior ? sanitizeDiagnosticText(data.expectedBehavior) : null,
      actualBehavior: data.actualBehavior ? sanitizeDiagnosticText(data.actualBehavior) : null,
      severity: data.severity,
      pageUrl: data.pageUrl ? sanitizeDiagnosticText(data.pageUrl) : null,
      pagePath: data.pagePath || null,
      pageTitle: data.pageTitle || null,
      referrer: data.referrer ? sanitizeDiagnosticText(data.referrer) : null,
      browser: data.browser || null,
      browserVersion: data.browserVersion || null,
      operatingSystem: data.operatingSystem || null,
      deviceType: data.deviceType || null,
      viewportWidth: data.viewportWidth || null,
      viewportHeight: data.viewportHeight || null,
      screenWidth: data.screenWidth || null,
      screenHeight: data.screenHeight || null,
      timezone: data.timezone || null,
      language: data.language || null,
      onlineStatus: data.onlineStatus !== undefined ? data.onlineStatus : true,
      connectionType: data.connectionType || null,
      appVersion: data.appVersion || '1.0.0',
      errorType: data.errorType || null,
      errorMessageSanitized: sanitizedErrorMsg,
      errorStackSanitized: sanitizedErrorStack,
      correlationId,
      screenshotUrl: data.screenshotUrl || null,
    });

    // Record Security Audit Log
    logSecurityAudit('REPORT_CREATED', {
      userId: auth.uid,
      resourceId: report.reportId,
      metadata: {
        category: report.category,
        severity: report.severity,
        correlationId,
      },
    }).catch(() => {});

    return NextResponse.json(
      {
        success: true,
        reportId: report.reportId,
        correlationId,
        message: 'Your report has been received by our technical engineering team.',
        isPotentialDuplicate: !!duplicate,
        potentialDuplicateReportId: duplicate ? duplicate.reportId : null,
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error('[API/MEMBER/REPORTS/POST] Fatal Error:', err);
    return NextResponse.json(
      { error: 'An unexpected error occurred while saving your report. Please try again.' },
      { status: 500 }
    );
  }
}
