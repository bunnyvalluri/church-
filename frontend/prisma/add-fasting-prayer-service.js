const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("Adding Monthly Fasting Prayer card for Shapur Nagar (Main Branch)...");

  const branches = await prisma.branch.findMany();
  const shapurBranch = branches.find(
    b => b.name && (b.name.toLowerCase().includes('shapur') || b.name.toLowerCase().includes('shapurnagar'))
  );

  const fastingServiceData = {
    slug: 'monthly-fasting-prayer',
    title: 'Monthly Fasting Prayer',
    shortDescription: "Church-wide monthly fasting and prayer gathering to seek God's presence.",
    description: 'Join us on the 2nd Monday of every month at our Main Branch in Shapur Nagar for a powerful time of fasting, intercessory prayer, worship, and spiritual renewal.',
    serviceType: 'PRAYER',
    icon: 'Flame',
    iconColor: '#ffffff',
    cardColor: 'from-orange-500 to-red-500',
    badgeColor: 'from-orange-500 to-red-500',
    serviceDay: 'Monday',
    frequency: 'MONTHLY',
    occurrence: 'Every Month 2nd Monday : Fasting Prayer - 10:00 AM – 3:00 PM',
    startTime: '10:00',
    endTime: '15:00',
    location: 'Shapur Nagar',
    branchId: shapurBranch ? shapurBranch.id : null,
    featured: false,
    displayOrder: 4,
    status: 'PUBLISHED',
    tags: ['prayer', 'fasting', 'monthly', 'shapur', 'main-branch', 'intercession'],
    language: 'en',
    isDeleted: false,
  };

  const existing = await prisma.churchService.findUnique({
    where: { slug: fastingServiceData.slug }
  });

  if (existing) {
    await prisma.churchService.update({
      where: { id: existing.id },
      data: fastingServiceData
    });
    console.log("✅ Updated Monthly Fasting Prayer service");
  } else {
    await prisma.churchService.create({
      data: fastingServiceData
    });
    console.log("✅ Created Monthly Fasting Prayer service");
  }

  // Adjust remaining ministries displayOrder
  const youth = await prisma.churchService.findUnique({ where: { slug: 'youth-ministry' } });
  if (youth) {
    await prisma.churchService.update({ where: { id: youth.id }, data: { displayOrder: 5 } });
  }

  const women = await prisma.churchService.findUnique({ where: { slug: 'womens-fellowship' } });
  if (women) {
    await prisma.churchService.update({ where: { id: women.id }, data: { displayOrder: 6 } });
  }

  const men = await prisma.churchService.findUnique({ where: { slug: 'mens-fellowship' } });
  if (men) {
    await prisma.churchService.update({ where: { id: men.id }, data: { displayOrder: 7 } });
  }

  const allServices = await prisma.churchService.findMany({
    where: { status: 'PUBLISHED' },
    orderBy: { displayOrder: 'asc' },
    select: { id: true, slug: true, title: true, location: true, displayOrder: true, occurrence: true }
  });

  console.log("Current services in display order:", JSON.stringify(allServices, null, 2));
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
