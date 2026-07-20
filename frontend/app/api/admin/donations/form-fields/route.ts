import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// GET: Fetch all dynamic donor form fields
export async function GET() {
  try {
    const fields = await prisma.donationFormField.findMany({
      orderBy: { displayOrder: 'asc' },
    });
    return NextResponse.json({ success: true, fields });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to fetch form fields' }, { status: 500 });
  }
}

// PUT: Bulk update or update single form field control rules
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    
    if (Array.isArray(body)) {
      // Bulk update
      for (const field of body) {
        if (field.id) {
          await prisma.donationFormField.update({
            where: { id: field.id },
            data: {
              isRequired: Boolean(field.isRequired),
              isVisible: Boolean(field.isVisible),
              label: field.label,
              placeholder: field.placeholder || '',
              displayOrder: parseInt(field.displayOrder || 0),
            },
          });
        }
      }
      const updatedList = await prisma.donationFormField.findMany({
        orderBy: { displayOrder: 'asc' },
      });
      return NextResponse.json({ success: true, fields: updatedList });
    }

    const { id, isRequired, isVisible, label, placeholder, displayOrder } = body;
    if (!id) {
      return NextResponse.json({ error: 'Field ID is required' }, { status: 400 });
    }

    const updated = await prisma.donationFormField.update({
      where: { id },
      data: {
        isRequired: isRequired !== undefined ? Boolean(isRequired) : undefined,
        isVisible: isVisible !== undefined ? Boolean(isVisible) : undefined,
        label: label || undefined,
        placeholder: placeholder !== undefined ? placeholder : undefined,
        displayOrder: displayOrder !== undefined ? parseInt(displayOrder) : undefined,
      },
    });

    return NextResponse.json({ success: true, field: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to update form field' }, { status: 500 });
  }
}
