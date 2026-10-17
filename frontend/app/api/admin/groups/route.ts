import { NextResponse } from 'next/server';
import { requireAdminOrDev } from '@/lib/authMiddleware';

export const dynamic = 'force-dynamic';

export interface GroupRecord {
  id: string;
  name: string;
  description: string;
  category: 'YOUTH' | 'CHILDREN' | 'WOMEN' | 'MEN' | 'SERVICE';
  members: string[]; // User IDs
  leaderId?: string;
  meetingTime?: string;
  location?: string;
  createdAt: string;
  updatedAt: string;
}

// In-memory persistent store initialized with church fellowship groups
let groupsStore: GroupRecord[] = [
  {
    id: "grp_1",
    name: "Youth Fellowship",
    description: "Young adults fellowship, music, and spiritual empowerment sessions.",
    category: "YOUTH",
    members: [],
    meetingTime: "Fridays 7:00 PM",
    location: "Main Fellowship Hall",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "grp_2",
    name: "Sunday School Choir",
    description: "Children's choir team singing during Sunday worship services.",
    category: "CHILDREN",
    members: [],
    meetingTime: "Sundays 9:00 AM",
    location: "Children's Chapel",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "grp_3",
    name: "Women's Prayer Guild",
    description: "Mothers and sisters intercessory team meeting weekly.",
    category: "WOMEN",
    members: [],
    meetingTime: "Wednesdays 6:00 PM",
    location: "Prayer Tower Room 2",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "grp_4",
    name: "Church Ushers & Safety",
    description: "Volunteers maintaining order and welcoming visitors.",
    category: "SERVICE",
    members: [],
    meetingTime: "Sundays 8:30 AM",
    location: "Main Entrance Lobby",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export async function GET(req: Request) {
  const auth = await requireAdminOrDev(req);
  if (auth instanceof NextResponse) return auth;

  return NextResponse.json({
    success: true,
    groups: groupsStore,
  });
}

export async function POST(req: Request) {
  const auth = await requireAdminOrDev(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await req.json();
    const { name, description, category, meetingTime, location, leaderId, members } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Group name is required' }, { status: 400 });
    }

    const newGroup: GroupRecord = {
      id: `grp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: name.trim(),
      description: description?.trim() || 'Active church fellowship group.',
      category: category || 'YOUTH',
      members: Array.isArray(members) ? members : [],
      leaderId: leaderId || undefined,
      meetingTime: meetingTime || 'Weekly Service',
      location: location || 'Sanctuary',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    groupsStore.unshift(newGroup);

    return NextResponse.json({
      success: true,
      group: newGroup,
      message: 'Group created successfully in real-time',
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to create group' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const auth = await requireAdminOrDev(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await req.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'Group ID is required' }, { status: 400 });
    }

    const index = groupsStore.findIndex((g) => g.id === id);
    if (index === -1) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 });
    }

    groupsStore[index] = {
      ...groupsStore[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      group: groupsStore[index],
      message: 'Group updated successfully in real-time',
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to update group' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const auth = await requireAdminOrDev(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Group ID is required' }, { status: 400 });
    }

    const initialLength = groupsStore.length;
    groupsStore = groupsStore.filter((g) => g.id !== id);

    if (groupsStore.length === initialLength) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Group deleted permanently in real-time',
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to delete group' }, { status: 500 });
  }
}
