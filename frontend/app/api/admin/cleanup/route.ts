import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminOrDev } from '@/lib/authMiddleware';

export const dynamic = 'force-dynamic';

// ─── DELETE ALL: Bulk wipe donations, attendance records, and events ───────────
export async function DELETE(req: Request) {
  const auth = await requireAdminOrDev(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const { searchParams } = new URL(req.url);
    const target = searchParams.get('target'); // 'donations' | 'attendance' | 'events' | 'all'

    let deletedDonations = 0;
    let deletedAttendance = 0;
    let deletedEvents = 0;

    if (target === 'donations' || target === 'all') {
      const result = await prisma.donation.deleteMany({});
      deletedDonations = result.count;
    }

    if (target === 'attendance' || target === 'all') {
      const result = await prisma.attendanceRecord.deleteMany({});
      deletedAttendance = result.count;
    }

    if (target === 'events' || target === 'all') {
      // Delete event registrations first (foreign key)
      await prisma.eventRegistration.deleteMany({}).catch(() => {});
      const result = await prisma.event.deleteMany({});
      deletedEvents = result.count;
    }

    return NextResponse.json({
      success: true,
      deleted: {
        donations: deletedDonations,
        attendanceRecords: deletedAttendance,
        events: deletedEvents,
      },
      message: `Cleared: ${deletedDonations} donations, ${deletedAttendance} attendance records, ${deletedEvents} events`,
    });
  } catch (err: any) {
    console.error('[ADMIN/CLEANUP/DELETE] Error:', err);
    return NextResponse.json({ error: err?.message || 'Database error' }, { status: 500 });
  }
}
