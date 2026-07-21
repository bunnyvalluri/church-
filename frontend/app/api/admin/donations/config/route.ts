/**
 * GET  /api/admin/donations/config   → Return donation settings (ADMIN only)
 * PATCH /api/admin/donations/config  → Update donation settings (ADMIN only)
 * ─────────────────────────────────────────────────────────────────────────────
 * Manages: UPI ID, QR expiry, min/max amounts, 80G registration, alert emails,
 * merchant name.
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/authMiddleware';
import { z } from 'zod';
import { writeAuditLog } from '@/lib/auditLogger';
import { getClientIp } from '@/lib/security';

export const dynamic = 'force-dynamic';

const UpdateSettingsSchema = z.object({
  churchName: z.string().min(2).max(120).optional(),
  upiId: z.string().min(3).max(60).optional(),
  merchantName: z.string().min(2).max(80).optional(),
  qrExpiryMinutes: z.number().int().min(5).max(60).optional(),
  minDonationAmount: z.number().min(1).max(1000).optional(),
  maxDonationAmount: z.number().min(1000).max(1000000).optional(),
  eightygRegistrationNo: z.string().max(60).optional().nullable(),
  adminAlertEmails: z.string().max(500).optional().nullable(),
  financeAlertEmails: z.string().max(500).optional().nullable(),
}).strict();

export async function GET(req: Request) {
  try {
    const authResult = await requireAdmin(req);
    if (authResult instanceof NextResponse) return authResult;

    const settings = await prisma.churchSettings.findUnique({ where: { id: 'settings' } });
    if (!settings) {
      return NextResponse.json({ error: 'Settings not initialized' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      settings: {
        churchName: settings.churchName,
        upiId: settings.upiId,
        merchantName: settings.merchantName,
        qrExpiryMinutes: settings.qrExpiryMinutes,
        minDonationAmount: settings.minDonationAmount,
        maxDonationAmount: settings.maxDonationAmount,
        eightygRegistrationNo: settings.eightygRegistrationNo,
        adminAlertEmails: settings.adminAlertEmails,
        financeAlertEmails: settings.financeAlertEmails,
      },
    });

  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const ip = getClientIp(req);
  try {
    const authResult = await requireAdmin(req);
    if (authResult instanceof NextResponse) return authResult;
    const adminUser = authResult;

    let rawBody: unknown;
    try { rawBody = await req.json(); } catch {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    const parsed = UpdateSettingsSchema.safeParse(rawBody);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0]?.message || 'Validation failed' }, { status: 400 });
    }

    const updated = await prisma.churchSettings.update({
      where: { id: 'settings' },
      data: parsed.data,
    });

    await writeAuditLog({
      userId: adminUser.uid,
      action: 'ADMIN_SETTINGS_UPDATED',
      details: `Admin updated donation settings: ${JSON.stringify(Object.keys(parsed.data))}`,
      ipAddress: ip,
    });

    return NextResponse.json({ success: true, settings: updated });

  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Update failed' }, { status: 500 });
  }
}
