import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminOrDev } from '@/lib/authMiddleware';

/**
 * GET /api/ngo/projects
 * Returns a paginated list of NGO projects, with optional status filter.
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || undefined;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '6', 10);
    const skip = (page - 1) * limit;

    const where = status ? { status } : {};

    const [projects, total] = await Promise.all([
      prisma.ngoProject.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          _count: {
            select: { media: true, volunteers: true },
          },
        },
      }),
      prisma.ngoProject.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      projects,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err: any) {
    console.error('[API/NGO/PROJECTS/GET] Error:', err);
    return NextResponse.json(
      { error: err?.message || 'Database error occurred' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/ngo/projects
 * Creates a new NGO project. Admin only.
 */
export async function POST(req: Request) {
  const auth = await requireAdminOrDev(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await req.json();
    const { title, description, details, imageUrl, targetAmount, status } = body;

    if (!title || !description || !details) {
      return NextResponse.json(
        { error: 'Title, description, and details are required' },
        { status: 400 }
      );
    }

    const project = await prisma.ngoProject.create({
      data: {
        title,
        description,
        details,
        imageUrl: imageUrl || null,
        targetAmount: targetAmount ? parseFloat(targetAmount) : null,
        status: status || 'ACTIVE',
      },
    });

    return NextResponse.json({ success: true, project });
  } catch (err: any) {
    console.error('[API/NGO/PROJECTS/POST] Error:', err);
    return NextResponse.json(
      { error: err?.message || 'Database error occurred' },
      { status: 500 }
    );
  }
}
