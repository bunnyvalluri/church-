import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const groups = await prisma.bibleStudy.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json({ success: true, groups });
  } catch (err: any) {
    console.error('[PASTOR/BIBLE-STUDIES/GET] Error:', err);
    return NextResponse.json(
      { error: err?.message || 'Database error occurred while fetching bible studies' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, leader, time, day } = body;

    if (!name || !leader || !time || !day) {
      return NextResponse.json({ error: 'Name, leader, time, and day are required' }, { status: 400 });
    }

    const newGroup = await prisma.bibleStudy.create({
      data: {
        name,
        leader,
        time,
        membersCount: 1, // Start with 1 register (leader/creator)
        day
      }
    });

    return NextResponse.json({ success: true, group: newGroup });
  } catch (err: any) {
    console.error('[PASTOR/BIBLE-STUDIES/POST] Error:', err);
    return NextResponse.json(
      { error: err?.message || 'Database error occurred while creating bible study group' },
      { status: 500 }
    );
  }
}

