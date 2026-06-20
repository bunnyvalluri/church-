import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminOrDev } from '@/lib/authMiddleware';

/**
 * GET /api/ngo/volunteers
 * Returns a list of volunteer applications. Admin only.
 */
export async function GET(req: Request) {
  const auth = await requireAdminOrDev(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || undefined;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const skip = (page - 1) * limit;

    const where = status ? { status } : {};

    const [volunteers, total] = await Promise.all([
      prisma.ngoVolunteer.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          project: {
            select: { title: true },
          },
        },
      }),
      prisma.ngoVolunteer.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      volunteers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err: any) {
    console.error('[API/NGO/VOLUNTEERS/GET] Error:', err);
    return NextResponse.json(
      { error: err?.message || 'Database error occurred' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/ngo/volunteers
 * Registers a new NGO volunteer. Public.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, phone, skills, projectId } = body;

    if (!name || !email) {
      return NextResponse.json(
        { error: 'Name and email are required fields' },
        { status: 400 }
      );
    }

    const volunteer = await prisma.ngoVolunteer.create({
      data: {
        name,
        email,
        phone: phone || null,
        skills: skills || null,
        projectId: projectId || null,
        status: 'PENDING',
      },
    });

    return NextResponse.json({ success: true, volunteer });
  } catch (err: any) {
    console.error('[API/NGO/VOLUNTEERS/POST] Error:', err);
    return NextResponse.json(
      { error: err?.message || 'Database error occurred' },
      { status: 500 }
    );
  }
}
