export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/authMiddleware';
import { updateReportStatus, getReportById } from '@/lib/issueService';
import { logSecurityAudit } from '@/lib/auditLogger';

const VALID_STATUSES = ['OPEN', 'INVESTIGATING', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'DUPLICATE'];

/**
 * PATCH /api/admin/reports/:reportId/status
 * Admin-only: Updates the lifecycle status of an issue report.
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
    const { status } = body;

    if (!status || !VALID_STATUSES.includes(status)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}` },
        { status: 400 }
      );
    }

    const existing = await getReportById(reportId);
    if (!existing) {
      return NextResponse.json({ error: 'Report not found.' }, { status: 404 });
    }

    const updated = await updateReportStatus(reportId, status, auth.uid);
    if (!updated) {
      return NextResponse.json({ error: 'Failed to update report status.' }, { status: 500 });
    }

    // Audit log
    await logSecurityAudit('REPORT_STATUS_CHANGED', {
      reportId: updated.reportId,
      oldStatus: existing.status,
      newStatus: updated.status,
      adminId: auth.uid,
      adminEmail: auth.email,
    });

    return NextResponse.json({
      success: true,
      report: updated,
    });
  } catch (err: any) {
    console.error('[API/ADMIN/REPORTS/STATUS] Error:', err);
    return NextResponse.json(
      { error: 'Failed to update report status.' },
      { status: 500 }
    );
  }
}
