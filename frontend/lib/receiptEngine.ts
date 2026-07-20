/**
 * lib/receiptEngine.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Tax-exempt (80G) PDF receipt generation engine for Kingdom of Christ Ministries.
 * Generates verified receipt numbers (KCM-REC-YYYY-XXXX), cryptographic verification codes,
 * and SVG/HTML vector receipts convertible to downloadable PDF documents.
 */

import { prisma } from '@/lib/prisma';
import QRCode from 'qrcode';
import crypto from 'crypto';

export interface ReceiptGeneratorInput {
  donationId: string;
  donorName: string;
  donorEmail?: string;
  donorPhone?: string;
  panNumber?: string;
  amount: number;
  currency?: string;
  purposeName: string;
  branchName?: string;
  paymentMethod: string;
  razorpayPaymentId?: string;
  razorpayOrderId?: string;
  issuedAt?: Date;
}

export interface GeneratedReceipt {
  id: string;
  receiptNumber: string;
  verificationCode: string;
  qrCodeDataUrl: string;
  verificationUrl: string;
  amount: number;
  issuedAt: Date;
}

/**
 * Generates unique receipt number format: KCM-REC-2026-0001
 */
export async function generateNextReceiptNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const count = await prisma.receipt.count();
  const sequence = String(count + 1).padStart(4, '0');
  return `KCM-REC-${year}-${sequence}`;
}

/**
 * Generates cryptographic 12-char SHA-256 verification code for receipt authenticity verification.
 */
export function generateVerificationCode(donationId: string, amount: number): string {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET || 'KCM_RECEIPT_SECRET_2026';
  const hash = crypto
    .createHmac('sha256', secret)
    .update(`${donationId}:${amount}:${Date.now()}`)
    .digest('hex');
  return hash.substring(0, 12).toUpperCase();
}

/**
 * Creates or retrieves verified Receipt database record and returns receipt details with QR code.
 */
export async function getOrCreateReceipt(input: ReceiptGeneratorInput): Promise<GeneratedReceipt> {
  // Check if receipt already exists for this donation
  const existingReceipt = await prisma.receipt.findUnique({
    where: { donationId: input.donationId },
  });

  if (existingReceipt) {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const verificationUrl = `${baseUrl}/verify-receipt/${existingReceipt.verificationCode}`;
    const qrCodeDataUrl = await QRCode.toDataURL(verificationUrl, { width: 180, margin: 1 });

    return {
      id: existingReceipt.id,
      receiptNumber: existingReceipt.receiptNumber,
      verificationCode: existingReceipt.verificationCode,
      qrCodeDataUrl,
      verificationUrl,
      amount: existingReceipt.amount,
      issuedAt: existingReceipt.issuedAt,
    };
  }

  // Generate new details
  const receiptNumber = await generateNextReceiptNumber();
  const verificationCode = generateVerificationCode(input.donationId, input.amount);
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const verificationUrl = `${baseUrl}/verify-receipt/${verificationCode}`;
  const qrCodeDataUrl = await QRCode.toDataURL(verificationUrl, { width: 180, margin: 1 });

  // Save to DB
  const receipt = await prisma.receipt.create({
    data: {
      receiptNumber,
      donationId: input.donationId,
      referenceNumber: input.razorpayOrderId || input.razorpayPaymentId || null,
      amount: input.amount,
      currency: input.currency || 'INR',
      verificationCode,
      qrCode: qrCodeDataUrl,
      pdfUrl: `/api/donations/receipt/${input.donationId}`,
      issuedAt: input.issuedAt || new Date(),
    },
  });

  return {
    id: receipt.id,
    receiptNumber: receipt.receiptNumber,
    verificationCode: receipt.verificationCode,
    qrCodeDataUrl,
    verificationUrl,
    amount: receipt.amount,
    issuedAt: receipt.issuedAt,
  };
}

/**
 * Renders HTML string format of official KCM donation receipt for PDF stream or preview.
 */
