import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminOrDev } from '@/lib/authMiddleware';

export const dynamic = 'force-dynamic';

// GET /api/admin/sms/[id] — Retrieve single message details
export async function GET(req: Request, { params }: { params: { id: string } }) {
  const auth = await requireAdminOrDev(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const msg = await (prisma as any).smsMessage.findUnique({
      where: { id: params.id },
      include: {
        member: { select: { id: true, name: true, email: true, phone: true } },
      },
    });

    if (!msg) {
      return NextResponse.json({ success: false, error: 'SMS message not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: msg });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// POST /api/admin/sms/[id] — Handle actions like retry or cancel
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const auth = await requireAdminOrDev(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await req.json();
    const action = body.action || 'retry';
    const companionUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';

    const res = await fetch(`${companionUrl}/api/admin/sms/${params.id}/${action}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
