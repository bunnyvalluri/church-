import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminOrDev } from '@/lib/authMiddleware';

/**
 * GET /api/ngo/media
 * Returns a list of media assets (images and videos) with pagination and category filtering.
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category') || undefined;
    const type = searchParams.get('type') || undefined;
    const projectId = searchParams.get('projectId') || undefined;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '12', 10);
    const skip = (page - 1) * limit;

    const where: any = {};
    if (category) where.category = category;
    if (type) where.type = type;
    if (projectId) where.projectId = projectId;

    const [media, total] = await Promise.all([
      prisma.ngoMedia.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.ngoMedia.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      media,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err: any) {
    console.error('[API/NGO/MEDIA/GET] Error:', err);
    return NextResponse.json(
      { error: err?.message || 'Database error occurred' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/ngo/media
 * Adds a new media item to the database. Admin only.
 */
export async function POST(req: Request) {
  const auth = await requireAdminOrDev(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await req.json();
    const { title, description, type, url, publicId, thumbnailUrl, projectId, category } = body;

    if (!type || !url) {
      return NextResponse.json(
        { error: 'Media type and URL are required' },
        { status: 400 }
      );
    }

    const media = await prisma.ngoMedia.create({
      data: {
        title: title || null,
        description: description || null,
        type,
        url,
        publicId: publicId || null,
        thumbnailUrl: thumbnailUrl || null,
        projectId: projectId || null,
        category: category || null,
      },
    });

    return NextResponse.json({ success: true, media });
  } catch (err: any) {
    console.error('[API/NGO/MEDIA/POST] Error:', err);
    return NextResponse.json(
      { error: err?.message || 'Database error occurred' },
      { status: 500 }
    );
  }
}
