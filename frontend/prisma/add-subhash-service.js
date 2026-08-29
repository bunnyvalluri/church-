const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("Setting up 1. Shapur Nagar, 2. Subhash Nagar, 3. Bahadurpally...");

  const branches = await prisma.branch.findMany();
  const subhashBranch = branches.find(
    b => b.name && (b.name.toLowerCase().includes('subhash') || b.name.toLowerCase().includes('subhashnagar'))
  );
  const bahadurpallyBranch = branches.find(
    b => b.name && b.name.toLowerCase().includes('bahadurpally')
  );
  const shapurBranch = branches.find(
    b => b.name && (b.name.toLowerCase().includes('shapur') || b.name.toLowerCase().includes('shapurnagar'))
  );

  // 1. Shapur Nagar
  const shapurService = await prisma.churchService.findUnique({ where: { slug: 'shapur-sunday-service' } });
  if (shapurService) {
    await prisma.churchService.update({
      where: { id: shapurService.id },
      data: {
        displayOrder: 1,
        branchId: shapurBranch ? shapurBranch.id : null,
      }
    });
    console.log("✅ Shapur Nagar displayOrder set to 1");
  }

  // 2. Subhash Nagar
  const subhashData = {
    slug: 'subhash-nagar-service',
    title: 'Sunday Worship & Thursday Prayer',
    shortDescription: 'Join our vibrant morning worship services and Thursday evening prayer at Subhash Nagar.',
    description: 'Experience powerful praise, heartfelt worship, and life-changing biblical messages during our two Sunday morning services, plus Thursday evening Fasting, Healing & Anointing Service.',
    serviceType: 'WORSHIP',
    icon: 'Sparkles',
    iconColor: '#ffffff',
    cardColor: 'from-yellow-500 to-orange-500',
    badgeColor: 'from-yellow-500 to-orange-500',
    serviceDay: 'Sunday & Thursday',
    frequency: 'WEEKLY',
    occurrence: 'Every Sunday (1st Service) - 5:45 AM – 7:45 AM | Every Sunday (2nd Service) - 8:30 AM – 10:30 AM | Every Thursday at 6:30 PM – 8:30 PM : Fasting, Healing & Anointing Service - "Aradhana"',
    startTime: '05:45',
    endTime: '10:30',
    location: 'Subhash Nagar',
    branchId: subhashBranch ? subhashBranch.id : null,
    featured: false,
    displayOrder: 2,
    status: 'PUBLISHED',
    tags: ['worship', 'sunday', 'thursday', 'subhash-nagar', 'prayer', 'healing', 'anointing'],
    language: 'en',
    isDeleted: false,
  };

  const existingSubhash = await prisma.churchService.findUnique({
    where: { slug: subhashData.slug }
  });

  if (existingSubhash) {
    await prisma.churchService.update({
      where: { id: existingSubhash.id },
      data: subhashData
    });
    console.log("✅ Updated existing Subhash Nagar service");
  } else {
    await prisma.churchService.create({
      data: subhashData
    });
    console.log("✅ Created Subhash Nagar service with displayOrder 2");
  }

  // 3. Bahadurpally
  const bahadurpallyService = await prisma.churchService.findUnique({ where: { slug: 'sunday-worship-service' } });
  if (bahadurpallyService) {
    await prisma.churchService.update({
      where: { id: bahadurpallyService.id },
      data: {
        displayOrder: 3,
        branchId: bahadurpallyBranch ? bahadurpallyBranch.id : null,
      }
    });
    console.log("✅ Bahadurpally displayOrder set to 3");
  }

  const allServices = await prisma.churchService.findMany({
    where: { status: 'PUBLISHED' },
    orderBy: { displayOrder: 'asc' },
    select: { id: true, slug: true, title: true, location: true, displayOrder: true, occurrence: true }
  });

  console.log("All PUBLISHED services in order:", JSON.stringify(allServices, null, 2));
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
