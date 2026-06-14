import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import fs from 'fs';
import path from 'path';

// Seed initial mock small groups
const initialSmallGroups = [
  { id: "sg_1", name: "Bahadurpally Home Cell", leader: "Deacon Samuel", location: "Bahadurpally Sector 2", meetingTime: "Friday 7:00 PM", attendanceAvg: 12 },
  { id: "sg_2", name: "Shapur Fellowship Group", leader: "Sister Mary", location: "Shapur Main Road", meetingTime: "Friday 6:35 PM", attendanceAvg: 8 },
  { id: "sg_3", name: "Subhash Nagar Cell Group", leader: "Brother David", location: "Subhash Nagar Colony", meetingTime: "Saturday 6:00 PM", attendanceAvg: 15 }
];

const getFallbackFile = () => path.join(process.cwd(), 'prisma', 'fallback_small_groups.json');

const readSmallGroups = () => {
  const file = getFallbackFile();
  if (!fs.existsSync(file)) {
    fs.writeFileSync(file, JSON.stringify(initialSmallGroups, null, 2), 'utf-8');
    return initialSmallGroups;
  }
  try {
    return JSON.parse(fs.readFileSync(file, 'utf-8'));
  } catch (err) {
    console.error('Error reading small groups file:', err);
    return initialSmallGroups;
  }
};

const writeSmallGroups = (groups: any[]) => {
  const file = getFallbackFile();
  fs.writeFileSync(file, JSON.stringify(groups, null, 2), 'utf-8');
};

export async function GET() {
  try {
    try {
      const groups = readSmallGroups();
      return NextResponse.json({ success: true, groups });
    } catch (dbError) {
      const groups = readSmallGroups();
      return NextResponse.json({ success: true, groups, warning: 'Using local storage' });
    }
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, leader, location, meetingTime, attendanceAvg } = body;

    if (!name || !leader || !location || !meetingTime) {
      return NextResponse.json({ error: 'Name, leader, location, and meetingTime are required' }, { status: 400 });
    }

    const groups = readSmallGroups();
    const newGroup = {
      id: `sg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name,
      leader,
      location,
      meetingTime,
      attendanceAvg: attendanceAvg ? parseInt(attendanceAvg) : 10
    };

    groups.push(newGroup);
    writeSmallGroups(groups);

    return NextResponse.json({ success: true, group: newGroup });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Internal Server Error' }, { status: 500 });
  }
}
