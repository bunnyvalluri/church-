import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import fs from 'fs';
import path from 'path';
import { getFallbackFilePath } from '@/lib/utils';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, name, phone, address, image } = body;

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const updateData: any = {
      name: name || 'Member',
      phone: phone || null,
      address: address || null,
    };
    if (image !== undefined) {
      updateData.image = image;
    }

    // Try Prisma DB first
    try {
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: updateData,
      });

      return NextResponse.json({ success: true, user: updatedUser });
    } catch (dbError: any) {
      console.warn('[PROFILE/UPDATE] Database offline. Using fallback JSON storage. Details:', dbError?.message || dbError);

      try {
        const fallbackFile = getFallbackFilePath('fallback_users.json');
        
        let users = [];
        if (fs.existsSync(fallbackFile)) {
          try {
            users = JSON.parse(fs.readFileSync(fallbackFile, 'utf-8'));
          } catch {}
        }

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
          // If the user wasn't found in fallback file, let's create a new record for them instead of throwing 404!
          const newUser = {
            id: userId,
            email: name === 'Member' ? '' : `${name.toLowerCase().replace(/\s+/g, '')}@gmail.com`,
            ...updateData,
            role: 'MEMBER',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          users.push(newUser);
        }

        // Ensure directories exist
        const dir = path.dirname(fallbackFile);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }

        fs.writeFileSync(fallbackFile, JSON.stringify(users, null, 2), 'utf-8');
        const updatedFallbackUser = users.find((u: any) => u.id === userId);

        return NextResponse.json({
          success: true,
          user: updatedFallbackUser,
          warning: 'Database offline. Profile updated in local fallback storage.',
        });
      } catch (fsErr: any) {
        console.error('[PROFILE/UPDATE] Local fallback failed:', fsErr);
        return NextResponse.json({
          error: 'Database is offline and local fallback failed.',
          details: fsErr?.message || String(fsErr),
        }, { status: 500 });
      }
    }
  } catch (err: any) {
    console.error('[PROFILE/UPDATE] Internal error:', err);
    return NextResponse.json({ error: err?.message || 'Internal Server Error' }, { status: 500 });
  }
}
