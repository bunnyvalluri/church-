import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import fs from 'fs';
import path from 'path';

// Seed initial mock Bible study groups
const initialBibleStudies = [
  { id: "bs_1", name: "Wednesday Morning Fellowship", leader: "Brother Johnathan", time: "10:00 AM", membersCount: 18, day: "Wednesday" },
  { id: "bs_2", name: "Midweek Theology Circle", leader: "Bishop Kurra Kristhu Raju", time: "07:30 PM", membersCount: 25, day: "Wednesday" },
  { id: "bs_3", name: "Saturday Men's Bible Class", leader: "Elder Matthew", time: "08:00 AM", membersCount: 14, day: "Saturday" }
];

const getFallbackFile = () => path.join(process.cwd(), 'prisma', 'fallback_bible_studies.json');

const readBibleStudies = () => {
  const file = getFallbackFile();
  if (!fs.existsSync(file)) {
    fs.writeFileSync(file, JSON.stringify(initialBibleStudies, null, 2), 'utf-8');
    return initialBibleStudies;
  }
  try {
    return JSON.parse(fs.readFileSync(file, 'utf-8'));
  } catch (err) {
    console.error('Error reading bible studies file:', err);
    return initialBibleStudies;
  }
};

const writeBibleStudies = (groups: any[]) => {
  const file = getFallbackFile();
  fs.writeFileSync(file, JSON.stringify(groups, null, 2), 'utf-8');
};

export async function GET() {
  try {
    try {
      // Direct JSON fallback as no specific model is in current schema
      const groups = readBibleStudies();
      return NextResponse.json({ success: true, groups });
    } catch (dbError) {
      const groups = readBibleStudies();
      return NextResponse.json({ success: true, groups, warning: 'Using local storage' });
    }
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, leader, time, day } = body;

    if (!name || !leader || !time || !day) {
      return NextResponse.json({ error: 'Name, leader, time, and day are required' }, { status: 400 });
    }

    const groups = readBibleStudies();
    const newGroup = {
      id: `bs_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name,
      leader,
      time,
      membersCount: 1, // Start with 1 register (leader/creator)
      day
    };

    groups.push(newGroup);
    writeBibleStudies(groups);

    return NextResponse.json({ success: true, group: newGroup });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Internal Server Error' }, { status: 500 });
  }
}
