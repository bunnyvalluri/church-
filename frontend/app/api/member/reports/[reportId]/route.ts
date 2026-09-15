export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { requireAuth, requireAdmin } from '@/lib/authMiddleware';
import { getReportById } from '@/lib/issueService';

/**
 * GET /api/member/reports/:reportId
 * Returns a single report detail for the authenticated member (IDOR protected).
 * Strips internal notes, stack traces, and server internals from normal member response.
 */
export async function GET(
  req: Request,
  { params }: { params: { reportId: string } }
) {
  try {
    const auth = await requireAuth(req);
    if (auth instanceof NextResponse) return auth;

    const { reportId } = params;
    if (!reportId || typeof reportId !== 'string' || reportId.length > 64) {
      return NextResponse.json({ error: 'Invalid report ID.' }, { status: 400 });
    }

    const report = await getReportById(reportId);
    if (!report) {
      return NextResponse.json({ error: 'Report not found.' }, { status: 404 });
    }

    // IDOR Protection: Member can only view their own reports
    const isAdmin = auth.role === 'ADMIN' || auth.role === 'SUPER_ADMIN';
    if (!isAdmin && report.userId !== auth.uid) {
      return NextResponse.json({ error: 'Report not found.' }, { status: 404 });
    }

    // Member-safe view: strip internal/admin-only fields
    const memberView = {
      reportId: report.reportId,
      category: report.category,
      title: report.title,
      description: report.description,
      expectedBehavior: report.expectedBehavior,
      actualBehavior: report.actualBehavior,
      severity: report.severity,
      status: report.status,
      pagePath: report.pagePath,
      pageTitle: report.pageTitle,
      browser: report.browser,
      operatingSystem: report.operatingSystem,
      deviceType: report.deviceType,
      language: report.language,
      createdAt: report.createdAt,
      updatedAt: report.updatedAt,
      resolvedAt: report.resolvedAt,
      screenshotUrl: report.screenshotUrl,
    };

    return NextResponse.json({ success: true, report: memberView });
  } catch (err: any) {
    console.error('[API/MEMBER/REPORTS/GET_ONE] Error:', err);
    return NextResponse.json(
      { error: 'Failed to retrieve report. Please try again.' },
      { status: 500 }
    );
  }
}
