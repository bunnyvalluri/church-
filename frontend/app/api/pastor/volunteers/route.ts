export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// ─── GET: Fetch Volunteers ──────────────────────────────────────────────────
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const ministry = searchParams.get('ministry');
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    const where: any = {};
    if (ministry && ministry !== 'ALL') where.ministry = ministry;
    if (status && status !== 'ALL') where.status = status;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
        { ministry: { contains: search, mode: 'insensitive' } },
      ];
    }

    const volunteers = await prisma.volunteer.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, volunteers, count: volunteers.length });
  } catch (err: any) {
    console.error('[PASTOR/VOLUNTEERS/GET] Error:', err);
    return NextResponse.json(
      { error: err?.message || 'Database error occurred while fetching volunteers' },
      { status: 500 }
    );
  }
}

// ─── POST: Create / Register a Volunteer ────────────────────────────────────
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, phone, ministry, status, appliedAt } = body;

    if (!name || !ministry) {
      return NextResponse.json({ error: 'Name and ministry area are required' }, { status: 400 });
    }

    const volunteer = await prisma.volunteer.create({
      data: {
        name: name.trim(),
        email: (email || '').trim(),
        phone: phone ? phone.trim() : null,
        ministry: ministry.trim(),
        status: status || 'Pending',
        appliedAt: appliedAt || new Date().toISOString().slice(0, 10),
      },
    });

    return NextResponse.json({ success: true, volunteer });
  } catch (err: any) {
    console.error('[PASTOR/VOLUNTEERS/POST] Error:', err);
    return NextResponse.json(
      { error: err?.message || 'Database error occurred while creating volunteer' },
      { status: 500 }
    );
  }
}

// ─── PATCH: Update Volunteer Status ─────────────────────────────────────────
export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json({ error: 'Volunteer ID and status are required' }, { status: 400 });
    }

    const volunteer = await prisma.volunteer.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json({ success: true, volunteer });
  } catch (err: any) {
    console.error('[PASTOR/VOLUNTEERS/PATCH] Error:', err);
    return NextResponse.json(
      { error: err?.message || 'Database error occurred while updating volunteer' },
      { status: 500 }
    );
  }
}

// ─── DELETE: Delete a volunteer or purge fake records ───────────────────────
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const cleanAllFake = searchParams.get('cleanAllFake') === 'true' || searchParams.get('purge') === 'true';

    if (cleanAllFake) {
      const fakeNames = [
        'Vijaya Lakshmi',
        'Kiran Reddy',
        'Anitha Rao',
        'Suresh Babu',
        'Preethi Naidu',
        'Ravi Kumar',
        'Fake User',
        'Test Volunteer',
      ];

      const deleted = await prisma.volunteer.deleteMany({
        where: {
          OR: [
            { id: { startsWith: 'vol_' } },
            { name: { in: fakeNames } },
            { email: { in: ['vijaya.l@gmail.com', 'kiran.reddy@gmail.com', 'anitha.rao@gmail.com', 'suresh.babu@gmail.com', 'preethi.naidu@gmail.com', 'ravi.kumar@gmail.com'] } },
          ],
        },
      });

      return NextResponse.json({
        success: true,
        message: `Purged ${deleted.count} fake volunteer records.`,
        deletedCount: deleted.count,
      });
    }

    if (!id) {
      return NextResponse.json({ error: 'Volunteer ID is required' }, { status: 400 });
    }

    await prisma.volunteer.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'Volunteer removed successfully' });
  } catch (err: any) {
    console.error('[PASTOR/VOLUNTEERS/DELETE] Error:', err);
    return NextResponse.json(
      { error: err?.message || 'Database error occurred while deleting volunteer' },
      { status: 500 }
    );
  }
}
