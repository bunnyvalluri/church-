const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("Updating service to English Worship at Shapur Nagar (3rd Sunday 4:00 PM - 6:00 PM)...");

  const branches = await prisma.branch.findMany();
  const shapurBranch = branches.find(
    b => b.name && (b.name.toLowerCase().includes('shapur') || b.name.toLowerCase().includes('shapurnagar'))
  );

  const mens = await prisma.churchService.findFirst({
    where: { slug: 'mens-fellowship' },
  });

  if (mens) {
    const updated = await prisma.churchService.update({
      where: { id: mens.id },
      data: {
        title: 'English Worship',
        shortDescription: 'Uplifting English praise, worship, and Bible teaching at Shapur Nagar.',
        description: "Join our English Worship service on the 3rd Sunday of every month from 4:00 PM to 6:00 PM at Shapur Nagar. Experience vibrant worship and inspiring messages from God's Word in English.",
        serviceType: 'WORSHIP',
        occurrence: '3rd Sunday of the month - 4:00 PM – 6:00 PM',
        serviceDay: 'Sunday',
        frequency: 'MONTHLY',
        startTime: '16:00',
        endTime: '18:00',
        location: 'Shapur Nagar',
        branchId: shapurBranch ? shapurBranch.id : null,
        tags: ['worship', 'english', 'sunday', 'monthly', 'shapur', 'fellowship'],
      },
      include: { branch: true },
    });
    console.log("✅ Updated English Worship service:", updated);
  } else {
    console.log("❌ Service not found in DB!");
  }
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
