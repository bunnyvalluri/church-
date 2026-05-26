import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import fs from 'fs';
import path from 'path';

export async function GET(req: Request) {
  try {
    // Try database fetch first
    try {
      const dbSermons = await prisma.sermon.findMany({
        orderBy: { date: 'desc' },
      });

      return NextResponse.json({ success: true, sermons: dbSermons });
    } catch (dbError: any) {
      console.warn('[PASTOR/SERMON/GET] Database offline. Using local JSON fallback. Detail:', dbError?.message || dbError);

      try {
        const fallbackFile = path.join(process.cwd(), 'prisma', 'fallback_sermons.json');
        
        if (!fs.existsSync(fallbackFile)) {
          return NextResponse.json({ success: true, sermons: [] });
        }

        const sermons = JSON.parse(fs.readFileSync(fallbackFile, 'utf-8'));
        const sortedSermons = sermons.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());

        return NextResponse.json({
          success: true,
          sermons: sortedSermons,
          warning: 'Retrieved from local fallback file (DB offline).',
        });
      } catch (fsErr) {
        console.error('[PASTOR/SERMON/GET] Local fallback failed:', fsErr);
        return NextResponse.json({ success: true, sermons: [] });
      }
    }
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, description, pastor, videoUrl, audioUrl, thumbnail, category, tags } = body;

    if (!title || !description || !pastor || !category) {
      return NextResponse.json({ error: 'Title, description, pastor name and category are required' }, { status: 400 });
    }

    const sermonData = {
      title,
      description,
      pastor,
      date: new Date(),
      videoUrl: videoUrl || null,
      audioUrl: audioUrl || null,
      thumbnail: thumbnail || '/sermons/default.jpg',
      category,
      tags: Array.isArray(tags) ? tags : [],
    };

    // Try database insertion first
    try {
      const newSermon = await prisma.sermon.create({
        data: sermonData,
      });

      return NextResponse.json({ success: true, sermon: newSermon });
    } catch (dbError: any) {
      console.warn('[PASTOR/SERMON] Database offline. Using fallback JSON storage. Detail:', dbError?.message || dbError);

      try {
        const fallbackFile = path.join(process.cwd(), 'prisma', 'fallback_sermons.json');
        
        let sermons = [];
        if (fs.existsSync(fallbackFile)) {
          sermons = JSON.parse(fs.readFileSync(fallbackFile, 'utf-8'));
        }

        const newSermonFallback = {
          id: `srm_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          ...sermonData,
          date: sermonData.date.toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        sermons.push(newSermonFallback);
        fs.writeFileSync(fallbackFile, JSON.stringify(sermons, null, 2), 'utf-8');

        return NextResponse.json({
          success: true,
          sermon: newSermonFallback,
          warning: 'Database offline. Sermon saved in local fallback storage.',
        });
      } catch (fsErr) {
        console.error('[PASTOR/SERMON] Local fallback failed:', fsErr);
        return NextResponse.json({ error: 'Database is offline and local fallback failed.' }, { status: 500 });
      }
    }
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Internal Server Error' }, { status: 500 });
  }
}
