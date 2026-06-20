import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminOrDev } from '@/lib/authMiddleware';

/**
 * DELETE /api/ngo/media/[id]
 * Deletes a specific media log. Admin only.
 */
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const auth = await requireAdminOrDev(req);
  if (auth instanceof NextResponse) return auth;

  try {
    await prisma.ngoMedia.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true, message: 'Media reference deleted' });
  } catch (err: any) {
    console.error('[API/NGO/MEDIA/ID/DELETE] Error:', err);
    return NextResponse.json(
      { error: err?.message || 'Database error occurred' },
      { status: 500 }
    );
  }
}
