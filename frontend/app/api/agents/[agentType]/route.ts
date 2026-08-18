/**
 * frontend/app/api/agents/[agentType]/route.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Next.js API route proxy for Agent Reach agents
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

export async function POST(req: NextRequest, { params }: { params: { agentType: string } }) {
  try {
    const body = await req.json().catch(() => ({}));
    const targetUrl = `${BACKEND_URL}/api/agents/${params.agentType}`;

    const res = await fetch(targetUrl, {
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

export async function GET(req: NextRequest, { params }: { params: { agentType: string } }) {
  try {
    const targetUrl = `${BACKEND_URL}/api/agents/${params.agentType}`;
    const res = await fetch(targetUrl);
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
