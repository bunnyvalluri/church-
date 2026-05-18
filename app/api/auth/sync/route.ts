import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { uid, email, name, photoURL, phoneNumber } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Try to sync with the database. Wrap in try/catch to handle connection/migration issues gracefully.
    try {
      const user = await prisma.user.upsert({
        where: { email },
        update: {
          name: name || 'Member',
          image: photoURL || null,
          phone: phoneNumber || null,
        },
        create: {
          id: uid, // Use Firebase UID as the primary key
          email,
          name: name || 'Member',
          password: 'firebase-authenticated', // Dummy placeholder to satisfy required schema constraint
          image: photoURL || null,
          phone: phoneNumber || null,
        },
      });

      return NextResponse.json({ success: true, user });
    } catch (dbError: any) {
      console.warn('[AUTH/SYNC] Prisma database sync skipped/failed:', dbError?.message || dbError);
      return NextResponse.json({
        success: false,
        warning: 'Database offline or not migrated. User authenticated on client only.',
        details: dbError?.message || String(dbError),
      });
    }
  } catch (err: any) {
    console.error('[AUTH/SYNC] Parsing/internal error:', err);
    return NextResponse.json({ error: err?.message || 'Internal Server Error' }, { status: 500 });
  }
}
