export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || (process.env.NODE_ENV === 'production' ? '' : 'http://localhost:3001');

export async function POST(req: NextRequest) {
  try {
    if (!BACKEND_URL) return NextResponse.json({ success: false, error: 'Backend service is not available.' }, { status: 503 });
    const body = await req.json();
    const res = await fetch(`${BACKEND_URL}/api/firecrawl/event-generator`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
