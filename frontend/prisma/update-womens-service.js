const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Updating Women\'s Fellowship schedule to 3rd Saturday of the month (6:30 PM - 8:30 PM) at Shapur Nagar...');

  const branches = await prisma.branch.findMany();
  const shapurBranch = branches.find(b => b.name && (b.name.toLowerCase().includes('shapur') || b.name.toLowerCase().includes('shapurnagar')));

  const womens = await prisma.churchService.findFirst({
    where: { slug: 'womens-fellowship' },
  });

  if (womens) {
    const updated = await prisma.churchService.update({
      where: { id: womens.id },
      data: {
        occurrence: '3rd Saturday of the month',
        serviceDay: 'Saturday',
        frequency: 'MONTHLY',
        startTime: '18:30',
        endTime: '20:30',
        location: 'Shapur Nagar',
        branchId: shapurBranch ? shapurBranch.id : null,
        description: 'The KCM Women\'s Fellowship gathers on the 3rd Saturday of every month for worship, testimony, and ministry to one another. Every woman is welcome.',
      },
      include: {
        branch: true,
      },
    });
    console.log('✅ Updated Women\'s Fellowship service:', updated);
  } else {
    console.log('❌ Women\'s Fellowship service not found!');
  }
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
