import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import fs from 'fs';
import path from 'path';
import { getFallbackFilePath } from '@/lib/utils';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Try Prisma DB first
    try {
      const prayers = await prisma.prayerRequest.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      });

      return NextResponse.json({ success: true, prayers });
    } catch (dbError: any) {
      console.warn('[PRAYERS/GET] Database offline. Using local JSON fallback. Detail:', dbError?.message || dbError);

      try {
        const fallbackFile = getFallbackFilePath('fallback_prayers.json');
        
        if (!fs.existsSync(fallbackFile)) {
          return NextResponse.json({ success: true, prayers: [] });
        }

        const allPrayers = JSON.parse(fs.readFileSync(fallbackFile, 'utf-8'));
        const userPrayers = allPrayers
          .filter((p: any) => p.userId === userId)
          .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        return NextResponse.json({
          success: true,
          prayers: userPrayers,
          warning: 'Retrieved from local fallback file (DB offline).',
        });
      } catch (fsErr) {
        console.error('[PRAYERS/GET] Local fallback failed:', fsErr);
        return NextResponse.json({ success: true, prayers: [] });
      }
    }
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, title, description, category, isAnonymous } = body;

    if (!userId || !title || !description || !category) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    const prayerData = {
      userId,
      title,
      description,
      category,
      isAnonymous: Boolean(isAnonymous),
      status: 'PENDING' as const,
    };

    // Try Prisma DB first
    try {
      const newPrayer = await prisma.prayerRequest.create({
        data: prayerData,
      });

      return NextResponse.json({ success: true, prayer: newPrayer });
    } catch (dbError: any) {
      console.warn('[PRAYERS/CREATE] Database offline. Using local fallback. Detail:', dbError?.message || dbError);

      try {
        const fallbackFile = getFallbackFilePath('fallback_prayers.json');
        
        let prayers = [];
        if (fs.existsSync(fallbackFile)) {
          prayers = JSON.parse(fs.readFileSync(fallbackFile, 'utf-8'));
        }

        const newPrayerFallback = {
          id: `pry_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          ...prayerData,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        const dir = path.dirname(fallbackFile);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }

        prayers.push(newPrayerFallback);
        fs.writeFileSync(fallbackFile, JSON.stringify(prayers, null, 2), 'utf-8');

        return NextResponse.json({
          success: true,
          prayer: newPrayerFallback,
          warning: 'Database offline. Prayer request recorded in local fallback storage.',
        });
      } catch (fsErr) {
        console.error('[PRAYERS/CREATE] Local fallback failed:', fsErr);
        return NextResponse.json({ error: 'Database is offline and local fallback failed.' }, { status: 500 });
      }
    }
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Internal Server Error' }, { status: 500 });
  }
}
