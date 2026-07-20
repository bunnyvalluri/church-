/**
 * GET /api/receipts/[id]/pdf
 *
 * Returns an HTML page optimised for browser print-to-PDF.
 * The page auto-triggers window.print() on load, so the browser's native
 * Save-as-PDF dialog opens immediately — zero server-side Chromium needed.
 *
 * Query params:
 *   ?preview=true  — shows the page without auto-print (for preview mode)
 *   ?verify=CODE   — displays verification watermark when code matches
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  const { searchParams } = new URL(req.url);
  const isPreview = searchParams.get('preview') === 'true';

  try {
    // Resolve by receipt ID, donation ID, or receipt number
    const receipt = await prisma.receipt.findFirst({
      where: {
        OR: [{ id }, { donationId: id }, { receiptNumber: id }],
      },
      include: {
        donation: {
          include: {
            purposeRelation: true,
            branch: true,
          },
        },
        member: {
          select: { name: true, email: true, phone: true },
        },
      },
    });

    if (!receipt) {
      return NextResponse.json({ error: 'Receipt not found.' }, { status: 404 });
    }

    const donation = receipt.donation;
    const donorName = donation.donorName || receipt.member?.name || 'Anonymous Giver';
    const donorEmail = donation.donorEmail || receipt.member?.email || 'N/A';
    const donorPhone = donation.donorPhone || receipt.member?.phone || 'N/A';
    const purpose = donation.purposeRelation?.nameEn || donation.purpose?.replace(/_/g, ' ') || 'General Donation';
    const branch = donation.branch?.name || 'General';
    const amount = receipt.amount;
    const currency = receipt.currency || 'INR';
    const issuedAt = receipt.issuedAt;

    const formattedAmount = amount.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      style: 'currency',
      currency,
    });

    const formattedDate = new Date(issuedAt).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'long', year: 'numeric',
    });
    const formattedTime = new Date(issuedAt).toLocaleTimeString('en-IN', {
      hour: '2-digit', minute: '2-digit', hour12: true,
    });

    // Amount in words helper
    function numberToWords(num: number): string {
      const a = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
        'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
      const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
      const convert = (n: number): string => {
        if (n < 20) return a[n];
        if (n < 100) return b[Math.floor(n / 10)] + (n % 10 ? ' ' + a[n % 10] : '');
        if (n < 1000) return a[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' and ' + convert(n % 100) : '');
        if (n < 100000) return convert(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 ? ' ' + convert(n % 1000) : '');
        if (n < 10000000) return convert(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 ? ' ' + convert(n % 100000) : '');
        return convert(Math.floor(n / 10000000)) + ' Crore' + (n % 10000000 ? ' ' + convert(n % 10000000) : '');
      };
      return convert(Math.floor(num)) + ' Rupees Only';
    }

    const qrDataUrl = receipt.qrCode || '';
    const domain = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const receiptPageUrl = `${domain}/give/receipt/${donation.id}`;

    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Donation Receipt ${receipt.receiptNumber} — KCM</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html { font-family: 'Inter', Arial, sans-serif; }
    body { background: #f5f3ff; display: flex; justify-content: center; align-items: flex-start; min-height: 100vh; padding: 20px; }
    .receipt-wrapper { width: 794px; background: #fff; box-shadow: 0 8px 60px rgba(79,28,145,0.15); border-radius: 16px; overflow: hidden; position: relative; }

    /* Diagonal watermark */
    .watermark {
      position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%) rotate(-30deg);
      font-size: 96px; font-weight: 900; color: rgba(79,28,145,0.04);
      letter-spacing: 4px; white-space: nowrap; pointer-events: none; z-index: 0; user-select: none;
    }
    .content { position: relative; z-index: 1; }

    /* Header */
    .header { background: linear-gradient(135deg, #3b0764 0%, #4F1C91 50%, #4338ca 100%); padding: 36px 48px; }
    .header-inner { display: flex; justify-content: space-between; align-items: flex-start; }
    .church-brand .cross { font-size: 32px; color: #e9d5ff; margin-bottom: 6px; }
    .church-brand h1 { color: #fff; font-size: 20px; font-weight: 800; letter-spacing: -0.3px; line-height: 1.2; margin-bottom: 4px; }
    .church-brand p { color: rgba(255,255,255,0.65); font-size: 11px; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 2px; }
    .receipt-badge { text-align: right; }
    .receipt-badge .label { font-size: 10px; color: rgba(255,255,255,0.6); letter-spacing: 2px; text-transform: uppercase; display: block; margin-bottom: 6px; }
    .receipt-badge .number { font-size: 22px; font-weight: 900; color: #fff; font-family: monospace; letter-spacing: -0.5px; display: block; }
    .receipt-badge .date-line { font-size: 11px; color: rgba(255,255,255,0.7); display: block; margin-top: 4px; }

    /* Success banner */
    .success-banner { background: #f0fdf4; border-bottom: 2px solid #dcfce7; padding: 12px 48px; display: flex; align-items: center; gap: 12px; }
    .success-banner .check { width: 28px; height: 28px; background: #16a34a; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 14px; font-weight: 700; flex-shrink: 0; }
    .success-banner span { font-size: 14px; font-weight: 700; color: #15803d; }
    .success-banner .ref { margin-left: auto; font-size: 11px; color: #6b7280; font-family: monospace; }

    /* Body */
    .body { padding: 32px 48px; }

    /* Two column info grid */
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 28px; }
    .info-section { background: #faf5ff; border: 1px solid #ede9fe; border-radius: 12px; padding: 18px 20px; }
    .info-section h3 { font-size: 10px; font-weight: 700; color: #7c3aed; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 14px; padding-bottom: 8px; border-bottom: 1px solid #ede9fe; }
    .info-row { display: flex; flex-direction: column; margin-bottom: 10px; }
    .info-row:last-child { margin-bottom: 0; }
    .info-label { font-size: 10px; color: #9ca3af; font-weight: 500; margin-bottom: 2px; }
    .info-value { font-size: 13px; color: #1f2937; font-weight: 600; }
    .info-value.mono { font-family: monospace; color: #4338ca; }
    .info-value.highlight { color: #4F1C91; font-weight: 700; }

    /* Amount box */
    .amount-box { background: linear-gradient(135deg, #4F1C91 0%, #7c3aed 100%); border-radius: 14px; padding: 24px 32px; margin-bottom: 28px; display: flex; justify-content: space-between; align-items: center; }
    .amount-words { color: rgba(255,255,255,0.8); font-size: 12px; line-height: 1.5; max-width: 55%; }
    .amount-words .label { font-size: 10px; letter-spacing: 1.5px; text-transform: uppercase; color: rgba(255,255,255,0.55); margin-bottom: 4px; }
    .amount-words .words { font-style: italic; font-weight: 600; color: #e9d5ff; }
    .amount-figure { text-align: right; }
    .amount-figure .label { font-size: 10px; letter-spacing: 1.5px; text-transform: uppercase; color: rgba(255,255,255,0.55); margin-bottom: 4px; }
    .amount-figure .value { font-size: 32px; font-weight: 900; color: #fff; font-family: monospace; letter-spacing: -1px; }

    /* Full-width details table */
    .details-table { width: 100%; border-collapse: collapse; margin-bottom: 28px; }
    .details-table th { font-size: 10px; font-weight: 700; color: #6b7280; letter-spacing: 1.5px; text-transform: uppercase; padding: 8px 14px; background: #f9fafb; border: 1px solid #f3f4f6; text-align: left; }
    .details-table td { font-size: 12.5px; color: #374151; padding: 10px 14px; border: 1px solid #f3f4f6; vertical-align: top; }
    .details-table td.label { color: #9ca3af; font-weight: 500; width: 160px; }
    .details-table td.value { font-weight: 600; }
    .details-table td.value.mono { font-family: monospace; color: #4338ca; }
    .details-table td.value.amount { font-size: 16px; font-weight: 800; color: #4F1C91; }

    /* QR + Signature row */
    .footer-row { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 28px; gap: 24px; }
    .qr-block { text-align: center; flex-shrink: 0; }
    .qr-block img { width: 100px; height: 100px; border: 2px solid #ede9fe; border-radius: 8px; padding: 4px; }
    .qr-block p { font-size: 9px; color: #9ca3af; margin-top: 4px; letter-spacing: 0.5px; }
    .seal-block { flex: 1; display: flex; flex-direction: column; align-items: center; }
    .seal-svg { margin-bottom: 8px; }
    .signature-block { text-align: center; flex-shrink: 0; min-width: 160px; }
    .sig-line { height: 40px; border-bottom: 2px solid #d1d5db; display: flex; align-items: flex-end; justify-content: center; padding-bottom: 4px; font-family: Georgia, serif; font-style: italic; font-size: 15px; color: #4F1C91; margin-bottom: 6px; }
    .sig-label { font-size: 10px; font-weight: 700; color: #6b7280; letter-spacing: 1.5px; text-transform: uppercase; }
    .sig-title { font-size: 10px; color: #9ca3af; margin-top: 2px; }

    /* Tax notice */
    .tax-notice { background: #fffbeb; border: 1px solid #fef3c7; border-radius: 10px; padding: 14px 18px; margin-bottom: 20px; }
    .tax-notice p { font-size: 11px; color: #92400e; line-height: 1.6; }

    /* Footer */
    .doc-footer { background: #f9fafb; border-top: 2px solid #ede9fe; padding: 20px 48px; display: flex; justify-content: space-between; align-items: center; }
    .doc-footer .left { font-size: 11px; color: #9ca3af; line-height: 1.7; }
    .doc-footer .right { text-align: right; font-size: 11px; color: #9ca3af; line-height: 1.7; }
    .doc-footer .tagline { font-size: 12px; font-weight: 700; color: #7c3aed; margin-bottom: 4px; }

    /* Screen-only controls */
    .screen-controls { display: flex; gap: 12px; justify-content: center; padding: 24px; background: #f9fafb; border-top: 1px solid #e5e7eb; }
    .btn-primary { background: linear-gradient(135deg,#4F1C91,#7c3aed); color: #fff; border: none; padding: 12px 28px; border-radius: 10px; font-size: 14px; font-weight: 700; cursor: pointer; font-family: inherit; }
    .btn-secondary { background: #f3f4f6; color: #374151; border: 1px solid #e5e7eb; padding: 12px 28px; border-radius: 10px; font-size: 14px; font-weight: 700; cursor: pointer; font-family: inherit; }
    .btn-primary:hover { background: linear-gradient(135deg,#3b0764,#4F1C91); }
    .btn-secondary:hover { background: #e5e7eb; }

    @media print {
      body { background: #fff; padding: 0; }
      .receipt-wrapper { box-shadow: none; border-radius: 0; width: 100%; }
      .screen-controls { display: none !important; }
      .watermark { color: rgba(79,28,145,0.03); }
    }
    @page { size: A4; margin: 0; }
  </style>
</head>
<body>
  <div class="receipt-wrapper">
    <div class="watermark">OFFICIAL RECEIPT</div>
    <div class="content">

      <!-- HEADER -->
      <div class="header">
        <div class="header-inner">
          <div class="church-brand">
            <div class="cross">✝</div>
            <h1>Kingdom of Christ Ministries</h1>
            <p>Reg. No: 125/2012 | 80G Tax Exempted Society</p>
            <p>15-201, Vivekananda Nagar, Jeedimetla, Hyderabad - 500055</p>
          </div>
          <div class="receipt-badge">
            <span class="label">Official Receipt</span>
            <span class="number">${receipt.receiptNumber}</span>
            <span class="date-line">${formattedDate} • ${formattedTime}</span>
          </div>
        </div>
      </div>

      <!-- SUCCESS BANNER -->
      <div class="success-banner">
        <div class="check">✓</div>
        <span>Payment Verified Successfully</span>
        <span class="ref">UTR: ${receipt.referenceNumber || donation.razorpayPaymentId || 'N/A'}</span>
      </div>

      <!-- BODY -->
      <div class="body">

        <!-- INFO GRID -->
        <div class="info-grid">
          <div class="info-section">
            <h3>Donor Information</h3>
            <div class="info-row">
              <span class="info-label">Full Name</span>
              <span class="info-value highlight">${donorName}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Email Address</span>
              <span class="info-value">${donorEmail}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Mobile Number</span>
              <span class="info-value">${donorPhone}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Donor Status</span>
              <span class="info-value">${donation.donorName === 'Anonymous Giver' ? '🔒 Anonymous' : '👤 Named Donor'}</span>
            </div>
          </div>
          <div class="info-section">
            <h3>Donation Details</h3>
            <div class="info-row">
              <span class="info-label">Donation Cause</span>
              <span class="info-value highlight">${purpose}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Branch</span>
              <span class="info-value">${branch}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Payment Method</span>
              <span class="info-value">UPI (Instant QR)</span>
            </div>
            <div class="info-row">
              <span class="info-label">Tax Exemption</span>
              <span class="info-value" style="color:#16a34a;">✅ Section 80G Eligible</span>
            </div>
          </div>
        </div>

        <!-- AMOUNT BOX -->
        <div class="amount-box">
          <div class="amount-words">
            <div class="label">Amount in Words</div>
            <div class="words">${numberToWords(amount)}</div>
          </div>
          <div class="amount-figure">
            <div class="label">Total Amount</div>
            <div class="value">${formattedAmount}</div>
          </div>
        </div>

        <!-- FULL TRANSACTION DETAILS -->
        <table class="details-table">
          <tr><th colspan="2">Transaction & Receipt Details</th></tr>
          <tr><td class="label">Donation ID</td><td class="value mono">${donation.id}</td></tr>
          <tr><td class="label">Receipt Number</td><td class="value mono">${receipt.receiptNumber}</td></tr>
          <tr><td class="label">Razorpay / UPI Ref</td><td class="value mono">${donation.razorpayPaymentId || receipt.referenceNumber || 'N/A'}</td></tr>
          <tr><td class="label">Transaction Ref (UTR)</td><td class="value mono">${receipt.referenceNumber || 'N/A'}</td></tr>
          <tr><td class="label">Date of Transaction</td><td class="value">${formattedDate}</td></tr>
          <tr><td class="label">Time of Transaction</td><td class="value">${formattedTime}</td></tr>
          <tr><td class="label">Verification Code</td><td class="value mono">${receipt.verificationCode}</td></tr>
          <tr><td class="label">Total Amount Received</td><td class="value amount">${formattedAmount}</td></tr>
        </table>

        <!-- QR + SEAL + SIGNATURE -->
        <div class="footer-row">
          <div class="qr-block">
            ${qrDataUrl ? `<img src="${qrDataUrl}" alt="Verification QR" />` : `<div style="width:100px;height:100px;background:#f3f4f6;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:10px;color:#9ca3af;text-align:center;padding:8px;">QR<br>Unavailable</div>`}
            <p>Scan to verify receipt</p>
          </div>

          <div class="seal-block">
            <!-- Church Seal SVG -->
            <svg class="seal-svg" width="90" height="90" viewBox="0 0 90 90" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="45" cy="45" r="43" stroke="#4F1C91" stroke-width="2.5" stroke-dasharray="4 3"/>
              <circle cx="45" cy="45" r="36" stroke="#4F1C91" stroke-width="1.5"/>
              <text x="45" y="34" text-anchor="middle" font-family="Arial" font-size="6.5" font-weight="700" fill="#4F1C91" letter-spacing="1.5">KINGDOM OF CHRIST</text>
              <text x="45" y="44" text-anchor="middle" font-family="Arial" font-size="14" font-weight="900" fill="#4F1C91">✝</text>
              <text x="45" y="55" text-anchor="middle" font-family="Arial" font-size="6" font-weight="700" fill="#4F1C91" letter-spacing="1">MINISTRIES</text>
              <text x="45" y="64" text-anchor="middle" font-family="Arial" font-size="5.5" fill="#7c3aed">HYDERABAD • 2004</text>
            </svg>
            <p style="font-size:10px;color:#9ca3af;text-align:center;">Official Church Seal</p>
          </div>

          <div class="signature-block">
            <div class="sig-line">Bishop K. Kristhu Raju</div>
            <div class="sig-label">Authorized Signatory</div>
            <div class="sig-title">Senior Pastor & President</div>
          </div>
        </div>

        <!-- TAX NOTICE -->
        <div class="tax-notice">
          <p><strong>📋 Tax Exemption Certificate:</strong> Donations to Kingdom of Christ Ministries are eligible for deduction under Section 80G of the Income Tax Act, 1961 (Notification/Approval details as per official records). Please retain this receipt for tax filing. This is a computer-generated official receipt and does not require a physical signature.</p>
        </div>

      </div>

      <!-- DOCUMENT FOOTER -->
      <div class="doc-footer">
        <div class="left">
          <div class="tagline">Thank you for supporting Kingdom of Christ Ministries.</div>
          <div>"God loves a cheerful giver." — 2 Corinthians 9:7</div>
          <div>📞 +91 97040 90069 | +91 73964 33856</div>
        </div>
        <div class="right">
          <div>✉ kingofchristministries23@gmail.com</div>
          <div>🌐 kingdomofchristministries.org</div>
          <div style="margin-top:4px;font-size:10px;">Generated: ${new Date().toLocaleString('en-IN')}</div>
        </div>
      </div>

      <!-- SCREEN CONTROLS (hidden on print) -->
      <div class="screen-controls">
        <button class="btn-primary" onclick="window.print()">🖨️ Download / Print PDF</button>
        <button class="btn-secondary" onclick="window.close()">← Close</button>
      </div>

    </div>
  </div>

  ${!isPreview ? `<script>
    window.addEventListener('load', function() {
      setTimeout(function() { window.print(); }, 800);
    });
  </script>` : ''}
</body>
</html>`;

    return new NextResponse(htmlContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-store',
        'X-Receipt-Number': receipt.receiptNumber,
      },
    });
  } catch (err: any) {
    console.error('[API/RECEIPTS/PDF] Error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
