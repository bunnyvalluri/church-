const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("Adding/updating Shapur Sunday Service (Every Sunday - 6:00 PM - 9:00 PM)...");

  const branches = await prisma.branch.findMany();
  const shapurBranch = branches.find(
    b => b.name && (b.name.toLowerCase().includes('shapur') || b.name.toLowerCase().includes('shapurnagar'))
  );

  const serviceData = {
    slug: 'shapur-sunday-service',
    title: 'Sunday Evening Service',
    shortDescription: 'Experience uplifting worship, prayer, and the Word of God at Shapur Nagar.',
    description: 'Join us every Sunday evening from 6:00 PM to 9:00 PM at our Shapur Nagar branch for an uplifting time of praise, worship, intercessory prayer, and powerful biblical teaching.',
    serviceType: 'WORSHIP',
    icon: 'Flame',
    iconColor: '#ffffff',
    cardColor: 'from-blue-500 to-cyan-500',
    serviceDay: 'Sunday & Friday',
    frequency: 'WEEKLY',
    occurrence: 'Every Sunday - 6:00 PM – 9:00 PM | Every Friday at 6:30 PM – 8:30 PM: Fasting, Healing & Anointing Service - "Aradhana"',
    startTime: '18:00',
    endTime: '21:00',
    location: 'Shapur Nagar',
    branchId: shapurBranch ? shapurBranch.id : null,
    featured: false,
    displayOrder: 1,
    status: 'PUBLISHED',
    tags: ['worship', 'sunday', 'friday', 'evening', 'shapur', 'prayer', 'healing', 'anointing'],
    language: 'en',
    isDeleted: false,
  };

  const existing = await prisma.churchService.findUnique({
    where: { slug: serviceData.slug },
  });

  let result;
  if (existing) {
    result = await prisma.churchService.update({
      where: { id: existing.id },
      data: serviceData,
      include: { branch: true },
    });
    console.log("✅ Updated existing Shapur Sunday Service:", result);
  } else {
    result = await prisma.churchService.create({
      data: serviceData,
      include: { branch: true },
    });
    console.log("✅ Created new Shapur Sunday Service:", result);
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
