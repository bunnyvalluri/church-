import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const volunteers = await prisma.volunteer.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json({ success: true, volunteers });
  } catch (err: any) {
    console.error('[PASTOR/VOLUNTEERS/GET] Error:', err);
    return NextResponse.json(
      { error: err?.message || 'Database error occurred while fetching volunteers' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json({ error: 'Volunteer ID and status are required' }, { status: 400 });
    }

    const volunteer = await prisma.volunteer.update({
      where: { id },
      data: { status }
    });

    return NextResponse.json({ success: true, volunteer });
  } catch (err: any) {
    console.error('[PASTOR/VOLUNTEERS/POST] Error:', err);
    return NextResponse.json(
      { error: err?.message || 'Database error occurred while updating volunteer status' },
      { status: 500 }
    );
  }
}

