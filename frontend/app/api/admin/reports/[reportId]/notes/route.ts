export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/authMiddleware';
import { addReportInternalNote, getReportById } from '@/lib/issueService';
import { logSecurityAudit } from '@/lib/auditLogger';

/**
 * POST /api/admin/reports/:reportId/notes
 * Admin-only: Appends an internal investigation note to the issue report.
 */
export async function POST(
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
    const { note } = body;

    if (!note || typeof note !== 'string' || note.trim().length === 0) {
      return NextResponse.json({ error: 'Note text cannot be empty.' }, { status: 400 });
    }

    if (note.length > 5000) {
      return NextResponse.json({ error: 'Note exceeds maximum length of 5000 characters.' }, { status: 400 });
    }

    const existing = await getReportById(reportId);
    if (!existing) {
      return NextResponse.json({ error: 'Report not found.' }, { status: 404 });
    }

    const adminName = auth.name || auth.email || 'Admin';
    const updated = await addReportInternalNote(reportId, note.trim(), adminName);
    if (!updated) {
      return NextResponse.json({ error: 'Failed to add internal note.' }, { status: 500 });
    }

    await logSecurityAudit('REPORT_NOTE_ADDED', {
      reportId: updated.reportId,
      adminId: auth.uid,
    });

    return NextResponse.json({
      success: true,
      report: updated,
    });
  } catch (err: any) {
    console.error('[API/ADMIN/REPORTS/NOTES] Error:', err);
    return NextResponse.json(
      { error: 'Failed to save note.' },
      { status: 500 }
    );
  }
}
