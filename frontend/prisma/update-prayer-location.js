const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const branches = await prisma.branch.findMany();
  const bahadurpallyBranch = branches.find(b => b.name && b.name.includes('Bahadurpally'));

  const updateData = {
    location: 'Bahadurpally'
  };

  if (bahadurpallyBranch) {
    updateData.branchId = bahadurpallyBranch.id;
  }

  const result = await prisma.churchService.updateMany({
    where: {
      OR: [
        { slug: 'prayer-meeting' },
        { title: 'Prayer Meeting' },
        { slug: 'worship-prayer-meeting' }
      ]
    },
    data: updateData
  });

  console.log(`Updated ${result.count} service(s) to location: Bahadurpally`);

  const services = await prisma.churchService.findMany({
    where: { title: 'Prayer Meeting' },
    select: { id: true, title: true, location: true, branchId: true, branch: { select: { name: true } } }
  });
  console.log('Updated Prayer Meeting in DB:', JSON.stringify(services, null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