export function renderReceiptHtml(data: {
  receiptNumber: string;
  verificationCode: string;
  donorName: string;
  donorEmail?: string;
  donorPhone?: string;
  panNumber?: string;
  amount: number;
  currency: string;
  purposeName: string;
  branchName?: string;
  paymentMethod: string;
  razorpayPaymentId?: string;
  qrCodeDataUrl: string;
  issuedAt: Date;
}): string {
  const formattedDate = new Date(data.issuedAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const formattedAmount = data.amount.toLocaleString('en-IN', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  });

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Donation Receipt - ${data.receiptNumber}</title>
      <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background: #fafafa; color: #1e1b4b; margin: 0; padding: 40px; }
        .receipt-card { max-width: 720px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; padding: 40px; box-shadow: 0 10px 30px rgba(0,0,0,0.05); }
        .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #f1f5f9; padding-bottom: 24px; margin-bottom: 32px; }
        .logo { font-size: 24px; font-weight: 800; color: #4f1c91; letter-spacing: -0.5px; }
        .logo span { color: #7c3aed; }
        .receipt-badge { background: #f3e8ff; color: #6b21a8; font-size: 12px; font-weight: 700; padding: 6px 14px; border-radius: 20px; text-transform: uppercase; letter-spacing: 1px; }
        .details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 32px; }
        .detail-item { margin-bottom: 12px; }
        .label { font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 700; letter-spacing: 0.5px; margin-bottom: 4px; }
        .value { font-size: 15px; font-weight: 600; color: #0f172a; }
        .amount-box { background: linear-gradient(135deg, #4f1c91, #6d28d9); color: #ffffff; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 32px; }
        .amount-box .amount { font-size: 36px; font-weight: 800; margin-top: 4px; }
        .footer { display: flex; justify-content: space-between; align-items: center; border-top: 1px dashed #cbd5e1; padding-top: 24px; }
        .tax-info { font-size: 11px; color: #64748b; line-height: 1.5; max-width: 440px; }
        .qr-code img { width: 100px; height: 100px; border-radius: 8px; }
      </style>
    </head>
    <body>
      <div class="receipt-card">
        <div class="header">
          <div class="logo">Kingdom of Christ <span>Ministries</span></div>
          <div class="receipt-badge">Official Tax Receipt</div>
        </div>

        <div class="amount-box">
          <div style="font-size: 12px; opacity: 0.8; text-transform: uppercase; letter-spacing: 1px;">Donation Amount</div>
          <div class="amount">₹${formattedAmount}</div>
        </div>

        <div class="details-grid">
          <div>
            <div class="detail-item">
              <div class="label">Receipt Number</div>
              <div class="value">${data.receiptNumber}</div>
            </div>
            <div class="detail-item">
              <div class="label">Donor Name</div>
              <div class="value">${data.donorName}</div>
            </div>
            ${data.donorEmail ? `<div class="detail-item"><div class="label">Donor Email</div><div class="value">${data.donorEmail}</div></div>` : ''}
            ${data.panNumber ? `<div class="detail-item"><div class="label">PAN Number (Tax Benefit)</div><div class="value">${data.panNumber}</div></div>` : ''}
          </div>
          <div>
            <div class="detail-item">
              <div class="label">Date Issued</div>
              <div class="value">${formattedDate}</div>
            </div>
            <div class="detail-item">
              <div class="label">Giving Purpose</div>
              <div class="value">${data.purposeName}</div>
            </div>
            ${data.branchName ? `<div class="detail-item"><div class="label">Branch</div><div class="value">${data.branchName}</div></div>` : ''}
            ${data.razorpayPaymentId ? `<div class="detail-item"><div class="label">Payment Ref ID</div><div class="value">${data.razorpayPaymentId}</div></div>` : ''}
          </div>
        </div>

        <div class="footer">
          <div class="tax-info">
            <strong>80G Tax Exemption Certificate:</strong> KCM Church is registered under Section 80G of the Income Tax Act, 1961. Donations are eligible for 50% tax deduction.
            <br><br>
            Verification Code: <code>${data.verificationCode}</code>
          </div>
          <div class="qr-code">
            <img src="${data.qrCodeDataUrl}" alt="Verification QR Code">
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}
