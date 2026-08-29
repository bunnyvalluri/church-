const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Updating Youth Ministry service location to Shapur Nagar and schedule to 3rd Saturday...');

  const branches = await prisma.branch.findMany();
  const shapurBranch = branches.find(b => b.name && (b.name.toLowerCase().includes('shapur') || b.name.toLowerCase().includes('shapurnagar')));

  const youth = await prisma.churchService.findFirst({
    where: { slug: 'youth-ministry' },
  });

  if (youth) {
    const updated = await prisma.churchService.update({
      where: { id: youth.id },
      data: {
        occurrence: '2nd Saturday of the month',
        serviceDay: 'Saturday',
        frequency: 'MONTHLY',
        startTime: '18:30',
        endTime: '20:30',
        location: 'Shapur Nagar',
        branchId: shapurBranch ? shapurBranch.id : null,
        description: 'KCM Youth is a dynamic ministry for ages 13-25. We meet on the 2nd Saturday of every month for worship, the Word, games, and community. Come as you are!',
      },
      include: {
        branch: true,
      },
    });
    console.log('✅ Updated Youth Ministry service:', updated);
  } else {
    console.log('❌ Youth Ministry service not found!');
  }
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
