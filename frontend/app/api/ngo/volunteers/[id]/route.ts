export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminOrDev } from '@/lib/authMiddleware';

/**
 * PUT /api/ngo/volunteers/[id]
 * Updates a volunteer application's status. Admin only.
 */
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const auth = await requireAdminOrDev(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await req.json();
    const { status } = body;

    if (!status || !['PENDING', 'APPROVED', 'REJECTED'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid volunteer status' },
        { status: 400 }
      );
    }

    const volunteer = await prisma.ngoVolunteer.update({
      where: { id: params.id },
      data: { status },
      include: {
        project: { select: { title: true } },
      },
    });

    if (status === 'APPROVED' && volunteer.email) {
      try {
        const { emailService } = await import('@/lib/email');
        emailService.send({
          template: 'VOLUNTEER_APPROVAL',
          to: volunteer.email,
          data: {
            email: volunteer.email,
            firstName: volunteer.name.split(' ')[0],
            ministry: volunteer.project?.title || 'Community & NGO Outreach',
            orientationDate: 'Next Sunday Fellowship',
          },
        }).catch((err) => console.warn('[NGO/VOLUNTEER/APPROVAL] Email notice:', err?.message));
      } catch {
        /* ignore */
      }
    }

    return NextResponse.json({ success: true, volunteer });
  } catch (err: any) {
    console.error('[API/NGO/VOLUNTEERS/ID/PUT] Error:', err);
    return NextResponse.json(
      { error: err?.message || 'Database error occurred' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/ngo/volunteers/[id]
 * Deletes a volunteer application. Admin only.
 */
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const auth = await requireAdminOrDev(req);
  if (auth instanceof NextResponse) return auth;

  try {
    await prisma.ngoVolunteer.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true, message: 'Volunteer record deleted' });
  } catch (err: any) {
    console.error('[API/NGO/VOLUNTEERS/ID/DELETE] Error:', err);
    return NextResponse.json(
      { error: err?.message || 'Database error occurred' },
      { status: 500 }
    );
  }
}
