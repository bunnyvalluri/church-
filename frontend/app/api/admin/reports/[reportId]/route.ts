export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/authMiddleware';
import { getReportById } from '@/lib/issueService';

/**
 * GET /api/admin/reports/:reportId
 * Admin-only route: Full diagnostic detail view including raw sanitized stacks and notes.
 */
export async function GET(
  req: Request,
  { params }: { params: { reportId: string } }
) {
  try {
    const auth = await requireAdmin(req);
    if (auth instanceof NextResponse) return auth;

    const { reportId } = params;
    if (!reportId || typeof reportId !== 'string') {
      return NextResponse.json({ error: 'Invalid report ID.' }, { status: 400 });
    }

    const report = await getReportById(reportId);
    if (!report) {
      return NextResponse.json({ error: 'Report not found.' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      report,
    });
  } catch (err: any) {
    console.error('[API/ADMIN/REPORTS/GET_DETAIL] Error:', err);
    return NextResponse.json(
      { error: 'Failed to retrieve report detail.' },
      { status: 500 }
    );
  }
}
