import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminOrDev } from '@/lib/authMiddleware';

export const dynamic = 'force-dynamic';

// GET /api/admin/sms/stats — Aggregate SMS KPI metrics
export async function GET(req: Request) {
  const auth = await requireAdminOrDev(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const smsModel = (prisma as any).smsMessage;
    if (!smsModel) {
      return NextResponse.json({
        success: true,
        stats: {
          total: 0,
          queued: 0,
          processing: 0,
          sent: 0,
          delivered: 0,
          failed: 0,
          retrying: 0,
          expired: 0,
          cancelled: 0,
          deliveryRate: 0,
          failureRate: 0,
        },
      });
    }

    const [
      total,
      queued,
      processing,
      sent,
      delivered,
      failed,
      retrying,
      expired,
      cancelled,
    ] = await Promise.all([
      smsModel.count(),
      smsModel.count({ where: { status: 'QUEUED' } }),
      smsModel.count({ where: { status: 'PROCESSING' } }),
      smsModel.count({ where: { status: 'SENT' } }),
      smsModel.count({ where: { status: 'DELIVERED' } }),
      smsModel.count({ where: { status: 'FAILED' } }),
      smsModel.count({ where: { status: 'RETRYING' } }),
      smsModel.count({ where: { status: 'EXPIRED' } }),
      smsModel.count({ where: { status: 'CANCELLED' } }),
    ]);

    const deliveryRate = total > 0 ? Number(((delivered / total) * 100).toFixed(1)) : 0;
    const failureRate = total > 0 ? Number(((failed / total) * 100).toFixed(1)) : 0;

    return NextResponse.json({
      success: true,
      stats: {
        total,
        queued,
        processing,
        sent,
        delivered,
        failed,
        retrying,
        expired,
        cancelled,
        deliveryRate,
        failureRate,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
