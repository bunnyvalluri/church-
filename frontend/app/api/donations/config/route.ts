import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // 1. Fetch active preset amounts
    let amounts = await prisma.donationAmount.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: 'asc' },
    });

    if (amounts.length === 0) {
      // Create default preset amounts if database table is empty
      const defaultAmounts = [
        { amount: 500, label: '₹500', displayOrder: 1, isDefault: false },
        { amount: 1000, label: '₹1,000', displayOrder: 2, isDefault: true },
        { amount: 2000, label: '₹2,000', displayOrder: 3, isDefault: false },
        { amount: 5000, label: '₹5,000', displayOrder: 4, isDefault: false },
        { amount: 10000, label: '₹10,000', displayOrder: 5, isDefault: false },
      ];

      for (const a of defaultAmounts) {
        await prisma.donationAmount.create({ data: a }).catch(() => {});
      }

      amounts = await prisma.donationAmount.findMany({
        where: { isActive: true },
        orderBy: { displayOrder: 'asc' },
      });
    }

    // 2. Fetch active donation causes/purposes
    let causes = await prisma.donationPurpose.findMany({
      where: { isActive: true, isArchived: false },
      orderBy: { sortOrder: 'asc' },
    });

    if (causes.length === 0) {
      const defaultCauses = [
        {
          code: 'CHARITY',
          nameEn: 'Hospital Outreach & Patient Kits',
          nameTe: 'ఆసుపత్రి రోగుల సేవ',
          nameHi: 'अस्पताल सेवा',
          descEn: 'Support food packets, medical kits, and rehabilitation for hospital patients.',
          icon: 'Heart',
          category: 'OUTREACH',
          targetAmount: 500000,
          raisedAmount: 145000,
        },
        {
          code: 'ASHRAMAM',
          nameEn: 'Ashramam & Handicap Support',
          nameTe: 'ఆశ్రమం & దివ్యాంగుల నిధి',
          nameHi: 'दिव्यांग सहायता',
          descEn: 'Funding essential care and wheelchair gear for handicap shelters.',
          icon: 'Gift',
          category: 'BENEVOLENCE',
          targetAmount: 300000,
          raisedAmount: 98000,
        },
        {
          code: 'MEDICAL',
          nameEn: 'Medical Kits & Emergency Care',
          nameTe: 'వైద్య సేవల నిధి',
          nameHi: 'चिकित्सा सहायता',
          descEn: 'Emergency medical aid and surgical assistance kits.',
          icon: 'Sparkles',
          category: 'HEALTH',
          targetAmount: 250000,
          raisedAmount: 72000,
        },
        {
          code: 'FOOD',
          nameEn: 'Fresh Food Packets Drive',
          nameTe: 'ఆహార పంపిణీ',
          nameHi: 'भोजन वितरण',
          descEn: 'Daily fresh meals for underprivileged families.',
          icon: 'Gift',
          category: 'FOOD_AID',
          targetAmount: 200000,
          raisedAmount: 110000,
        },
        {
          code: 'GENERAL',
          nameEn: 'General NGO Social Services',
          nameTe: 'సాధారణ సామాజిక సేవలు',
          nameHi: 'सामान्य सामाजिक सेवा',
          descEn: 'General social welfare projects and community relief.',
          icon: 'Building',
          category: 'GENERAL',
          targetAmount: 1000000,
          raisedAmount: 420000,
        },
      ];

      for (const c of defaultCauses) {
        await prisma.donationPurpose.create({ data: c }).catch(() => {});
      }

      causes = await prisma.donationPurpose.findMany({
        where: { isActive: true, isArchived: false },
        orderBy: { sortOrder: 'asc' },
      });
    }

    // 3. Fetch branches
    let branches = await prisma.branch.findMany({
      select: { id: true, name: true, address: true, phone: true },
    });

    if (branches.length === 0) {
      const defaultBranches = [
        { name: 'Shapur Nagar (Main)', address: '15-201, Vivekananda Nagar, Jeedimetla, Hyderabad' },
        { name: 'Subhash Nagar Branch', address: 'Subhash Nagar X Road, Jeedimetla, Hyderabad' },
        { name: 'Bahadurpally Branch', address: 'Main Road, Bahadurpally, Hyderabad' },
      ];

      for (const b of defaultBranches) {
        await prisma.branch.create({ data: b }).catch(() => {});
      }

      branches = await prisma.branch.findMany({
        select: { id: true, name: true, address: true, phone: true },
      });
    }

    // 4. Fetch dynamic form fields configuration
    let formFields = await prisma.donationFormField.findMany({
      where: { isVisible: true },
      orderBy: { displayOrder: 'asc' },
    });

    if (formFields.length === 0) {
      const defaultFields = [
        { fieldName: 'donorName', label: 'Full Name', placeholder: 'Enter full name', isRequired: true, isVisible: true, displayOrder: 1, fieldType: 'text' },
        { fieldName: 'donorPhone', label: 'Mobile Number', placeholder: '10-digit mobile number', isRequired: true, isVisible: true, displayOrder: 2, fieldType: 'tel' },
        { fieldName: 'donorEmail', label: 'Email Address', placeholder: 'email@example.com', isRequired: false, isVisible: true, displayOrder: 3, fieldType: 'email' },
        { fieldName: 'panNumber', label: 'PAN Number (for 80G Tax Receipt)', placeholder: 'ABCDE1234F', isRequired: false, isVisible: false, displayOrder: 4, fieldType: 'text' },
        { fieldName: 'address', label: 'Address', placeholder: 'Street address', isRequired: false, isVisible: false, displayOrder: 5, fieldType: 'text' },
        { fieldName: 'city', label: 'City', placeholder: 'Hyderabad', isRequired: false, isVisible: false, displayOrder: 6, fieldType: 'text' },
        { fieldName: 'state', label: 'State', placeholder: 'Telangana', isRequired: false, isVisible: false, displayOrder: 7, fieldType: 'text' },
        { fieldName: 'country', label: 'Country', placeholder: 'India', isRequired: false, isVisible: false, displayOrder: 8, fieldType: 'text' },
        { fieldName: 'prayerRequest', label: 'Prayer Request', placeholder: 'Optional prayer request...', isRequired: false, isVisible: false, displayOrder: 9, fieldType: 'textarea' },
        { fieldName: 'message', label: 'Personal Note', placeholder: 'Optional message...', isRequired: false, isVisible: false, displayOrder: 10, fieldType: 'textarea' },
        { fieldName: 'isAnonymous', label: 'Make donation anonymous', placeholder: '', isRequired: false, isVisible: true, displayOrder: 11, fieldType: 'checkbox' },
      ];

      for (const f of defaultFields) {
        await prisma.donationFormField.create({ data: f }).catch(() => {});
      }

      formFields = await prisma.donationFormField.findMany({
        where: { isVisible: true },
        orderBy: { displayOrder: 'asc' },
      });
    }

    // 5. Fetch Church Payment Settings
    let settings = await prisma.churchSettings.findUnique({
      where: { id: 'settings' },
    });

    if (!settings) {
      settings = await prisma.churchSettings.create({
        data: {
          id: 'settings',
          churchName: 'Kingdom of Christ Ministries',
          tagline: 'A Place of Love, Faith, and Miracles',
          primaryEmail: 'kingofchristministries23@gmail.com',
          contactPhone: '+91 97040 90069',
          address: '15-201, Vivekananda Nagar, Jeedimetla, Hyderabad',
          worshipServices: 'Sunday 5:45 AM | 8:30 AM | 10:30 AM',
          minDonationAmount: 10,
          maxDonationAmount: 500000,
          upiId: 'kcm.kristhraj2004-1@okicici',
          merchantName: 'Kingdom of Christ Ministries',
          qrExpiryMinutes: 10,
        },
      });
    }

    return NextResponse.json({
      success: true,
      amounts,
      causes,
      branches,
      formFields,
      settings: {
        minDonationAmount: settings.minDonationAmount || 10,
        maxDonationAmount: settings.maxDonationAmount || 500000,
        upiId: settings.upiId || 'kcm.kristhraj2004-1@okicici',
        merchantName: settings.merchantName || 'Kingdom of Christ Ministries',
        qrExpiryMinutes: settings.qrExpiryMinutes || 10,
      },
    });
  } catch (err: any) {
    console.error('[API/DONATIONS/CONFIG] Error:', err);
    return NextResponse.json(
      { error: err?.message || 'Failed to fetch donation config' },
      { status: 500 }
    );
  }
}
