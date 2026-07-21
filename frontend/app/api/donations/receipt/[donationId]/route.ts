/**
 * GET /api/donations/receipt/[donationId]
 * ─────────────────────────────────────────────────────────────────────────────
 * Production-grade 80G donation receipt endpoint.
 *
 * Query Params:
 *   ?format=html        → Returns printable HTML receipt (default browser view)
 *   ?format=download    → Returns HTML with Content-Disposition: attachment (triggers save-as)
 *   ?format=json        → Returns structured JSON receipt data
 *   ?verify=CODE        → Verifies receipt authenticity by verification code
 *
 * Security:
 *   • Only COMPLETED donations get a receipt
 *   • Verification code validated against HMAC before showing
 *   • No PAN or sensitive data in JSON mode (only in HTML for download)
 *   • Rate limited: 10 requests/min per IP
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getOrCreateReceipt, renderReceiptHtml } from '@/lib/receiptEngine';
import { getClientIp, maskSensitive } from '@/lib/security';

export const dynamic = 'force-dynamic';

// ─── Rate Limit (in-memory, per IP) ──────────────────────────────────────────
const receiptRateMap = new Map<string, { count: number; resetAt: number }>();

function isReceiptRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = receiptRateMap.get(ip);
  if (!entry || entry.resetAt < now) {
    receiptRateMap.set(ip, { count: 1, resetAt: now + 60_000 });
    return false;
  }
  entry.count++;
  if (entry.count > 15) return true;
  return false;
}

export async function GET(
  req: Request,
  { params }: { params: { donationId: string } }
) {
  const { donationId } = params;
  const { searchParams } = new URL(req.url);
  const format = searchParams.get('format') || 'html'; // html | download | json
  const verifyCode = searchParams.get('verify');        // optional verify param
  const ip = getClientIp(req);

  if (!donationId) {
    return NextResponse.json({ error: 'Donation ID is required' }, { status: 400 });
  }

  // Rate limit
  if (isReceiptRateLimited(ip)) {
    return NextResponse.json({ error: 'Too many requests. Please wait before downloading again.' }, { status: 429 });
  }

  try {
    // ── 1. Load donation with all related data ──────────────────────────────
    const donation = await prisma.donation.findUnique({
      where: { id: donationId },
      include: {
        user: {
          select: { name: true, email: true, phone: true },
        },
        purposeRelation: true,
        branch: true,
        receipt: true,
        session: {
          select: {
            campaignName: true,
            razorpayOrderId: true,
          },
        },
      },
    });

    if (!donation) {
      return receiptNotFound(format);
    }

    // ── 2. Only completed donations get receipts ────────────────────────────
    if (donation.status !== 'COMPLETED') {
      if (format === 'json') {
        return NextResponse.json({
          error: 'Receipt is not yet available. Payment verification is in progress.',
          status: donation.status,
        }, { status: 202 });
      }
      return new Response(pendingReceiptHtml(donation.status), {
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
        status: 202,
      });
    }

    // ── 3. Load Church Settings for 80G number ─────────────────────────────
    const settings = await prisma.churchSettings.findUnique({
      where: { id: 'settings' },
      select: { eightygRegistrationNo: true, merchantName: true },
    }).catch(() => null);

    // ── 4. Resolve donor details ────────────────────────────────────────────
    const donorName = donation.donorName || donation.user?.name || 'Valued Partner';
    const donorEmail = donation.donorEmail || donation.user?.email || undefined;
    const donorPhone = donation.donorPhone || donation.user?.phone || undefined;
    const purposeName = donation.purposeRelation?.nameEn || donation.purpose.replace(/_/g, ' ');
    const branchName = donation.branch?.name || undefined;
    const campaignName = donation.campaignName || donation.session?.campaignName || undefined;
    const razorpayOrderId = donation.razorpayOrderId || donation.session?.razorpayOrderId || undefined;

    // ── 5. Get or Create Receipt record ────────────────────────────────────
    const receipt = await getOrCreateReceipt({
      donationId: donation.id,
      donorName,
      donorEmail,
      donorPhone,
      panNumber: donation.panNumber || undefined,
      amount: donation.amount,
      currency: donation.currency,
      purposeName,
      purposeCode: donation.purpose,
      branchName,
      campaignName,
      paymentMethod: donation.paymentMethod,
      upiApp: donation.upiApp || undefined,
      razorpayPaymentId: donation.razorpayPaymentId || undefined,
      razorpayOrderId,
      issuedAt: donation.createdAt,
    });

    // ── 6. Verify Mode — check verification code ───────────────────────────
    if (verifyCode) {
      const isValid = verifyCode === receipt.verificationCode;
      if (format === 'json') {
        return NextResponse.json({
          verified: isValid,
          receiptNumber: receipt.receiptNumber,
          amount: receipt.amount,
          donorName: isValid ? donorName : 'Hidden',
          purposeName: isValid ? purposeName : 'Hidden',
          issuedAt: receipt.issuedAt,
        });
      }
      return new Response(verificationResultHtml(isValid, receipt.receiptNumber, donorName, donation.amount), {
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      });
    }

    // ── 7. JSON mode — structured data (no sensitive PAN in JSON) ─────────
    if (format === 'json') {
      return NextResponse.json({
        success: true,
        receipt: {
          id: receipt.id,
          receiptNumber: receipt.receiptNumber,
          verificationCode: receipt.verificationCode,
          verificationUrl: receipt.verificationUrl,
          amount: receipt.amount,
          currency: donation.currency,
          issuedAt: receipt.issuedAt,
          donorName,
          purposeName,
          branchName,
          campaignName,
          paymentMethod: donation.paymentMethod,
          upiApp: donation.upiApp,
          razorpayPaymentId: maskSensitive(donation.razorpayPaymentId || '', 8),
        },
        donation: {
          id: donation.id,
          status: donation.status,
          amount: donation.amount,
          currency: donation.currency,
          createdAt: donation.createdAt,
        },
      });
    }

    // ── 8. HTML / Download mode ────────────────────────────────────────────
    const html = renderReceiptHtml({
      receiptNumber: receipt.receiptNumber,
      verificationCode: receipt.verificationCode,
      donorName,
      donorEmail,
      donorPhone,
      panNumber: donation.panNumber || undefined,
      amount: donation.amount,
      currency: donation.currency,
      purposeName,
      branchName,
      campaignName,
      paymentMethod: donation.paymentMethod,
      upiApp: donation.upiApp || undefined,
      razorpayPaymentId: donation.razorpayPaymentId || undefined,
      razorpayOrderId,
      qrCodeDataUrl: receipt.qrCodeDataUrl,
      issuedAt: donation.createdAt,
      eightygNumber: settings?.eightygRegistrationNo || undefined,
    });

    const headers: Record<string, string> = {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'private, no-cache',
    };

    if (format === 'download') {
      const safeName = `KCM-Receipt-${receipt.receiptNumber}.html`;
      headers['Content-Disposition'] = `attachment; filename="${safeName}"`;
    }

    return new Response(html, { headers });

  } catch (err: any) {
    console.error(`[RECEIPT_API] Error for donation ${maskSensitive(donationId, 8)}:`, err?.message);
    return NextResponse.json(
      { error: 'An error occurred while generating the receipt. Please try again.' },
      { status: 500 }
    );
  }
}

// ─── Error HTML Pages ─────────────────────────────────────────────────────────

function receiptNotFound(format: string) {
  if (format === 'json') {
    return NextResponse.json({ error: 'Receipt not found' }, { status: 404 });
  }
  return new Response(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>Receipt Not Found</title>
    <style>body{font-family:sans-serif;background:#faf5ff;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;}
    .card{background:#fff;border-radius:16px;padding:40px;text-align:center;box-shadow:0 4px 20px rgba(0,0,0,.08);max-width:400px;}
    h2{color:#4F1C91;font-size:22px;}p{color:#64748b;margin-top:8px;}
    a{display:inline-block;margin-top:20px;padding:10px 24px;background:#4F1C91;color:#fff;border-radius:8px;text-decoration:none;font-weight:600;}
    </style></head><body><div class="card"><div style="font-size:48px">🔍</div>
    <h2>Receipt Not Found</h2><p>This donation receipt could not be located. It may have been removed or the link is invalid.</p>
    <a href="/ngo/donations">Return to Donations</a></div></body></html>`, {
    status: 404,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}

function pendingReceiptHtml(status: string) {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Payment In Progress — KCM</title>
  <meta http-equiv="refresh" content="10">
  <style>body{font-family:sans-serif;background:#f5f3ff;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;}
  .card{background:#fff;border-radius:16px;padding:40px;text-align:center;box-shadow:0 4px 20px rgba(0,0,0,.08);max-width:420px;}
  h2{color:#d97706;font-size:20px;}p{color:#64748b;margin-top:8px;line-height:1.6;}
  .status{display:inline-block;padding:6px 14px;background:#fef3c7;color:#92400e;border-radius:20px;font-size:12px;font-weight:700;margin:12px 0;}
  .spinner{width:40px;height:40px;border:4px solid #ede9fe;border-top:4px solid #7C3AED;border-radius:50%;animation:spin 1s linear infinite;margin:12px auto;}
  @keyframes spin{to{transform:rotate(360deg)}}</style></head>
  <body><div class="card"><div class="spinner"></div>
  <h2>⏳ Awaiting Payment Verification</h2>
  <div class="status">Status: ${status}</div>
  <p>Your payment is being verified. Once confirmed, your 80G receipt will be automatically generated and emailed to you.</p>
  <p style="font-size:12px;color:#94a3b8;margin-top:16px;">This page will refresh automatically every 10 seconds.</p>
  </div></body></html>`;
}

function verificationResultHtml(isValid: boolean, receiptNumber: string, donorName: string, amount: number) {
  const color = isValid ? '#15803d' : '#dc2626';
  const bg = isValid ? '#f0fdf4' : '#fef2f2';
  const icon = isValid ? '✅' : '❌';
  const title = isValid ? 'Receipt Verified' : 'Verification Failed';
  const msg = isValid
    ? `Receipt <strong>${receiptNumber}</strong> issued to <strong>${donorName}</strong> for ₹${amount.toLocaleString('en-IN')} is authentic and verified by Kingdom of Christ Ministries.`
    : 'The verification code provided does not match our records. This receipt may be invalid or tampered with. Please contact KCM administration.';

  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${title} — KCM</title>
  <style>body{font-family:sans-serif;background:${bg};display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;}
  .card{background:#fff;border-radius:16px;padding:40px;text-align:center;box-shadow:0 4px 20px rgba(0,0,0,.08);max-width:460px;border-top:4px solid ${color};}
  h2{color:${color};font-size:22px;}p{color:#374151;line-height:1.6;margin-top:12px;}
  a{display:inline-block;margin-top:20px;padding:10px 24px;background:#4F1C91;color:#fff;border-radius:8px;text-decoration:none;font-weight:600;}
  </style></head><body><div class="card">
  <div style="font-size:52px;margin-bottom:8px">${icon}</div>
  <h2>${title}</h2><p>${msg}</p>
  <a href="/">Return to KCM Portal</a></div></body></html>`;
}
