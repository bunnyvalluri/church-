const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Updating Bahadurpally service timings in database...');
  
  const branches = await prisma.branch.findMany();
  const bahadurpallyBranch = branches.find(b => b.name && b.name.includes('Bahadurpally'));

  const serviceData = {
    title: 'Sunday Worship Service',
    shortDescription: 'Come and experience the presence of God in our vibrant Sunday & midweek services.',
    description: 'Join us every Sunday for a powerful time of praise, worship, and the Word of God, and every Wednesday evening for intercessory prayer and spiritual renewal. Our services are conducted in Telugu, Hindi, and English.',
    serviceType: 'WORSHIP',
    icon: 'Heart',
    iconColor: '#ffffff',
    cardColor: 'from-violet-500 to-purple-600',
    badgeColor: 'from-violet-500 to-purple-600',
    serviceDay: 'Sunday & Wednesday',
    frequency: 'WEEKLY',
    occurrence: 'Every Sunday - 11:00 AM – 2:00 PM | Every Wednesday - 6:30 PM – 8:30 PM',
    startTime: '11:00',
    endTime: '14:00',
    location: 'Bahadurpally',
    branchId: bahadurpallyBranch ? bahadurpallyBranch.id : null,
    featured: true,
    displayOrder: 1,
    status: 'PUBLISHED',
    tags: ['worship', 'sunday', 'wednesday', 'prayer', 'fellowship'],
    language: 'en',
  };

  const existing = await prisma.churchService.findUnique({
    where: { slug: 'sunday-worship-service' }
  });

  if (existing) {
    await prisma.churchService.update({
      where: { slug: 'sunday-worship-service' },
      data: serviceData
    });
    console.log('✅ Updated existing sunday-worship-service with Sunday & Wednesday timings');
  } else {
    await prisma.churchService.create({
      data: {
        slug: 'sunday-worship-service',
        ...serviceData
      }
    });
    console.log('✅ Created sunday-worship-service with Sunday & Wednesday timings');
  }

  const allServices = await prisma.churchService.findMany({
    where: { status: 'PUBLISHED' },
    select: { id: true, slug: true, title: true, location: true, occurrence: true, status: true, featured: true, branch: { select: { name: true } } }
  });

  console.log('Current PUBLISHED services:', JSON.stringify(allServices, null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
