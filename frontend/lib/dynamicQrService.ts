/**
 * lib/dynamicQrService.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Server-side dynamic QR code generation service.
 * Builds single-use UPI URIs with Order ID, Amount, Merchant UPI, Purpose, and Branch,
 * and renders a high-res base64 QR code image.
 */

import QRCode from 'qrcode';

export interface DynamicQrParams {
  upiId: string;
  merchantName: string;
  orderId: string;
  amount: number;
  currency?: string;
  purposeName: string;
  branchName?: string;
  campaignName?: string;
}

export interface DynamicQrResult {
  upiUri: string;
  qrCodeDataUrl: string;
}

/**
 * Builds standard National Payments Corporation of India (NPCI) compliant UPI Deep Link URI.
 */
export function buildUpiUri(params: DynamicQrParams): string {
  const { upiId, merchantName, orderId, amount, currency = 'INR', purposeName, branchName } = params;

  // Transaction note format: KCM | Purpose | Branch | OrderID
  const noteParts = ['KCM', purposeName];
  if (branchName) noteParts.push(branchName);
  noteParts.push(`Ref:${orderId.slice(-8)}`);
  
  const note = noteParts.join(' - ');

  const queryParams = new URLSearchParams({
    pa: upiId,
    pn: merchantName,
    tr: orderId,
    am: amount.toFixed(2),
    cu: currency,
    tn: note,
  });

  return `upi://pay?${queryParams.toString()}`;
}

/**
 * Generates high-contrast PNG QR Code base64 Data URL for display on front-end.
 */
export async function generateDynamicQr(params: DynamicQrParams): Promise<DynamicQrResult> {
  const upiUri = buildUpiUri(params);

  try {
    const qrCodeDataUrl = await QRCode.toDataURL(upiUri, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      margin: 2,
      width: 320,
      color: {
        dark: '#4F1C91', // KCM Violet brand color
        light: '#FFFFFF',
      },
    });

    return {
      upiUri,
      qrCodeDataUrl,
    };
  } catch (error) {
    console.error('[DYNAMIC_QR] Error generating QR code:', error);
    throw new Error('Failed to generate dynamic payment QR code.');
  }
}
