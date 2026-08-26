import { NextResponse } from 'next/server';
import { requireAdminOrDev } from '@/lib/authMiddleware';

export const dynamic = 'force-dynamic';

// GET /api/admin/sms/settings — Provider and gateway settings
export async function GET(req: Request) {
  const auth = await requireAdminOrDev(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const companionUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';
    const res = await fetch(`${companionUrl}/api/admin/sms/settings`);
    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
  } catch {}

  // Fallback if companion server is offline
  return NextResponse.json({
    success: true,
    settings: {
      provider: process.env.SMS_PROVIDER || 'mock',
      isConfigured: !!(process.env.HTTPSMS_API_KEY && process.env.HTTPSMS_API_KEY.length > 5),
      fromNumber: process.env.HTTPSMS_FROM_NUMBER ? '+91 ****' : 'Not configured',
      defaultCountry: 'IN',
      maxRetries: 3,
      rateLimitPerMinute: 30,
      queueMode: 'PostgreSQL Outbox Worker',
    },
  });
}
