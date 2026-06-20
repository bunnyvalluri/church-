import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminOrDev } from '@/lib/authMiddleware';
import { z } from 'zod';
import sanitizeHtml from 'sanitize-html';

export const dynamic = 'force-dynamic';

const attendanceSchema = z.object({
  date: z.string().transform((val) => new Date(val)),
  serviceType: z.string().min(1).max(256),
  location: z.string().min(1).max(256),
  headcount: z.number().int().nonnegative(),
  newVisitors: z.number().int().nonnegative().default(0),
  notes: z.string().max(1000).optional().nullable(),
});

const sanitize = (s: string) =>
  sanitizeHtml(s, {
    allowedTags: [],
    allowedAttributes: {},
    disallowedTagsMode: 'discard',
  });

export async function GET(req: Request) {
  const auth = await requireAdminOrDev(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const records = await prisma.attendanceRecord.findMany({
      orderBy: { date: 'desc' },
    });
    return NextResponse.json({ success: true, records });
  } catch (err: any) {
    console.error('[ADMIN/ATTENDANCE/GET] Error:', err);
    return NextResponse.json(
      { error: err?.message || 'Database error occurred' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const auth = await requireAdminOrDev(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await req.json();
    const parsed = attendanceSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request data', details: parsed.error.format() }, { status: 400 });
    }

    const { date, serviceType, location, headcount, newVisitors, notes } = parsed.data;

    const newRecord = await prisma.attendanceRecord.create({
      data: {
        date,
        serviceType: sanitize(serviceType),
        location: sanitize(location),
        headcount,
        newVisitors,
        notes: notes ? sanitize(notes) : null,
      },
    });

    return NextResponse.json({ success: true, record: newRecord });
  } catch (err: any) {
    console.error('[ADMIN/ATTENDANCE/POST] Error:', err);
    return NextResponse.json(
      { error: err?.message || 'Database error occurred while adding attendance record' },
      { status: 500 }
    );
  }
}
