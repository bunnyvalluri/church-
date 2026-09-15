export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/authMiddleware';
import { assignReport, getReportById } from '@/lib/issueService';
import { logSecurityAudit } from '@/lib/auditLogger';

/**
 * PATCH /api/admin/reports/:reportId/assignment
 * Admin-only: Assigns report to an engineer or support staff member.
 */
export async function PATCH(
  req: Request,
  { params }: { params: { reportId: string } }
) {
  try {
    const auth = await requireAdmin(req);
    if (auth instanceof NextResponse) return auth;

    const { reportId } = params;
    if (!reportId) {
      return NextResponse.json({ error: 'Report ID required.' }, { status: 400 });
    }

    const body = await req.json().catch(() => ({}));
    const { assignedTo } = body;

    if (typeof assignedTo !== 'string') {
      return NextResponse.json({ error: 'assignedTo must be a string.' }, { status: 400 });
    }

    const existing = await getReportById(reportId);
    if (!existing) {
      return NextResponse.json({ error: 'Report not found.' }, { status: 404 });
    }

    const updated = await assignReport(reportId, assignedTo.trim());
    if (!updated) {
      return NextResponse.json({ error: 'Failed to assign report.' }, { status: 500 });
    }

    await logSecurityAudit('REPORT_ASSIGNED', {
      reportId: updated.reportId,
      assignedTo: updated.assignedTo,
      adminId: auth.uid,
    });

    return NextResponse.json({
      success: true,
      report: updated,
    });
  } catch (err: any) {
    console.error('[API/ADMIN/REPORTS/ASSIGNMENT] Error:', err);
    return NextResponse.json(
      { error: 'Failed to assign report.' },
      { status: 500 }
    );
  }
}
