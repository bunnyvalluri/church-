import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json(
      { status: 'READY', database: 'CONNECTED', timestamp: new Date().toISOString() },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { status: 'NOT_READY', database: 'DISCONNECTED', error: error.message },
      { status: 503 }
    );
  }
}
