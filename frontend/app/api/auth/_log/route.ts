import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ success: true, message: 'Auth log endpoint active' });
}

export async function POST() {
  // Log endpoint placeholder
  return NextResponse.json({ success: true });
}
