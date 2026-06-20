import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminOrDev } from '@/lib/authMiddleware';

/**
 * GET /api/ngo/projects/[id]
 * Returns details of a specific NGO project, including associated media.
 */
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const project = await prisma.ngoProject.findUnique({
      where: { id: params.id },
      include: {
        media: {
          orderBy: { createdAt: 'desc' },
        },
        _count: {
          select: { volunteers: true },
        },
      },
    });

    if (!project) {
      return NextResponse.json(
        { error: 'NGO Project not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, project });
  } catch (err: any) {
    console.error('[API/NGO/PROJECTS/ID/GET] Error:', err);
    return NextResponse.json(
      { error: err?.message || 'Database error occurred' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/ngo/projects/[id]
 * Updates a specific NGO project. Admin only.
 */
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const auth = await requireAdminOrDev(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await req.json();
    const { title, description, details, imageUrl, targetAmount, raisedAmount, status } = body;

    const data: any = {};
    if (title !== undefined) data.title = title;
    if (description !== undefined) data.description = description;
    if (details !== undefined) data.details = details;
    if (imageUrl !== undefined) data.imageUrl = imageUrl;
    if (targetAmount !== undefined) data.targetAmount = targetAmount ? parseFloat(targetAmount) : null;
    if (raisedAmount !== undefined) data.raisedAmount = parseFloat(raisedAmount);
    if (status !== undefined) data.status = status;

    const project = await prisma.ngoProject.update({
      where: { id: params.id },
      data,
    });

    return NextResponse.json({ success: true, project });
  } catch (err: any) {
    console.error('[API/NGO/PROJECTS/ID/PUT] Error:', err);
    return NextResponse.json(
      { error: err?.message || 'Database error occurred' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/ngo/projects/[id]
 * Deletes a specific NGO project. Admin only.
 */
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const auth = await requireAdminOrDev(req);
  if (auth instanceof NextResponse) return auth;

  try {
    await prisma.ngoProject.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true, message: 'Project deleted successfully' });
  } catch (err: any) {
    console.error('[API/NGO/PROJECTS/ID/DELETE] Error:', err);
    return NextResponse.json(
      { error: err?.message || 'Database error occurred' },
      { status: 500 }
    );
  }
}
