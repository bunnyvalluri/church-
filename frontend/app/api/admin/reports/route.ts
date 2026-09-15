export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/authMiddleware';
import { getAllReportsAdmin } from '@/lib/issueService';

/**
 * GET /api/admin/reports
 * Admin-only route: Lists all issue reports with filtering & pagination.
 */
export async function GET(req: Request) {
  try {
    const auth = await requireAdmin(req);
    if (auth instanceof NextResponse) return auth;

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || undefined;
    const severity = searchParams.get('severity') || undefined;
    const category = searchParams.get('category') || undefined;
    const search = searchParams.get('search') || undefined;
    const startDate = searchParams.get('startDate') || undefined;
    const endDate = searchParams.get('endDate') || undefined;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    const result = await getAllReportsAdmin({
      status,
      severity,
      category,
      search,
      startDate,
      endDate,
      page,
      limit,
    });

    return NextResponse.json({
      success: true,
      reports: result.reports,
      total: result.total,
      page,
      limit,
      totalPages: Math.ceil(result.total / limit) || 1,
    });
  } catch (err: any) {
    console.error('[API/ADMIN/REPORTS/LIST] Error:', err);
    return NextResponse.json(
      { error: 'Failed to retrieve reports. Please try again.' },
      { status: 500 }
    );
  }
}
