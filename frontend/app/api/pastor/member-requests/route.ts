import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const requests = await prisma.memberRequest.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json({ success: true, requests });
  } catch (err: any) {
    console.error('[PASTOR/MEMBER-REQUESTS/GET] Error:', err);
    return NextResponse.json(
      { error: err?.message || 'Database error occurred while fetching member requests' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json({ error: 'Request ID and status are required' }, { status: 400 });
    }

    const request = await prisma.memberRequest.update({
      where: { id },
      data: { status }
    });

    return NextResponse.json({ success: true, request });
  } catch (err: any) {
    console.error('[PASTOR/MEMBER-REQUESTS/POST] Error:', err);
    return NextResponse.json(
      { error: err?.message || 'Database error occurred while updating member request status' },
      { status: 500 }
    );
  }
}

