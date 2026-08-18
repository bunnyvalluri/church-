export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

export async function GET(req: NextRequest) {
  try {
    const res = await fetch(`${BACKEND_URL}/api/firecrawl/website-monitoring`);
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { action, siteName, targetUrl, checkFrequency } = await req.json();

    if (action === 'check') {
      const res = await fetch(`${BACKEND_URL}/api/firecrawl/website-monitoring/check`, { method: 'POST' });
      const data = await res.json();
      return NextResponse.json(data, { status: res.status });
    }

    const res = await fetch(`${BACKEND_URL}/api/firecrawl/website-monitoring/targets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ siteName, targetUrl, checkFrequency })
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
