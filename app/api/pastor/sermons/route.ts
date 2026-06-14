import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const dbSermons = await prisma.sermon.findMany({
      orderBy: { date: 'desc' },
    });

    return NextResponse.json({ success: true, sermons: dbSermons });
  } catch (err: any) {
    console.error('[PASTOR/SERMON/GET] Error:', err);
    return NextResponse.json(
      { error: err?.message || 'Database error occurred while fetching sermons' },
      { status: 500 }
    );
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

    const newSermon = await prisma.sermon.create({
      data: sermonData,
    });

    return NextResponse.json({ success: true, sermon: newSermon });
  } catch (err: any) {
    console.error('[PASTOR/SERMON/POST] Error:', err);
    return NextResponse.json(
      { error: err?.message || 'Database error occurred while creating sermon' },
      { status: 500 }
    );
  }
}

