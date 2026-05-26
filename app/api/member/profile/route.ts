import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import fs from 'fs';
import path from 'path';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, name, phone, address } = body;

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const updateData = {
      name: name || 'Member',
      phone: phone || null,
      address: address || null,
    };

    // Try Prisma DB first
    try {
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: updateData,
      });

      return NextResponse.json({ success: true, user: updatedUser });
    } catch (dbError: any) {
      console.warn('[PROFILE/UPDATE] Database offline. Using fallback JSON file. Details:', dbError?.message || dbError);

      try {
        const fallbackFile = path.join(process.cwd(), 'prisma', 'fallback_users.json');
        
        if (!fs.existsSync(fallbackFile)) {
          return NextResponse.json({ error: 'No user database found on fallback storage.' }, { status: 404 });
        }

        let users = JSON.parse(fs.readFileSync(fallbackFile, 'utf-8'));
        let found = false;

        users = users.map((u: any) => {
          if (u.id === userId) {
            found = true;
            return {
              ...u,
              ...updateData,
              updatedAt: new Date().toISOString(),
            };
          }
          return u;
        });

        if (!found) {
          return NextResponse.json({ error: 'User not found in local fallback storage.' }, { status: 404 });
        }

        fs.writeFileSync(fallbackFile, JSON.stringify(users, null, 2), 'utf-8');
        const updatedFallbackUser = users.find((u: any) => u.id === userId);

        return NextResponse.json({
          success: true,
          user: updatedFallbackUser,
          warning: 'Database offline. Profile updated in local fallback storage.',
        });
      } catch (fsErr) {
        console.error('[PROFILE/UPDATE] Local fallback failed:', fsErr);
        return NextResponse.json({
          error: 'Database is offline and local fallback failed.',
          details: dbError?.message || String(dbError),
        }, { status: 500 });
      }
    }
  } catch (err: any) {
    console.error('[PROFILE/UPDATE] Internal error:', err);
    return NextResponse.json({ error: err?.message || 'Internal Server Error' }, { status: 500 });
  }
}
