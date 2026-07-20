import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import Razorpay from 'razorpay';
import QRCode from 'qrcode';
import { writeAuditLog } from '@/lib/auditLogger';

// Helper to generate a unique reference ID
function generateOrderReference() {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `KCM-NGO-${timestamp.toUpperCase()}-${randomStr}`;
}

export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
  try {
    const body = await req.json();
    const { amount, purpose, donorName, donorEmail, donorPhone, userId, branchId, isAnonymous, panNumber, address, city, state, country, prayerRequest } = body;

    // Fetch dynamic church payment settings from DB
    const settings = await prisma.churchSettings.findUnique({
      where: { id: 'settings' },
    });

    const minAmount = settings?.minDonationAmount ? Math.min(settings.minDonationAmount, 1) : 1;
    const maxAmount = settings?.maxDonationAmount || 500000;
    const upiId = settings?.upiId || process.env.NEXT_PUBLIC_UPI_ID || 'kcm.kristhraj2004-1@okicici';
    const merchantName = settings?.merchantName || process.env.NEXT_PUBLIC_CHURCH_NAME || 'Kingdom of Christ Ministries';
    const expiryMins = settings?.qrExpiryMinutes || 10;

    if (!amount || isNaN(amount) || Number(amount) < 1) {
      return NextResponse.json({ error: 'Please enter a valid donation amount (minimum ₹1).' }, { status: 400 });
    }

    if (Number(amount) > maxAmount) {
      return NextResponse.json({ error: `Maximum donation amount per transaction is ₹${maxAmount.toLocaleString('en-IN')}` }, { status: 400 });
    }

    if (!donorName && !isAnonymous) {
      return NextResponse.json({ error: 'Donor name is required unless anonymous' }, { status: 400 });
    }

    const amountInINR = parseFloat(amount);
    const amountInPaise = Math.round(amountInINR * 100);
    const referenceNumber = generateOrderReference();
    const expiresAt = new Date(Date.now() + expiryMins * 60 * 1000);

    const razorpayKeyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '';
    const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET || '';

    // Initialize Razorpay Order
    let razorpayOrderId = `order_upi_${Math.random().toString(36).substring(2, 10)}`;
    const hasRealKeys = razorpayKeyId && !razorpayKeyId.startsWith('rzp_test_default') && razorpayKeySecret && !razorpayKeySecret.startsWith('mock_razorpay');

    if (hasRealKeys) {
      try {
        const razorpayInstance = new Razorpay({
          key_id: razorpayKeyId,
          key_secret: razorpayKeySecret,
        });

        const order = await razorpayInstance.orders.create({
          amount: amountInPaise,
          currency: 'INR',
          receipt: referenceNumber,
          notes: {
            purpose: purpose || 'CHARITY',
            donorName: isAnonymous ? 'Anonymous Donor' : donorName,
            donorPhone: donorPhone || '',
            panNumber: panNumber || '',
          },
        });
        
        razorpayOrderId = order.id;
      } catch (rzpError) {
        console.error('[RAZORPAY] Order creation error, falling back to mock mode:', rzpError);
        razorpayOrderId = `order_mock_${Math.random().toString(36).substring(2, 10)}`;
      }
    } else {
      console.info('[RAZORPAY] Using local mock UPI order mode.');
    }

    // 1. Safe resolution of memberId (prevent foreign key constraint failure)
    let validMemberId: string | null = null;
    if (userId) {
      const userExists = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true },
      });
      if (userExists) {
        validMemberId = userExists.id;
      } else if (donorEmail) {
        const userByEmail = await prisma.user.findUnique({
          where: { email: donorEmail },
          select: { id: true },
        });
        if (userByEmail) validMemberId = userByEmail.id;
      }
    }

    // 2. Safe resolution of branchId
    let validBranchId: string | null = null;
    if (branchId) {
      const branchExists = await prisma.branch.findUnique({
        where: { id: branchId },
        select: { id: true },
      });
      if (branchExists) {
        validBranchId = branchExists.id;
      }
    }

    // 3. Resolve Donation Purpose record
    let purposeRecord = await prisma.donationPurpose.findFirst({
      where: { code: purpose || 'CHARITY' },
    });

    if (!purposeRecord) {
      purposeRecord = await prisma.donationPurpose.findFirst({
        where: { isActive: true },
      });
    }

    if (!purposeRecord) {
      purposeRecord = await prisma.donationPurpose.create({
        data: {
          code: purpose || 'CHARITY',
          nameEn: purpose ? purpose.replace(/_/g, ' ') : 'General Charity',
          nameTe: 'ధర్మకార్యం',
          nameHi: 'दान',
          descEn: 'Charity donation',
        },
      });
    }

    // 4. Create DonationSession record in DB
    const session = await prisma.donationSession.create({
      data: {
        memberId: validMemberId,
        branchId: validBranchId,
        purposeId: purposeRecord.id,
        amount: amountInINR,
        currency: 'INR',
        referenceNumber: razorpayOrderId,
        status: 'PROCESSING',
        expiresAt,
        ipAddress: ip,
      },
    });

    // 5. Construct Dynamic UPI Link & Dynamic QR Code
    const encodedName = encodeURIComponent(merchantName);
    const note = `KCM NGO Donation Ref ${session.referenceNumber}`;
    const encodedNote = encodeURIComponent(note);

    const upiUri = `upi://pay?pa=${upiId}&pn=${encodedName}&am=${amountInINR.toFixed(2)}&cu=INR&tn=${encodedNote}&tr=${session.referenceNumber}`;

    const qrCodeBase64 = await QRCode.toDataURL(upiUri, {
      margin: 2,
      width: 360,
      color: {
        dark: '#4F1C91',
        light: '#FFFFFF',
      },
    });

    // 6. Create Donation Record in DB with PENDING status
    const donation = await prisma.donation.create({
      data: {
        userId: validMemberId,
        amount: amountInINR,
        currency: 'INR',
        purpose: purpose || 'CHARITY',
        purposeId: purposeRecord.id,
        branchId: validBranchId,
        sessionId: session.id,
        paymentMethod: 'UPI',
        razorpayOrderId,
        donorName: isAnonymous ? 'Anonymous Donor' : (donorName || 'Beloved Donor'),
        donorEmail: donorEmail || null,
        donorPhone: donorPhone || null,
        status: 'PENDING',
      },
    });

    writeAuditLog({
      userId: validMemberId,
      action: 'DONATION_ORDER_CREATED',
      details: `Created UPI order ${razorpayOrderId} for donation ${donation.id} of ₹${amountInINR}`,
      ipAddress: ip,
    }).catch(() => {});

    return NextResponse.json({
      success: true,
      orderId: razorpayOrderId,
      sessionId: session.id,
      donationId: donation.id,
      referenceNumber: session.referenceNumber,
      amount: amountInINR,
      amountInPaise,
      currency: 'INR',
      keyId: razorpayKeyId,
      expiresAt: session.expiresAt,
      upiUri,
      qrCode: qrCodeBase64,
      upiId,
      merchantName,
      isMock: !hasRealKeys,
    });
  } catch (err: any) {
    console.error('[DONATION/CREATE-ORDER] Error:', err);
    return NextResponse.json(
      { error: err?.message || 'Database error occurred while creating order' },
      { status: 500 }
    );
  }
}


