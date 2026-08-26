import { NextResponse } from 'next/server';
import { requireAdminOrDev } from '@/lib/authMiddleware';

export const dynamic = 'force-dynamic';

// POST /api/admin/sms/test — Relay test SMS request to backend companion server
export async function POST(req: Request) {
  const auth = await requireAdminOrDev(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await req.json();
    const companionUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';

    const res = await fetch(`${companionUrl}/api/admin/sms/test`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...body,
        initiatedBy: (auth as any)?.email || 'admin',
      }),
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Failed to dispatch test SMS' }, { status: 500 });
  }
}
