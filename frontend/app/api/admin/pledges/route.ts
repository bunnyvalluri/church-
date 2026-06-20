import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminOrDev } from '@/lib/authMiddleware';
import { z } from 'zod';
import sanitizeHtml from 'sanitize-html';

export const dynamic = 'force-dynamic';

const pledgeSchema = z.object({
  donorName: z.string().min(1).max(256),
  donorEmail: z.string().email().max(254),
  committedAmount: z.number().positive(),
  targetDate: z.string().transform((val) => new Date(val)),
  purpose: z.string().min(1).max(256),
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
    const pledges = await prisma.pledge.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ success: true, pledges });
  } catch (err: any) {
    console.error('[ADMIN/PLEDGES/GET] Error:', err);
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
    const parsed = pledgeSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request data', details: parsed.error.format() }, { status: 400 });
    }

    const { donorName, donorEmail, committedAmount, targetDate, purpose } = parsed.data;

    const newPledge = await prisma.pledge.create({
      data: {
        donorName: sanitize(donorName),
        donorEmail: sanitize(donorEmail),
        committedAmount,
        targetDate,
        purpose: sanitize(purpose),
        status: 'PENDING',
      },
    });

    return NextResponse.json({ success: true, pledge: newPledge });
  } catch (err: any) {
    console.error('[ADMIN/PLEDGES/POST] Error:', err);
    return NextResponse.json(
      { error: err?.message || 'Database error occurred while creating pledge' },
      { status: 500 }
    );
  }
}
