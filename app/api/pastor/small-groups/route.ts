import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const groups = await prisma.smallGroup.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json({ success: true, groups });
  } catch (err: any) {
    console.error('[PASTOR/SMALL-GROUPS/GET] Error:', err);
    return NextResponse.json(
      { error: err?.message || 'Database error occurred while fetching small groups' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, leader, location, meetingTime, attendanceAvg } = body;

    if (!name || !leader || !location || !meetingTime) {
      return NextResponse.json({ error: 'Name, leader, location, and meetingTime are required' }, { status: 400 });
    }

    const newGroup = await prisma.smallGroup.create({
      data: {
        name,
        leader,
        location,
        meetingTime,
        attendanceAvg: attendanceAvg ? parseInt(attendanceAvg) : 10
      }
    });

    return NextResponse.json({ success: true, group: newGroup });
  } catch (err: any) {
    console.error('[PASTOR/SMALL-GROUPS/POST] Error:', err);
    return NextResponse.json(
      { error: err?.message || 'Database error occurred while creating small group' },
      { status: 500 }
    );
  }
}

