const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Updating Prayer Meeting timing in database...');
  const result = await prisma.churchService.updateMany({
    where: {
      OR: [
        { slug: 'prayer-meeting' },
        { title: 'Prayer Meeting' },
        { slug: 'worship-prayer-meeting' }
      ]
    },
    data: {
      startTime: '18:30',
      endTime: '20:30'
    }
  });
  console.log(`Updated ${result.count} service record(s) in database!`);
  
  const updated = await prisma.churchService.findMany({
    select: { id: true, slug: true, title: true, startTime: true, endTime: true, occurrence: true, serviceDay: true }
  });
  console.log('Current church services in database:', JSON.stringify(updated, null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
