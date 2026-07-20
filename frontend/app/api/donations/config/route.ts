import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Execute all DB queries concurrently in parallel using Promise.all
    let [heroConfig, amounts, causes, branches, formFields, settings] = await Promise.all([
      prisma.givingHeroConfig.findUnique({
        where: { id: 'giving_hero' },
      }),
      prisma.donationAmount.findMany({
        where: { isActive: true },
        orderBy: { displayOrder: 'asc' },
      }),
      prisma.donationPurpose.findMany({
        where: { isActive: true, isArchived: false },
        orderBy: { sortOrder: 'asc' },
      }),
      prisma.branch.findMany({
        select: { id: true, name: true, address: true, phone: true },
      }),
      prisma.donationFormField.findMany({
        where: { isVisible: true },
        orderBy: { displayOrder: 'asc' },
      }),
      prisma.churchSettings.findUnique({
        where: { id: 'settings' },
      }),
    ]);

    const defaultHeroConfig = {
      headline: 'Sow a Seed of Faith & Transform Lives',
      subtitle: 'Your generous giving supports our local church services, community outreach programs, youth development, and global missions.',
      backgroundImageUrl: null,
      backgroundType: 'gradient',
      badgeText: '100% Tax Exempt (80G) & Secure',
      ctaPrimaryText: 'Give Now',
      ctaPrimaryHref: '#give-form',
      ctaSecondaryText: 'Impact Report',
      ctaSecondaryHref: '/about#impact',
      campaignBannerText: 'Special Festival & Outreach Drive active! Join us in blessing 1,000+ families this month.',
      campaignBannerHref: '#give-form',
      securityBadges: ['80G Tax Exemption Registered', '256-bit SSL Encrypted', 'Instant Verified PDF Receipt'],
      statistics: [
        { label: 'Lives Impacted', value: '10,000+' },
        { label: 'Outreach Programs', value: '25+' },
        { label: 'Church Branches', value: '3' },
      ],
    };

    // Fast fallbacks if empty
    if (amounts.length === 0) {
      amounts = [
        { id: '1', amount: 500, label: '₹500', displayOrder: 1, isDefault: false, isActive: true, currency: 'INR', campaignId: null, createdAt: new Date(), updatedAt: new Date() },
        { id: '2', amount: 1000, label: '₹1,000', displayOrder: 2, isDefault: true, isActive: true, currency: 'INR', campaignId: null, createdAt: new Date(), updatedAt: new Date() },
        { id: '3', amount: 2000, label: '₹2,000', displayOrder: 3, isDefault: false, isActive: true, currency: 'INR', campaignId: null, createdAt: new Date(), updatedAt: new Date() },
        { id: '4', amount: 5000, label: '₹5,000', displayOrder: 4, isDefault: false, isActive: true, currency: 'INR', campaignId: null, createdAt: new Date(), updatedAt: new Date() },
        { id: '5', amount: 10000, label: '₹10,000', displayOrder: 5, isDefault: false, isActive: true, currency: 'INR', campaignId: null, createdAt: new Date(), updatedAt: new Date() },
      ];
    }

    if (causes.length === 0) {
      causes = [
        {
          id: 'c1',
          code: 'CHARITY',
          nameEn: 'Hospital Outreach & Patient Kits',
          nameTe: 'ఆసుపత్రి రోగుల సేవ',
          nameHi: 'अस्पताल सेवा',
          descEn: 'Support food packets, medical kits, and rehabilitation for hospital patients.',
          descTe: null,
          descHi: null,
          icon: 'Heart',
          colorTheme: 'violet',
          category: 'OUTREACH',
          targetAmount: 500000,
          raisedAmount: 145000,
          imageUrl: null,
          sortOrder: 1,
          isActive: true,
          isArchived: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'c2',
          code: 'ASHRAMAM',
          nameEn: 'Ashramam & Handicap Support',
          nameTe: 'ఆశ్రమం & దివ్యాంగుల నిధి',
          nameHi: 'दिव्यांग सहायता',
          descEn: 'Funding essential care and wheelchair gear for handicap shelters.',
          descTe: null,
          descHi: null,
          icon: 'Gift',
          colorTheme: 'violet',
          category: 'BENEVOLENCE',
          targetAmount: 300000,
          raisedAmount: 98000,
          imageUrl: null,
          sortOrder: 2,
          isActive: true,
          isArchived: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
    }

    if (branches.length === 0) {
      branches = [
        { id: 'b1', name: 'Shapur Nagar (Main)', address: '15-201, Vivekananda Nagar, Jeedimetla, Hyderabad', phone: '+91 97040 90069' },
        { id: 'b2', name: 'Subhash Nagar Branch', address: 'Subhash Nagar X Road, Jeedimetla, Hyderabad', phone: null },
        { id: 'b3', name: 'Bahadurpally Branch', address: 'Main Road, Bahadurpally, Hyderabad', phone: null },
      ];
    }

    if (formFields.length === 0) {
      formFields = [
        { id: 'f1', fieldName: 'donorName', label: 'Full Name', placeholder: 'Enter full name', isRequired: true, isVisible: true, displayOrder: 1, fieldType: 'text', createdAt: new Date(), updatedAt: new Date() },
        { id: 'f2', fieldName: 'donorPhone', label: 'Mobile Number', placeholder: '10-digit mobile number', isRequired: true, isVisible: true, displayOrder: 2, fieldType: 'tel', createdAt: new Date(), updatedAt: new Date() },
        { id: 'f3', fieldName: 'donorEmail', label: 'Email Address', placeholder: 'email@example.com', isRequired: false, isVisible: true, displayOrder: 3, fieldType: 'email', createdAt: new Date(), updatedAt: new Date() },
        { id: 'f11', fieldName: 'isAnonymous', label: 'Make donation anonymous', placeholder: '', isRequired: false, isVisible: true, displayOrder: 11, fieldType: 'checkbox', createdAt: new Date(), updatedAt: new Date() },
      ];
    }

    const response = NextResponse.json({
      success: true,
      amounts,
      causes,
      branches,
      formFields,
      settings: {
        minDonationAmount: settings?.minDonationAmount ? Math.min(settings.minDonationAmount, 1) : 1,
        maxDonationAmount: settings?.maxDonationAmount || 500000,
        upiId: settings?.upiId || 'kcm.kristhraj2004-1@okicici',
        merchantName: settings?.merchantName || 'Kingdom of Christ Ministries',
        qrExpiryMinutes: settings?.qrExpiryMinutes || 10,
      },
    });

    // Add high performance edge caching headers
    response.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
    return response;
  } catch (err: any) {
    console.error('[API/DONATIONS/CONFIG] Error:', err);
    return NextResponse.json(
      { error: err?.message || 'Failed to fetch donation config' },
      { status: 500 }
    );
  }
}
